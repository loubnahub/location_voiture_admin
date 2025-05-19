<?php

namespace Database\Factories; // Correct Namespace

use App\Models\Address; // Correct Model Import
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // If you were to use Str::uuid() manually for ID

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Address>
 */
class AddressFactory extends Factory // Correct Class Name
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Address::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // If your 'id' column in 'addresses' table is a UUID and you are NOT using
        // the HasUuid trait on the Address model, you would define it here:
        // 'id' => Str::uuid()->toString(),

        // If HasUuid trait IS on Address model, it handles ID creation automatically.

        return [
            'street_line_1' => $this->faker->streetAddress,
            'street_line_2' => $this->faker->optional(0.3)->secondaryAddress, // 30% chance of having a street_line_2
            'city' => $this->faker->city,
            'postal_code' => $this->faker->postcode,
            'country' => $this->faker->country,
            'notes' => $this->faker->optional(0.2)->sentence, // 20% chance of having notes
        ];
    }
}