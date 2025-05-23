<?php

namespace App\Listeners;
use Carbon\Carbon; 
use App\Events\BookingCompleted;
use App\Models\PromotionCampaign;
use App\Models\PromotionCode;
use App\Models\User;
use App\Enums\PromotionCodeStatus; // Make sure this Enum exists and has an 'ACTIVE' or similar case
use Illuminate\Contracts\Queue\ShouldQueue; // To make the listener run in the background queue
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class CheckCampaignEligibility implements ShouldQueue // Implementing ShouldQueue is recommended
{
    use InteractsWithQueue; // Trait for queueable listeners

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param \App\Events\BookingCompleted $event
     * @return void
     */
    public function handle(BookingCompleted $event): void
    {
        $booking = $event->booking;
        // It's good practice to re-fetch the user to ensure we have the absolute latest data,
        // especially if the increment in the controller and event dispatch were very close.
        $renter = User::find($booking->renter_user_id);

        if (!$renter) {
            Log::warning("CheckCampaignEligibility Listener: Renter not found for booking ID {$booking->id}. Cannot check campaign eligibility.");
            return;
        }

        // Using loyalty_points as the count of completed rentals/bookings
        $completedBookingsCount = $renter->loyalty_points;

        Log::info("CheckCampaignEligibility Listener: Handling for renter ID {$renter->id}. User has {$completedBookingsCount} loyalty points (completed bookings).");

        // Find active campaigns where the user's completed bookings meet or exceed the required count
        $now = now();
        $eligibleCampaigns = PromotionCampaign::where('is_active', true)
            ->where('required_rental_count', '<=', $completedBookingsCount)
            ->where(function ($query) use ($now) {
                $query->whereNull('start_date') // Campaign might not have a start date (always active from creation)
                      ->orWhere('start_date', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('end_date') // Campaign might not have an end date (never expires based on date)
                      ->orWhere('end_date', '>=', $now);
            })
            // Add ->orderBy('required_rental_count', 'desc') if you want to process the "hardest to achieve" campaign first
            // or ->orderBy('created_at', 'asc') to process older campaigns first.
            ->get();

        if ($eligibleCampaigns->isEmpty()) {
            Log::info("CheckCampaignEligibility Listener: No eligible active campaigns found for renter ID {$renter->id} with {$completedBookingsCount} points.");
            return;
        }

        foreach ($eligibleCampaigns as $campaign) {
            Log::info("CheckCampaignEligibility Listener: Renter {$renter->id} is potentially eligible for campaign '{$campaign->name}' (ID: {$campaign->id}), requires {$campaign->required_rental_count} bookings.");

            // Rule: Check if the user has already been issued a code for this specific campaign
            // for this specific milestone/count. This prevents issuing multiple codes for the same achievement.
            // A more sophisticated system might involve a separate table to track "milestones achieved" by users.
            // For now, a simple check: has the user ever received a code from this campaign?
            // You might want to make this more specific, e.g., only one active code per campaign per user.

            $alreadyHasCodeForCampaign = PromotionCode::where('user_id', $renter->id)
                ->where('promotion_campaign_id', $campaign->id)
                // Optional: ->where('status', PromotionCodeStatus::ACTIVE) // If they can get another if previous one expired/used
                ->exists();

            if ($alreadyHasCodeForCampaign) {
                Log::info("CheckCampaignEligibility Listener: Renter {$renter->id} already has/had a code from campaign '{$campaign->name}'. Skipping issuance.");
                continue; // Skip to the next eligible campaign
            }

            // If eligible and no existing code for this campaign, issue a new one.
            $newPromotionCode = PromotionCode::create([
                'promotion_campaign_id' => $campaign->id,
                'user_id'               => $renter->id,
                'code_string'           => $this->generateUniqueCodeString($campaign->name),
                'issued_at'             => now(),
                'expires_at'            => $this->calculateExpiryDateForCode($campaign),
                'status'                => PromotionCodeStatus::ACTIVE, // Assuming ACTIVE is your default unused status
                // 'used_on_booking_id' will be null until used
            ]);

            Log::info("CheckCampaignEligibility Listener: Issued new promotion code '{$newPromotionCode->code_string}' (ID: {$newPromotionCode->id}) from campaign '{$campaign->name}' to user {$renter->id}. Expires at: {$newPromotionCode->expires_at}");

            // TODO: Notify the user about their new promotion code
            // Example: $renter->notify(new NewPromotionCodeAwardedNotification($newPromotionCode));
            // This notification would tell them their code and how to use it.

            // Depending on your rules, you might only issue one promo code per completed booking event,
            // even if they qualify for multiple campaigns simultaneously.
            // If so, you might `break;` here after the first code is issued.
            // break;
        }
    }

    /**
     * Generate a unique promotion code string.
     */
    protected function generateUniqueCodeString(string $campaignNameHint = 'LOYALTY'): string
    {
        $prefix = strtoupper(Str::slug(substr($campaignNameHint, 0, 6), '')); // Create a short prefix from campaign name
        if (empty($prefix) || strlen($prefix) < 3) {
            $prefix = 'PROMO';
        }

        do {
            // Generate a random part. Adjust length as needed.
            $randomPart = Str::upper(Str::random(8));
            $code = $prefix . $randomPart;
        } while (PromotionCode::where('code_string', $code)->exists()); // Ensure uniqueness

        return $code;
    }

    /**
     * Calculate the expiry date for a new promotion code based on the campaign.
     */
      /**
     * Calculate the expiry date for a new promotion code based on the campaign.
     */
    protected function calculateExpiryDateForCode(PromotionCampaign $campaign): ?Carbon
    {
        $issuedAt = now(); // Base the calculation on the current time (issue time)

        // Option 1: Campaign has a specific number of days for code validity from issue date
        if ($campaign->code_validity_days && is_numeric($campaign->code_validity_days) && $campaign->code_validity_days > 0) {
            $expiryFromValidityDays = $issuedAt->copy()->addDays($campaign->code_validity_days);

            // If the campaign also has an end_date, the code should not be valid beyond the campaign's end.
            if ($campaign->end_date) {
                if ($campaign->end_date->isPast()) { // Defensive: Campaign should be active, but check
                    Log::warning("Campaign {$campaign->id} (for code expiry calculation) has already ended.");
                    return $issuedAt->copy()->addMinutes(5); // Short expiry if campaign somehow ended
                }
                // Code expires on whichever is SOONER: campaign end date OR calculated expiry from validity_days
                return $campaign->end_date->lt($expiryFromValidityDays) ? $campaign->end_date : $expiryFromValidityDays;
            }
            // If no campaign end_date, just use the calculated expiry from validity_days
            return $expiryFromValidityDays;
        }

        // Option 2: No specific code_validity_days, so use campaign end_date if it exists and is in the future
        if ($campaign->end_date) {
            if ($campaign->end_date->isPast()) {
                Log::warning("Campaign {$campaign->id} (for code expiry calculation without validity_days) has already ended.");
                return $issuedAt->copy()->addMinutes(5);
            }
            return $campaign->end_date;
        }

        // Option 3: No code_validity_days AND no campaign end_date (campaign runs indefinitely)
        // In this case, you might want a default system-wide validity for such codes, or they never expire.
        // Let's use a default (e.g., 90 days) if no other rule applies.
        Log::info("Campaign {$campaign->id} has no code_validity_days and no end_date. Applying default expiry.");
        return $issuedAt->copy()->addDays(90); // Default to 90 days if no other expiry logic fits
    }
}