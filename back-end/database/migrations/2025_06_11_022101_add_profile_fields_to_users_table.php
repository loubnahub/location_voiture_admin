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
            // In a migration file for the `users` table
Schema::table('users', function (Blueprint $table) {
    // These should come after the `id` column
    $table->string('profile_photo_path', 2048)->nullable();

    // Foreign keys for default addresses
    $table->foreignUuid('default_billing_address_id')->nullable()->constrained('addresses')->onDelete('set null');
    $table->foreignUuid('default_shipping_address_id')->nullable()->constrained('addresses')->onDelete('set null');
});
}
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
