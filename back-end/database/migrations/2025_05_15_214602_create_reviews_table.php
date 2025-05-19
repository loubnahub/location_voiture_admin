<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Was reviewID
            $table->foreignUuid('booking_id')->nullable()->constrained('bookings')->nullOnDelete(); // Review might be for a specific booking
            $table->foreignUuid('reviewer_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('subject_type'); // e.g., 'vehicle', 'platform', 'booking'
            // Consider $table->uuidMorphs('reviewable'); instead of subject_type if you want to link to various models directly
            $table->tinyInteger('rating')->unsigned(); // 1-5
            $table->text('comment')->nullable();
            $table->timestamp('created_at')->useCurrent();
            // Reviews typically aren't updated, so only created_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};