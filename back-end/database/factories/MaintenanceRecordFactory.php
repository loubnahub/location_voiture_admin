<?php

namespace Database\Factories;

use App\Models\MaintenanceRecord;
use App\Models\Vehicle;
use App\Models\OperationalHold; // Optional: if linked to a hold
use Illuminate\Database\Eloquent\Factories\Factory;

class MaintenanceRecordFactory extends Factory
{
    protected $model = MaintenanceRecord::class;

    public function definition(): array
    {
        $descriptions = [
            'Oil Change and Filter Replacement', 'Tire Rotation and Balancing', 'Brake Pad Replacement (Front)',
            'Air Filter Change', 'Battery Check and Replacement', 'Full Vehicle Inspection', 'Fluid Top-up'
        ];
        $vehicleIds = Vehicle::pluck('id')->all();

        return [
            'vehicle_id' => !empty($vehicleIds) ? $this->faker->randomElement($vehicleIds) : Vehicle::factory(),
            'operational_hold_id' => null, // Can be linked if maintenance is part of a specific hold
            'description' => $this->faker->randomElement($descriptions) . ' - ' . $this->faker->sentence(3),
            'cost' => $this->faker->optional(0.8)->randomFloat(2, 50, 500),
            'notes' => $this->faker->optional(0.4)->paragraph,
            // 'created_at' for the record itself will be set by timestamps()
        ];
    }
}