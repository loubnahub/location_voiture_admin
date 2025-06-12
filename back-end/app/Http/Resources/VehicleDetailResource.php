<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class VehicleDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Find the main image URL
        $mainImage = null;
        if ($this->media->isNotEmpty()) {
            $coverImage = $this->media->firstWhere('is_cover', true);
            // Use the cover image if it exists, otherwise fall back to the very first image
            $mainImage = $coverImage ? $coverImage->url : $this->media->first()->url;
        }

        // Generate a simple header subtitle
        $headerSubtitle = trim(
            ($this->transmission ? ucfirst($this->transmission) : '') . ' ' .
            ($this->whenLoaded('vehicleType') ? strtolower($this->vehicleType->name) : '')
        );

        return [
            // --- Top-level Vehicle Model Details ---
            'id' => $this->id,
            'title' => $this->title,
            'header_subtitle' => $headerSubtitle,
            'brand' => $this->brand,
            'model_name' => $this->model, // Maps model to model_name
            'year' => (int) $this->year,
            'fuel_type' => $this->fuel_type,
            'transmission' => $this->transmission,
            'number_of_seats' => (int) $this->number_of_seats,
            'number_of_doors' => (int) $this->number_of_doors,
            'base_price_per_day' => (float) $this->base_price_per_day,
            'description' => $this->description,
            'is_generally_available' => (bool) $this->is_available, // Maps is_available to is_generally_available

            // --- Media ---
            'main_image_url' => $mainImage ? Storage::disk('public')->url($mainImage) : null,
           'all_media' => $this->whenLoaded('media', function() {
                return $this->media->map(function($media) {
                    
                    $fileUrl = '';
                   
                    if ($media->media_type === '3d_model_glb') {
                      
                        $fileUrl = url('/api/stream-glb/' . $media->url);
                    } else {
                        $fileUrl = Storage::disk('public')->url($media->url);
                    }

                    return [
                        'id'         => $media->id,
                        'url'        => $fileUrl, // Use the correctly generated URL
                        'caption'    => $media->caption,
                        'is_cover'   => (bool) $media->is_cover,
                        'order'      => (int) $media->order,
                        'color_hex'  => $media->color_hex,
                        'media_type' => $media->media_type,
                    ];
                });
            }),
            'available_colors_from_model' => $this->available_colors, // Assuming this is a JSON column

            // --- Relationships ---
            'vehicle_type' => $this->whenLoaded('vehicleType', fn() => [
                'id' => $this->vehicleType->id,
                'name' => $this->vehicleType->name
            ]),

            'features_grouped' => $this->whenLoaded('features', function () {
                return $this->features->groupBy('category')->map(function ($featuresInCategory, $categoryName) {
                    return [
                        'category_name' => $categoryName ?: 'General',
                        'items' => $featuresInCategory->map(fn($feature) => [
                            'id' => $feature->id,
                            'name' => $feature->name,
                            'description' => $feature->description,
                            // NOTE: Pivot 'notes' is included as requested by the frontend
                            'pivot' => $feature->pivot ? ['notes' => $feature->pivot->notes] : null,
                        ])->values()
                    ];
                })->values();
            }),

            'extras_available' => $this->whenLoaded('extras', function() {
                return $this->extras->map(fn($extra) => [
                    'id' => $extra->id,
                    'name' => $extra->name,
                    'description' => $extra->description,
                    'default_price_per_day' => (float) $extra->default_price_per_day,
                    'icon_identifier' => $extra->icon_identifier ?? null
                ])->values();
            }),

            'insurance_plans_associated' => $this->whenLoaded('insurancePlans', function() {
                return $this->insurancePlans->map(fn($plan) => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'provider' => $plan->provider,
                    'coverage_details' => $plan->coverage_details,
                    'price_per_day' => (float) $plan->price_per_day,
                    'is_active' => (bool) $plan->is_active,
                ])->values();
            }),

            'vehicle_instances' => $this->whenLoaded('vehicles', function() {
                return $this->vehicles->map(fn($instance) => [
                    'id' => $instance->id,
                    'license_plate' => $instance->license_plate,
                    'status' => $instance->status,
                ])->values();
            }),

            // --- Timestamps & Placeholders ---
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'quantity_placeholder' => $this->whenLoaded('vehicles', fn() => $this->vehicles->count()),
        ];
    }
}