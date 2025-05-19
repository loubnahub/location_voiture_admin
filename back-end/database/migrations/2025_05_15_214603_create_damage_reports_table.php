<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\DamageReportStatus; 

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('damage_reports', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Was reportID
            $table->foreignUuid('booking_id')->constrained('bookings')->cascadeOnDelete(); // Damage always linked to a booking
            $table->foreignUuid('reported_by_user_id')->nullable()->constrained('users')->nullOnDelete(); // User or staff who reported
            $table->timestamp('reported_at')->useCurrent();
            $table->text('description');
            $table->enum('status', array_column(DamageReportStatus::cases(), 'value'))->default(DamageReportStatus::REPORTED->value);
            $table->decimal('repair_cost', 10, 2)->nullable();
            $table->timestamps(); // Record creation/update time
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('damage_reports');
    }
};