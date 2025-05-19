<?php

namespace Database\Factories;

use App\Models\DamageReportImage;
// DamageReport model is not strictly needed here as 'damage_report_id' will be passed
use Illuminate\Database\Eloquent\Factories\Factory;

class DamageReportImageFactory extends Factory
{
    protected $model = DamageReportImage::class;

    public function definition(): array
    {
        $imageUrls = [
            'https://loremflickr.com/640/480/car,damage,scratch?random=' . $this->faker->randomNumber(),
            'https://loremflickr.com/640/480/car,dent,accident?random=' . $this->faker->randomNumber(),
            'https://loremflickr.com/640/480/vehicle,broken,part?random=' . $this->faker->randomNumber(),
        ];
        return [
            // 'damage_report_id' will be set when calling factory
            'url' => $this->faker->randomElement($imageUrls),
            'caption' => $this->faker->optional(0.7)->sentence,
            'uploaded_at' => now(),
        ];
    }
}