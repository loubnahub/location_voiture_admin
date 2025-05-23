<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\PromotionRewardType; // We will create this Enum next

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('promotion_campaigns', function (Blueprint $table) {
            // Add reward_type after reward_value or a similar logical place
            $table->string('reward_type')->default(PromotionRewardType::PERCENTAGE->value)->after('reward_value'); // Default to percentage

            // Add code_validity_days after end_date or similar
            // This will store how many days a generated code from this campaign is valid from its issue date.
            // Can be null if codes expire with the campaign's end_date or have another logic.
            $table->integer('code_validity_days')->nullable()->unsigned()->after('end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promotion_campaigns', function (Blueprint $table) {
            $table->dropColumn('reward_type');
            $table->dropColumn('code_validity_days');
        });
    }
};