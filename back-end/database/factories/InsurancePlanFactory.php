<?php
namespace Database\Factories;
use App\Models\InsurancePlan;
use Illuminate\Database\Eloquent\Factories\Factory;
class InsurancePlanFactory extends Factory
{
    protected $model = InsurancePlan::class;
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['Basic Coverage', 'Standard Protection', 'Premium Shield', 'Full Comprehensive']),
            'provider' => $this->faker->optional()->company,
            'coverage_details' => $this->faker->paragraph(3),
            'price_per_day' => $this->faker->randomFloat(2, 5, 50),
            'is_active' => $this->faker->boolean(90),
        ];
    }
}