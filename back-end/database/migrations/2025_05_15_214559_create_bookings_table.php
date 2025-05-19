<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\BookingStatus;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('renter_user_id')->constrained('users')->cascadeOnDelete(); // User who is renting
            $table->foreignUuid('vehicle_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('insurance_plan_id')->nullable()->constrained('insurance_plans')->nullOnDelete();
            $table->foreignUuid('promotion_code_id')->nullable()->constrained('promotion_codes')->nullOnDelete();

            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->enum('status', array_column(BookingStatus::cases(), 'value'))
            ->default(BookingStatus::PENDING_CONFIRMATION->value);
            $table->decimal('calculated_base_price', 10, 2);
            $table->decimal('calculated_extras_price', 10, 2)->default(0);
            $table->decimal('calculated_insurance_price', 10, 2)->default(0);
            $table->decimal('discount_amount_applied', 10, 2)->default(0);
            $table->decimal('final_price', 10, 2);
            $table->timestamps();
        });

        if (Schema::hasTable('promotion_codes') && !Schema::hasColumn('promotion_codes', 'used_on_booking_id')) {
            Schema::table('promotion_codes', function (Blueprint $table) {
                $table->foreignUuid('used_on_booking_id')->nullable()->constrained('bookings')->nullOnDelete()->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('promotion_codes') && Schema::hasColumn('promotion_codes', 'used_on_booking_id')) {
             Schema::table('promotion_codes', function (Blueprint $table) {
                try { // Try-catch for safety, as FK name can vary or not exist
                    $table->dropForeign(['used_on_booking_id']);
                } catch (\Exception $e) {
                    // Log or ignore if FK doesn't exist
                }
            });
        }
        Schema::dropIfExists('bookings');
    }
};