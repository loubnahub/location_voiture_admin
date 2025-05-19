<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class, // <<< MUST BE FIRST (or very early)
            UserSeeder::class,                // <<< RUNS AFTER ROLES ARE CREATED
            AddressSeeder::class,
            VehicleTypeSeeder::class,
            FeatureSeeder::class,
            ExtraSeeder::class,
            InsurancePlanSeeder::class,
            VehicleModelSeeder::class,
            VehicleSeeder::class,
            BookingSeeder::class,
            OperationalHoldSeeder::class,
            MaintenanceRecordSeeder::class,
        ]);
    }
}