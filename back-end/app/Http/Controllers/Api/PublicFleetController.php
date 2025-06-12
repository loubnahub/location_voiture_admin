<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AllCarsResource;
use App\Http\Resources\VehicleDetailResource;
use App\Models\VehicleModel;
use Illuminate\Http\Request;

class PublicFleetController extends Controller
{
    /**
     * Display a listing of all vehicle models available for rent.
     */
    public function show(VehicleModel $vehicleModel)
    {
        // Eager load all the relationships that our resource will need.
        // This is crucial for performance.
        $vehicleModel->load([
            'vehicleType',
            'media' => function ($query) {
                // Order media so the cover image is first, then by the specified order.
                $query->orderBy('is_cover', 'desc')->orderBy('order', 'asc');
            },
            'features' => function ($query) {
                // Order features for consistent display.
                $query->orderBy('category')->orderBy('name');
            },
            'extras' => function ($query) {
                $query->orderBy('name');
            },
            'insurancePlans' => function ($query) {
                $query->orderBy('name');
            },
            // We only need a few fields from the individual vehicle instances.
            'vehicles:id,license_plate,status,vehicle_model_id'
        ]);

        // Return the single model wrapped in our new resource.
        return new VehicleDetailResource($vehicleModel);
    }
     public function show3d(VehicleModel $vehicleModel)
    {
        // For the 3D/Gallery page, the data requirements are identical to the standard detail page.
        // We can simply call the existing `show` method's logic to avoid duplicating code.
        // We load all the necessary relationships here.
        $vehicleModel->load([
            'vehicleType',
            'media' => function ($query) {
                $query->orderBy('is_cover', 'desc')->orderBy('order', 'asc');
            },
            // The 3D page doesn't strictly need these, but the Resource does, so we load them.
            'features' => fn($q) => $q->orderBy('category')->orderBy('name'),
            'extras' => fn($q) => $q->orderBy('name'),
            'insurancePlans' => fn($q) => $q->orderBy('name'),
            'vehicles:id,license_plate,status,vehicle_model_id'
        ]);

        // We can reuse the same API Resource because the data structure is the same.
        return new VehicleDetailResource($vehicleModel);
    }
    public function index(Request $request)
    {
        // Query VehicleModel directly
        $vehicleModels = VehicleModel::query()
            // Only include models that have at least one 'available' vehicle instance
            // ->whereHas('vehicles', function ($query) {
            //     $query->where('status', 'available');
            // })
            ->where('is_available',1)
            // Eager load all necessary relationships for performance
            ->with([
                'vehicleType',
                'extras' => fn($q) => $q->orderBy('name'),
                'features' => fn($q) => $q->orderBy('category')->orderBy('name'),
                'media' => fn($q) => $q->orderBy('is_cover', 'desc')->orderBy('order', 'asc'),
                // Load addresses of all available vehicles to find the most common location
                'vehicles' => fn($q) => $q->where('status', 'available')->with('currentLocationAddress:id,city'),
            ])
            ->get();

        return AllCarsResource::collection($vehicleModels);
    }
}