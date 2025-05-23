<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Change the length of the status column
            // Using 25 as a safe length for current and potentially slightly longer future statuses
            $table->string('status', 25)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Revert to the previous length. You'll need to know what it was.
            // For example, if it was 15:
            // $table->string('status', 15)->change();
            // It's important to have a correct down method for rollbacks.
            // If you don't know the previous length, you might make an educated guess
            // or decide that reverting to a shorter length isn't critical for your dev workflow.
        });
    }
};