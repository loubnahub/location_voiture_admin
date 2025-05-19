<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // This migration creates a custom notifications table.
        // If you intend to use Laravel's built-in notification system with database channel,
        // it uses a different structure (id, type, notifiable_type, notifiable_id, data, read_at, created_at, updated_at).
        // This custom table matches your diagram more closely.
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Was notificationID
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete(); // The recipient
            $table->string('title');
            $table->text('message'); // Renamed from 'message' to avoid conflict if using Laravel's system later
            $table->timestamp('timestamp')->useCurrent(); // Maps to created_at essentially
            $table->boolean('is_read')->default(false);
            // No default created_at/updated_at as timestamp serves as created_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};