<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary(); 
            $table->foreignUuid('default_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('phone')->unique()->nullable();
            $table->timestamp('email_verified_at')->nullable(); 
            $table->string('password');
            $table->string('profile_picture_url')->nullable();
            $table->integer('loyalty_points')->default(0);
            $table->rememberToken();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('users'); }
};