<?php

namespace App\Providers;

use App\Events\BookingCompleted;             // <<< ADD THIS IMPORT
use App\Listeners\CheckCampaignEligibility;   // <<< ADD THIS IMPORT
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
        BookingCompleted::class => [           // <<< ADD THIS MAPPING
            CheckCampaignEligibility::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false; // Or true if you prefer auto-discovery, but explicit mapping is fine
    }
}