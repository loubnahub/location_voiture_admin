<?php

namespace Database\Factories;

use App\Models\OperationalHold;
use App\Models\Vehicle;
use App\Models\User; // For created_by_user_id
use App\Models\Booking; // Optional: if a hold is linked to a booking
use Illuminate\Database\Eloquent\Factories\Factory;

class OperationalHoldFactory extends Factory
{
    protected $model = OperationalHold::class;

    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-1 month', '+1 month');
        $endDate = $this->faker->dateTimeBetween($startDate, (clone $startDate)->modify('+'.rand(1, 7).' days'));

        $reasons = ['Scheduled Maintenance', 'Deep Cleaning', 'Minor Repair', 'Inspection', 'Temporary Unavailability'];

        // Ensure Users and Vehicles exist if picking random ones
        $vehicleIds = Vehicle::pluck('id')->all();
        $userIds = User::pluck('id')->all(); // Assuming you have users (e.g., staff/admin)

        return [
            'vehicle_id' => !empty($vehicleIds) ? $this->faker->randomElement($vehicleIds) : Vehicle::factory(),
            'booking_id' => null, // For now, can be linked later if needed
            'created_by_user_id' => !empty($userIds) ? $this->faker->randomElement($userIds) : User::factory(), // Assumes UserFactory exists
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reason' => $this->faker->randomElement($reasons),
            'notes' => $this->faker->optional(0.5)->paragraph,
        ];
    }
}