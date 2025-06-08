<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleModel;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class VehicleModelController extends Controller
{
    public function index(Request $request)
    {
        $query = VehicleModel::query();
        $query->with(['vehicleType', 'media' => function ($query) {
            $query->where('is_cover', true)->orWhere(function ($q) {
                $q->orderBy('order', 'asc')->limit(1);
            });
        }]);

        if ($request->filled('filter_brand')) { $query->where('brand', 'LIKE', '%' . $request->input('filter_brand') . '%'); }
        if ($request->filled('filter_vehicle_type_id')) { $query->where('vehicle_type_id', $request->input('filter_vehicle_type_id')); }
        if ($request->filled('filter_year_from')) { $query->where('year', '>=', $request->input('filter_year_from')); }
        if ($request->filled('filter_year_to')) { $query->where('year', '<=', $request->input('filter_year_to')); }
        if ($request->filled('filter_status')) {
            $statusValue = strtolower($request->input('filter_status'));
            if ($statusValue === 'available') { $query->where('is_available', true); }
            elseif ($statusValue === 'unavailable') { $query->where('is_available', false); }
        }
        if ($request->filled('filter_fuel_type')) { $query->where('fuel_type', 'LIKE', '%' . $request->input('filter_fuel_type') . '%'); }
        if ($request->filled('search') && $request->input('search') !== '') {
            $searchTerm = $request->input('search');
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")->orWhere('brand', 'LIKE', "%{$searchTerm}%")->orWhere('model', 'LIKE', "%{$searchTerm}%")->orWhere('id', 'LIKE', "{$searchTerm}%");
            });
        }
        if ($request->filled('filter_transmission')) {
    $query->where('transmission', 'LIKE', '%' . $request->input('filter_transmission') . '%');
        }
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $allowedSortColumns = ['title', 'brand', 'model', 'year', 'fuel_type', 'transmission', 'number_of_seats', 'number_of_doors', 'base_price_per_day', 'is_available', 'created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSortColumns)) { $query->orderBy($sortBy, $sortDirection); } else { $query->orderBy('created_at', 'desc'); }
        $perPage = $request->input('per_page', 10);
        $vehicleModelsPage = $query->paginate($perPage);
        $vehicleModelsPage->getCollection()->transform(function ($model) {
            $attributes = $model->toArray();
            $thumbnail_url = null;
            if ($model->media->isNotEmpty()) { $cover = $model->media->firstWhere('is_cover', true); $thumbnail_url = $cover ? $cover->url : $model->media->first()->url; }
            $attributes['vehicle_type_name'] = $model->vehicleType ? $model->vehicleType->name : null;
            $attributes['thumbnail_url'] = $thumbnail_url;
            $attributes['base_price_per_day'] = (float) $model->base_price_per_day; $attributes['is_available'] = (bool) $model->is_available;
            $attributes['year'] = (int) $model->year; $attributes['number_of_seats'] = (int) $model->number_of_seats; $attributes['number_of_doors'] = (int) $model->number_of_doors;
            unset($attributes['media']); unset($attributes['vehicle_type']);
            return $attributes;
        });
        return response()->json($vehicleModelsPage);
    }

    public function show(VehicleModel $vehicleModel)
    {
        $vehicleModel->load([
            'vehicleType',
            'media' => function ($query) { $query->orderBy('is_cover', 'desc')->orderBy('order', 'asc'); },
            'features' => function ($query) { $query->withPivot('notes')->orderBy('features.category')->orderBy('features.name'); },
            'extras' => function ($query) { $query->orderBy('name'); },
            'insurancePlans' => function ($query) { $query->orderBy('name'); },
            'vehicles:id,license_plate,status,vehicle_model_id'
        ]);

        $vehicleType = $vehicleModel->vehicleType;
        $mainImage = null;
        if ($vehicleModel->media->isNotEmpty()) {
            $coverImage = $vehicleModel->media->firstWhere('is_cover', true);
            $mainImage = $coverImage ? $coverImage->url : $vehicleModel->media->first()->url;
        }
        $headerSubtitle = trim(ucfirst($vehicleModel->transmission ?? '') . ' ' . ($vehicleType ? strtolower($vehicleType->name) : ''));

        $featuresGrouped = $vehicleModel->features->groupBy('category')->map(function ($categoryFeatures, $categoryName) {
            return [
                'category_name' => $categoryName ?: 'General',
                'items' => $categoryFeatures->map(function ($feature) {
                    return ['id' => $feature->id, 'name' => $feature->name, 'description' => $feature->description, 'pivot' => $feature->pivot ? ['notes' => $feature->pivot->notes] : null ];
                })->values()
            ];
        })->values();

        $extrasFormatted = $vehicleModel->extras->map(function ($extra) {
            return ['id' => $extra->id, 'name' => $extra->name, 'description' => $extra->description, 'default_price_per_day' => isset($extra->default_price_per_day) ? (float) $extra->default_price_per_day : null, 'icon_identifier' => $extra->icon_identifier ?? null];
        })->values();

        $insurancePlansAssociated = $vehicleModel->insurancePlans->map(function ($plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'provider' => $plan->provider,
                'coverage_details' => $plan->coverage_details,
                'price_per_day' => (float) $plan->price_per_day,
                'is_active' => (bool) $plan->is_active,
            ];
        })->values();

        $vehicleInstances = $vehicleModel->vehicles->map(function ($vehicleInstance) { return ['id' => $vehicleInstance->id, 'license_plate' => $vehicleInstance->license_plate, 'status' => $vehicleInstance->status,]; });

        return response()->json(['data' => [
            'id' => $vehicleModel->id, 'title' => $vehicleModel->title, 'header_subtitle' => $headerSubtitle,
            'brand' => $vehicleModel->brand, 'model_name' => $vehicleModel->model,
            'year' => (int) $vehicleModel->year, 'fuel_type' => $vehicleModel->fuel_type,
            'transmission' => $vehicleModel->transmission, 'number_of_seats' => (int) $vehicleModel->number_of_seats,
            'number_of_doors' => (int) $vehicleModel->number_of_doors, 'base_price_per_day' => (float) $vehicleModel->base_price_per_day,
            'description' => $vehicleModel->description, 'is_generally_available' => (bool) $vehicleModel->is_available,
            'main_image_url' => $mainImage, 'all_media' => $vehicleModel->media->map(fn($m) => ['id' => $m->id, 'url' => $m->url, 'caption' => $m->caption, 'is_cover' => (bool)$m->is_cover, 'order' => $m->order]),
            'available_colors_from_model' => $vehicleModel->available_colors,
            'vehicle_type' => $vehicleType ? ['id' => $vehicleType->id, 'name' => $vehicleType->name] : null,
            'features_grouped' => $featuresGrouped,
            'extras_available' => $extrasFormatted,
            'insurance_plans_associated' => $insurancePlansAssociated,
            'vehicle_instances' => $vehicleInstances,
            'created_at' => $vehicleModel->created_at?->toIso8601String(), 'updated_at' => $vehicleModel->updated_at?->toIso8601String(),
            'quantity_placeholder' => 25,
        ]]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vehicle_type_id' => 'required|exists:vehicle_types,id',
            'title' => 'required|string|max:255|unique:vehicle_models,title',
            'brand' => 'required|string|max:100',
        'model_name' => 'required|string|max:100', // <-- THE FIX: Changed from 'model'
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 2),
            'fuel_type' => 'required|string|max:50',
            'transmission' => 'required|string|max:50',
            'available_colors' => 'nullable|array',
            'available_colors.*' => 'string|max:50',
            'number_of_seats' => 'required|integer|min:1',
            'number_of_doors' => 'required|integer|min:1',
            'base_price_per_day' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_generally_available' => 'sometimes|boolean',
            'features' => 'nullable|array',
            'features.*.feature_id' => 'required_with:features|exists:features,id',
            'features.*.notes' => 'nullable|string|max:1000',
            'extras' => 'nullable|array',
            'extras.*' => 'required_with:extras|exists:extras,id',
            'insurance_plans' => 'nullable|array',
            'insurance_plans.*' => 'required_with:insurance_plans|exists:insurance_plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        if (isset($validatedData['model_name'])) {
            $validatedData['model'] = $validatedData['model_name'];
            unset($validatedData['model_name']);
        }
        if (isset($validatedData['is_generally_available'])) {
            $validatedData['is_available'] = $validatedData['is_generally_available'];
            unset($validatedData['is_generally_available']);
        }

        $featureDataForSync = [];
        if (!empty($validatedData['features'])) {
            foreach ($validatedData['features'] as $featureInput) {
                $featureDataForSync[$featureInput['feature_id']] = ['notes' => $featureInput['notes'] ?? null];
            }
        }
        $extraIds = $validatedData['extras'] ?? [];
        $insurancePlanIds = $validatedData['insurance_plans'] ?? [];

        unset($validatedData['features'], $validatedData['extras'], $validatedData['insurance_plans']);

        if (isset($validatedData['available_colors'])) {
            $validatedData['available_colors'] = json_encode($validatedData['available_colors']);
        } else {
            $validatedData['available_colors'] = null;
        }

        $vehicleModel = VehicleModel::create($validatedData);

        if (!empty($featureDataForSync)) {
            $vehicleModel->features()->sync($featureDataForSync);
        }
        if (!empty($extraIds)) {
            $vehicleModel->extras()->sync($extraIds);
        }
        if (!empty($insurancePlanIds)) {
            $vehicleModel->insurancePlans()->sync($insurancePlanIds);
        }
        
        return $this->show($vehicleModel->fresh());
    }

    public function update(Request $request, VehicleModel $vehicleModel)
    {
        $validator = Validator::make($request->all(), [
            'vehicle_type_id' => 'sometimes|required|exists:vehicle_types,id',
            'title' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('vehicle_models', 'title')->ignore($vehicleModel->id)],
            'brand' => 'sometimes|required|string|max:100',
            'model_name' => 'sometimes|required|string|max:100',
            'year' => 'sometimes|required|integer|min:1900|max:' . (date('Y') + 2),
            'fuel_type' => 'sometimes|required|string|max:50',
            'transmission' => 'sometimes|required|string|max:50',
            'available_colors' => 'nullable|array',
            'available_colors.*' => 'string|max:50',
            'number_of_seats' => 'sometimes|required|integer|min:1',
            'number_of_doors' => 'sometimes|required|integer|min:1',
            'base_price_per_day' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'is_generally_available' => 'sometimes|boolean',
            'features' => 'nullable|array',
            'features.*.feature_id' => 'required_with:features|exists:features,id',
            'features.*.notes' => 'nullable|string|max:1000',
            'extras' => 'nullable|array',
            'extras.*' => 'required_with:extras|exists:extras,id',
            'insurance_plans' => 'nullable|array',
            'insurance_plans.*' => 'required_with:insurance_plans|exists:insurance_plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        if (isset($validatedData['model_name'])) {
            $validatedData['model'] = $validatedData['model_name'];
            unset($validatedData['model_name']);
        }
        if (isset($validatedData['is_generally_available'])) {
            $validatedData['is_available'] = $validatedData['is_generally_available'];
            unset($validatedData['is_generally_available']);
        }

        $featureDataForSync = [];
        if ($request->has('features')) {
            $featuresInput = $request->input('features', []);
            if(is_array($featuresInput)) {
                foreach ($featuresInput as $featureInput) {
                    if (isset($featureInput['feature_id'])) {
                        $featureDataForSync[$featureInput['feature_id']] = ['notes' => $featureInput['notes'] ?? null];
                    }
                }
            }
        }

        $extraIdsToSync = null;
        if ($request->has('extras')) {
            $extraIdsToSync = $request->input('extras', []);
            if (!is_array($extraIdsToSync)) $extraIdsToSync = [];
        }

        $insurancePlanIdsToSync = null;
        if ($request->has('insurance_plans')) {
            $insurancePlanIdsToSync = $request->input('insurance_plans', []);
            if (!is_array($insurancePlanIdsToSync)) $insurancePlanIdsToSync = [];
        }

        $coreModelData = collect($validatedData)->except(['features', 'extras', 'insurance_plans'])->toArray();
        if ($request->has('available_colors')) {
            $colors = $request->input('available_colors');
            $coreModelData['available_colors'] = is_array($colors) ? json_encode($colors) : null;
        }

        if (!empty($coreModelData)) {
            $vehicleModel->update($coreModelData);
        }

        if ($request->has('features')) { $vehicleModel->features()->sync($featureDataForSync); }
        if ($extraIdsToSync !== null) { $vehicleModel->extras()->sync($extraIdsToSync); }
        if ($insurancePlanIdsToSync !== null) { $vehicleModel->insurancePlans()->sync($insurancePlanIdsToSync); }

        return $this->show($vehicleModel->fresh());
    }

    public function destroy(VehicleModel $vehicleModel)
    {
        if (method_exists($vehicleModel, 'features')) { $vehicleModel->features()->detach(); }
        if (method_exists($vehicleModel, 'extras')) { $vehicleModel->extras()->detach(); }
        if (method_exists($vehicleModel, 'insurancePlans')) { $vehicleModel->insurancePlans()->detach(); }

        $vehicleModel->delete();
        return response()->json(['message' => 'Vehicle model deleted successfully.'], 200);
    }
    // app/Http/Controllers/Api/VehicleModelController.php

