<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case SUCCESSFUL = 'successful'; 
    case FAILED = 'failed';
    case REFUNDED = 'refunded';
    case PARTIALLY_REFUNDED = 'partially_refunded';
    case REQUIRES_ACTION = 'requires_action';
    case CANCELLED = 'cancelled';
}