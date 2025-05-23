<?php

namespace App\Enums;

enum PromotionRewardType: string
{
    case PERCENTAGE = 'percentage'; // Reward value is a percentage discount
    case FIXED_AMOUNT = 'fixed_amount'; // Reward value is a fixed amount discount

    // You could add more types later, e.g., FREE_SHIPPING, FREE_EXTRA_ITEM etc.

    /**
     * Get a human-readable label for the enum case.
     */
    public function label(): string
    {
        return match ($this) {
            self::PERCENTAGE => 'Percentage Discount',
            self::FIXED_AMOUNT => 'Fixed Amount Discount',
        };
    }
}