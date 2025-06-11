<?php

namespace App\Providers;

// We only need the imports that are already there
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        // --- THIS IS THE ONLY BLOCK YOU NEED TO ADD ---
        // We use the full namespace path here, so no 'use' statement is needed at the top.
        \App\Events\BookingCompleted::class => [
            \App\Listeners\CheckLoyaltyAndGeneratePromoCode::class,
        ],
           'eloquent.saved: App\Models\Booking' => [
        \App\Listeners\BookingStatusTriggerListener::class,
    ],
    'eloquent.deleted: App\Models\Booking' => [
        \App\Listeners\BookingStatusTriggerListener::class,
    ],

    // Any time an Operational Hold is saved or deleted...
    'eloquent.saved: App\Models\OperationalHold' => [
        \App\Listeners\OperationalHoldStatusTriggerListener::class,
    ],
    'eloquent.deleted: App\Models\OperationalHold' => [
        \App\Listeners\OperationalHoldStatusTriggerListener::class,
    ],

    // Any time a Damage Report is saved or deleted...
    'eloquent.saved: App\Models\DamageReport' => [
        \App\Listeners\DamageReportStatusTriggerListener::class,
    ],
    'eloquent.deleted: App\Models\DamageReport' => [
        \App\Listeners\DamageReportStatusTriggerListener::class,
    ]
        // --- END OF THE NEW BLOCK ---
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        // No changes needed here
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false; // This is fine, explicit mapping is more clear.
    }
}