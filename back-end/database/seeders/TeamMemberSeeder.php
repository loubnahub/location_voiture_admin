<?php
// database/seeders/TeamMemberSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\TeamMember; // Import the model

class TeamMemberSeeder extends Seeder
{
    public function run(): void
    {
        // Start with a clean slate
        DB::table('team_members')->truncate();

        // --- 1. Insert your SPECIFIC, hardcoded team members first ---
        $specificTeamMembers = [
            [
                'name' => 'Lahyane Oussama',
                'role' => 'Fleet Manager',
                'image_path' => 'team_images/ossama.jpg',
                'order_column' => 1,
                'created_at' => now(), 'updated_at' => now(),
            ],
            // ... add your other specific members here ...
        ];
        DB::table('team_members')->insert($specificTeamMembers);

        // --- 2. Use the factory to create ADDITIONAL random members ---
        // This will create 10 more team members. Some will have the placeholder
        // image, and some will have a null image_path.
        TeamMember::factory()->count(10)->create();
    }
}