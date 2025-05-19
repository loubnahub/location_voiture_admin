<?php

namespace Database\Factories;

use App\Models\DamageReport;
use App\Models\Booking; // Damage is usually linked to a booking
use App\Models\User;   // User who reported it
use Illuminate\Database\Eloquent\Factories\Factory;

class DamageReportFactory extends Factory
{
    protected $model = DamageReport::class;

    public function definition(): array
    {
        // Ensure Bookings and Users exist
        $bookingIds = Booking::pluck('id')->all();
        $userIds = User::pluck('id')->all();

        $statuses = ['reported', 'under_investigation', 'repair_pending', 'repaired', 'closed_with_charge']; // Match your DamageReportStatus enum values

        return [
            // 'booking_id' will usually be set when creating via seeder after bookings are made
            'booking_id' => !empty($bookingIds) ? $this->faker->randomElement($bookingIds) : Booking::factory(), // Requires BookingFactory
            'reported_by_user_id' => !empty($userIds) ? $this->faker->randomElement($userIds) : User::factory(),
            'reported_at' => $this->faker->dateTimeThisYear(),
            'description' => 'Damage observed: ' . $this->faker->sentence(rand(5,15)),
            'status' => $this->faker->randomElement($statuses),
            'repair_cost' => $this->faker->optional(0.6)->randomFloat(2, 100, 2000),
        ];
    }
}