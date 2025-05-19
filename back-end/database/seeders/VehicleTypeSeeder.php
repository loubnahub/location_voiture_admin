<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\VehicleType;

class VehicleTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Van', 'Coupe', 'Convertible', 'Minivan'];
        foreach ($types as $type) {
            VehicleType::factory()->create(['name' => $type]);
        }
        // Or just: VehicleType::factory()->count(8)->create(); if random names are okay from factory
    }
}