// ... (keep the existing index, show, store, update, destroy methods as they are) ...

    /**
     * A new, lightweight method to fetch all models for dropdowns.
     * This method does not paginate and returns only the necessary fields.
     */
    public function listAll()
    {
        $vehicleModels = VehicleModel::query()
            ->select('id', 'title', 'brand', 'year', 'available_colors') // Select only what's needed
            ->with(['media' => function ($query) {
                // Get the thumbnail for the creative preview
                $query->where('is_cover', true)->orWhere(function ($q) {
                    $q->orderBy('order', 'asc')->limit(1);
                });
            }])
            ->orderBy('title', 'asc')
            ->get();
            
        // We still need to transform the data to get the thumbnail_url
        $transformedData = $vehicleModels->map(function ($model) {
            $attributes = $model->toArray();
            $thumbnail_url = null;
            if (!empty($model->media) && $model->media->isNotEmpty()) {
                $cover = $model->media->firstWhere('is_cover', true);
                $thumbnail_url = $cover ? $cover->url : ($model->media->first() ? $model->media->first()->url : null);
            }
            $attributes['thumbnail_url'] = $thumbnail_url;
            // The frontend already handles parsing this, so just pass it through
            // $attributes['available_colors'] = json_decode($model->available_colors);
            unset($attributes['media']); // Clean up the response
            return $attributes;
        });

        return response()->json(['data' => $transformedData]);
    }

}