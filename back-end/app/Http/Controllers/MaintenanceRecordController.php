<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceRecord;
use App\Models\Vehicle; // For validation
use App\Models\OperationalHold; // For validation if linking
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class MaintenanceRecordController extends Controller
{
    protected function transformMaintenanceRecord(MaintenanceRecord $record): array
    {
        $record->loadMissing(['vehicle:id,license_plate', 'vehicle.vehicleModel:id,title', 'operationalHold:id,reason']);

        return [
            'id' => $record->id,
            'vehicle_id' => $record->vehicle_id,
            'vehicle_display' => $record->vehicle
                ? ($record->vehicle->vehicleModel ? $record->vehicle->vehicleModel->title . ' (' . $record->vehicle->license_plate . ')' : $record->vehicle->license_plate)
                : null,
            'operational_hold_id' => $record->operational_hold_id,
            'operational_hold_reason' => $record->operationalHold ? $record->operationalHold->reason : null,
            'description' => $record->description,
            'cost' => $record->cost !== null ? (float) $record->cost : null,
            'notes' => $record->notes,
            'created_at' => $record->created_at->toDateTimeString(),
            'updated_at' => $record->updated_at->toDateTimeString(),
            // created_by_user_id if you add it to MaintenanceRecord model
            // 'creator_name' => $record->user ? $record->user->full_name : null,
        ];
    }

    public function index(Request $request)
    {
        $query = MaintenanceRecord::query()->with([
            'vehicle:id,license_plate',
            'vehicle.vehicleModel:id,title',
            'operationalHold:id,reason'
            // 'user:id,full_name' // If you add created_by_user_id
        ]);

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('description', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('notes', 'LIKE', "%{$searchTerm}%")
                  ->orWhereHas('vehicle', fn($vq) => 
                        $vq->where('license_plate', 'LIKE', "%{$searchTerm}%")
                           ->orWhereHas('vehicleModel', fn($vmq) => $vmq->where('title', 'LIKE', "%{$searchTerm}%"))
                    );
            });
        }

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->input('vehicle_id'));
        }
        if ($request->filled('operational_hold_id')) {
            $query->where('operational_hold_id', $request->input('operational_hold_id'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        // Add more sortable columns: 'cost', 'vehicle_id'
        $allowedSorts = ['created_at', 'updated_at', 'cost'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        if ($request->boolean('all')) {
            $records = $query->get();
            return response()->json(['data' => $records->map(fn($r) => $this->transformMaintenanceRecord($r))]);
        } else {
            $perPage = $request->input('per_page', config('pagination.default_per_page', 15));
            $recordsPaginated = $query->paginate((int)$perPage);
            $recordsPaginated->getCollection()->transform(fn($r) => $this->transformMaintenanceRecord($r));
            return response()->json($recordsPaginated);
        }
    }

    public function store(Request $request)
    {
        Log::info('MaintenanceRecordController@store: Request data:', $request->all());
        $validator = Validator::make($request->all(), [
            'vehicle_id' => 'required|uuid|exists:vehicles,id',
            'operational_hold_id' => 'nullable|uuid|exists:operational_holds,id', // Can be created standalone
            'description' => 'required|string|max:65535',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            // 'created_by_user_id' => 'required|uuid|exists:users,id', // If you want to track who created it
        ]);

        if ($validator->fails()) {
            Log::error('MaintenanceRecordController@store: Validation failed.', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        // if you add created_by_user_id:
        // $validatedData['created_by_user_id'] = Auth::id();

        // Ensure operational_hold_id is for the same vehicle if provided
        if (!empty($validatedData['operational_hold_id'])) {
            $hold = OperationalHold::find($validatedData['operational_hold_id']);
            if (!$hold || $hold->vehicle_id !== $validatedData['vehicle_id']) {
                 Log::error('MaintenanceRecordController@store: operational_hold_id vehicle mismatch.');
                return response()->json(['errors' => ['operational_hold_id' => ['The provided operational hold is not for the selected vehicle.']]], 422);
            }
        }


        $maintenanceRecord = MaintenanceRecord::create($validatedData);
        Log::info('MaintenanceRecordController@store: MaintenanceRecord created with ID: ' . $maintenanceRecord->id);

        return response()->json([
            'data' => $this->transformMaintenanceRecord($maintenanceRecord->refresh()),
            'message' => 'Maintenance record created successfully.'
        ], 201);
    }

    public function show(MaintenanceRecord $maintenanceRecord) // Route model binding
    {
        return response()->json(['data' => $this->transformMaintenanceRecord($maintenanceRecord)]);
    }

    public function update(Request $request, MaintenanceRecord $maintenanceRecord)
    {
        Log::info('MaintenanceRecordController@update: Request data for MR ID ' . $maintenanceRecord->id . ':', $request->all());
        $validator = Validator::make($request->all(), [
            'vehicle_id' => 'sometimes|required|uuid|exists:vehicles,id',
            'operational_hold_id' => 'nullable|uuid|exists:operational_holds,id',
            'description' => 'sometimes|required|string|max:65535',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            Log::error('MaintenanceRecordController@update: Validation failed for MR ID ' . $maintenanceRecord->id, $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        // Ensure operational_hold_id is for the same vehicle if vehicle_id or operational_hold_id is being changed
        $targetVehicleId = $validatedData['vehicle_id'] ?? $maintenanceRecord->vehicle_id;
        if (isset($validatedData['operational_hold_id']) && !empty($validatedData['operational_hold_id'])) {
            $hold = OperationalHold::find($validatedData['operational_hold_id']);
            if (!$hold || $hold->vehicle_id !== $targetVehicleId) {
                Log::error('MaintenanceRecordController@update: operational_hold_id vehicle mismatch.');
                return response()->json(['errors' => ['operational_hold_id' => ['The provided operational hold is not for the target vehicle.']]], 422);
            }
        } elseif (isset($validatedData['operational_hold_id']) && $validatedData['operational_hold_id'] === null) {
            // Allowing to de-associate from a hold
        }


        $maintenanceRecord->update($validatedData);
        Log::info('MaintenanceRecordController@update: MaintenanceRecord updated for ID: ' . $maintenanceRecord->id);

        return response()->json([
            'data' => $this->transformMaintenanceRecord($maintenanceRecord->refresh()),
            'message' => 'Maintenance record updated successfully.'
        ]);
    }

    public function destroy(MaintenanceRecord $maintenanceRecord)
    {
        Log::info('MaintenanceRecordController@destroy: Attempting to delete MR ID: ' . $maintenanceRecord->id);
        // Add any business logic here before deletion if needed
        $maintenanceRecord->delete();
        Log::info('MaintenanceRecordController@destroy: MaintenanceRecord deleted ID: ' . $maintenanceRecord->id);
        return response()->json(['message' => 'Maintenance record deleted successfully.'], 200);
    }
}