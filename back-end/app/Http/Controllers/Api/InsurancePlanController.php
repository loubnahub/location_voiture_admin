<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InsurancePlan; // Your InsurancePlan model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class InsurancePlanController extends Controller
{
    /**
     * Helper method to transform an InsurancePlan model for API response.
     */
    protected function transformInsurancePlan(InsurancePlan $plan): array
    {
        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'provider' => $plan->provider,
            'coverage_details' => $plan->coverage_details,
            'price_per_day' => (float) $plan->price_per_day,
            'is_active' => (bool) $plan->is_active, // Ensure boolean
            'created_at' => $plan->created_at ? $plan->created_at->toDateTimeString() : null,
            'updated_at' => $plan->updated_at ? $plan->updated_at->toDateTimeString() : null,
            // 'vehicle_models_count' => $plan->vehicle_models_count, // If loaded
            // 'bookings_count' => $plan->bookings_count, // If loaded
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Optional: Permission check
        // if (!auth()->user()->can('view insurance plans')) { return response()->json(['message' => 'Forbidden'], 403); }

        $query = InsurancePlan::query();

        // Search
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('provider', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('coverage_details', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'name'); // Default sort by name
        $sortDirection = $request->input('sort_direction', 'asc');
        $allowedSorts = ['name', 'provider', 'price_per_day', 'is_active', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('name', 'asc');
        }

        // Pagination or All
        if ($request->boolean('all')) {
            $plans = $query->get();
            return response()->json(['data' => $plans->map(fn($plan) => $this->transformInsurancePlan($plan))]);
        } else {
            $perPage = $request->input('per_page', 15);
            $plansPaginated = $query->paginate((int)$perPage);
            $plansPaginated->getCollection()->transform(fn($plan) => $this->transformInsurancePlan($plan));
            return response()->json($plansPaginated);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Optional: Permission check
        // if (!auth()->user()->can('create insurance plans')) { return response()->json(['message' => 'Forbidden'], 403); }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:insurance_plans,name',
            'provider' => 'nullable|string|max:255',
            'coverage_details' => 'required|string',
            'price_per_day' => 'required|numeric|min:0',
            'is_active' => 'sometimes|boolean', // 'sometimes' means only validate if present
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        // Ensure correct types before creation
        $validatedData['price_per_day'] = (float) $validatedData['price_per_day'];
        // If 'is_active' is not sent, it won't be in $validatedData if 'sometimes' is used.
        // The model's default or database default would apply.
        // If you want it to default to true if not sent, handle it here or in model's $attributes.
        if (!isset($validatedData['is_active'])) {
            $validatedData['is_active'] = true; // Or false, depending on desired default if not provided
        } else {
            $validatedData['is_active'] = filter_var($validatedData['is_active'], FILTER_VALIDATE_BOOLEAN);
        }


        $plan = InsurancePlan::create($validatedData);

        return response()->json(['data' => $this->transformInsurancePlan($plan), 'message' => 'Insurance plan created successfully.'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(InsurancePlan $insurancePlan) // Route Model Binding
    {
        // Optional: Permission check
        // if (!auth()->user()->can('view insurance plans')) { return response()->json(['message' => 'Forbidden'], 403); }

        // $insurancePlan->loadCount(['vehicleModels', 'bookings']); // Example
        return response()->json(['data' => $this->transformInsurancePlan($insurancePlan)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, InsurancePlan $insurancePlan)
    {
        // Optional: Permission check
        // if (!auth()->user()->can('edit insurance plans')) { return response()->json(['message' => 'Forbidden'], 403); }

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('insurance_plans', 'name')->ignore($insurancePlan->id)],
            'provider' => 'nullable|string|max:255',
            'coverage_details' => 'sometimes|required|string',
            'price_per_day' => 'sometimes|required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        if (isset($validatedData['price_per_day'])) {
            $validatedData['price_per_day'] = (float) $validatedData['price_per_day'];
        }
        if (array_key_exists('is_active', $validatedData)) { // Check if 'is_active' was actually sent
            $validatedData['is_active'] = filter_var($validatedData['is_active'], FILTER_VALIDATE_BOOLEAN);
        }


        $insurancePlan->update($validatedData);

        return response()->json(['data' => $this->transformInsurancePlan($insurancePlan), 'message' => 'Insurance plan updated successfully.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InsurancePlan $insurancePlan)
    {
        // Optional: Permission check
        // if (!auth()->user()->can('delete insurance plans')) { return response()->json(['message' => 'Forbidden'], 403); }

        // Check if the plan is associated with any vehicle models or active bookings
        if ($insurancePlan->vehicleModels()->exists() || $insurancePlan->bookings()->where('status', '!=', 'completed')->where('status', '!=', 'cancelled_by_user')->where('status', '!=', 'cancelled_by_platform')->exists()) {
            return response()->json(['message' => 'Cannot delete: This insurance plan is currently assigned to vehicle models or active/pending bookings.'], 409); // Conflict
        }

        $insurancePlan->delete();

        return response()->json(['message' => 'Insurance plan deleted successfully.'], 200);
    }
}