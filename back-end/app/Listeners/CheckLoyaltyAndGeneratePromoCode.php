<?php 

namespace App\Listeners;

use App\Events\BookingCompleted;
use App\Models\User;
use App\Models\PromotionCampaign;
use App\Models\PromotionCode;
use App\Models\Notification;
use App\Enums\PromotionCodeStatus;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Str;

class CheckLoyaltyAndGeneratePromoCode {

    public function __construct() {}

    public function handle(BookingCompleted $event): void
    {
        $user = $event->booking->renter;
        if (!$user) {
            Log::warning("BookingCompleted event for Booking ID: {$event->booking->id} has no associated renter.");
            return;
        }

        // --- THIS IS THE DYNAMIC FIX ---
        // 1. Fetch ALL active loyalty campaigns directly from the database.
        // A "loyalty campaign" is one that has a value for the points threshold.
        $loyaltyCampaigns = PromotionCampaign::where('is_active', true)
                                ->whereNotNull('required_rental_count') // This is our 'points_threshold' column
                                ->where('required_rental_count', '>', 0)
                                ->orderBy('required_rental_count', 'asc') // Check smaller point totals first
                                ->get();

        if ($loyaltyCampaigns->isEmpty()) {
            Log::info("No active loyalty campaigns found. Skipping loyalty check for User ID: {$user->id}.");
            return;
        }

        // 2. Determine points before and after this booking.
        $pointsAwarded = floor((float)$event->booking->final_price / 100);
        // The user's points have ALREADY been incremented by the controller
        $newTotalPoints = $user->loyalty_points; 
        $previousPoints = $newTotalPoints - $pointsAwarded;

        Log::info("Handling BookingCompleted for User ID: {$user->id}. Points went from {$previousPoints} to {$newTotalPoints}.");

        // 3. Loop through the DYNAMIC campaigns from the DB and check if any were triggered.
        foreach ($loyaltyCampaigns as $campaign) {
            // Get the trigger point directly from the campaign object
            $level = $campaign->required_rental_count; 

            // The core logic: did the user's point total CROSS this level?
            if ($previousPoints < $level && $newTotalPoints >= $level) {
                
                // Check if the user already received a code for this specific campaign
                $alreadyHasCode = PromotionCode::where('user_id', $user->id)
                                               ->where('promotion_campaign_id', $campaign->id)
                                               ->exists();

                if (!$alreadyHasCode) {
                    Log::info("User {$user->id} crossed the {$level} point threshold for campaign '{$campaign->name}' (ID: {$campaign->id}). Generating code.");
                    $this->generateLoyaltyPromoCode($user, $campaign);
                } else {
                    Log::info("User {$user->id} already has a code for campaign '{$campaign->name}', skipping generation.");
                }
            }
        }
    }

    protected function generateLoyaltyPromoCode(User $user, PromotionCampaign $campaign): void
    {
        $level = $campaign->required_rental_count; 
        $codeString = 'LOYALTY' . $level . '-' . strtoupper(Str::random(6));

        $expiresAt = null;
        if ($campaign->code_validity_days) {
            $expiresAt = Carbon::now()->addDays($campaign->code_validity_days);
        } elseif ($campaign->end_date && $campaign->end_date->isFuture()) {
            $expiresAt = $campaign->end_date;
        }

        $promoCode = PromotionCode::create([
            'promotion_campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'code_string' => $codeString,
            'status' => PromotionCodeStatus::ACTIVE,
            'issued_at' => Carbon::now(),
            'expires_at' => $expiresAt,
        ]);

        Log::info("Successfully generated loyalty promotion code for user.", [
            'user_id' => $user->id,
            'level' => $level,
            'code' => $codeString,
            'campaign_id' => $campaign->id,
        ]);

        $this->createRewardNotification($user, $campaign, $promoCode);
    }

    protected function createRewardNotification(User $user, PromotionCampaign $campaign, PromotionCode $promoCode): void
    {
        $title = "Congratulations! You've Earned a Reward!";
        $message = "You've reached the {$campaign->required_rental_count} points milestone! " .
                   "As a thank you, here is a promotion code for your next rental: {$promoCode->code_string}.";

        try {
            Notification::create([
                'user_id'   => $user->id,
                'title'     => $title,
                'message'   => $message,
                'timestamp' => Carbon::now(),
                'is_read'   => false,
            ]);

            Log::info("Successfully created notification for user about their new reward.", [
                'user_id' => $user->id,
                'campaign_id' => $campaign->id,
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to create reward notification for user {$user->id}.", [
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}