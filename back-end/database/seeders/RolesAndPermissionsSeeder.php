<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions (examples)
        Permission::firstOrCreate(['name' => 'manage vehicles']);
        Permission::firstOrCreate(['name' => 'view bookings']);
        Permission::firstOrCreate(['name' => 'manage users']);
        // ... add all permissions your app needs

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $staffRole = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']); // Example

        // Assign permissions to roles
        // $adminRole->givePermissionTo(Permission::all()); // Example
        $adminRole->givePermissionTo(['manage vehicles', 'view bookings', 'manage users']);
        $customerRole->givePermissionTo(['view bookings']); // Example
        $staffRole->givePermissionTo(['manage vehicles', 'view bookings']);

        $this->command->info('Roles and Permissions seeded successfully!');
    }
}