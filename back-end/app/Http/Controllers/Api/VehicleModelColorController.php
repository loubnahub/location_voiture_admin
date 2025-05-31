<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\VehicleModel;

class VehicleModelColorController extends Controller
{
    // GET /vehicle-models/{vehicleModel}/colors
    public function index(VehicleModel $vehicleModel)
    {
        $colors = $vehicleModel->available_colors ?? [];
        return response()->json(['data' => $colors]);
    }

    // POST /vehicle-models/{vehicleModel}/colors
public function store(Request $request, VehicleModel $vehicleModel)
{
    $validated = $request->validate([
        'name' => 'required|string|max:100',
        'hex' => 'required|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
    ]);
    

    // Ensure $colors is always an array
    $colors = $vehicleModel->available_colors;
    if (is_string($colors)) {
        $colors = json_decode($colors, true) ?: [];
    }
    if (!is_array($colors)) {
        $colors = [];
    }

    // Prevent duplicates
    foreach ($colors as $color) {
        if (
            strtolower($color['name']) === strtolower($validated['name']) ||
            strtolower($color['hex']) === strtolower($validated['hex'])
        ) {
            return response()->json(['message' => 'Color already exists.'], 409);
        }
    }
    $colors[] = $validated;
    $vehicleModel->available_colors = $colors;
    $vehicleModel->save();

    return response()->json(['data' => $validated], 201);
}
public function updateColors(Request $request, $vehicleModelId)
{
    $validated = $request->validate([
        'colors.available_colors' => 'required|array',
        'colors.available_colors.*.name' => 'required|string|max:100',
        'colors.available_colors.*.hex' => 'required|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
    ]);

    // Remove any incomplete color objects (defensive, optional)
    $filtered = array_filter(
        $validated['colors']['available_colors'],
        fn($c) => !empty($c['name']) && !empty($c['hex'])
    );

    $vehicleModel = \App\Models\VehicleModel::findOrFail($vehicleModelId);
    $vehicleModel->available_colors = array_values($filtered);
    $vehicleModel->save();

    return response()->json(['data' => $vehicleModel->available_colors]);
}
public function destroy($vehicleModelId, $colorHex)
{
    $vehicleModel = \App\Models\VehicleModel::findOrFail($vehicleModelId);
    $colors = $vehicleModel->available_colors ?? [];
    // Decode hex in case it's URL-encoded
    $colorHex = urldecode($colorHex);

    // Remove color by hex
    $colors = array_filter($colors, function($color) use ($colorHex) {
        return strtolower($color['hex']) !== strtolower($colorHex);
    });

    $vehicleModel->available_colors = array_values($colors);
    $vehicleModel->save();

    return response()->json(['data' => $vehicleModel->available_colors]);
}
}