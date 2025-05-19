<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\OperationalHold;
use App\Models\Vehicle;

class OperationalHoldSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::all();
        if ($vehicles->isEmpty()) {
            $this->command->warn('No vehicles found to create operational holds for. Please run VehicleSeeder first.');
            return;
        }
        // Create 1-3 holds for about 30% of vehicles
        $vehicles->random(ceil($vehicles->count() * 0.3))->each(function ($vehicle) {
            OperationalHold::factory()->count(rand(1, 2))->create(['vehicle_id' => $vehicle->id]);
        });
    }
}