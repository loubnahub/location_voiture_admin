<?php

// in database/seeders/AvisSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Avi;

class AvisSeeder extends Seeder
{
    public function run(): void
    {
        // Array of testimonials to insert
        $testimonials = [
            [
                'name' => 'Dan Martin',
                'rating' => 5,
                'car_name'=> 'Toyota Camry',
                'comment' => 'Lorem posuere in miss drana en the nisan semere sceriun amiss etiam ornare in the miss drana is lorem fermen nunta urnase mauris in the interdum.',
            ],
            // ... copy the rest of your testimonials here
            [
                'name' => 'Olivia Brown',
                'rating' => 5,
                'car_name'=> 'Toyota Camry',
               
                'comment' => 'Lorem posuere in miss drana en the nisan semere sceriun amiss etiam ornare in the miss drana is lorem fermen nunta urnase mauris in the interdum.',
            ],
             // etc. for all 6...
        ];

        // Loop through and create each record
        foreach ($testimonials as $testimonial) {
            Avi::create($testimonial);
        }
    }
}