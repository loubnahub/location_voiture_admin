<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Was campaignID
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('required_rental_count')->nullable();
            $table->decimal('reward_value', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_campaigns');
    }
};