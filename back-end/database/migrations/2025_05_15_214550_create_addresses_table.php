<?php 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('street_line_1');
            $table->string('street_line_2')->nullable();
            $table->string('city');
            $table->string('postal_code');
            $table->string('country');
            $table->text('notes')->nullable();
        });
    }
    public function down(): void { Schema::dropIfExists('addresses'); }
};