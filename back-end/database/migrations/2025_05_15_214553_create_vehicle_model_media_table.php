<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_model_media', function (Blueprint $table) {
            $table->uuid('id')->primary(); 
            $table->foreignUuid('vehicle_model_id')->constrained('vehicle_models')->cascadeOnDelete();
            $table->string('url');
            $table->string('caption')->nullable();
            $table->boolean('is_cover')->default(false);
            $table->integer('order')->default(0);
            $table->timestamp('uploaded_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_model_media');
    }
};