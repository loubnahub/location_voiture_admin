<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Address;
class AddressSeeder extends Seeder
{
    public function run(): void { Address::factory()->count(15)->create(); }
}