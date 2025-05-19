<?php

namespace Database\Factories;

use App\Models\Extra;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExtraFactory extends Factory
{
    protected $model = Extra::class;

    public function definition(): array
    {
        $extraNames = [
            'Child Safety Seat (Infant)', 'Child Safety Seat (Toddler)', 'GPS Navigation Unit',
            'Mobile Wi-Fi Hotspot', 'Ski Rack', 'Bike Rack', 'Roof Box', 'Snow Chains',
            'Premium Insurance Coverage', 'Additional Driver Fee'
        ];
        return [
            'name' => $this->faker->unique()->randomElement($extraNames),
            'description' => $this->faker->optional(0.8)->sentence,
            'default_price_per_day' => $this->faker->randomElement([10, 15, 20, 25, 5, 30]),
        ];
    }
}