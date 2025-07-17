<?php
// database/factories/TeamMemberFactory.php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TeamMemberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'role' => fake()->jobTitle(),
            
            // ✅ THIS IS THE FIX ✅
            // Generates a full URL to a 400x500 pixel image.
            // You can change the dimensions as you like.
            'image_path' => fake()->imageUrl(400, 500, 'people', true),
            
            'order_column' => fake()->unique()->numberBetween(10, 100),
        ];
    }
}