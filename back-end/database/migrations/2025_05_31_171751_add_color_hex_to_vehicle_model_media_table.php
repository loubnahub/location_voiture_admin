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
    Schema::table('vehicle_model_media', function ($table) {
        $table->string('color_hex', 10)->nullable()->after('media_type');
    });
}
public function down()
{
    Schema::table('vehicle_model_media', function ($table) {
        $table->dropColumn('color_hex');
    });
}
};
