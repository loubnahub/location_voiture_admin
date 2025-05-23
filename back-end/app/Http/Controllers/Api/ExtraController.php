<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Extra;
use App\Models\Vehicle; // To get vehicle_model_id from vehicle_id
// use App\Models\VehicleModel; // Not directly used here if vehicleModels relationship handles it
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ExtraController extends Controller
{
    protected function transformExtra(Extra $extra): array
    {
        // Since model only has default_price_per_day as fillable for price,
        // we primarily rely on that. If other price fields were actual columns, logic would differ.
        return [
            'id' => $extra->id,
            'name' => $extra->name,
            'description' => $extra->description,
            // For display consistency, if frontend expects 'price', we can map it here.
            // But for table columns, it's better to use the actual model field name.
            'price' => (float) ($extra->default_price_per_day ?? 0), // Map default_price_per_day to 'price' for output consistency if needed
            'default_price_per_day' => (float) ($extra->default_price_per_day ?? 0), // The actual model field
            // 'price_per_unit' => (float) ($extra->price_per_unit ?? $extra->default_price_per_day ?? 0), // If you had this field
            'created_at' => $extra->created_at?->toIso8601String(),
            'updated_at' => $extra->updated_at?->toIso8601String(),
        ];
    }

    public function index(Request $request)
    {
        $query = Extra::query();

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
                return response()->json(['data' => []]); // Return empty if vehicle context is invalid
            }
        }

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%");
            });
        }

        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        // Ensure 'default_price_per_day' is used for sorting if that's the primary price column
        $allowedSorts = ['name', 'default_price_per_day', 'created_at'];
        if (in_array($sortBy, $allowedSorts) && in_array(strtolower($sortDirection), ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('name', 'asc'); // Default sort
        }

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
            'default_price_per_day' => 'required|numeric|min:0', // VALIDATE THIS FIELD
            // 'price_per_unit' => 'nullable|numeric|min:0', // Only if you have this column and want to manage it
            'vehicle_model_ids' => 'nullable|array',
            'vehicle_model_ids.*' => 'sometimes|required|exists:vehicle_models,id' // 'sometimes' because vehicle_model_ids itself is nullable
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        // Explicitly cast the price field from the validated data
        // This ensures it's a float before creating the model, as it's in $fillable
        if (isset($validatedData['default_price_per_day'])) {
            $validatedData['default_price_per_day'] = (float) $validatedData['default_price_per_day'];
        }
        // if (isset($validatedData['price_per_unit'])) {
        //     $validatedData['price_per_unit'] = (float) $validatedData['price_per_unit'];
        // }


        $vehicleModelIds = $validatedData['vehicle_model_ids'] ?? null;
        if (array_key_exists('vehicle_model_ids', $validatedData)) {
            unset($validatedData['vehicle_model_ids']); // Don't try to mass assign this directly
        }

        // Create the Extra using only fields that are in $fillable
        // and have been validated (which now correctly includes default_price_per_day)
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
        return response()->json(['data' => $this->transformExtra($extra->load('vehicleModels'))]);
    }

    public function update(Request $request, Extra $extra)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('extras', 'name')->ignore($extra->id)],
            'description' => 'nullable|string|max:1000',
            'default_price_per_day' => 'sometimes|required|numeric|min:0', // VALIDATE THIS FIELD
            // 'price_per_unit' => 'nullable|numeric|min:0', // Only if you have this column
            'vehicle_model_ids' => 'nullable|array',
            'vehicle_model_ids.*' => 'sometimes|required|exists:vehicle_models,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        if (array_key_exists('default_price_per_day', $validatedData)) {
            $validatedData['default_price_per_day'] = (float) $validatedData['default_price_per_day'];
        }
        // if (array_key_exists('price_per_unit', $validatedData)) {
        //     $validatedData['price_per_unit'] = (float) $validatedData['price_per_unit'];
        // }

        $vehicleModelIds = null;
        // Check if 'vehicle_model_ids' key was explicitly sent in the request payload
        if ($request->has('vehicle_model_ids')) {
             $vehicleModelIds = $validatedData['vehicle_model_ids'] ?? []; // Default to empty array if sent as null
             unset($validatedData['vehicle_model_ids']);
        }


        $extra->update($validatedData);

        // Only sync if vehicleModelIds was part of the request (even if it's an empty array to clear associations)
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