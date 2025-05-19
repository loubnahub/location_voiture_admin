<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Extra;

class ExtraSeeder extends Seeder
{
    public function run(): void
    {
        $extrasData = [
            ['name' => 'Child Safety Seat (Infant)', 'default_price_per_day' => 15.00, 'description' => 'Suitable for infants up to 12 months.'],
            ['name' => 'Child Safety Seat (Toddler)', 'default_price_per_day' => 15.00, 'description' => 'Suitable for toddlers from 1 to 4 years.'],
            ['name' => 'GPS Navigation Unit', 'default_price_per_day' => 10.00, 'description' => 'Dedicated GPS device for easy navigation.'],
            ['name' => 'Mobile Wi-Fi Hotspot', 'default_price_per_day' => 20.00, 'description' => 'Connect multiple devices to the internet on the go.'],
            ['name' => 'Ski Rack', 'default_price_per_day' => 25.00, 'description' => 'For transporting skis securely.'],
            ['name' => 'Bike Rack', 'default_price_per_day' => 20.00, 'description' => 'For transporting bicycles.'],
            ['name' => 'Roof Box Carrier', 'default_price_per_day' => 30.00, 'description' => 'Extra storage space on the roof.'],
            ['name' => 'Snow Chains', 'default_price_per_day' => 12.00, 'description' => 'For driving in snowy conditions.'],
        ];

        foreach ($extrasData as $extra) {
            Extra::firstOrCreate(
                ['name' => $extra['name']],
                [
                    'default_price_per_day' => $extra['default_price_per_day'],
                    'description' => $extra['description'] ?? fake()->optional(0.3)->sentence,
                ]
            );
        }
        // Extra::factory()->count(5)->create(); // If you want more random ones
    }
}