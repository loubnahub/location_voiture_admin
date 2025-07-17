<?php

// FILE: database/seeders/AgencyInfoSeeder.php

namespace Database\Seeders; // <-- MUST be exactly this

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

// The class name MUST match the filename
class AgencyInfoSeeder extends Seeder 
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Use truncate to ensure you don't get duplicate key errors if you run it again
        DB::table('agency_info')->truncate();

        DB::table('agency_info')->insert([
            'id' => 1,
            'agency_name' => 'RECALO',
            'phone_number' => '+212 060604405',
            'YearsExperience' => 50,
            'email' => 'Contact@Recalo.com',
            'address' => 'Oujda, Lazaret Street, Morocco',
            'office_hours' => 'Mon - Sat: 9 AM - 7 PM',
            'facebook_url' => 'https://facebook.com',
            'instagram_url' => 'https://instagram.com',
            'twitter_url' => 'https://twitter.com',
            'youtube_url' => 'https://youtube.com',
            'whatsapp_url' => 'https://wa.me/21260604405',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}