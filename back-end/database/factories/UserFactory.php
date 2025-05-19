<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Address; // If you want to assign a default address

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
  
    public function definition(): array
    {
        $phone = null;
        if ($this->faker->boolean(70)) { // 70% chance of having a phone
            try {
                // Try to generate a unique phone number.
                // Faker's unique can be resource-intensive if you create many users.
                // For massive seeding, consider simpler non-unique or a custom unique generator.
                $phone = $this->faker->unique()->e164PhoneNumber; // e.g., +1XXXXXXXXXX
            } catch (\OverflowException $e) {
                // Handle cases where unique can't be found after max retries
                // For simplicity, we might generate a non-unique one or just leave it null
                $phone = $this->faker->e164PhoneNumber;
                $this->faker->unique(true); // Reset for next factory call if it failed
            }
        }

        return [
            'full_name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'phone' => $phone, // Assign the generated phone number
            'profile_picture_url' => $this->faker->boolean(50) ? $this->faker->imageUrl(200, 200, 'people', true, 'Faker') : null, // 50% chance, added parameters for picsum
            'loyalty_points' => $this->faker->numberBetween(0, 1000),
            'default_address_id' => null, // Or Address::factory() if AddressFactory is robust
        ];
    }
    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}