<?php

namespace App\Listeners;

use App\Models\Booking;
use App\Services\VehicleStatusService;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit; // 1. IMPORT THIS
use Illuminate\Support\Facades\Log;

// 2. IMPLEMENT THE INTERFACE
class BookingStatusTriggerListener implements ShouldHandleEventsAfterCommit
{
    public function __construct(protected VehicleStatusService $vehicleStatusService) {}

    /**
     * Handle the event.
     * The event is now guaranteed to run *after* the database commit.
     * The event object is the model instance itself for Eloquent events.
     */
    public function handle(Booking $booking): void
    {
        Log::info("--- LISTENER (After Commit): BookingStatusTriggerListener TRIGGERED for Booking ID: {$booking->id} ---");

        $currentVehicleId = $booking->vehicle_id;
        $originalVehicleId = $booking->getOriginal('vehicle_id');
        
        // Update status for the current/new vehicle
        if ($currentVehicleId) {
            Log::info("Listener found current Vehicle ID: {$currentVehicleId}. Calling Service.");
            $this->vehicleStatusService->updateStatus($currentVehicleId);
        }

        // If the vehicle was changed, update the status of the OLD vehicle
        if ($booking->wasChanged('vehicle_id') && $originalVehicleId && $originalVehicleId !== $currentVehicleId) {
            Log::info("Vehicle ID was changed. Also updating status for old Vehicle ID: {$originalVehicleId}.");
            $this->vehicleStatusService->updateStatus($originalVehicleId);
        }
    }
}