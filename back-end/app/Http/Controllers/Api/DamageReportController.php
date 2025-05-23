<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DamageReport;
use App\Models\Booking;
use App\Models\User;
use App\Models\DamageReportImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Enums\DamageReportStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DamageReportController extends Controller
{
    protected function transformDamageReport(DamageReport $report): array
    {
        Log::info('--- TransformDamageReport START for Report ID: ' . $report->id . ' ---');
        $report->load('images');
        Log::info('After explicit $report->load(\'images\'), images count from $report->images: ' . ($report->images ? $report->images->count() : 'null or not loaded'));

        $imagesOutput = [];
        if ($report->relationLoaded('images') && $report->images && $report->images->isNotEmpty()) {
            Log::info('Mapping ' . $report->images->count() . ' images for Report ID ' . $report->id);
            $imagesOutput = $report->images->map(function (DamageReportImage $image) use ($report) {
                $publicUrl = null;
                if ($image->url) {
                    $publicUrl = Storage::disk('public')->url($image->url);
                    if (empty($publicUrl) || $publicUrl === Storage::disk('public')->url('')) {
                        Log::warning("TransformDamageReport: Generated public URL is empty or base for image ID {$image->id} (DB path: {$image->url}) for Report ID {$report->id}. Check filesystems.php and if file exists at path.");
                        return null;
                    }
                } else {
                    Log::warning("TransformDamageReport: Image ID {$image->id} has null or empty URL in DB for Report ID {$report->id}");
                    return null;
                }
                return $publicUrl ? [
                    'id' => $image->id,
                    'url' => $publicUrl,
                    'caption' => $image->caption,
                    'uploaded_at' => $image->uploaded_at ? $image->uploaded_at->toDateTimeString() : null,
                ] : null;
            })->filter()->values()->toArray();
        } else {
            Log::warning('TransformDamageReport: Condition to map images was FALSE for Report ID: ' . $report->id . ' (relationLoaded: ' . ($report->relationLoaded('images') ? 'yes' : 'no') . ', images: ' . (is_object($report->images) ? $report->images->count() : 'null') . ')');
        }
        Log::info('TransformDamageReport for Report ID ' . $report->id . ': Final imagesOutput being sent:', $imagesOutput);

        $vehicleDisplay = null;
        if ($report->booking) {
            $report->booking->loadMissing('vehicle.vehicleModel');
            if ($report->booking->vehicle) {
                $vehicle = $report->booking->vehicle;
                $vehicleDisplay = $vehicle->vehicleModel
                    ? $vehicle->vehicleModel->title . ' (' . $vehicle->license_plate . ')'
                    : $vehicle->license_plate;
            }
        }

        return [
            'id' => $report->id,
            'booking_id' => $report->booking_id,
            'booking_identifier' => $report->booking ? 'Booking #' . substr($report->booking_id, 0, 8) . '...' : null,
            'vehicle_display' => $vehicleDisplay,
            'reported_by_user_id' => $report->reported_by_user_id,
            'reporter_name' => $report->reportedByUser ? $report->reportedByUser->full_name : null,
            'reported_at' => $report->reported_at->toDateTimeString(),
            'description' => $report->description,
            'status' => $report->status,
            'status_display' => $report->status ? ucfirst(str_replace('_', ' ', $report->status->value)) : null,
            'repair_cost' => $report->repair_cost !== null ? (float) $report->repair_cost : null,
            'image_count' => $report->images()->count(),
            'images' => $imagesOutput,
            'created_at' => $report->created_at ? $report->created_at->toDateTimeString() : null,
            'updated_at' => $report->updated_at ? $report->updated_at->toDateTimeString() : null,
        ];
    }

    public function index(Request $request)
    {
        Log::info('DamageReportController@index: Fetching list of damage reports.');
        $query = DamageReport::query()->with([
            'booking:id,vehicle_id',
            'booking.vehicle:id,license_plate',
            'booking.vehicle.vehicleModel:id,title',
            'reportedByUser:id,full_name',
            'images:id,url,caption,uploaded_at'
        ]);

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('description', 'LIKE', "%{$searchTerm}%")
                  ->orWhereHas('booking.vehicle', fn($vq) =>
                        $vq->where('license_plate', 'LIKE', "%{$searchTerm}%")
                           ->orWhereHas('vehicleModel', fn($vmq) => $vmq->where('title', 'LIKE', "%{$searchTerm}%"))
                    )
                  ->orWhereHas('reportedByUser', fn($uq) => $uq->where('full_name', 'LIKE', "%{$searchTerm}%"));
            });
        }
        if ($request->filled('booking_id')) { $query->where('booking_id', $request->input('booking_id')); }
        if ($request->filled('vehicle_id')) {
            $query->whereHas('booking', function ($q) use ($request) {
                $q->where('vehicle_id', $request->input('vehicle_id'));
            });
        }
        if ($request->filled('status')) {
            $status = $request->input('status');
            if (DamageReportStatus::tryFrom($status)) { $query->where('status', $status); }
        }

        $sortBy = $request->input('sort_by', 'reported_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $allowedSorts = ['reported_at', 'status', 'repair_cost', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) { $query->orderBy($sortBy, $sortDirection); }
        else { $query->orderBy('reported_at', 'desc'); }

        if ($request->boolean('all')) {
            $reports = $query->get();
            $transformedData = $reports->map(fn($report) => $this->transformDamageReport($report));
            Log::info('DamageReportController@index: Returning all reports. Count: ' . $reports->count());
            return response()->json(['data' => $transformedData]);
        } else {
            $perPage = $request->input('per_page', config('pagination.default_per_page', 15));
            $reportsPaginated = $query->paginate((int)$perPage);
            $reportsPaginated->getCollection()->transform(fn($report) => $this->transformDamageReport($report));
            Log::info('DamageReportController@index: Returning paginated reports. Page: ' . $reportsPaginated->currentPage() . ' Count: ' . $reportsPaginated->count());
            return response()->json($reportsPaginated);
        }
    }

    public function store(Request $request)
    {
        Log::info('DamageReportController@store: Request data:', $request->all());
        Log::info('DamageReportController@store: Request files:', $request->allFiles());

        $rules = [
            'booking_id' => 'required|uuid|exists:bookings,id',
            'reported_by_user_id' => 'required|uuid|exists:users,id',
            'reported_at' => 'required|date_format:Y-m-d H:i:s',
            'description' => 'required|string|max:65535',
            'status' => ['required', Rule::in(array_column(DamageReportStatus::cases(), 'value'))],
            'repair_cost' => 'nullable|numeric|min:0',
        ];

        if ($request->hasFile('images') || ($request->filled('images') && is_array($request->input('images')) && count(array_filter($request->input('images'))) > 0) ) {
            Log::info('DamageReportController@store: Images detected in request for validation.');
            $rules['images'] = 'present|array';
            $rules['images.*'] = 'image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        } else {
            Log::info('DamageReportController@store: No images detected in request for validation.');
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            Log::error('DamageReportController@store: Validation failed.', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $imageFiles = $request->file('images', []);

        $reportData = $validatedData;
        if (array_key_exists('images', $reportData)) {
            unset($reportData['images']);
        }

        $report = DamageReport::create($reportData);
        Log::info('DamageReportController@store: DamageReport created with ID: ' . $report->id);

        if (!empty($imageFiles)) {
            Log::info('DamageReportController@store: Processing ' . count($imageFiles) . ' image(s) for report ID ' . $report->id);
            foreach ($imageFiles as $index => $imageFile) {
                if ($imageFile && $imageFile->isValid()) {
                    $originalName = $imageFile->getClientOriginalName();
                    $extension = $imageFile->getClientOriginalExtension();
                    $fileName = Str::uuid() . '_' . time() . '.' . $extension;
                    $path = $imageFile->storeAs('damage_images', $fileName, 'public');
                    if ($path) {
                        $report->images()->create([
                            'url' => $path,
                            'caption' => $request->input("captions.{$index}", pathinfo($originalName, PATHINFO_FILENAME)),
                            'uploaded_at' => now(),
                        ]);
                        Log::info('DamageReportController@store: Image stored at ' . $path);
                    } else { Log::error('DamageReportController@store: Failed to store image ' . $originalName); }
                } else { Log::warning('DamageReportController@store: Invalid or missing image file at index ' . $index); }
            }
        }
        return response()->json([
            'data' => $this->transformDamageReport($report->refresh()),
            'message' => 'Damage report created successfully.'
        ], 201);
    }

    public function show(DamageReport $damageReport)
    {
        return response()->json(['data' => $this->transformDamageReport($damageReport)]);
    }

    public function update(Request $request, DamageReport $damageReport)
    {
        Log::info('DamageReportController@update: Request data for Report ID ' . $damageReport->id . ':', $request->all());
        Log::info('DamageReportController@update: Request files for Report ID ' . $damageReport->id . ':', $request->allFiles());
    Log::info('-----------------------------------------------------');
    Log::info('DamageReportController@update: METHOD: ' . $request->method() . ' (Real method: ' . $request->getRealMethod() . ') for Report ID ' . $damageReport->id);
    Log::info('DamageReportController@update: HEADERS:', $request->headers->all());
    Log::info('DamageReportController@update: Initial Request data ($request->all()):', $request->all());
    Log::info('DamageReportController@update: Initial Request files ($request->allFiles()):', $request->allFiles());
    // Log::info('DamageReportController@update: RAW CONTENT:', $request->getContent()); // Can be very verbose
    Log::info('-----------------------------------------------------');
        $rules = [
            'booking_id' => 'sometimes|required|uuid|exists:bookings,id',
            'reported_by_user_id' => 'sometimes|required|uuid|exists:users,id',
            'reported_at' => 'sometimes|required|date_format:Y-m-d H:i:s',
            'description' => 'sometimes|required|string|max:65535',
            'status' => ['sometimes','required', Rule::in(array_column(DamageReportStatus::cases(), 'value'))],
            'repair_cost' => 'nullable|numeric|min:0',
            'image_ids_to_delete' => 'nullable|array',
            'image_ids_to_delete.*' => 'uuid|exists:damage_report_images,id',
        ];

        if ($request->hasFile('images') || ($request->filled('images') && is_array($request->input('images')) && count(array_filter($request->input('images'))) > 0) ) {
            Log::info('DamageReportController@update: New images detected in request for validation.');
            $rules['images'] = 'present|array';
            $rules['images.*'] = 'image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        } else {
            Log::info('DamageReportController@update: No new images detected in request for validation.');
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            Log::error('DamageReportController@update: Validation failed for Report ID ' . $damageReport->id, $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $imageFiles = $request->file('images', []);
        $imageIdsToDelete = $validatedData['image_ids_to_delete'] ?? [];

        $reportUpdateData = $validatedData;
        if (array_key_exists('images', $reportUpdateData)) {
            unset($reportUpdateData['images']);
        }
        if (array_key_exists('image_ids_to_delete', $reportUpdateData)) {
            unset($reportUpdateData['image_ids_to_delete']);
        }

        $damageReport->update($reportUpdateData);
        Log::info('DamageReportController@update: DamageReport base data updated for ID: ' . $damageReport->id);

        if (!empty($imageIdsToDelete)) {
            Log::info('DamageReportController@update: Deleting images for report ID ' . $damageReport->id . ':', $imageIdsToDelete);
            $imagesToDelete = DamageReportImage::where('damage_report_id', $damageReport->id)
                                ->whereIn('id', $imageIdsToDelete)
                                ->get();
            foreach ($imagesToDelete as $image) {
                Storage::disk('public')->delete($image->url);
                $image->delete();
                Log::info('DamageReportController@update: Deleted image ID ' . $image->id . ' path ' . $image->url);
            }
        }

        if (!empty($imageFiles)) {
            Log::info('DamageReportController@update: Processing ' . count($imageFiles) . ' new image(s) for report ID ' . $damageReport->id);
            foreach ($imageFiles as $index => $imageFile) {
                if ($imageFile && $imageFile->isValid()) {
                    $originalName = $imageFile->getClientOriginalName();
                    $extension = $imageFile->getClientOriginalExtension();
                    $fileName = Str::uuid() . '_' . time() . '.' . $extension;
                    $path = $imageFile->storeAs('damage_images', $fileName, 'public');
                    if ($path) {
                        $damageReport->images()->create([
                            'url' => $path,
                            'caption' => $request->input("captions.{$index}", pathinfo($originalName, PATHINFO_FILENAME)),
                            'uploaded_at' => now(),
                        ]);
                        Log::info('DamageReportController@update: New image stored at ' . $path);
                    } else { Log::error('DamageReportController@update: Failed to store new image ' . $originalName); }
                } else { Log::warning('DamageReportController@update: Invalid or missing new image file at index ' . $index); }
            }
        }
        return response()->json([
            'data' => $this->transformDamageReport($damageReport->refresh()),
            'message' => 'Damage report updated successfully.'
        ]);
    }

    public function destroy(DamageReport $damageReport)
    {
        Log::info('DamageReportController@destroy: Attempting to delete Report ID: ' . $damageReport->id);
        if ($damageReport->images()->exists()) {
            Log::info('DamageReportController@destroy: Deleting associated images for Report ID: ' . $damageReport->id);
            foreach ($damageReport->images as $image) {
                Storage::disk('public')->delete($image->url);
                $image->delete();
            }
        }
        $damageReport->delete();
        Log::info('DamageReportController@destroy: DamageReport deleted ID: ' . $damageReport->id);
        return response()->json(['message' => 'Damage report deleted successfully.'], 200);
    }
}