<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rental_agreements', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Was agreementID
            $table->foreignUuid('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('document_url');
            $table->timestamp('generated_at')->useCurrent();
            $table->timestamp('signed_by_renter_at')->nullable();
            $table->timestamp('signed_by_platform_at')->nullable();
            $table->text('notes')->nullable();
            // No default timestamps(), specific date fields are used
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_agreements');
    }
};