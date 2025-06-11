<?php 

namespace App\Listeners;

use App\Events\BookingCompleted;
use App\Models\User;
use App\Models\PromotionCampaign;
use App\Models\PromotionCode;
use App\Models\Notification;
use App\Enums\PromotionCodeStatus;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Str;

class CheckLoyaltyAndGeneratePromoCode
{
    public function __construct() {}

    /**
     * Handle the booking completed event.
     * This listener is now the single source of truth for calculating points,
     * incrementing the user's total, and checking for rewards.
     */
    public function handle(BookingCompleted $event): void
    {
        $user = $event->booking->renter;
        if (!$user) {
            Log::warning("LISTENER: BookingCompleted event for Booking ID: {$event->booking->id} has no associated renter. Skipping.");
            return;
        }

        // --- NEW, CENTRALIZED LOGIC ---
        // 1. Calculate points to award from this specific booking.
        // Example logic: 1 point for every 100 MAD spent. Adjust as needed.
        $pointsToAward = floor((float)$event->booking->final_price / 100);

        // If no points were earned from this booking, there's nothing more to do.
        if ($pointsToAward <= 0) {
            Log::info("LISTENER: No loyalty points awarded for this booking (final price: {$event->booking->final_price}). Skipping check for User ID: {$user->id}.");
            return;
        }

        // 2. Get the user's points total BEFORE this transaction.
        $previousPoints = $user->loyalty_points;

        // 3. Atomically increment the user's points in the database.
        $user->increment('loyalty_points', $pointsToAward);

        // 4. Get the new total for comparison.
        $newTotalPoints = $previousPoints + $pointsToAward;
        
        Log::info("LISTENER: Handling BookingCompleted for User ID: {$user->id}. Points awarded: {$pointsToAward}. Total went from {$previousPoints} to {$newTotalPoints}.");
        
        // 5. Fetch all active loyalty campaigns to check against.
        $loyaltyCampaigns = PromotionCampaign::where('is_active', true)
                                ->whereNotNull('required_rental_count')
                                ->where('required_rental_count', '>', 0)
                                ->orderBy('required_rental_count', 'asc') // Check smaller thresholds first
                                ->get();

        if ($loyaltyCampaigns->isEmpty()) {
            Log::info("LISTENER: No active loyalty campaigns found. Exiting.");
            return;
        }

        // 6. Loop through campaigns and check if any threshold was crossed.
        foreach ($loyaltyCampaigns as $campaign) {
            $level = (int) $campaign->required_rental_count; 

            // The core logic: did the user's point total CROSS this level?
            if ($previousPoints < $level && $newTotalPoints >= $level) {
                $this->processRewardForCampaign($user, $campaign);
            }
        }
    }

    /**
     * Checks if a user should receive a code for a campaign and generates it.
     */
    protected function processRewardForCampaign(User $user, PromotionCampaign $campaign): void
    {
        // Check if the user has already received a code for this specific campaign
        $alreadyHasCode = PromotionCode::where('user_id', $user->id)
                                       ->where('promotion_campaign_id', $campaign->id)
                                       ->exists();

        if (!$alreadyHasCode) {
            Log::info("LISTENER: User {$user->id} crossed the {$campaign->required_rental_count} point threshold for campaign '{$campaign->name}'. Generating code.");
            $this->generateLoyaltyPromoCode($user, $campaign);
        } else {
            Log::info("LISTENER: User {$user->id} already has a code for campaign '{$campaign->name}', skipping generation.");
        }
    }

    /**
     * Creates the PromotionCode record in the database.
     */
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

        Log::info("LISTENER: Successfully generated loyalty promotion code for user.", ['user_id' => $user->id, 'code' => $codeString, 'campaign_id' => $campaign->id]);

        $this->createRewardNotification($user, $campaign, $promoCode);
    }

    /**
     * Creates a notification for the user about their new reward.
     */
    protected function createRewardNotification(User $user, PromotionCampaign $campaign, PromotionCode $promoCode): void
    {
        $title = "Congratulations! You've Earned a Reward!";
        $message = "You've reached the {$campaign->required_rental_count} points milestone! As a thank you, here is a promotion code for your next rental: {$promoCode->code_string}.";

        try {
            Notification::create([
                'user_id'   => $user->id,
                'title'     => $title,
                'message'   => $message,
                'timestamp' => Carbon::now(),
                'is_read'   => false,
            ]);
            Log::info("LISTENER: Successfully created notification for user about new reward.", ['user_id' => $user->id]);
        } catch (\Exception $e) {
            Log::error("LISTENER: Failed to create reward notification for user {$user->id}.", ['error_message' => $e->getMessage()]);
        }
    }
}