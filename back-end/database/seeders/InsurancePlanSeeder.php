<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\InsurancePlan;
class InsurancePlanSeeder extends Seeder
{
    public function run(): void
    {
        InsurancePlan::factory()->count(5)->create();
    }
}