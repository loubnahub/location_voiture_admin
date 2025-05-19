<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('damage_report_images', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Was imageID
            $table->foreignUuid('damage_report_id')->constrained('damage_reports')->cascadeOnDelete();
            $table->string('url');
            $table->string('caption')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();
            // No default timestamps()
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('damage_report_images');
    }
};