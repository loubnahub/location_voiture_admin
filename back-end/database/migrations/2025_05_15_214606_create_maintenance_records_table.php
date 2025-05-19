<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Was maintenanceID
            $table->foreignUuid('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignUuid('operational_hold_id')->nullable()->constrained('operational_holds')->nullOnDelete();
            $table->text('description');
            $table->decimal('cost', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps(); // Tracks when the record itself was created/updated
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_records');
    }
};