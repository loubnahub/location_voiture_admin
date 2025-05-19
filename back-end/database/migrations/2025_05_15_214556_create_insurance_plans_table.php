<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurance_plans', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Was insuranceID
            $table->string('name');
            $table->string('provider')->nullable();
            $table->text('coverage_details');
            $table->decimal('price_per_day', 8, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_plans');
    }
};