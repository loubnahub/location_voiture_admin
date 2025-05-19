<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurance_plan_vehicle_model', function (Blueprint $table) {
            $table->foreignUuid('vehicle_model_id')->constrained('vehicle_models')->cascadeOnDelete();
            $table->foreignUuid('insurance_plan_id')->constrained('insurance_plans')->cascadeOnDelete();
            $table->primary(['vehicle_model_id', 'insurance_plan_id'], 'vehicle_model_insurance_plan_primary');
            // No timestamps for basic pivot
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_plan_vehicle_model');
    }
};