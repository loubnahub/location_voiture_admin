<?php

namespace Database\Factories;

use App\Models\VehicleModelMedia;
use App\Models\VehicleModel; // Needed to associate media with a model
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleModelMediaFactory extends Factory
{
    protected $model = VehicleModelMedia::class;

    public function definition(): array
    {
        // Placeholder images - replace with actual image URLs or use Faker's image methods
        // For real testing, you might want to point to actual images in your public storage
        // or use a service like picsum.photos or placeimg.com
        $imageUrls = [
            'https://picsum.photos/seed/' . $this->faker->word . '/800/600',
            'https://picsum.photos/seed/' . $this->faker->word . '/800/600',
            'https://picsum.photos/seed/' . $this->faker->word . '/800/600',
            'https://picsum.photos/seed/' . $this->faker->word . '/800/600',
            'https://loremflickr.com/800/600/car,'. $this->faker->randomElement(['sedan','suv','truck']) .'?random=' . $this->faker->randomNumber(),
        ];

        return [
            // 'vehicle_model_id' will be set when calling the factory typically
            'url' => $this->faker->randomElement($imageUrls),
            'caption' => $this->faker->optional(0.5)->sentence,
            'is_cover' => false, // We'll set one as cover manually or in a state
            'order' => $this->faker->numberBetween(0, 10),
            'uploaded_at' => now(),
        ];
    }

    /**
     * Indicate that this media is the cover image.
     */
    public function cover(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_cover' => true,
                'order' => 0, // Cover image usually comes first
            ];
        });
    }
}