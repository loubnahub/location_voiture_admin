<?php

namespace App\Enums;

enum BookingStatus: string
{
    case PENDING_CONFIRMATION = 'pending_confirmation';
    case CONFIRMED = 'confirmed';         
    case ACTIVE = 'active';                 
    case COMPLETED = 'completed';          
    case CANCELLED_BY_USER = 'cancelled_by_user';
    case CANCELLED_BY_PLATFORM = 'cancelled_by_platform';
    case PENDING_PAYMENT = 'pending_payment';   
    case PAYMENT_FAILED = 'payment_failed';
    case NO_SHOW = 'no_show';           
}