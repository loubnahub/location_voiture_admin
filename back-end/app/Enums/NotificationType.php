<?php

namespace App\Enums;

// This is an EXAMPLE if you want to categorize custom notifications.
// If using Laravel's default notification system, the 'type' column
// usually stores the fully qualified class name of the Notification.
enum NotificationType: string
{
    case BOOKING_CONFIRMED = 'booking_confirmed';
    case BOOKING_CANCELLED = 'booking_cancelled';
    case PAYMENT_SUCCESSFUL = 'payment_successful';
    case PAYMENT_FAILED = 'payment_failed';
    case RENTAL_REMINDER = 'rental_reminder';
    case PROMOTION_AVAILABLE = 'promotion_available';
    case ACCOUNT_UPDATE = 'account_update';
    case DAMAGE_REPORT_UPDATE = 'damage_report_update';
}