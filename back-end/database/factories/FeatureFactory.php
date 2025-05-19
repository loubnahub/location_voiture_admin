<?php

namespace Database\Factories;

use App\Models\Feature;
use Illuminate\Database\Eloquent\Factories\Factory;

class FeatureFactory extends Factory
{
    protected $model = Feature::class;

    public function definition(): array
    {
        $categories = ['Safety', 'Comfort & Convenience', 'Infotainment', 'Performance', 'Exterior', 'Interior'];
        $featuresData = [
            'Safety' => ['Anti-lock Braking System (ABS)', 'Electronic Stability Control (ESC)', 'Airbags (Front, Side, Curtain)', 'Blind Spot Monitoring', 'Lane Departure Warning', 'Adaptive Cruise Control', 'Rearview Camera', 'Parking Sensors'],
            'Comfort & Convenience' => ['Air Conditioning', 'Dual-zone Automatic Climate Control', 'Heated Front Seats', 'Ventilated Front Seats', 'Power Adjustable Seats', 'Keyless Entry', 'Push-button Start', 'Sunroof/Moonroof', 'Leather Upholstery', 'Power Tailgate'],
            'Infotainment' => ['Touchscreen Display', 'Bluetooth Connectivity', 'Apple CarPlay', 'Android Auto', 'Navigation System', 'Premium Sound System', 'USB Ports', 'Wireless Charging Pad'],
            'Performance' => ['Turbocharged Engine', 'All-Wheel Drive (AWD)', 'Sport Suspension', 'Paddle Shifters', 'Multiple Driving Modes'],
            'Exterior' => ['LED Headlights', 'LED Taillights', 'Alloy Wheels', 'Fog Lights', 'Roof Rails', 'Privacy Glass'],
            'Interior' => ['Ambient Lighting', 'Leather-wrapped Steering Wheel', 'Split-folding Rear Seats', 'Auto-dimming Rearview Mirror'],
        ];

        $category = $this->faker->randomElement($categories);
        $name = $this->faker->unique()->randomElement($featuresData[$category]); // Ensure unique feature name

        return [
            'name' => $name,
            'description' => $this->faker->optional(0.7)->sentence, // 70% chance of having a description
            'category' => $category,
        ];
    }

    // Helper to reset unique constraint for testing if needed, but usually not called directly
    public function resetUnique()
    {
        $this->faker->unique(true); // Reset all unique generators for this Faker instance
    }
}