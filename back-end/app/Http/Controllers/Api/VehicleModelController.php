<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleModel;        
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; 

class VehicleModelController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
     public function index(Request $request)
    {
        // --- Permission Check (Placeholder - uncomment and implement when auth is ready) ---
        // if (!auth()->user()->can('view vehicle models')) {
        //     return response()->json(['message' => 'Forbidden: You do not have permission to view vehicle models.'], 403);
        // }

        $query = VehicleModel::query();

        // --- Eager load the 'vehicleType' relationship ---
        $query->with('vehicleType'); // Make sure 'vehicleType' relationship exists on VehicleModel

        // --- Search Functionality (with column-specific targeting) ---
        if ($request->filled('search') && $request->input('search') !== '') {
            $searchTerm = $request->input('search');
            $searchIn = $request->input('search_in', 'all'); // Default to 'all' fields if not specified

            // Whitelist of columns allowed for targeted search to prevent misuse
            $allowedSearchableFields = ['title', 'brand', 'model', 'id'];

            $query->where(function ($q) use ($searchTerm, $searchIn, $allowedSearchableFields) {
                if ($searchIn === 'all') {
                    // Search across multiple general fields
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('brand', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('model', 'LIKE', "%{$searchTerm}%")
                      // For ID, a partial match from the beginning might be more useful
                      // but ensure your client-side search logic for ID also aligns (e.g. startsWith)
                      ->orWhere('id', 'LIKE', "{$searchTerm}%");
                } elseif (in_array($searchIn, $allowedSearchableFields)) {
                    // Search in a specific allowed field
                    if ($searchIn === 'id') {
                        // For UUIDs, partial match from start is often best if users type it
                        $q->where($searchIn, 'LIKE', "{$searchTerm}%");
                    } else {
                        $q->where($searchIn, 'LIKE', "%{$searchTerm}%");
                    }
                }
                // If $searchIn is something else not allowed, the query won't add a WHERE clause for search,
                // effectively ignoring an invalid search_in parameter.
            });
        }

        // --- Sorting ---
        $sortBy = $request->input('sort_by', 'created_at'); // Default sort column
        $sortDirection = $request->input('sort_direction', 'desc'); // Default sort direction

        // Whitelist of columns allowed for sorting
        $allowedSortColumns = ['title', 'brand', 'model', 'year', 'base_price_per_day', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc'); // Fallback to default sort
        }

        // --- Get ALL matching records (NO backend pagination) ---
        $allVehicleModels = $query->get();

        // --- Manually transform ALL data for the JSON response ---
        $transformedData = $allVehicleModels->map(function ($model) {
            // $model is an instance of App\Models\VehicleModel
            return [
                'id' => $model->id,
                'title' => $model->title,
                'brand' => $model->brand,
                'model' => $model->model,
                'year' => $model->year,
                'base_price_per_day' => (float) $model->base_price_per_day,
                'description' => $model->description, // Consider truncating if very long for list views
                'is_available' => (bool) $model->is_available,
                'vehicle_type_name' => $model->vehicleType ? $model->vehicleType->name : null, // Access eager loaded relationship
                'created_at_formatted' => $model->created_at ? $model->created_at->toDateTimeString() : null,
                // Add other fields your frontend list might need directly
            ];
        });

        // Return the transformed data as a simple array under a 'data' key.
        return response()->json(['data' => $transformedData]);
    }
   

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\VehicleModel  $vehicleModel  (Route Model Binding)
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(VehicleModel $vehicleModel)
    {
        // Eager load all necessary relationships for the model detail view
        $vehicleModel->load([
            'vehicleType',
            'media' => function ($query) {
                $query->orderBy('is_cover', 'desc')->orderBy('order', 'asc');
            },
            'features' => function ($query) {
                $query->orderBy('category')->orderBy('name');
            },
            'extras' => function ($query) {
                $query->orderBy('name');
            },
            'vehicles:id,license_plate,status,vehicle_model_id' // Load associated vehicle instances (specific columns)
        ]);

        $vehicleType = $vehicleModel->vehicleType;

        $mainImage = null;
        if ($vehicleModel->media->isNotEmpty()) {
            $coverImage = $vehicleModel->media->firstWhere('is_cover', true);
            $mainImage = $coverImage ? $coverImage->url : $vehicleModel->media->first()->url;
        }

        $headerSubtitle = trim(ucfirst($vehicleModel->transmission) . ' ' . ($vehicleType ? strtolower($vehicleType->name) : ''));

        $featuresGrouped = $vehicleModel->features->groupBy('category')->map(function ($categoryFeatures, $categoryName) {
            return [
                'category_name' => $categoryName ?: 'General',
                'items' => $categoryFeatures->map(function ($feature) {
                    return ['id' => $feature->id, 'name' => $feature->name, 'description' => $feature->description];
                })->values()
            ];
        })->values();

        $extrasFormatted = $vehicleModel->extras->map(function ($extra) {
            return [
                'id' => $extra->id,
                'name' => $extra->name,
                'description' => $extra->description,
                'default_price_per_day' => (float) $extra->default_price_per_day,
            ];
        })->values();

        // Format the list of vehicle instances (license plates) for the dropdown
        $vehicleInstances = $vehicleModel->vehicles->map(function ($vehicleInstance) {
            return [
                'id' => $vehicleInstance->id, // Vehicle instance ID
                'license_plate' => $vehicleInstance->license_plate,
                'status' => $vehicleInstance->status, // Status of this specific instance
            ];
        });

        return response()->json([
            'data' => [
                'id' => $vehicleModel->id,
                'title' => $vehicleModel->title, // e.g., "TOYOTA CAMRY XLE 2022"
                'header_subtitle' => $headerSubtitle, // e.g., "Automatic sedan"
                'brand' => $vehicleModel->brand,
                'model_name' => $vehicleModel->model,
                'year' => (int) $vehicleModel->year,
                'fuel_type' => $vehicleModel->fuel_type,
                'transmission' => $vehicleModel->transmission,
                'number_of_seats' => (int) $vehicleModel->number_of_seats,
                'number_of_doors' => (int) $vehicleModel->number_of_doors,
                'base_price_per_day' => (float) $vehicleModel->base_price_per_day,
                'description' => $vehicleModel->description,
                'is_generally_available' => (bool) $vehicleModel->is_available, // Model's offering status
                'main_image_url' => $mainImage,
                'all_media' => $vehicleModel->media->map(function($media){ // For image gallery on media tab
                    return ['id' => $media->id, 'url' => $media->url, 'caption' => $media->caption, 'is_cover' => (bool)$media->is_cover, 'order' => $media->order];
                }),
                'available_colors_from_model' => $vehicleModel->available_colors, // For color swatches

                'vehicle_type' => $vehicleType ? [
                    'id' => $vehicleType->id,
                    'name' => $vehicleType->name,
                ] : null,

                'features_grouped' => $featuresGrouped,
                'extras_available' => $extrasFormatted,

                'vehicle_instances' => $vehicleInstances, // List of specific cars of this model

                'created_at' => $vehicleModel->created_at ? $vehicleModel->created_at->toDateTimeString() : null,
                'updated_at' => $vehicleModel->updated_at ? $vehicleModel->updated_at->toDateTimeString() : null,
            ]
        ]);
    }

    // ... store, update, destroy methods for VehicleModel ...
    // (The store method we worked on previously for creating models is good)
    public function store(Request $request)
    {
        // ... (existing store method) ...
        if (!auth()->user()->can('manage vehicles')) { /* ... */ }
        $validator = Validator::make($request->all(), [ /* ... */ ]);
        if ($validator->fails()) { /* ... */ }
        $vehicleModelData = $validator->validated();
        if (isset($vehicleModelData['available_colors']) && is_array($vehicleModelData['available_colors'])) {
            $vehicleModelData['available_colors'] = json_encode($vehicleModelData['available_colors']);
        } else if (!isset($vehicleModelData['available_colors'])) {
            $vehicleModelData['available_colors'] = null; // Or an empty JSON array '[]'
        }
        $vehicleModel = VehicleModel::create($vehicleModelData);
        // Transform and return created model (simplified for brevity)
        $vehicleModel->load('vehicleType'); // Load type for response consistency
        return response()->json([
            'id' => $vehicleModel->id,
            'title' => $vehicleModel->title,
            'vehicle_type_name' => $vehicleModel->vehicleType ? $vehicleModel->vehicleType->name : null,
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     * (Stub - to be implemented later)
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\VehicleModel  $vehicleModel
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, VehicleModel $vehicleModel)
    {
        // Logic for updating an existing VehicleModel will go here later.
        // Remember validation, permission checks, transforming the updated model for response.
        return response()->json(['message' => 'VehicleModel update endpoint not fully implemented yet.'], 501);
    }

    /**
     * Remove the specified resource from storage.
     * (Stub - to be implemented later)
     * @param  \App\Models\VehicleModel  $vehicleModel
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(VehicleModel $vehicleModel)
    {
        // Logic for deleting a VehicleModel will go here later.
        // Remember permission checks.
        //
        // $vehicleModel->delete();
        // return response()->json(null, 204); // 204 No Content is common for successful deletes

        return response()->json(['message' => 'VehicleModel destroy endpoint not fully implemented yet.'], 501);
    }
}