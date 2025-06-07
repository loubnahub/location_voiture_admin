<?php

use App\Enums\DamageReportStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('damage_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignUuid('reported_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reported_at')->useCurrent();
            $table->text('description');
            // Corrected Enum case name
            $table->enum('status', array_column(DamageReportStatus::cases(), 'value'));
                //   ->default(DamageReportStatus::REPORTED->value); 
            $table->decimal('repair_cost', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('damage_reports');
    }
};