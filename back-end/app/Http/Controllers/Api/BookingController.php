<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\InsurancePlan;
use App\Models\PromotionCode;
use App\Models\Extra; // Ensure Extra model is imported
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Enums\BookingStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log; // For logging

class BookingController extends Controller
{
    protected function transformBooking(Booking $booking): array
    {
        $booking->loadMissing([
            'renter:id,full_name',
            'vehicle:id,license_plate', // Load basic vehicle info
            'vehicle.vehicleModel:id,title', // And its model
            'insurancePlan:id,name',
            'promotionCode:id,code_string',
            'bookingExtras:id,name' // << CRITICAL: Eager load specific columns from Extras
        ]);

        $bookingExtrasOutput = [];
        if ($booking->relationLoaded('bookingExtras') && $booking->bookingExtras) {
            $bookingExtrasOutput = $booking->bookingExtras->map(function (Extra $extra) {
                return [
                    'id' => $extra->id,
                    'name' => $extra->name,
                    // 'price' => (float) $extra->price, // Current price of extra, if needed
                ];
            })->toArray(); // Convert collection to array
             Log::info('TransformBooking: Booking ID ' . $booking->id . ' - bookingExtras prepared:', $bookingExtrasOutput);
        } else {
            Log::info('TransformBooking: Booking ID ' . $booking->id . ' - No bookingExtras relation loaded or extras are empty.');
        }

        return [
            'id' => $booking->id,
            'renter_user_id' => $booking->renter_user_id,
            'renter_name' => $booking->renter ? $booking->renter->full_name : null,
            'vehicle_id' => $booking->vehicle_id,
            'vehicle_display' => $booking->vehicle && $booking->vehicle->vehicleModel
                ? $booking->vehicle->vehicleModel->title . ' (' . $booking->vehicle->license_plate . ')'
                : ($booking->vehicle ? $booking->vehicle->license_plate : null),
            'insurance_plan_id' => $booking->insurance_plan_id,
            'insurance_plan_name' => $booking->insurancePlan ? $booking->insurancePlan->name : null,
            'promotion_code_id' => $booking->promotion_code_id,
            'promotion_code_string' => $booking->promotionCode ? $booking->promotionCode->code_string : null,
            'start_date' => $booking->start_date->toDateTimeString(),
            'end_date' => $booking->end_date->toDateTimeString(),
            'status' => $booking->status,
            'status_display' => $booking->status ? ucfirst(str_replace('_', ' ', $booking->status->value)) : null,
            'calculated_base_price' => (float) $booking->calculated_base_price,
            'calculated_extras_price' => (float) $booking->calculated_extras_price,
            'calculated_insurance_price' => (float) $booking->calculated_insurance_price,
            'discount_amount_applied' => (float) $booking->discount_amount_applied,
            'final_price' => (float) $booking->final_price,
            'booking_extras' => $bookingExtrasOutput, // << CRITICAL: Included here
            'created_at' => $booking->created_at ? $booking->created_at->toDateTimeString() : null,
            'updated_at' => $booking->updated_at ? $booking->updated_at->toDateTimeString() : null,
        ];
    }

