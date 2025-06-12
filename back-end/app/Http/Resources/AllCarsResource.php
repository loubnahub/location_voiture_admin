<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AllCarsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // $this now refers to a VehicleModel instance

        // Find the main image URL
        $mainImage = null;
        if ($this->media->isNotEmpty()) {
            $coverImage = $this->media->firstWhere('is_cover', true);
            $mainImage = $coverImage ? $coverImage->url : $this->media->first()->url;
        }

        // Get gallery images (all non-cover images)
        $galleryImages = $this->media
            ->where('is_cover', false)
            ->sortBy('order')
            ->map(fn($media) => $media->url)
            ->values()
            ->all();
        
        // Find the most common location for available instances of this model
        $location = $this->whenLoaded('vehicles', function() {
            return $this->vehicles
                ->whereNotNull('currentLocationAddress.city')
                ->countBy('currentLocationAddress.city')
                ->sortDesc()
                ->keys()
                ->first();
        });

        return [
            'id' => $this->id,
            'name' => $this->title, // Using the 'title' from VehicleModel as the main display name
            'brand' => $this->brand,
            'type' => $this->whenLoaded('vehicleType', fn() => $this->vehicleType->name),
            'price' => (float) $this->base_price_per_day,
            'seats' => (int) $this->number_of_seats,
            'location' => $location,
            'modelName' => $this->model,
            'transmission' => $this->transmission,
            'mileage' => null, // OMITTED: This is specific to a vehicle instance, not a model.
            'bags' => $this->baggage_capacity, // Assuming this field exists on VehicleModel
            'doors' => (int) $this->number_of_doors,
            'imageUrl' => $mainImage ? Storage::disk('public')->url($mainImage) : null,
            'imageNoBgc' => collect($galleryImages)->map(fn($url) => Storage::disk('public')->url($url)),
            'category' => $this->whenLoaded('vehicleType', fn() => $this->vehicleType->name),
            'makeYear' => (int) $this->year,
            'fuelType' => $this->fuel_type,
            'capacityGroup' => '+' . $this->number_of_seats,
            'description' => $this->description,
            'extras' => $this->whenLoaded('extras', function() {
                return $this->extras->map(fn($extra) => [
                    'name' => $extra->name,
                    'price' => (float) $extra->default_price_per_day,
                ]);
            }),

            'featuresListToUse' => $this->whenLoaded('features', function() {
                return $this->features
                    ->groupBy('category')
                    ->map(function ($features, $category) {
                        return [
                            'category' => $category ?: 'General',
                            'items' => $features->map(fn($feature) => [
                                'name' => $feature->name,
                                // Using the feature's description as the value, as planned.
                                'value' => $feature->description ?? $feature->name,
                            ]),
                        ];
                    })
                    ->values(); // Use ->values() to get a clean array
            }),
        ];
    }
}