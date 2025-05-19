<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operational_holds', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Was holdID
            $table->foreignUuid('booking_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->foreignUuid('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignUuid('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('reason');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operational_holds');
    }
};