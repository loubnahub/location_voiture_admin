<?php
namespace Database\Factories;
use App\Models\RentalAgreement;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;
class RentalAgreementFactory extends Factory
{
    protected $model = RentalAgreement::class;
    public function definition(): array
    {
        $generatedAt = $this->faker->dateTimeThisYear();
        return [
            // booking_id will be set when creating
            'document_url' => $this->faker->url . '/' . $this->faker->word . '.pdf',
            'generated_at' => $generatedAt,
            'signed_by_renter_at' => $this->faker->optional(0.7)->dateTimeBetween($generatedAt, (clone $generatedAt)->modify('+2 days')),
            'signed_by_platform_at' => $this->faker->optional(0.6)->dateTimeBetween($generatedAt, (clone $generatedAt)->modify('+2 days')),
            'notes' => $this->faker->optional(0.2)->paragraph,
        ];
    }
}