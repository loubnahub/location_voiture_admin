<?php

namespace Database\Factories;

use App\Models\VehicleModel;
use App\Models\VehicleType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // If you need Str::uuid() for the ID

class VehicleModelFactory extends Factory
{
    protected $model = VehicleModel::class;

    public function definition(): array
    {
        $vehicleTypes = VehicleType::pluck('id')->all();
        $brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia'];
        $brand = $this->faker->randomElement($brands);

        $commonModels = [
            'Toyota' => ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma'],
            'Honda' => ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
            'Ford' => ['F-150', 'Explorer', 'Escape', 'Mustang', 'Ranger'],
            'BMW' => ['3 Series', '5 Series', 'X3', 'X5', 'X1'],
            'Mercedes-Benz' => ['C-Class', 'E-Class', 'GLC', 'GLE', 'A-Class'],
            'Audi' => ['A4', 'A6', 'Q5', 'Q7', 'Q3'],
            'Volkswagen' => ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf'],
            'Nissan' => ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Frontier'],
            'Hyundai' => ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade'],
            'Kia' => ['Forte', 'Optima (K5)', 'Sportage', 'Sorento', 'Telluride'],
        ];
        $modelName = $this->faker->randomElement($commonModels[$brand] ?? [$this->faker->word . ' ' . $this->faker->word]);
        $year = $this->faker->numberBetween(2018, date('Y') + 1);

        return [
            // If your ID is not auto-incrementing and not handled by a trait like HasUuid
            // 'id' => Str::uuid()->toString(),
  'vehicle_type_id' => $this->faker->randomElement($vehicleTypes ?: [VehicleType::factory()]),            'title' => $brand . ' ' . $modelName . ' ' . $this->faker->randomElement(['LX', 'EX', 'Sport', 'Limited', 'XLE', 'Touring', 'Base']) . ' ' . $year,
            'brand' => $brand,
            'model' => $modelName,
            'year' => $year,
            'fuel_type' => $this->faker->randomElement(['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid']),
            'transmission' => $this->faker->randomElement(['Automatic', 'Manual', 'CVT']),
            'available_colors' => json_encode([ // Store as JSON string
                ['name' => 'White', 'hex' => '#FFFFFF'],
                ['name' => 'Black', 'hex' => '#000000'],
                ['name' => 'Silver', 'hex' => '#C0C0C0'],
                ['name' => 'Red', 'hex' => '#FF0000'],
            ]),
            'number_of_seats' => $this->faker->randomElement([2, 4, 5, 7, 8]),
            'number_of_doors' => $this->faker->randomElement([2, 3, 4, 5]),
            'base_price_per_day' => $this->faker->randomFloat(2, 25, 250),
            'description' => $this->faker->paragraph(3),
            'is_available' => $this->faker->boolean(90), // 90% chance of being true
        ];
    }
}