<?php


namespace App\Http\Controllers\Api;
use App\Events\BookingCompleted;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\InsurancePlan;
use App\Models\PromotionCode;
use App\Models\Extra;
use App\Enums\PromotionCodeStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Enums\BookingStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    protected function transformBooking(Booking $booking): array
    {
        $booking->loadMissing([
            'renter:id,full_name,email,phone',
            'vehicle:id,license_plate,vehicle_model_id',
            'vehicle.vehicleModel:id,title,brand',
            'insurancePlan:id,name,price_per_day',
            'promotionCode:id,code_string',
            'bookingExtras'
        ]);
        $bookingExtrasOutput = [];
        if ($booking->relationLoaded('bookingExtras') && $booking->bookingExtras) {
            $bookingExtrasOutput = $booking->bookingExtras->map(function (Extra $extra) {
                return [
                    'extra_id' => $extra->id,
                    'name' => $extra->name,
                    'quantity' => $extra->pivot->quantity,
                    'price_at_booking' => (float) $extra->pivot->price_at_booking,
                    'default_price_per_day' => (float) $extra->default_price_per_day,
                ];
            })->toArray();
        }

        return [
            'id' => $booking->id,
            'renter_user_id' => $booking->renter_user_id,
            'renter_name' => $booking->renter?->full_name,
            'renter_email' => $booking->renter?->email,
            'renter_phone' => $booking->renter?->phone,

            'vehicle_id' => $booking->vehicle_id,
            'vehicle_display' => $booking->vehicle?->vehicleModel
                ? $booking->vehicle->vehicleModel->title . ($booking->vehicle->year ? ' ' . $booking->vehicle->year : '') . ' (' . $booking->vehicle->license_plate . ')'
                : ($booking->vehicle?->license_plate),
            'insurance_plan_id' => $booking->insurance_plan_id,
            'insurance_plan_name' => $booking->insurancePlan?->name,
            'promotion_code_id' => $booking->promotion_code_id,
            'promotion_code_string' => $booking->promotionCode?->code_string,
            'start_date' => $booking->start_date?->toDateTimeString(),
            'end_date' => $booking->end_date?->toDateTimeString(),
            'status' => $booking->status,
            'status_display' => $booking->status ? ($booking->status->label ?? ucfirst(str_replace('_', ' ', $booking->status->value))) : null,
            'calculated_base_price' => (float) $booking->calculated_base_price,
            'calculated_extras_price' => (float) $booking->calculated_extras_price,
            'calculated_insurance_price' => (float) $booking->calculated_insurance_price,
            'discount_amount_applied' => (float) $booking->discount_amount_applied,
            'discount_percentage' => $booking->discount_percentage,
            'final_price' => (float) $booking->final_price,
            'booking_extras' => $bookingExtrasOutput,
            'created_at' => $booking->created_at?->toDateTimeString(),
            'updated_at' => $booking->updated_at?->toDateTimeString(),
        ];
    }

    public function index(Request $request)
    {
        $query = Booking::query()->with([
            'renter:id,full_name,email,phone',
            'vehicle:id,license_plate,vehicle_model_id',
            'vehicle.vehicleModel:id,title,brand,model',
            'insurancePlan:id,name',
            'bookingExtras'
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
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $allowedSorts = ['start_date', 'end_date', 'final_price', 'created_at', 'status'];
        if (in_array($sortBy, $allowedSorts)) { $query->orderBy($sortBy, $sortDirection); }
        else { $query->orderBy('created_at', 'desc'); }

  
$perPage = $request->input('per_page', config('pagination.default_per_page', 15));

$paginator = $query->paginate($request->boolean('all') ? 9999 : (int)$perPage);

$paginator->getCollection()->transform(fn($booking) => $this->transformBooking($booking));

return response()->json($paginator);
    }

    public function store(Request $request)
    {
        Log::info('BookingController@store: Request data received:', $request->all());
        $validator = Validator::make($request->all(), [
            'renter_user_id' => 'required|uuid|exists:users,id',
            'vehicle_id' => 'required|uuid|exists:vehicles,id',
            'insurance_plan_id' => 'nullable|uuid|exists:insurance_plans,id',
            'promotion_code_id' => ['nullable', 'uuid', Rule::exists('promotion_codes', 'id')->where('status', 'active')],
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => ['sometimes', 'required', Rule::in(array_column(BookingStatus::cases(), 'value'))],
            'calculated_base_price' => 'required|numeric|min:0',
            'calculated_extras_price' => 'sometimes|numeric|min:0',
            'calculated_insurance_price' => 'sometimes|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount_applied' => 'sometimes|numeric|min:0',
            'final_price' => 'required|numeric|min:0',
            'booking_extras' => 'nullable|array',
            'booking_extras.*.extra_id' => 'required_with:booking_extras|uuid|exists:extras,id',
            'booking_extras.*.quantity' => 'required_with:booking_extras|integer|min:1',
            'booking_extras.*.price_at_booking' => 'required_with:booking_extras|numeric|min:0',
        ]);

        if ($validator->fails()) {
            Log::error('BookingController@store: Validation failed.', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        Log::info('BookingController@store: Validated data:', $validatedData);

        if (!isset($validatedData['status'])) {
            $validatedData['status'] = BookingStatus::PENDING_CONFIRMATION->value;
        }
        $numericFieldsToDefault = ['calculated_extras_price', 'calculated_insurance_price', 'discount_amount_applied'];
        foreach ($numericFieldsToDefault as $field) {
            if (!isset($validatedData[$field])) {
                $validatedData[$field] = 0.00;
            }
        }

        DB::beginTransaction();
        try {
            $bookingInputData = collect($validatedData)->except('booking_extras')->all();
            $booking = Booking::create($bookingInputData);
            Log::info("--- BOOKING CREATED (ID: {$booking->id}). EVENT SHOULD FIRE NOW. ---");
            $extrasToSync = [];
            if (!empty($validatedData['booking_extras'])) {
                foreach ($validatedData['booking_extras'] as $extraData) {
                    $extrasToSync[$extraData['extra_id']] = [
                        'quantity' => $extraData['quantity'],
                        'price_at_booking' => $extraData['price_at_booking']
                    ];
                }
            }

            if (method_exists($booking, 'bookingExtras')) {
                Log::info('BookingController@store: Syncing extras for booking ID ' . $booking->id . ' with data:', $extrasToSync);
                $booking->bookingExtras()->sync($extrasToSync);
                Log::info('BookingController@store: Extras synced successfully for booking ID ' . $booking->id);
            }
             if (!empty($validatedData['promotion_code_id'])) {
            $promoCode = PromotionCode::find($validatedData['promotion_code_id']);
            if ($promoCode) {
                $promoCode->status = PromotionCodeStatus::USED;
                $promoCode->used_at = now();
                $promoCode->used_on_booking_id = $booking->id;
                $promoCode->save();
                Log::info("Promotion code {$promoCode->code_string} marked as USED for Booking ID: {$booking->id}");
            }
        }
            DB::commit();
            
            return response()->json(['data' => $this->transformBooking($booking->refresh()), 'message' => 'Booking created successfully.'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('BookingController@store: CRITICAL ERROR during booking creation or extras sync: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Failed to create booking. Please try again.', 'error_details' => $e->getMessage()], 500);
        }
    }

    public function show(Booking $booking)
    {
            $booking->load('bookingExtras');
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
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            'status' => ['sometimes', 'required', Rule::in(array_column(BookingStatus::cases(), 'value'))],
            'calculated_base_price' => 'sometimes|numeric|min:0',
            'calculated_extras_price' => 'sometimes|numeric|min:0',
            'calculated_insurance_price' => 'sometimes|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount_applied' => 'sometimes|numeric|min:0',
            'final_price' => 'sometimes|numeric|min:0',
            'booking_extras' => 'nullable|array',
            'booking_extras.*.extra_id' => 'required_with:booking_extras|uuid|exists:extras,id',
            'booking_extras.*.quantity' => 'required_with:booking_extras|integer|min:1',
            'booking_extras.*.price_at_booking' => 'required_with:booking_extras|numeric|min:0',
        ]);

        if ($validator->fails()) {
            Log::error('BookingController@update: Validation failed for Booking ID ' . $booking->id, $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        Log::info('BookingController@update: Validated data for Booking ID ' . $booking->id . ':', $validatedData);

        DB::beginTransaction();
        try {
            $bookingUpdateInputData = collect($validatedData)->except('booking_extras')->all();
            $booking->update($bookingUpdateInputData);
            Log::info('BookingController@update: Booking main data updated for ID: ' . $booking->id);

            if ($request->has('booking_extras')) {
                $extrasToSync = [];
                if (!empty($validatedData['booking_extras'])) {
                    foreach ($validatedData['booking_extras'] as $extraData) {
                        $extrasToSync[$extraData['extra_id']] = [
                            'quantity' => $extraData['quantity'],
                            'price_at_booking' => $extraData['price_at_booking']
                        ];
                    }
                }
                if (method_exists($booking, 'bookingExtras')) {
                    Log::info('BookingController@update: Syncing extras for booking ID ' . $booking->id . ' with data:', $extrasToSync);
                    $booking->bookingExtras()->sync($extrasToSync);
                    Log::info('BookingController@update: Extras synced successfully for booking ID ' . $booking->id);
                }
            }
              $newPromoCodeId = $validatedData['promotion_code_id'] ?? null;
               $originalPromoCodeId = $booking->promotion_code_id; // <-- ADD THIS LINE
    
    $bookingUpdateInputData = collect($validatedData)->except('booking_extras')->all();
        
        // Only process if the code has actually changed
        if ($newPromoCodeId !== $originalPromoCodeId) {

            // If an old code was attached, revert it to ACTIVE
            if ($originalPromoCodeId) {
                $originalPromoCode = PromotionCode::find($originalPromoCodeId);
                if ($originalPromoCode) {
                    $originalPromoCode->status = PromotionCodeStatus::ACTIVE;
                    $originalPromoCode->used_at = null;
                    $originalPromoCode->used_on_booking_id = null;
                    $originalPromoCode->save();
                    Log::info("Original promotion code {$originalPromoCode->code_string} REVERTED to ACTIVE.");
                }
            }

            // If a new code is being attached, mark it as USED
            if ($newPromoCodeId) {
                $newPromoCode = PromotionCode::find($newPromoCodeId);
                if ($newPromoCode && $newPromoCode->status === PromotionCodeStatus::ACTIVE) {
                    $newPromoCode->status = PromotionCodeStatus::USED;
                    $newPromoCode->used_at = now();
                    $newPromoCode->used_on_booking_id = $booking->id;
                    $newPromoCode->save();
                    Log::info("NEW promotion code {$newPromoCode->code_string} marked as USED for Booking ID: {$booking->id}");
                }
            }
        }
            DB::commit();
            return response()->json(['data' => $this->transformBooking($booking->refresh()), 'message' => 'Booking updated successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('BookingController@update: CRITICAL ERROR during booking update or extras sync: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Failed to update booking. Please try again.', 'error_details' => $e->getMessage()], 500);
        }
    }

// In BookingController.php
public function destroy($id) // Changed from `Booking $booking` to `$id`
{
    Log::info('BookingController@destroy: Received ID for deletion: ' . $id);
    $booking = Booking::find($id); // Manually find
    if (!$booking) {
        Log::error('BookingController@destroy: Booking not found with ID: ' . $id);
        return response()->json(['message' => 'Booking not found.'], 404);
    }
    // ... rest of delete logic using $booking ...
    $booking->delete();
    return response()->json(['message' => 'Booking deleted successfully.'], 200);
}
    public function confirmBooking(Request $request, Booking $booking)
    {
        if ($booking->status === BookingStatus::PENDING_CONFIRMATION) {
            $booking->status = BookingStatus::CONFIRMED;
            $booking->save();
            return response()->json(['data' => $this->transformBooking($booking->refresh()), 'message' => 'Booking confirmed.']);
        }
        return response()->json(['message' => 'Booking cannot be confirmed or is already confirmed/processed.'], 422);
    }

 

// In app/Http/Controllers/Api/BookingController.php

// In BookingController.php

public function completeBooking(Request $request, Booking $booking)
{
    if ($booking->status !== BookingStatus::ACTIVE) {
        return response()->json(['message' => 'Only active bookings can be completed.'], 422);
    }

    Log::info("--- STARTING COMPLETE BOOKING FOR ID: {$booking->id} ---");

    DB::transaction(function () use ($booking) {
        $booking->load('renter');
        $renter = $booking->renter;

        if ($renter) {
            Log::info("Renter {$renter->id} found. Current points: {$renter->loyalty_points}. Booking final price: {$booking->final_price}");

            // --- TEMPORARY TEST: Unconditionally award 1 point ---
            $pointsToAward = 1; 
            Log::info("TEST: Forcing pointsToAward to be {$pointsToAward}.");
            // --- END TEMPORARY TEST ---

            if ($pointsToAward > 0) {
                $renter->increment('loyalty_points', $pointsToAward);
                Log::info("Executing increment method.");
            } else {
                 Log::info("Condition (pointsToAward > 0) was FALSE. Skipping increment.");
            }
        } else {
            Log::warning("No renter found for booking.");
        }
        
        $booking->status = BookingStatus::COMPLETED;
        $booking->save();
        Log::info("Booking status set to COMPLETED and saved.");
    });

    $freshBooking = Booking::with('renter')->find($booking->id);

    Log::info("--- TRANSACTION COMPLETE. FINAL CHECK ---", [
        'renter_id' => $freshBooking->renter->id,
        'points_in_db' => $freshBooking->renter->loyalty_points,
    ]);

    event(new BookingCompleted($freshBooking));
    Log::info("Event dispatched.");

    return response()->json([
        'data' => $this->transformBooking($freshBooking),
        'message' => 'Booking marked as completed and loyalty updated.'
    ], 200);
}
public function forDropdown() {
    $bookings = Booking::select('id')->orderBy('created_at', 'desc')->get();
    return response()->json(['data' => $bookings]);
}
public function forAgreementDropdown()
    {
        // Fetch bookings that DO NOT HAVE a related rental agreement.
        // We also only fetch recent bookings to keep the list manageable.
        $bookings = Booking::whereDoesntHave('rentalAgreement')
            ->with(['renter:id,full_name', 'vehicle:id,license_plate', 'vehicle.vehicleModel:id,title'])
            ->where('start_date', '>=', now()->subMonths(3)) // Optional: only show recent/upcoming bookings
            ->latest() // Show newest first
            ->limit(100) // Limit the result size for performance
            ->get();

        // We can use the existing Booking transformation, but a simpler one is better for a dropdown
        $transformedBookings = $bookings->map(function ($booking) {
            $vehicleDisplay = $booking->vehicle?->vehicleModel?->title ?? $booking->vehicle?->license_plate ?? 'N/A';
            return [
                'id' => $booking->id,
                'display_text' => sprintf(
                    'ID: %s... (V: %s, R: %s)',
                    substr($booking->id, 0, 8),
                    $vehicleDisplay,
                    $booking->renter?->full_name ?? 'N/A'
                )
            ];
        });

        return response()->json(['data' => $transformedBookings]);
    }
}