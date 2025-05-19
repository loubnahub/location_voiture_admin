<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Feature;

class FeatureSeeder extends Seeder
{
    public function run(): void
    {
        // Predefined list to ensure good variety and avoid too much randomness for core features
        $featuresData = [
            // Safety
            ['name' => 'Anti-lock Braking System (ABS)', 'category' => 'Safety', 'description' => 'Prevents wheel lock-up during hard braking.'],
            ['name' => 'Electronic Stability Control (ESC)', 'category' => 'Safety', 'description' => 'Helps maintain control during skids.'],
            ['name' => 'Front Airbags', 'category' => 'Safety'],
            ['name' => 'Side Airbags', 'category' => 'Safety'],
            ['name' => 'Curtain Airbags', 'category' => 'Safety'],
            ['name' => 'Blind Spot Monitoring', 'category' => 'Safety', 'description' => 'Alerts driver to vehicles in blind spots.'],
            ['name' => 'Lane Departure Warning', 'category' => 'Safety', 'description' => 'Warns if the car drifts out of its lane.'],
            ['name' => 'Adaptive Cruise Control', 'category' => 'Safety', 'description' => 'Maintains set speed and distance from vehicle ahead.'],
            ['name' => 'Rearview Camera', 'category' => 'Safety'],
            ['name' => 'Parking Sensors (Front & Rear)', 'category' => 'Safety'],

            // Comfort & Convenience
            ['name' => 'Air Conditioning', 'category' => 'Comfort & Convenience'],
            ['name' => 'Dual-zone Automatic Climate Control', 'category' => 'Comfort & Convenience'],
            ['name' => 'Heated Front Seats', 'category' => 'Comfort & Convenience'],
            ['name' => 'Ventilated Front Seats', 'category' => 'Comfort & Convenience'],
            ['name' => 'Power Adjustable Driver Seat', 'category' => 'Comfort & Convenience'],
            ['name' => 'Leather Upholstery', 'category' => 'Comfort & Convenience'],
            ['name' => 'Sunroof / Moonroof', 'category' => 'Comfort & Convenience'],
            ['name' => 'Keyless Entry & Go', 'category' => 'Comfort & Convenience'],

            // Infotainment
            ['name' => 'Touchscreen Infotainment System', 'category' => 'Infotainment'],
            ['name' => 'Bluetooth Connectivity', 'category' => 'Infotainment'],
            ['name' => 'Apple CarPlay Integration', 'category' => 'Infotainment'],
            ['name' => 'Android Auto Integration', 'category' => 'Infotainment'],
            ['name' => 'Built-in Navigation System', 'category' => 'Infotainment'],
            ['name' => 'Premium Sound System (e.g., Bose, JBL)', 'category' => 'Infotainment'],
            ['name' => 'Multiple USB Ports', 'category' => 'Infotainment'],

            // Performance
            ['name' => 'Turbocharged Engine', 'category' => 'Performance'],
            ['name' => 'All-Wheel Drive (AWD)', 'category' => 'Performance'],
            ['name' => 'Sport Mode', 'category' => 'Performance'],

            // Exterior
            ['name' => 'LED Headlights', 'category' => 'Exterior'],
            ['name' => 'Alloy Wheels (17-inch)', 'category' => 'Exterior'],
            ['name' => 'Alloy Wheels (18-inch)', 'category' => 'Exterior'],
            ['name' => 'Alloy Wheels (19-inch)', 'category' => 'Exterior'],
            ['name' => 'Fog Lights', 'category' => 'Exterior'],
        ];

        foreach ($featuresData as $feature) {
            Feature::firstOrCreate(
                ['name' => $feature['name']], // Find by name
                [ // Create with these if not found
                    'category' => $feature['category'],
                    'description' => $feature['description'] ?? fake()->optional(0.3)->sentence,
                ]
            );
        }

        // Optionally, create a few more random ones if needed,
        // but be careful with FeatureFactory's unique() on small predefined lists
        // Feature::factory()->count(10)->create();
    }
}