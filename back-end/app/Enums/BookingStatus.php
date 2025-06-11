<?php

namespace App\Enums;

enum BookingStatus: string
{
    // --- These are the cases you have DEFINED ---
    case PENDING_CONFIRMATION = 'pending_confirmation';
    case CONFIRMED = 'confirmed';         
    case ACTIVE = 'active';                 
    case COMPLETED = 'completed';          
    case CANCELLED_BY_USER = 'cancelled_by_user';
    case CANCELLED_BY_PLATFORM = 'cancelled_by_platform';
    case PENDING_PAYMENT = 'pending_payment';   
    case PAYMENT_FAILED = 'payment_failed';
    case NO_SHOW = 'no_show';     
    
    // --- This is the CORRECTED method ---
    public function label(): string
    {
        return match ($this) {
            // These cases now match what you defined above
            self::PENDING_CONFIRMATION => 'pending confirmation',
            self::CONFIRMED => 'confirmed',
            self::ACTIVE => 'active',
            self::COMPLETED => 'completed',
            self::CANCELLED_BY_USER => 'cancelled (User)', // Corrected
            self::CANCELLED_BY_PLATFORM => 'cancelled (Platform)', // Corrected
            self::PENDING_PAYMENT => 'Pending Payment', // Added
            self::PAYMENT_FAILED => 'Payment Failed', // Added
            self::NO_SHOW => 'No Show',

            // The default is a good fallback for any cases you might add later
            default => ucfirst(str_replace('_', ' ', $this->value)),
        };
    }      
}