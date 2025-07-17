<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_agency_info_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The table is now called 'agency_info'
        Schema::create('agency_info', function (Blueprint $table) {
            $table->id(); // Will always be 1 for our single row of settings

            // Agency Info
            $table->string('logo_url')->nullable();
            $table->string('agency_name')->default('RECALO');
            $table->integer('YearsExperience')->nullable();

            // Contact Details
            $table->string('phone_number')->nullable();
            $table->string('phone_fixed')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable(); // "Our Location"
            $table->string('office_hours')->nullable();
            $table->text('google_maps_url')->nullable();

            // Social Media Links
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('youtube_url')->nullable();
            $table->string('whatsapp_url')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agency_info');
    }
};