<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\VehicleStatus; 

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vehicle_model_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('current_location_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->string('license_plate')->unique();
            $table->string('vin')->unique()->nullable();
            $table->string('color');
            $table->string('hexa_color_code')->nullable(); 
            $table->integer('mileage')->default(0);
            $table->enum('status', array_column(VehicleStatus::cases(), 'value'))->default(VehicleStatus::AVAILABLE->value);
            // $table->string('status')->default('available'); // Example: 'available', 'rented', 'maintenance'
            $table->date('acquisition_date')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('vehicles'); }
};