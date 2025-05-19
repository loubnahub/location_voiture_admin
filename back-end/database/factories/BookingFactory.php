<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\InsurancePlan;
use App\Models\PromotionCode; // Optional
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $userIds = User::pluck('id')->all();
        $vehicleIds = Vehicle::pluck('id')->all();
        $insurancePlanIds = InsurancePlan::pluck('id')->all();
        // $promotionCodeIds = PromotionCode::where('status', 'active')->pluck('id')->all(); // More complex

        $startDate = $this->faker->dateTimeInInterval('-1 month', '+1 month');
        $endDate = (clone $startDate)->modify('+'.rand(1, 14).' days'); // Rental for 1 to 14 days

        $statuses = ['pending_confirmation', 'confirmed', 'active', 'completed', 'cancelled_by_user']; // Match BookingStatus enum

        $basePrice = $this->faker->randomFloat(2, 50, 300);
        $extrasPrice = $this->faker->optional(0.5)->randomFloat(2, 10, 100);
        $insurancePrice = $this->faker->optional(0.7)->randomFloat(2, 20, 150);
        $discount = $this->faker->optional(0.2)->randomFloat(2, 5, 50);
        $finalPrice = $basePrice + ($extrasPrice ?? 0) + ($insurancePrice ?? 0) - ($discount ?? 0);


        return [
            'renter_user_id' => !empty($userIds) ? $this->faker->randomElement($userIds) : User::factory(),
            'vehicle_id' => !empty($vehicleIds) ? $this->faker->randomElement($vehicleIds) : Vehicle::factory(),
            'insurance_plan_id' => !empty($insurancePlanIds) && $this->faker->boolean(70) ? $this->faker->randomElement($insurancePlanIds) : null,
            'promotion_code_id' => null, // Link this later if you have a PromotionCode seeder
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => $this->faker->randomElement($statuses),
            'calculated_base_price' => $basePrice,
            'calculated_extras_price' => $extrasPrice ?? 0,
            'calculated_insurance_price' => $insurancePrice ?? 0,
            'discount_amount_applied' => $discount ?? 0,
            'final_price' => max(0, $finalPrice), // Ensure final price is not negative
        ];
    }
}