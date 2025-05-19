<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule; // For unique validation on update

class VehicleTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // --- Permission Check (Example) ---
        // if (!auth()->user()->can('view vehicle types')) {
        //     return response()->json(['message' => 'Forbidden'], 403);
        // }

        $query = VehicleType::query();

        // --- Search ---
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%");
        }

        // --- Sorting ---
        $sortBy = $request->input('sort_by', 'name'); // Default sort by name
        $sortDirection = $request->input('sort_direction', 'asc');
        $allowedSortColumns = ['name', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('name', 'asc');
        }

        // --- Pagination or All ---
        if ($request->boolean('all')) { // Add ?all=true to get all records
            $vehicleTypes = $query->get();
            // Manual transformation if not using API Resources
            $transformedData = $vehicleTypes->map(fn($type) => $this->transformVehicleType($type));
            return response()->json(['data' => $transformedData]);
        } else {
            $perPage = $request->input('per_page', 15);
            $vehicleTypesPaginated = $query->paginate((int)$perPage);
            // Manual transformation for paginated data
            $vehicleTypesPaginated->getCollection()->transform(fn($type) => $this->transformVehicleType($type));
            return response()->json($vehicleTypesPaginated);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // --- Permission Check ---
        // if (!auth()->user()->can('create vehicle types')) {
        //     return response()->json(['message' => 'Forbidden'], 403);
        // }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:vehicle_types,name',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $vehicleType = VehicleType::create($validator->validated());

        return response()->json(['data' => $this->transformVehicleType($vehicleType), 'message' => 'Vehicle type created successfully.'], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\VehicleType  $vehicleType (Route Model Binding)
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(VehicleType $vehicleType)
    {
        // --- Permission Check ---
        // if (!auth()->user()->can('view vehicle types')) {
        //     return response()->json(['message' => 'Forbidden'], 403);
        // }

        // Optionally load related models if needed for detail view, e.g., count of models
        // $vehicleType->loadCount('vehicleModels');

        return response()->json(['data' => $this->transformVehicleType($vehicleType)]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\VehicleType  $vehicleType
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, VehicleType $vehicleType)
    {
        // --- Permission Check ---
        // if (!auth()->user()->can('edit vehicle types')) {
        //     return response()->json(['message' => 'Forbidden'], 403);
        // }

        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes', // only validate if present
                'required',
                'string',
                'max:255',
                Rule::unique('vehicle_types', 'name')->ignore($vehicleType->id),
            ],
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $vehicleType->update($validator->validated());

        return response()->json(['data' => $this->transformVehicleType($vehicleType), 'message' => 'Vehicle type updated successfully.']);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\VehicleType  $vehicleType
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(VehicleType $vehicleType)
    {
        // --- Permission Check ---
        // if (!auth()->user()->can('delete vehicle types')) {
        //     return response()->json(['message' => 'Forbidden'], 403);
        // }

        // Consider what happens if vehicle models are using this type.
        // Soft deletes or preventing deletion might be necessary.
        if ($vehicleType->vehicleModels()->exists()) {
            return response()->json(['message' => 'Cannot delete: This vehicle type is in use by vehicle models.'], 409); // 409 Conflict
        }

        $vehicleType->delete();

        return response()->json(['message' => 'Vehicle type deleted successfully.'], 200); // or 204 for No Content
    }

    /**
     * Helper method to transform a VehicleType model for API response.
     *
     * @param VehicleType $vehicleType
     * @return array
     */
    protected function transformVehicleType(VehicleType $vehicleType): array
    {
        return [
            'id' => $vehicleType->id,
            'name' => $vehicleType->name,
            'description' => $vehicleType->description,
            'notes' => $vehicleType->notes,
            'created_at' => $vehicleType->created_at ? $vehicleType->created_at->toDateTimeString() : null,
            'updated_at' => $vehicleType->updated_at ? $vehicleType->updated_at->toDateTimeString() : null,
            // 'vehicle_models_count' => $vehicleType->vehicle_models_count, // If loaded with loadCount
        ];
    }
}