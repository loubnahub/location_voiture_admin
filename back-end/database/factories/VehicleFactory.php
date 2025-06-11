<?php

namespace Database\Factories; // Correct Namespace

use App\Models\Vehicle;       // Correct Model Import
use App\Models\VehicleModel; // For selecting a vehicle_model_id
use App\Models\Address;      // For current_location_address_id
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;    // For Str::random() or Str::uuid() if needed for ID

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vehicle>
 */
class VehicleFactory extends Factory // Correct Class Name
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Vehicle::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Ensure VehicleModelSeeder and AddressSeeder (or AddressFactory) run first
        // to populate these tables if you are picking existing ones.
        $vehicleModelIds = VehicleModel::pluck('id')->all();
        if (empty($vehicleModelIds)) {
            // Fallback: Create a VehicleModel if none exist.
            // This assumes VehicleModelFactory is correctly set up.
            $vehicleModelIds[] = VehicleModel::factory()->create()->id;
        }

        $addressIds = Address::pluck('id')->all();
        $locationAddressId = null;
        if (!empty($addressIds)) {
            $locationAddressId = $this->faker->randomElement($addressIds);
        } else {
            // Fallback: Create an Address if none exist.
            // This assumes AddressFactory is correctly set up.
            $locationAddressId = Address::factory()->create()->id;
        }


        $colors = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Gray', 'Green', 'Yellow'];
        $hexColors = ['#FFFFFF', '#000000', '#C0C0C0', '#FF0000', '#0000FF', '#808080', '#008000', '#FFFF00'];
        $colorIndex = $this->faker->numberBetween(0, count($colors) - 1);

        // Possible vehicle statuses from your VehicleStatus enum


        return [
            // 'id' => Str::uuid()->toString(), // Only if not using HasUuid trait on Vehicle model
            'vehicle_model_id' => $this->faker->randomElement($vehicleModelIds),
            'current_location_address_id' => $locationAddressId,
            'license_plate' => strtoupper(Str::random(3) . $this->faker->unique()->numberBetween(100, 9999)), // Ensure unique license plate
            'vin' => $this->faker->unique()->bothify('?##??###?#?##?###'), // Generate a somewhat realistic unique VIN
            'color' => $colors[$colorIndex],
            'hexa_color_code' => $hexColors[$colorIndex],
            'mileage' => $this->faker->numberBetween(1000, 250000),
            'status' => 'available', // Use values from your VehicleStatus enum
            'acquisition_date' => $this->faker->dateTimeBetween('-5 years', 'now')->format('Y-m-d'),
            // created_at and updated_at are handled by Eloquent timestamps
        ];
    }
}