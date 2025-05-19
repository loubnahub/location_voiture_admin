<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_models', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vehicle_type_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('brand');
            $table->string('model');
            $table->year('year');
            $table->string('fuel_type');
            $table->string('transmission');
            $table->json('available_colors')->nullable();
            $table->integer('number_of_seats');
            $table->integer('number_of_doors');
            $table->decimal('base_price_per_day', 10, 2);
            $table->text('description')->nullable(); // Kept nullable
            $table->boolean('is_available')->default(true); // Model availability, vehicle instances have their own status
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('vehicle_models'); }
};