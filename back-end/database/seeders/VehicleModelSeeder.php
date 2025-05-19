<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\VehicleModel;
use App\Models\Feature; // Import Feature
use App\Models\Extra;   // Import Extra
use App\Models\VehicleModelMedia; // Import VehicleModelMedia

class VehicleModelSeeder extends Seeder
{
    public function run(): void
    {
        $allFeatures = Feature::all();
        $allExtras = Extra::all();

        if ($allFeatures->isEmpty() || $allExtras->isEmpty()) {
            $this->command->warn('Please run FeatureSeeder and ExtraSeeder before VehicleModelSeeder if you want models to have features/extras.');
            // Optionally, call them here if you want to ensure they run
            // $this->call([FeatureSeeder::class, ExtraSeeder::class]);
            // $allFeatures = Feature::all();
            // $allExtras = Extra::all();
        }

        VehicleModel::factory()->count(25)->create()->each(function ($model) use ($allFeatures, $allExtras) {
            // Attach a random number of features (3 to 10)
            if ($allFeatures->isNotEmpty()) {
                $featuresToAttach = $allFeatures->random(min(rand(3, 10), $allFeatures->count()))->pluck('id');
                $model->features()->attach($featuresToAttach); // Assumes ManyToMany relationship 'features'
            }

            // Attach a random number of extras (1 to 4)
            if ($allExtras->isNotEmpty()) {
                $extrasToAttach = $allExtras->random(min(rand(1, 4), $allExtras->count()))->pluck('id');
                $model->extras()->attach($extrasToAttach); // Assumes ManyToMany relationship 'extras'
            }

            // Create some media for each model
            // Create one cover image
            VehicleModelMedia::factory()->cover()->create(['vehicle_model_id' => $model->id]);
            // Create a few additional non-cover images
            VehicleModelMedia::factory()->count(rand(2, 4))->create(['vehicle_model_id' => $model->id]);
        });
    }
}