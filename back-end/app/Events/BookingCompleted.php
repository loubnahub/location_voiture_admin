<?php

namespace App\Events;

use App\Models\Booking; // Import your Booking model
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; // Remove if not broadcasting
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Booking $booking; // Public property to hold the Booking instance

    /**
     * Create a new event instance.
     *
     * @param \App\Models\Booking $booking The booking that was completed.
     * @return void
     */
    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    /**
     * Get the channels the event should broadcast on.
     * (Remove this method if your event does not need to be broadcast over WebSockets)
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Example: Broadcasting on a private channel for the specific user
        // return [
        //     new PrivateChannel('user.'.$this->booking->renter_user_id),
        // ];
        // For now, if you're not using broadcasting, you can return an empty array or remove the method
        // and remove the `ShouldBroadcast` interface from the class declaration.
        return [];
    }
}