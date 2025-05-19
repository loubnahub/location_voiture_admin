<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feature_vehicle_model', function (Blueprint $table) {
            $table->foreignUuid('vehicle_model_id')->constrained('vehicle_models')->cascadeOnDelete();
            $table->foreignUuid('feature_id')->constrained('features')->cascadeOnDelete();
            $table->string('notes')->nullable();
            $table->primary(['vehicle_model_id', 'feature_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_vehicle_model');
    }
};