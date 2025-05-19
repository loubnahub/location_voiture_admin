<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('booking_extra', function (Blueprint $table) {
            $table->uuid('booking_id'); // Or $table->foreignId('booking_id')->constrained()->onDelete('cascade'); if using auto-incrementing IDs
            $table->uuid('extra_id');   // Or $table->foreignId('extra_id')->constrained()->onDelete('cascade');

            // Optional pivot columns
            $table->integer('quantity')->default(1);
            $table->decimal('price_at_booking', 8, 2)->nullable(); // Price of the extra at the time of booking

            $table->timestamps(); // Optional: if you want created_at/updated_at on pivot

            // Define foreign keys
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->foreign('extra_id')->references('id')->on('extras')->onDelete('cascade');

            // Primary key for the pivot table (composite key)
            $table->primary(['booking_id', 'extra_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('booking_extra');
    }
};