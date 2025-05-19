<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\MaintenanceRecord;
use App\Models\Vehicle;
use App\Models\OperationalHold;

class MaintenanceRecordSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::all();
        if ($vehicles->isEmpty()) {
            $this->command->warn('No vehicles found to create maintenance records for. Please run VehicleSeeder first.');
            return;
        }

        foreach ($vehicles as $vehicle) {
            // Create 2-5 maintenance records for each vehicle
            MaintenanceRecord::factory()->count(rand(2, 5))->create([
                'vehicle_id' => $vehicle->id,
                // Optionally link some to existing operational holds for that vehicle
                'operational_hold_id' => $this->faker->optional(0.3)
                    ->randomElement(
                        OperationalHold::where('vehicle_id', $vehicle->id)->pluck('id')->all()
                    ) ?: null,
            ]);
        }
    }
    // Need to inject faker or use global fake()
    protected $faker;
    public function __construct(\Faker\Generator $faker)
    {
        $this->faker = $faker;
    }
}