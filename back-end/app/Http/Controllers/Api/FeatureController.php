<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class FeatureController extends Controller
{
    /**
     * Helper to transform feature data for API response.
     */
    protected function transformFeature(Feature $feature): array
    {
        return [
            'id' => $feature->id,
            'name' => $feature->name,
            'description' => $feature->description,
            'category' => $feature->category,
            'created_at' => $feature->created_at ? $feature->created_at->toDateTimeString() : null,
            'updated_at' => $feature->updated_at ? $feature->updated_at->toDateTimeString() : null,
            // 'vehicle_models_count' => $feature->vehicle_models_count, // If you loadCount('vehicleModels')
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Optional: Permission check
        // if (!auth()->user()->can('view features')) { return response()->json(['message' => 'Forbidden'], 403); }

        $query = Feature::query();

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('category', 'LIKE', "%{$searchTerm}%");
            });
        }

        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        $allowedSorts = ['name', 'category', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('name', 'asc');
        }

        if ($request->boolean('all')) {
            $features = $query->get();
            return response()->json(['data' => $features->map(fn($feature) => $this->transformFeature($feature))]);
        } else {
            $perPage = $request->input('per_page', 15);
            $featuresPaginated = $query->paginate((int)$perPage);
            $featuresPaginated->getCollection()->transform(fn($feature) => $this->transformFeature($feature));
            return response()->json($featuresPaginated);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Optional: Permission check
        // if (!auth()->user()->can('create features')) { return response()->json(['message' => 'Forbidden'], 403); }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:features,name', // Feature names usually unique
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $feature = Feature::create($validator->validated());
        return response()->json(['data' => $this->transformFeature($feature), 'message' => 'Feature created successfully.'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Feature $feature)
    {
        // Optional: Permission check
        // if (!auth()->user()->can('view features')) { return response()->json(['message' => 'Forbidden'], 403); }
        // $feature->loadCount('vehicleModels'); // Example
        return response()->json(['data' => $this->transformFeature($feature)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Feature $feature)
    {
        // Optional: Permission check
        // if (!auth()->user()->can('edit features')) { return response()->json(['message' => 'Forbidden'], 403); }

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('features', 'name')->ignore($feature->id)],
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $feature->update($validator->validated());
        return response()->json(['data' => $this->transformFeature($feature), 'message' => 'Feature updated successfully.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Feature $feature)
    {
        // Optional: Permission check
        // if (!auth()->user()->can('delete features')) { return response()->json(['message' => 'Forbidden'], 403); }

        // Check if the feature is associated with any vehicle models
        if ($feature->vehicleModels()->exists()) { // Assumes 'vehicleModels' relationship exists on Feature model
            return response()->json(['message' => 'Cannot delete: This feature is currently assigned to one or more vehicle models.'], 409); // Conflict
        }

        $feature->delete();
        return response()->json(['message' => 'Feature deleted successfully.'], 200); // or 204
    }
}