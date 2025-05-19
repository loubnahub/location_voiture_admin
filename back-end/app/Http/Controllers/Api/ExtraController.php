<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Extra;
use App\Models\Vehicle; // To get vehicle_model_id from vehicle_id
use App\Models\VehicleModel; // For attaching/detaching extras
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ExtraController extends Controller
{
    protected function transformExtra(Extra $extra): array
    {
        // Determine the primary price.
        $priceToUse = $extra->price ?? $extra->price_per_unit ?? $extra->default_price_per_day ?? 0;

        return [
            'id' => $extra->id,
            'name' => $extra->name,
            'description' => $extra->description,
            'price' => (float) $priceToUse,
            'default_price_per_day' => (float) ($extra->default_price_per_day ?? 0),
            'price_per_unit' => (float) ($extra->price_per_unit ?? $priceToUse),
            'created_at' => $extra->created_at?->toIso8601String(),
            'updated_at' => $extra->updated_at?->toIso8601String(),
        ];
    }

    public function index(Request $request)
    {
        // Log::info('ExtraController@index Request Params:', $request->all());
        $query = Extra::query();

        // --- Filtering ---

        // 1. Filter by 'vehicle_id' (for booking form to get model-specific extras)
        if ($request->filled('vehicle_id')) {
            $vehicleInstanceId = $request->input('vehicle_id');
            $vehicle = Vehicle::find($vehicleInstanceId);

            if ($vehicle && $vehicle->vehicle_model_id) {
                $vehicleModelId = $vehicle->vehicle_model_id;
                $query->whereHas('vehicleModels', function ($q) use ($vehicleModelId) {
                    $q->where('vehicle_model_id', $vehicleModelId);
                });
            } else {
                Log::warning('ExtraController@index: Vehicle not found or no model_id for vehicle_id filter.', ['vehicle_id' => $vehicleInstanceId]);
                return response()->json(['data' => []]);
            }
        }
        // If no vehicle_id, it returns extras based on other filters (e.g., search, pagination for admin).

        // 2. Search
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%");
            });
        }

        // --- Sorting ---
        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        $allowedSorts = ['name', 'price', 'default_price_per_day', 'created_at']; // Removed 'is_active'
        if (in_array($sortBy, $allowedSorts) && in_array(strtolower($sortDirection), ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('name', 'asc');
        }

        // --- Pagination or All ---
        if ($request->boolean('all') || $request->filled('vehicle_id')) {
            $extras = $query->get();
            return response()->json(['data' => $extras->map(fn($extra) => $this->transformExtra($extra))]);
        } else {
            $perPage = $request->input('per_page', config('pagination.default_per_page', 15));
            $extrasPaginated = $query->paginate((int)$perPage);
            $extrasPaginated->getCollection()->transform(fn($extra) => $this->transformExtra($extra));
            return response()->json($extrasPaginated);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:extras,name',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'default_price_per_day' => 'nullable|numeric|min:0',
            'price_per_unit' => 'nullable|numeric|min:0',
            // 'is_active' removed
            'vehicle_model_ids' => 'nullable|array',
            'vehicle_model_ids.*' => 'required|exists:vehicle_models,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        // 'is_active' removed

        foreach (['price', 'default_price_per_day', 'price_per_unit'] as $priceField) {
            if (isset($validatedData[$priceField])) {
                $validatedData[$priceField] = (float) $validatedData[$priceField];
            }
        }

        $vehicleModelIds = $validatedData['vehicle_model_ids'] ?? null;
        if (array_key_exists('vehicle_model_ids', $validatedData)) {
            unset($validatedData['vehicle_model_ids']);
        }

        $extra = Extra::create($validatedData);

        if ($vehicleModelIds && method_exists($extra, 'vehicleModels')) {
            $extra->vehicleModels()->sync($vehicleModelIds);
        }

        return response()->json([
            'data' => $this->transformExtra($extra->fresh()->load('vehicleModels')),
            'message' => 'Extra created successfully.'
        ], 201);
    }

    public function show(Extra $extra)
    {
        return response()->json(['data' => $this->transformExtra($extra)]);
    }

    public function update(Request $request, Extra $extra)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('extras', 'name')->ignore($extra->id)],
            'description' => 'nullable|string|max:1000',
            'price' => 'sometimes|required|numeric|min:0',
            'default_price_per_day' => 'nullable|numeric|min:0',
            'price_per_unit' => 'nullable|numeric|min:0',
            // 'is_active' removed
            'vehicle_model_ids' => 'nullable|array',
            'vehicle_model_ids.*' => 'required|exists:vehicle_models,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        // 'is_active' removed

        foreach (['price', 'default_price_per_day', 'price_per_unit'] as $priceField) {
            if (array_key_exists($priceField, $validatedData)) {
                $validatedData[$priceField] = (float) $validatedData[$priceField];
            }
        }

        $vehicleModelIds = null;
        if ($request->exists('vehicle_model_ids')) {
            $vehicleModelIds = $validatedData['vehicle_model_ids'] ?? [];
            unset($validatedData['vehicle_model_ids']);
        }

        $extra->update($validatedData);

        if ($vehicleModelIds !== null && method_exists($extra, 'vehicleModels')) {
            $extra->vehicleModels()->sync($vehicleModelIds);
        }

        return response()->json([
            'data' => $this->transformExtra($extra->fresh()->load('vehicleModels')),
            'message' => 'Extra updated successfully.'
        ]);
    }

    public function destroy(Extra $extra)
    {
        if (method_exists($extra, 'vehicleModels') && $extra->vehicleModels()->exists()) {
             $extra->vehicleModels()->detach();
             Log::info('ExtraController@destroy: Detached extra from vehicle models before deletion.', ['extra_id' => $extra->id]);
        }
        $extra->delete();
        return response()->json(['message' => 'Extra deleted successfully.'], 200);
    }
}