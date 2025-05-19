<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OperationalHold;
use App\Models\Vehicle;
use App\Models\Booking;
use App\Models\MaintenanceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class OperationalHoldController extends Controller
{
    protected function transformOperationalHold(OperationalHold $hold): array
    {
        // Ensure all necessary relations are loaded for the transformation
        $hold->loadMissing([
            'vehicle:id,license_plate', // Basic vehicle info
            'vehicle.vehicleModel:id,title', // For better display name
            'createdByUser:id,full_name', // Creator info
            'booking:id', // Basic booking info if linked
            'maintenanceRecord' // << THE CRUCIAL ONE
        ]);

        // Prepare the maintenance_record sub-object
        $maintenanceRecordOutput = null;
        if ($hold->maintenanceRecord) { // Check if the relationship property is loaded and not null
            $maintenanceRecordOutput = [
                'id' => $hold->maintenanceRecord->id,
                'description' => $hold->maintenanceRecord->description,
                'cost' => $hold->maintenanceRecord->cost !== null ? (float) $hold->maintenanceRecord->cost : null,
                'notes' => $hold->maintenanceRecord->notes,
                // Add any other fields from MaintenanceRecord you want the frontend to have for display/edit
            ];
            Log::info('TransformHold: Maintenance Record data prepared for Hold ID ' . $hold->id, $maintenanceRecordOutput);
        } else {
            Log::info('TransformHold: No Maintenance Record found or loaded for Hold ID ' . $hold->id);
        }

        // Determine the 'requires_maintenance' flag
        // True if an actual maintenance record exists, or if the reason strongly implies it.
        // Adjust the reason check as per your business logic.
        $hasLinkedMaintenanceRecord = $hold->maintenanceRecord()->exists(); // Checks DB
        $reasonImpliesMaintenance = stripos($hold->reason, 'maintenance') !== false ||
                                    stripos($hold->reason, 'repair') !== false ||
                                    stripos($hold->reason, 'service') !== false;
        $requiresMaintenanceFlag = $hasLinkedMaintenanceRecord || $reasonImpliesMaintenance;
        Log::info('TransformHold: Hold ID ' . $hold->id . ' - hasLinkedMR: ' . ($hasLinkedMaintenanceRecord?'true':'false') . ', reasonImplies: ' . ($reasonImpliesMaintenance?'true':'false') . ', finalRequiresFlag: ' . ($requiresMaintenanceFlag?'true':'false'));


        return [
            'id' => $hold->id,
            'booking_id' => $hold->booking_id,
            'booking_identifier' => $hold->booking ? 'Booking #' . substr($hold->booking_id, 0, 8) . '...' : null,
            'vehicle_id' => $hold->vehicle_id,
            'vehicle_display' => $hold->vehicle
                ? ($hold->vehicle->vehicleModel ? $hold->vehicle->vehicleModel->title . ' (' . $hold->vehicle->license_plate . ')' : $hold->vehicle->license_plate)
                : null,
            'created_by_user_id' => $hold->created_by_user_id,
            'creator_name' => $hold->createdByUser ? $hold->createdByUser->full_name : null,
            'start_date' => $hold->start_date->toDateTimeString(),
            'end_date' => $hold->end_date->toDateTimeString(),
            'reason' => $hold->reason,
            'notes' => $hold->notes,

            // These are the crucial fields for the frontend form
            'requires_maintenance' => $requiresMaintenanceFlag,
            'maintenance_record' => $maintenanceRecordOutput, // This will be the object or null
            'existing_maintenance_record_id' => $maintenanceRecordOutput ? $maintenanceRecordOutput['id'] : null, // ID if record exists

            'created_at' => $hold->created_at ? $hold->created_at->toDateTimeString() : null,
            'updated_at' => $hold->updated_at ? $hold->updated_at->toDateTimeString() : null,
        ];
    }

    // index() method - Ensure 'maintenanceRecord' is in the ->with() array
    public function index(Request $request)
    {
        $query = OperationalHold::query()->with([
            'vehicle:id,license_plate',
            'vehicle.vehicleModel:id,title',
            'createdByUser:id,full_name',
            'booking:id',
            'maintenanceRecord' // << ENSURE THIS IS PRESENT FOR LIST VIEW TOO
        ]);

        // ... (rest of your index method as it was - search, filter, sort, pagination)
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('reason', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('notes', 'LIKE', "%{$searchTerm}%")
                  ->orWhereHas('vehicle', function ($vq) use ($searchTerm) {
                      $vq->where('license_plate', 'LIKE', "%{$searchTerm}%")
                         ->orWhereHas('vehicleModel', fn($vmq) => $vmq->where('title', 'LIKE', "%{$searchTerm}%"));
                  })
                  ->orWhereHas('createdByUser', fn($uq) => $uq->where('full_name', 'LIKE', "%{$searchTerm}%"));
            });
        }
        if ($request->filled('vehicle_id')) { $query->where('vehicle_id', $request->input('vehicle_id')); }
        if ($request->boolean('active_only')) { $now = Carbon::now(); $query->where('start_date', '<=', $now)->where('end_date', '>=', $now); }
        if ($request->boolean('upcoming_only')) { $now = Carbon::now(); $query->where('start_date', '>', $now); }
        if ($request->boolean('past_only')) { $now = Carbon::now(); $query->where('end_date', '<', $now); }

        $sortBy = $request->input('sort_by', 'start_date');
        $sortDirection = $request->input('sort_direction', 'desc');
        $allowedSorts = ['start_date', 'end_date', 'reason', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) { $query->orderBy($sortBy, $sortDirection); } else { $query->orderBy('start_date', 'desc'); }

        if ($request->boolean('all')) {
            $holds = $query->get();
            return response()->json(['data' => $holds->map(fn($hold) => $this->transformOperationalHold($hold))]);
        } else {
            $perPage = $request->input('per_page', config('pagination.default_per_page', 15));
            $holdsPaginated = $query->paginate((int)$perPage);
            $holdsPaginated->getCollection()->transform(fn($hold) => $this->transformOperationalHold($hold));
            return response()->json($holdsPaginated);
        }
    }


    // store() method - should be largely okay from your last version, ensure it calls transformOperationalHold for response
    public function store(Request $request)
    {
        Log::info('OperationalHoldController@store: Request data:', $request->all());

        $baseRules = [ /* ... as before ... */
            'vehicle_id' => 'required|uuid|exists:vehicles,id',
            'booking_id' => 'nullable|uuid|exists:bookings,id',
            'start_date' => 'required|date_format:Y-m-d H:i:s|after_or_equal:now',
            'end_date' => 'required|date_format:Y-m-d H:i:s|after:start_date',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ];
        $maintenanceRules = [];
        if ($request->filled('maintenance_record_attributes') && is_array($request->input('maintenance_record_attributes'))) {
            $maintenanceAttributes = $request->input('maintenance_record_attributes');
            if (!empty($maintenanceAttributes['description'])) {
                $maintenanceRules = [
                    'maintenance_record_attributes.description' => 'required|string|max:65535',
                    'maintenance_record_attributes.cost' => 'nullable|numeric|min:0',
                    'maintenance_record_attributes.notes' => 'nullable|string|max:1000',
                ];
            }
        }
        $validator = Validator::make($request->all(), array_merge($baseRules, $maintenanceRules));

        if ($validator->fails()) { /* ... error handling ... */
            Log::error('OperationalHoldController@store: Validation failed.', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $operationalHoldData = [ /* ... populate from validatedData, excluding maintenance ... */
            'vehicle_id' => $validatedData['vehicle_id'],
            'booking_id' => $validatedData['booking_id'] ?? null,
            'start_date' => $validatedData['start_date'],
            'end_date' => $validatedData['end_date'],
            'reason' => $validatedData['reason'],
            'notes' => $validatedData['notes'] ?? null,
            'created_by_user_id' => Auth::id(),
        ];
        $operationalHold = OperationalHold::create($operationalHoldData);

        if (isset($validatedData['maintenance_record_attributes'])) {
            $maintenanceAttrs = $validatedData['maintenance_record_attributes'];
            if (!empty($maintenanceAttrs['description'])) {
                $operationalHold->maintenanceRecord()->create([
                    'vehicle_id' => $operationalHold->vehicle_id,
                    'description' => $maintenanceAttrs['description'],
                    'cost' => $maintenanceAttrs['cost'] ?? null,
                    'notes' => $maintenanceAttrs['notes'] ?? null,
                ]);
            }
        }
        return response()->json([
            'data' => $this->transformOperationalHold($operationalHold->refresh()), // Use refresh
            'message' => 'Operational hold created successfully.'
        ], 201);
    }

    // show() method - ensure it calls transformOperationalHold
    public function show(OperationalHold $operationalHold)
    {
        // transformOperationalHold will loadMissing if needed
        return response()->json(['data' => $this->transformOperationalHold($operationalHold)]);
    }

    // update() method - ensure it calls transformOperationalHold for response
    public function update(Request $request, OperationalHold $operationalHold)
    {
        Log::info('OperationalHoldController@update: Request data for Hold ID ' . $operationalHold->id . ':', $request->all());
        $baseRules = [ /* ... as before ... */
            'vehicle_id' => 'sometimes|required|uuid|exists:vehicles,id',
            'booking_id' => 'nullable|uuid|exists:bookings,id',
            'start_date' => 'sometimes|required|date_format:Y-m-d H:i:s',
            'end_date' => 'sometimes|required|date_format:Y-m-d H:i:s|after:start_date',
            'reason' => 'sometimes|required|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ];
        $maintenanceRules = [];
        if ($request->has('maintenance_record_attributes')) {
            $maintenanceAttributesFromRequest = $request->input('maintenance_record_attributes');
            if (is_array($maintenanceAttributesFromRequest) && !empty($maintenanceAttributesFromRequest['description'])) {
                $maintenanceRules = [ /* ... as before ... */
                    'maintenance_record_attributes.description' => 'required|string|max:65535',
                    'maintenance_record_attributes.cost' => 'nullable|numeric|min:0',
                    'maintenance_record_attributes.notes' => 'nullable|string|max:1000',
                    'existing_maintenance_record_id' => 'nullable|uuid|exists:maintenance_records,id',
                ];
            } else {
                 $maintenanceRules = [ /* ... as before ... */
                    'maintenance_record_attributes' => 'nullable|array',
                    'existing_maintenance_record_id' => 'nullable|uuid|exists:maintenance_records,id',
                ];
            }
        }
        $validator = Validator::make($request->all(), array_merge($baseRules, $maintenanceRules));

        if ($validator->fails()) { /* ... error handling ... */
            Log::error('OperationalHoldController@update: Validation failed for Hold ID ' . $operationalHold->id, $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $operationalHoldUpdateData = $validatedData; // Start with all
        unset($operationalHoldUpdateData['maintenance_record_attributes']); // Remove for main update
        unset($operationalHoldUpdateData['existing_maintenance_record_id']); // Remove for main update
        $operationalHold->update($operationalHoldUpdateData);

        if ($request->has('maintenance_record_attributes')) {
            $maintenanceAttrs = $validatedData['maintenance_record_attributes'] ?? null;
            $existingMRIdFromRequest = $validatedData['existing_maintenance_record_id'] ?? null;

            if (is_array($maintenanceAttrs) && !empty($maintenanceAttrs['description'])) {
                $maintenancePayload = [ /* ... populate ... */
                    'vehicle_id' => $operationalHold->vehicle_id,
                    'description' => $maintenanceAttrs['description'],
                    'cost' => $maintenanceAttrs['cost'] ?? null,
                    'notes' => $maintenanceAttrs['notes'] ?? null,
                ];
                if ($existingMRIdFromRequest) {
                    $maintenanceRecord = MaintenanceRecord::where('id', $existingMRIdFromRequest)
                                             ->where('operational_hold_id', $operationalHold->id)->first();
                    if ($maintenanceRecord) {
                        $maintenanceRecord->update($maintenancePayload);
                    } else {
                        optional($operationalHold->maintenanceRecord)->delete();
                        $operationalHold->maintenanceRecord()->create($maintenancePayload);
                    }
                } else {
                    $operationalHold->maintenanceRecord()->updateOrCreate(
                        ['operational_hold_id' => $operationalHold->id],
                        $maintenancePayload
                    );
                }
            } else {
                optional($operationalHold->maintenanceRecord)->delete();
            }
        }
        return response()->json([
            'data' => $this->transformOperationalHold($operationalHold->refresh()), // Use refresh
            'message' => 'Operational hold updated successfully.'
        ]);
    }

    // destroy() method - should be okay from your last version
    public function destroy(OperationalHold $operationalHold)
    {
        Log::info('OperationalHoldController@destroy: Attempting to delete OperationalHold ID: ' . $operationalHold->id);
        if ($operationalHold->maintenanceRecord) {
            Log::info('OperationalHoldController@destroy: Deleting associated MaintenanceRecord ID: ' . $operationalHold->maintenanceRecord->id);
            $operationalHold->maintenanceRecord->delete();
        }
        $operationalHold->delete();
        Log::info('OperationalHoldController@destroy: OperationalHold deleted ID: ' . $operationalHold->id);
        return response()->json(['message' => 'Operational hold deleted successfully.'], 200);
    }
}