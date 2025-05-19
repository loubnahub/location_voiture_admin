<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('extra_vehicle_model', function (Blueprint $table) {
            $table->foreignUuid('vehicle_model_id')->constrained('vehicle_models')->cascadeOnDelete();
            $table->foreignUuid('extra_id')->constrained('extras')->cascadeOnDelete();
            $table->primary(['vehicle_model_id', 'extra_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('extra_vehicle_model');
    }
};