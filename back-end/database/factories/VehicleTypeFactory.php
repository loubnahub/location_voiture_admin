<?php

namespace Database\Factories;

use App\Models\VehicleType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // If you need Str::uuid() for the ID, but HasUuid trait handles it

class VehicleTypeFactory extends Factory
{
    protected $model = VehicleType::class;

    public function definition(): array
    {
        // If your ID is not auto-incrementing and not handled by a trait like HasUuid
        // 'id' => Str::uuid()->toString(),
        return [
            'name' => $this->faker->randomElement(['Sedan', 'SUV', 'Hatchback', 'Truck', 'Van', 'Coupe', 'Convertible', 'Minivan']),
            'description' => $this->faker->sentence,
            'notes' => $this->faker->optional()->paragraph,
        ];
    }
}