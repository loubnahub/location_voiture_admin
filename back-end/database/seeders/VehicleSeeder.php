<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\VehicleModel;
use App\Models\Address;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicleModels = VehicleModel::all();
        $addresses = Address::all();

        if ($vehicleModels->isEmpty()) {
            $this->command->warn('No Vehicle Models found. Please seed Vehicle Models first.');
            return;
        }
        if ($addresses->isEmpty()) {
            $this->command->warn('No Addresses found. Please seed Addresses first (or let VehicleFactory create them).');
            // Let factory create them if none exist
        }

        // Create 1 to 5 instances for each vehicle model
        foreach ($vehicleModels as $model) {
            Vehicle::factory()->count(rand(1, 5))->create([
                'vehicle_model_id' => $model->id,
                // Optionally assign a pre-existing random address if $addresses is not empty
                'current_location_address_id' => $addresses->isNotEmpty() ? $addresses->random()->id : Address::factory(),
            ]);
        }

        // Or create a flat number of vehicles if you prefer
        // Vehicle::factory()->count(50)->create(); // Factory will pick random models and create addresses
    }
}