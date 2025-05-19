<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User; // Import your User model
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role; // If using Spatie roles

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // --- Create a default Admin User ---
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'], // Find by email
            [ // Create with these details if not found
                'full_name' => 'Admin User',
                'password' => Hash::make('password'), // Change 'password' to something secure
                'phone' => '0123456789', // Optional
                // Add other necessary fields from your User model that don't have defaults
                // 'default_address_id' => null, // Or link to a created address
            ]
        );

        // Assign 'admin' role if using Spatie and the role exists
        if (class_exists(Role::class)) {
            $adminRole = Role::where('name', 'admin')->first();
            if ($adminRole) {
                $adminUser->assignRole($adminRole);
            } else {
                $this->command->warn('Admin role not found. Please run RolesAndPermissionsSeeder first or create it.');
            }
        }


        // --- Create a default Customer User ---
        $customerUser = User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'full_name' => 'Test Customer',
                'password' => Hash::make('password'),
            ]
        );
        if (class_exists(Role::class)) {
            $customerRole = Role::where('name', 'customer')->first();
            if ($customerRole) {
                $customerUser->assignRole($customerRole);
            } else {
                $this->command->warn('Customer role not found.');
            }
        }


        // --- Create some additional random users using the factory ---
        // Ensure your UserFactory is set up correctly first
        // and that it doesn't try to create too many users with conflicting unique emails/phones.
        // Also, assign them a default role like 'customer'.
        if (User::count() < 15) { // Only create if you have less than 15 users total
            User::factory()->count(10)->create()->each(function ($user) {
                if (class_exists(Role::class)) {
                    $customerRole = Role::where('name', 'customer')->first();
                    if ($customerRole) {
                        $user->assignRole($customerRole);
                    }
                }
            });
        }

        $this->command->info('User seeder finished.');
    }
}