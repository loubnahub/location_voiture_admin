<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\Vehicle;
use App\Models\User;
use App\Models\DamageReport;
use App\Models\DamageReportImage;
use App\Models\Payment;
use App\Models\RentalAgreement;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::all();
        $users = User::all(); // Renters

        if ($vehicles->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Ensure Vehicles and Users are seeded before Bookings.');
            return;
        }

        // Create 30-50 bookings
        for ($i = 0; $i < rand(30, 50); $i++) {
            $vehicle = $vehicles->random();
            $user = $users->random();

            // Try to make booking dates somewhat logical (not too overlapping for one vehicle, but can happen)
            $startDate = fake()->dateTimeInInterval('-2 months', '+1 month');
            $endDate = (clone $startDate)->modify('+'.rand(1, 10).' days');

            // Ensure the chosen vehicle might be available around these dates
            // This is a simplified check, real availability logic is complex
            $overlappingBookings = Booking::where('vehicle_id', $vehicle->id)
                ->where(function($query) use ($startDate, $endDate) {
                    $query->where(function($q) use ($startDate, $endDate) { // Booking starts within new booking
                        $q->where('start_date', '>=', $startDate)->where('start_date', '<', $endDate);
                    })->orWhere(function($q) use ($startDate, $endDate) { // Booking ends within new booking
                        $q->where('end_date', '>', $startDate)->where('end_date', '<=', $endDate);
                    })->orWhere(function($q) use ($startDate, $endDate) { // Booking encapsulates new booking
                        $q->where('start_date', '<=', $startDate)->where('end_date', '>=', $endDate);
                    });
                })->count();

            if ($overlappingBookings > 1 && fake()->boolean(70)) { // Allow some overlap for realism, but not too much
                continue; // Skip creating this booking to reduce excessive overlaps
            }


            $booking = Booking::factory()->create([
                'renter_user_id' => $user->id,
                'vehicle_id' => $vehicle->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                // Factory assigns random status, insurance, promotion
            ]);

            // For some bookings, create related items:
            // Create Payments (most bookings should have at least one successful payment)
            if (in_array($booking->status, ['confirmed', 'active', 'completed'])) {
                Payment::factory()->create([
                    'booking_id' => $booking->id,
                    'amount' => $booking->final_price, // Pay the full amount
                    'status' => 'successful',
                ]);
            } elseif (fake()->boolean(30)) { // Some pending/failed payments
                 Payment::factory()->create([
                    'booking_id' => $booking->id,
                    'amount' => $booking->final_price,
                    'status' => fake()->randomElement(['pending', 'failed']),
                ]);
            }


            // Create Rental Agreement for confirmed/active/completed bookings
            if (in_array($booking->status, ['confirmed', 'active', 'completed']) && fake()->boolean(80)) {
                RentalAgreement::factory()->create(['booking_id' => $booking->id]);
            }


            // Create Damage Reports for some 'completed' or 'active' bookings
            if (in_array($booking->status, ['completed', 'active']) && fake()->boolean(25)) { // 25% chance of damage
                $damageReport = DamageReport::factory()->create([
                    'booking_id' => $booking->id,
                    'reported_by_user_id' => $users->random()->id, // Could be renter or staff
                    // Factory assigns status and cost
                ]);
                // Add images to the damage report
                DamageReportImage::factory()->count(rand(1, 4))->create([
                    'damage_report_id' => $damageReport->id,
                ]);
            }
        }
    }
}