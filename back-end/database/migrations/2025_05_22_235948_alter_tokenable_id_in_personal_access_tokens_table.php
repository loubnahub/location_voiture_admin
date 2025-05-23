<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Change tokenable_id to store UUIDs.
            // CHAR(36) is a common choice for UUIDs in MySQL.
            // Ensure this matches how your HasUuid trait stores UUIDs (usually CHAR(36) or UUID type).
            $table->string('tokenable_id', 36)->change(); // Or $table->uuid('tokenable_id')->change(); if supported & preferred
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Reverting this is tricky if data types are very different.
            // The original was likely an integer type for auto-incrementing IDs.
            // If you need a robust down method, you'd have to know the original type.
            // For development, you might just drop and recreate or accept data loss on rollback here.
            // For simplicity, assuming you might want to revert to a standard integer if needed,
            // but this would lose UUID compatibility.
            // A safer down() might be to just acknowledge it or revert to a generic string.
            // $table->unsignedBigInteger('tokenable_id')->change(); // This might fail if existing data is UUID
            // For safety, let's make it a string that can hold either, or comment out if unsure.
            $table->string('tokenable_id')->change(); // Revert to a general string, or define original type.
        });
    }
};