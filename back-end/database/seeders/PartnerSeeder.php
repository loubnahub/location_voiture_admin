<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PartnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate the table first to start with a clean slate.
        // This is useful for development if you run the seeder multiple times.
        DB::table('partners')->truncate();

        $partners = [
            [
                'name' => 'Maserati',
                'logo_path' => 'partner_logos/maserati.png',
                'order_column' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Jeep',
                'logo_path' => 'partner_logos/jeep.png',
                'order_column' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bentley',
                'logo_path' => 'partner_logos/bentley.png',
                'order_column' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Porsche',
                'logo_path' => 'partner_logos/porsche.png',
                'order_column' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'BMW',
                'logo_path' => 'partner_logos/bmw.png',
                'order_column' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ferrari',
                'logo_path' => 'partner_logos/ferrari.png',
                'order_column' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Lamborghini',
                'logo_path' => 'partner_logos/Lamborghini.png',
                'order_column' => 7,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert the data into the 'partners' table
        DB::table('partners')->insert($partners);
    }
}