    public function index(Request $request)
    {
        $query = Booking::query()->with([
            'renter:id,full_name',
            'vehicle:id,license_plate,vehicle_model_id',
            'vehicle.vehicleModel:id,title,brand,model',
            'insurancePlan:id,name',
            'bookingExtras:id,name' // << CRITICAL: Eager load for the list view
        ]);

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('renter', fn($rq) => $rq->where('full_name', 'LIKE', "%{$searchTerm}%"))
                  ->orWhereHas('vehicle', fn($vq) => $vq->where('license_plate', 'LIKE', "%{$searchTerm}%")
                        ->orWhereHas('vehicleModel', fn($vmq) => $vmq->where('title', 'LIKE', "%{$searchTerm}%")))
                  ->orWhere('id', 'LIKE', "{$searchTerm}%");
            });
        }
        if ($request->filled('status')) {
            $status = $request->input('status');
            if (BookingStatus::tryFrom($status)) { $query->where('status', $status); }
        }
        $sortBy = $request->input('sort_by', 'created_at'); // Changed default sort to created_at for typical booking list
        $sortDirection = $request->input('sort_direction', 'desc');
        $allowedSorts = ['start_date', 'end_date', 'final_price', 'created_at', 'status'];
        if (in_array($sortBy, $allowedSorts)) { $query->orderBy($sortBy, $sortDirection); }
        else { $query->orderBy('created_at', 'desc'); } // Default sort

        if ($request->boolean('all')) {
            $bookings = $query->get();
            return response()->json(['data' => $bookings->map(fn($b) => $this->transformBooking($b))]);
        } else {
            $perPage = $request->input('per_page', config('pagination.default_per_page', 15));
            $bookingsPaginated = $query->paginate((int)$perPage);
            // Important: transform the collection items *after* pagination
            $bookingsPaginated->getCollection()->transform(fn($b) => $this->transformBooking($b));
            return response()->json($bookingsPaginated);
        }
    }

    public function store(Request $request)
    {
        Log::info('BookingController@store: Request data received:', $request->all());
        $validator = Validator::make($request->all(), [
            'renter_user_id' => 'required|uuid|exists:users,id',
            'vehicle_id' => 'required|uuid|exists:vehicles,id',
            'insurance_plan_id' => 'nullable|uuid|exists:insurance_plans,id',
            'promotion_code_id' => 'nullable|uuid|exists:promotion_codes,id',
            'start_date' => 'required|after_or_equal:now',
            'end_date' => 'required|after:start_date',
            'status' => ['sometimes', 'required', Rule::in(array_column(BookingStatus::cases(), 'value'))],
            'calculated_base_price' => 'required|numeric|min:0',
            'calculated_extras_price' => 'sometimes|numeric|min:0',
            'calculated_insurance_price' => 'sometimes|numeric|min:0',
            'discount_amount_applied' => 'sometimes|numeric|min:0',
            'final_price' => 'required|numeric|min:0',
            'booking_extras' => 'nullable|array',
            'booking_extras.*' => 'uuid|exists:extras,id'
        ]);

        if ($validator->fails()) {
            Log::error('BookingController@store: Validation failed.', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        Log::info('BookingController@store: Validated data:', $validatedData);

        if (!isset($validatedData['status'])) {
            $validatedData['status'] = BookingStatus::PENDING_CONFIRMATION;
        }
        $numericFields = ['calculated_base_price', 'calculated_extras_price', 'calculated_insurance_price', 'discount_amount_applied', 'final_price'];
        foreach($numericFields as $field) {
            if(isset($validatedData[$field])) {
                $validatedData[$field] = (float) $validatedData[$field];
            } else if (in_array($field, ['calculated_extras_price', 'calculated_insurance_price', 'discount_amount_applied'])) {
                $validatedData[$field] = 0.00;
            }
        }

        $extraIdsToAttach = $validatedData['booking_extras'] ?? [];
        unset($validatedData['booking_extras']);

        $booking = Booking::create($validatedData);
        Log::info('BookingController@store: Booking created with ID: ' . $booking->id);

        if (!empty($extraIdsToAttach) && method_exists($booking, 'bookingExtras')) {
            Log::info('BookingController@store: Attempting to sync extras for booking ID ' . $booking->id . ':', $extraIdsToAttach);
            try {
                $booking->bookingExtras()->sync($extraIdsToAttach);
                Log::info('BookingController@store: Extras synced successfully for booking ID ' . $booking->id);
            } catch (\Exception $e) {
                Log::error('BookingController@store: ERROR syncing extras for booking ID ' . $booking->id . ' - ' . $e->getMessage());
            }
        } else {
             Log::info('BookingController@store: No extras to attach or bookingExtras method missing for booking ID ' . $booking->id);
        }

        return response()->json(['data' => $this->transformBooking($booking->refresh()), 'message' => 'Booking created successfully.'], 201);
    }

    public function show(Booking $booking)
    {
        // transformBooking will handle loading necessary relations including bookingExtras
        return response()->json(['data' => $this->transformBooking($booking)]);
    }

    public function update(Request $request, Booking $booking)
    {
        Log::info('BookingController@update: Request data for Booking ID ' . $booking->id . ':', $request->all());
        $validator = Validator::make($request->all(), [
            'renter_user_id' => 'sometimes|required|uuid|exists:users,id',
            'vehicle_id' => 'sometimes|required|uuid|exists:vehicles,id',
            'insurance_plan_id' => 'nullable|uuid|exists:insurance_plans,id',
            'promotion_code_id' => 'nullable|uuid|exists:promotion_codes,id',
            'start_date' => 'sometimes|required',
            'end_date' => 'sometimes|required|after:start_date',
            'status' => ['sometimes', 'required', Rule::in(array_column(BookingStatus::cases(), 'value'))],
            'calculated_base_price' => 'sometimes|numeric|min:0',
            'calculated_extras_price' => 'sometimes|numeric|min:0',
            'calculated_insurance_price' => 'sometimes|numeric|min:0',
            'discount_amount_applied' => 'sometimes|numeric|min:0',
            'final_price' => 'sometimes|numeric|min:0',
            'booking_extras' => 'nullable|array', // Allow sending empty array to remove all extras
            'booking_extras.*' => 'uuid|exists:extras,id'
        ]);

        if ($validator->fails()) {
            Log::error('BookingController@update: Validation failed for Booking ID ' . $booking->id, $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        Log::info('BookingController@update: Validated data for Booking ID ' . $booking->id . ':', $validatedData);

        $bookingUpdateData = $validatedData;
        if ($request->has('booking_extras')) { // Only try to sync if key is present in request
            $extraIdsToSync = $validatedData['booking_extras'] ?? []; // Default to empty array if key is present but value is null
            unset($bookingUpdateData['booking_extras']); // Remove from main update data

            if (method_exists($booking, 'bookingExtras')) {
                Log::info('BookingController@update: Attempting to sync extras for booking ID ' . $booking->id . ':', $extraIdsToSync);
                try {
                    $booking->bookingExtras()->sync($extraIdsToSync);
                    Log::info('BookingController@update: Extras synced successfully for booking ID ' . $booking->id);
                } catch (\Exception $e) {
                    Log::error('BookingController@update: ERROR syncing extras for booking ID ' . $booking->id . ' - ' . $e->getMessage());
                }
            } else {
                 Log::info('BookingController@update: bookingExtras method missing for booking ID ' . $booking->id);
            }
        }
        // If 'booking_extras' is NOT in the request, we don't touch the existing synced extras.
        // To remove all extras, the frontend MUST send "booking_extras": []

        $booking->update($bookingUpdateData);
        Log::info('BookingController@update: Booking main data updated for ID: ' . $booking->id);

        return response()->json(['data' => $this->transformBooking($booking->refresh()), 'message' => 'Booking updated successfully.']);
    }

    public function destroy(Booking $booking)
    {
        Log::info('BookingController@destroy: Attempting to delete Booking ID: ' . $booking->id);
        if (in_array($booking->status, [BookingStatus::ACTIVE, BookingStatus::COMPLETED])) {
            Log::warn('BookingController@destroy: Attempt to delete active/completed booking ID: ' . $booking->id);
            return response()->json(['message' => 'Cannot delete an active or completed booking.'], 403);
        }
        if (method_exists($booking, 'bookingExtras')) {
            Log::info('BookingController@destroy: Detaching extras for booking ID: ' . $booking->id);
            $booking->bookingExtras()->detach();
        }
        $booking->delete();
        Log::info('BookingController@destroy: Booking deleted ID: ' . $booking->id);
        return response()->json(['message' => 'Booking deleted successfully.'], 200);
    }

    // confirmBooking and completeBooking methods remain the same
    public function confirmBooking(Request $request, Booking $booking)
    {
        if ($booking->status === BookingStatus::PENDING_CONFIRMATION) {
            $booking->status = BookingStatus::CONFIRMED;
            $booking->save();
            return response()->json(['data' => $this->transformBooking($booking->refresh()), 'message' => 'Booking confirmed.']);
        }
        return response()->json(['message' => 'Booking cannot be confirmed or is already confirmed.'], 422);
    }

    public function completeBooking(Request $request, Booking $booking)
    {
        if ($booking->status === BookingStatus::ACTIVE) {
            $booking->status = BookingStatus::COMPLETED;
            $booking->save();
            return response()->json(['data' => $this->transformBooking($booking->refresh()), 'message' => 'Booking marked as completed.']);
        }
        return response()->json(['message' => 'Only active bookings can be completed.'], 422);
    }
}