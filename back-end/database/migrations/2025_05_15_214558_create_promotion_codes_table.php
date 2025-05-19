<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\PromotionCodeStatus; // Make sure this enum exists

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_codes', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Was promotionCodeID
            $table->foreignUuid('promotion_campaign_id')->constrained('promotion_campaigns')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('code_string')->unique();
            $table->timestamp('issued_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->enum('status', array_column(PromotionCodeStatus::cases(), 'value'))->default(PromotionCodeStatus::ACTIVE->value);
            // $table->string('status')->default('active'); // Alternative if not using enum
            $table->timestamp('used_at')->nullable();
            // used_on_booking_id will be added after bookings table is created, or ensure this migration runs after bookings
            // $table->foreignUuid('used_on_booking_id')->nullable()->constrained('bookings')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_codes');
    }
};