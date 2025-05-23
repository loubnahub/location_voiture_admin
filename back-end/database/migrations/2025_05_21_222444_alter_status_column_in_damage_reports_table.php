<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::table('damage_reports', function (Blueprint $table) {
        $table->string('status', 50)->change(); // Modify length
        // If changing description too:
        // $table->text('description')->change(); // Or string with new length
    });
}

public function down()
{
    Schema::table('damage_reports', function (Blueprint $table) {
        // Revert to the old length if known, otherwise this might be tricky
        // For safety, you might just comment out the down method or ensure it's correct
        // $table->string('status', PREVIOUS_LENGTH)->change();
    });
}
};
