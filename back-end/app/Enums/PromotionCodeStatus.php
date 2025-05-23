<?php

namespace App\Enums;

enum PromotionCodeStatus: string
{
    case ACTIVE = 'active';     // Ready to be used
    case USED = 'used';       // Applied to a booking
    case EXPIRED = 'expired';   // Past its expiry date
    case INACTIVE = 'inactive'; // Manually deactivated by admin
    // case PENDING = 'pending'; // If codes need approval before becoming active

    public function label(): string // Optional: For display
    {
        return match ($this) {
            self::ACTIVE => 'Active',
            self::USED => 'Used',
            self::EXPIRED => 'Expired',
            self::INACTIVE => 'Inactive',
            // self::PENDING => 'Pending',
        };
    }
}