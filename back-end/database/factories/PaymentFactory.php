<?php
namespace Database\Factories;
use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;
class PaymentFactory extends Factory
{
    protected $model = Payment::class;
    public function definition(): array
    {
        $methods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash'];
        $statuses = ['pending', 'successful', 'failed', 'refunded']; // Match PaymentStatus enum
        return [
            // booking_id will be set when creating
            'amount' => $this->faker->randomFloat(2, 20, 1000),
            'payment_date' => $this->faker->dateTimeThisYear(),
            'method' => $this->faker->randomElement($methods),
            'status' => $this->faker->randomElement($statuses),
            'transaction_id' => $this->faker->optional()->bothify('txn_#?#?#?#?#?#?'),
            'notes' => $this->faker->optional(0.3)->sentence,
        ];
    }
}