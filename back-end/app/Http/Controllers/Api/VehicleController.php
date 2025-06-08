<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleModel; // For validation and linking
use App\Models\Address;     // For validation and linking
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Enums\VehicleStatus; // Your enum for status
use Illuminate\Support\Str;  // For Str::uuid() if creating Address on the fly
use Illuminate\Support\Facades\Storage;
class VehicleController extends Controller
{
    /**
     * Helper method to transform a Vehicle model for API response.
     */
    protected function transformVehicle(Vehicle $vehicle): array
    {
        // Ensure relationships are loaded if they are to be included directly
        // $vehicle->loadMissing(['vehicleModel.vehicleType', 'currentLocationAddress']);

        return [
            'id' => $vehicle->id,
            'vehicle_model_id' => $vehicle->vehicle_model_id,
            'vehicle_model_title' => $vehicle->vehicleModel ? $vehicle->vehicleModel->title : null, // Example
            'current_location_address_id' => $vehicle->current_location_address_id,
            'current_location_display' => $vehicle->currentLocationAddress ? $vehicle->currentLocationAddress->street_line_1 . ', ' . $vehicle->currentLocationAddress->city : null, // Example
            'license_plate' => $vehicle->license_plate,
            'vin' => $vehicle->vin,
            'color' => $vehicle->color,
            'hexa_color_code' => $vehicle->hexa_color_code,
            'mileage' => (int) $vehicle->mileage,
            'base_price_per_day' => $vehicle->vehicleModel?->base_price_per_day,
            'status' => $vehicle->status, // This will be the string value of the enum
            'status_display' => $vehicle->status ? ucfirst(str_replace('_', ' ', $vehicle->status->value)) : null, // If status is an enum object
            'acquisition_date' => $vehicle->acquisition_date ? $vehicle->acquisition_date->toDateString() : null,
            'created_at' => $vehicle->created_at ? $vehicle->created_at->toDateTimeString() : null,
            'updated_at' => $vehicle->updated_at ? $vehicle->updated_at->toDateTimeString() : null,
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // if (!auth()->user()->can('view vehicles')) { /* ... */ }

        $query = Vehicle::query()->with(['vehicleModel:id,title,brand,model,model,base_price_per_day', 'currentLocationAddress:id,city,street_line_1']); // Eager load essentials

        // Search
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('license_plate', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('vin', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('color', 'LIKE', "%{$searchTerm}%")
                  ->orWhereHas('vehicleModel', function ($modelQuery) use ($searchTerm) {
                      $modelQuery->where('title', 'LIKE', "%{$searchTerm}%")
                                 ->orWhere('brand', 'LIKE', "%{$searchTerm}%")
                                 ->orWhere('model', 'LIKE', "%{$searchTerm}%");
                  })
                  ->orWhereHas('currentLocationAddress', function ($addressQuery) use ($searchTerm) {
                        $addressQuery->where('city', 'LIKE', "%{$searchTerm}%")
                                     ->orWhere('street_line_1', 'LIKE', "%{$searchTerm}%");
                  });
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $status = $request->input('status');
            // Validate against enum values if possible
            if (VehicleStatus::tryFrom($status)) { // tryFrom is PHP 8.1+ for backed enums
                $query->where('status', $status);
            }
        }

        // Filter by vehicle_model_id
        if ($request->filled('vehicle_model_id')) {
            $query->where('vehicle_model_id', $request->input('vehicle_model_id'));
        }


        // Sorting
        $sortBy = $request->input('sort_by', 'license_plate');
        $sortDirection = $request->input('sort_direction', 'asc');
        $allowedSorts = ['license_plate', 'vin', 'color', 'mileage', 'status', 'acquisition_date', 'created_at'];
        // To sort by related model fields, it's more complex, e.g. join or select raw.
        // For simplicity, we'll stick to direct vehicle fields for now.
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('license_plate', 'asc');
        }

        if ($request->boolean('all')) {
            $vehicles = $query->get();
            return response()->json(['data' => $vehicles->map(fn($v) => $this->transformVehicle($v))]);
        } else {
            $perPage = $request->input('per_page', 15);
            $vehiclesPaginated = $query->paginate((int)$perPage);
            $vehiclesPaginated->getCollection()->transform(fn($v) => $this->transformVehicle($v));
            return response()->json($vehiclesPaginated);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // if (!auth()->user()->can('create vehicles')) { /* ... */ }

        $validator = Validator::make($request->all(), [
            'vehicle_model_id' => 'required|uuid|exists:vehicle_models,id',
            'current_location_address_id' => 'nullable|uuid|exists:addresses,id', // Or logic to create new address
            'license_plate' => 'required|string|max:20|unique:vehicles,license_plate',
            'vin' => 'nullable|string|max:100|unique:vehicles,vin', // VINs are typically 17 chars
            'color' => 'required|string|max:50',
            'hexa_color_code' => 'nullable|string|max:7', // e.g., #RRGGBB
            'mileage' => 'required|integer|min:0',
            'status' => ['required', Rule::in(array_column(VehicleStatus::cases(), 'value'))], // Validate against enum values
            'acquisition_date' => 'nullable|date_format:Y-m-d',
            // Add logic for creating a new address if address fields are sent instead of ID
            // 'new_address.street_line_1' => 'required_without:current_location_address_id|string|max:255',
            // 'new_address.city' => 'required_without:current_location_address_id|string|max:100',
            // ... other address fields
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        // Example: Handle creating a new address if current_location_address_id is not provided
        // if ($request->filled('new_address.street_line_1') && !isset($validatedData['current_location_address_id'])) {
        //     $address = Address::create([
        //         'id' => Str::uuid()->toString(), // If Address model doesn't use HasUuid for some reason
        //         'street_line_1' => $request->input('new_address.street_line_1'),
        //         'city' => $request->input('new_address.city'),
        //         // ... other address fields from request
        //     ]);
        //     $validatedData['current_location_address_id'] = $address->id;
        // }

        $vehicle = Vehicle::create($validatedData);
        $vehicle->load(['vehicleModel', 'currentLocationAddress']); // Load for response

        return response()->json(['data' => $this->transformVehicle($vehicle), 'message' => 'Vehicle created successfully.'], 201);
    }

    /**
     * Display the specified resource.
     * This is the method we worked on for the detail page with multiple tabs.
     */
public function show(Request $request, Vehicle $vehicle)
    {
        $vehicle->load([
            'vehicleModel.vehicleType',
            'vehicleModel.media' => fn($q) => $q->orderBy('is_cover', 'desc')->orderBy('order', 'asc'),
            'vehicleModel.features' => fn($q) => $q->orderBy('category')->orderBy('name'),
            'vehicleModel.extras' => fn($q) => $q->orderBy('name'),
            // 'vehicleModel.insurancePlans', // Load if you need it in model_details
            'currentLocationAddress',
            'bookings' => fn($q) => $q->select(['id', 'vehicle_id', 'renter_user_id', 'start_date', 'end_date', 'status', 'created_at'])->with([ // Added created_at for sorting if needed
                'renter:id,full_name',
                'damageReports.images', // Assuming DamageReport has 'images'
            ])->orderBy('start_date', 'asc'),
            'operationalHolds.maintenanceRecord' => fn($q) => $q->select(['id', 'operational_hold_id', 'description', 'cost', 'created_at']),
        ]);

        $vehicleModel = $vehicle->vehicleModel;

        // --- गैदर ALL DAMAGE REPORTS (THIS SEEMS FINE FOR A SEPARATE LIST, NOT FOR CALENDAR DIRECTLY UNLESS MODIFIED) ---
        $allDamageReportsForListing = $vehicle->bookings->flatMap(function ($booking) {
            return $booking->damageReports->map(function ($report) use ($booking) {
                return [
                    'id' => $report->id,
                    'booking_id' => $booking->id,
                    'description' => $report->description,
                    'status' => $report->status,
                    'reported_at' => $report->reported_at?->toIso8601String(),
                    'images' => $report->images->map(function ($img) {
                        return [
                            'id' => $img->id,
                            'url' => $img->url ? Storage::url($img->url) : null, // Ensure full URL
                        ];
                    }),
                ];
            });
        })->values();

        // --- AGGREGATE SCHEDULE EVENTS FOR CALENDAR ---
        $scheduleEvents = [];

        // Bookings for Calendar
        foreach ($vehicle->bookings as $booking) {
            $scheduleEvents[] = [
                'id' => 'booking_' . $booking->id,
                'type' => 'booking',
                'title' => 'Booking: ' . ($booking->renter?->full_name ?? 'Unknown Renter'),
                'start' => $booking->start_date?->toIso8601String(),
                'end' => $booking->end_date?->toIso8601String(),
            ];
        }

        // Operational Holds for Calendar (Maintenance, Cleaning, other Holds)
        foreach ($vehicle->operationalHolds as $hold) {
            $eventTitle = $hold->reason ?? 'Operational Hold'; // Default title
            $eventType = 'operational_hold'; // Default type

            if ($hold->maintenanceRecord) {
                $eventType = 'maintenance'; // Specific type for maintenance
                $eventTitle = 'Maintenance: ' . ($hold->maintenanceRecord->description ?? $hold->reason);
            } elseif (strtolower(trim($hold->reason ?? '')) === 'cleaning') {
                $eventType = 'cleaning'; // Specific type for cleaning
                $eventTitle = 'Cleaning: ' . ($hold->notes ?? $hold->reason);
            }
            // Add more elseif conditions here if other operational hold reasons
            // should map to different 'types' for calendar display.

            $scheduleEvents[] = [
                'id' => 'hold_' . $hold->id,
                'type' => $eventType,
                'title' => $eventTitle,
                'start' => $hold->start_date?->toIso8601String(),
                'end' => $hold->end_date?->toIso8601String(),
            ];
        }

        // **** ADD DAMAGE REPORTS AS SINGLE-DAY EVENTS TO SCHEDULE_EVENTS ****
        foreach ($vehicle->bookings as $booking) {
            foreach ($booking->damageReports as $report) {
                if ($report->reported_at) { // Ensure there's a date
                    $scheduleEvents[] = [
                        'id' => 'damage_event_' . $report->id, // Unique ID prefix for calendar event
                        'type' => 'damage',                   // Type for frontend matching
                        'title' => 'Damage Reported',         // Simple title for tooltip
                        // More detailed title: 'Damage: ' . Str::limit($report->description, 25),
                        'start' => $report->reported_at->toIso8601String(), // Single day event
                        'end' => $report->reported_at->toIso8601String(),   // Start and end are the same
                        // You can include original_report_id or other details if needed by frontend
                        // 'original_report_id' => $report->id, 
                    ];
                }
            }
        }
        // **** END OF DAMAGE REPORT ADDITION TO SCHEDULE_EVENTS ****

        // Sort all schedule events by start date (optional)
        usort($scheduleEvents, function ($a, $b) {
            return strtotime($a['start'] ?? 'now') <=> strtotime($b['start'] ?? 'now');
        });


        // --- AGGREGATE ALERTS & HEALTH (FOR THE LIST CARD) ---
        $alertsAndHealth = [];

        // Damage reports for Alerts List
        foreach ($vehicle->bookings as $booking) {
            foreach ($booking->damageReports as $report) {
                $alertsAndHealth[] = [
                    'id' => 'damage_alert_' . $report->id, // Different ID for alert list item
                    'type' => 'damage',
                    'title' => 'Damage Report',
                    'details' => Str::limit($report->description, 50), // Limit details for list view
                    'date' => $report->reported_at?->toIso8601String(),
                    'action_label' => 'View Report', // Changed from "Install Report"
                ];
            }
        }

        // Maintenance for Alerts List (from Operational Holds)
        foreach ($vehicle->operationalHolds as $hold) {
            if ($hold->maintenanceRecord) {
                $alertsAndHealth[] = [
                    'id' => 'maintenance_alert_' . $hold->maintenanceRecord->id,
                    'type' => 'maintenance',
                    'title' => 'Maintenance Scheduled',
                    'details' => Str::limit($hold->maintenanceRecord->description ?? $hold->reason, 50),
                    'date' => $hold->start_date?->toIso8601String(), // Use hold's start date or maintenance record's due_date if available
                    'action_label' => 'View Log',
                ];
            }
        }

        // Cleaning for Alerts List (from Operational Holds)
        foreach ($vehicle->operationalHolds as $hold) {
            if (strtolower(trim($hold->reason ?? '')) === 'cleaning') {
                $alertsAndHealth[] = [
                    'id' => 'cleaning_alert_' . $hold->id,
                    'type' => 'cleaning',
                    'title' => 'Cleaning Scheduled',
                    'details' => Str::limit($hold->notes ?? $hold->reason, 50),
                    'date' => $hold->start_date?->toIso8601String(),
                    'action_label' => 'View Details',
                ];
            }
        }
        // You might want to sort alertsAndHealth by date too


        $modelDetailsPayload = $vehicleModel ? $this->transformVehicleModelForDetail($vehicleModel) : null;

        return response()->json([
            'data' => [
                'id' => $vehicle->id,
                'license_plate' => $vehicle->license_plate,
                'vin' => $vehicle->vin,
                'color' => $vehicle->color,
                'hexa_color_code' => $vehicle->hexa_color_code,
                'mileage' => (int) $vehicle->mileage,
                'status' => $vehicle->status, // This is the VehicleStatus Enum instance
                'status_display' => $vehicle->status ? ucfirst(str_replace('_', ' ', $vehicle->status->value)) : null, // For convenience
                'acquisition_date' => $vehicle->acquisition_date?->toDateString(),
                
                'model_details' => $modelDetailsPayload,
                'current_location' => $vehicle->currentLocationAddress ? $this->transformAddressForDetail($vehicle->currentLocationAddress) : null,
                
                'schedule_events' => $scheduleEvents, // This NOW INCLUDES damage and correctly typed cleaning/maintenance
                'alerts_and_health' => $alertsAndHealth,
                
                'damage_reports_listing' => $allDamageReportsForListing, // Keep original if needed for a separate detailed list of damages

                'created_at' => $vehicle->created_at?->toIso8601String(),
                'updated_at' => $vehicle->updated_at?->toIso8601String(),
            ]
        ]);
    }

    // Ensure your transformVehicleModelForDetail includes full URLs and color_hex for media
    private function transformVehicleModelForDetail(VehicleModel $model): ?array
    {
        if (!$model) return null;
        $model->loadMissing(['vehicleType', 'media' => fn($q) => $q->orderBy('is_cover', 'desc')->orderBy('order', 'asc'), 'features', 'extras']);

        $mainImageUrl = null;
        if ($model->media && $model->media->isNotEmpty()) {
            $coverMedia = $model->media->firstWhere('is_cover', true);
            if ($coverMedia && $coverMedia->url) {
                $mainImageUrl = Storage::url($coverMedia->url); 
            } else {
                $firstMedia = $model->media->first();
                if ($firstMedia && $firstMedia->url) {
                    $mainImageUrl = Storage::url($firstMedia->url);
                }
            }
        }

        return [
            'id' => $model->id,
            'title' => $model->title,
            'header_subtitle' => trim(ucfirst($model->transmission ?? '') . ' ' . ($model->vehicleType ? strtolower($model->vehicleType->name) : '')),
            'brand' => $model->brand, 
            'model_name' => $model->model, 
            'year' => (int) $model->year,
            'fuel_type' => $model->fuel_type, 
            'transmission' => $model->transmission,
            'number_of_seats' => (int) $model->number_of_seats, 
            'number_of_doors' => (int) $model->number_of_doors,
            'base_price_per_day' => (float) $model->base_price_per_day,
            'description' => $model->description,
            'main_image_url' => $mainImageUrl,
            'is_available'=>$model->is_available,
            'all_media' => $model->media ? $model->media->map(fn($m) => ([
                'id' => $m->id, 
                'url' => $m->url ? Storage::url($m->url) : null,
                'caption' => $m->caption ?? null,
                'is_cover' => (bool)$m->is_cover,
                'order' => $m->order ?? null,
                'color_hex' => $m->color_hex ?? null, 
                'media_type' => $m->media_type ?? 'image'
            ]))->values() : [],
            'available_colors_from_model' => $model->available_colors ?? [],
            'vehicle_type_name' => $model->vehicleType?->name,
            'features_grouped' => $model->features->isNotEmpty() ? $model->features->groupBy('category')->map(fn($catFeat, $catName) => ['category_name' => $catName?:'General', 'items' => $catFeat->map(fn($f) => ['id'=>$f->id, 'name'=>$f->name, 'description' => $f->description ?? null])->values()])->values() : [], // Added description to features
            'extras_available' => $model->extras->isNotEmpty() ? $model->extras->map(fn($e)=>(['id'=>$e->id, 'name'=>$e->name, 'description' => $e->description ?? null, 'default_price_per_day'=>(float)($e->default_price_per_day ?? 0)]))->values() : [], // Added description to extras
        ];
    }
     
    public function update(Request $request, Vehicle $vehicle)
    {
        // if (!auth()->user()->can('edit vehicles')) { /* ... */ }

        $validator = Validator::make($request->all(), [
            'vehicle_model_id' => 'sometimes|required|uuid|exists:vehicle_models,id',
            'current_location_address_id' => 'sometimes|nullable|uuid|exists:addresses,id',
            'license_plate' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('vehicles', 'license_plate')->ignore($vehicle->id)],
            'vin' => ['sometimes', 'nullable', 'string', 'max:100', Rule::unique('vehicles', 'vin')->ignore($vehicle->id)],
            'color' => 'sometimes|required|string|max:50',
            'hexa_color_code' => 'nullable|string|max:7',
            'mileage' => 'sometimes|required|integer|min:0',
            'status' => ['sometimes', 'required', Rule::in(array_column(VehicleStatus::cases(), 'value'))],
            'acquisition_date' => 'nullable|date_format:Y-m-d',
            // Add logic for updating/creating address if address fields are sent
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $vehicle->update($validator->validated());
        $vehicle->load(['vehicleModel', 'currentLocationAddress']); // Reload for response

        return response()->json(['data' => $this->transformVehicle($vehicle), 'message' => 'Vehicle updated successfully.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vehicle $vehicle)
    {
        // if (!auth()->user()->can('delete vehicles')) { /* ... */ }

        // Important: Check for active bookings or other critical dependencies before deleting a vehicle
        if ($vehicle->bookings()->whereNotIn('status', ['completed', 'cancelled_by_user', 'cancelled_by_platform'])->exists()) {
            return response()->json(['message' => 'Cannot delete: This vehicle has active or pending bookings.'], 409);
        }
        // Add checks for operational holds, etc. if needed

        $vehicle->delete(); // Consider soft deletes for vehicles

        return response()->json(['message' => 'Vehicle deleted successfully.'], 200);
    }


    // --- Example Helper methods for the show() method's complex transformation ---
    // You would move the transformation logic from the previous show() method here
   
      private function transformAddressForDetail(?Address $address): ?array // Allow $address to be nullable
    {
        if (!$address) {
            return null; // Return null if no address is provided
        }

        return [
            'id' => $address->id,
            'street_line_1' => $address->street_line_1,
            'street_line_2' => $address->street_line_2, // Now included
            'city' => $address->city,                   // Now included
            'postal_code' => $address->postal_code,     // Now included
            'country' => $address->country,             // Now included
            'notes' => $address->notes,
            // You could also include the accessor if needed on frontend, though frontend can construct it too
            // 'full_address_string' => $address->full_address_string, 
        ];
    }
    // You'd also need transformScheduleEvents and transformAlerts helpers
}