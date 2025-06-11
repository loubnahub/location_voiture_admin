<?php

namespace App\Listeners;

use App\Models\Booking;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;
use Illuminate\Support\Facades\Log;

class BookingStatusTriggerListener implements ShouldHandleEventsAfterCommit
{
    // The service is no longer needed here.
    // public function __construct(protected VehicleStatusService $vehicleStatusService) {}

    public function handle(Booking $booking): void
    {
        Log::info("--- LISTENER (After Commit): BookingStatusTriggerListener TRIGGERED for Booking ID: {$booking->id} ---");

        $currentVehicleId = $booking->vehicle_id;
        $originalVehicleId = $booking->getOriginal('vehicle_id');
        
        // Update status for the current/new vehicle
        if ($currentVehicleId) {
            $currentVehicle = \App\Models\Vehicle::find($currentVehicleId);
            if ($currentVehicle) {
                Log::info("Booking Listener found current Vehicle ID: {$currentVehicleId}. Calling update method.");
                // Call the central method.
                $currentVehicle->updateStatusBasedOnPriority();
            }
        }

        // If the vehicle was changed, update the status of the OLD vehicle
        if ($booking->wasChanged('vehicle_id') && $originalVehicleId && $originalVehicleId !== $currentVehicleId) {
            $originalVehicle = \App\Models\Vehicle::find($originalVehicleId);
            if ($originalVehicle) {
                Log::info("Vehicle ID was changed. Also updating status for old Vehicle ID: {$originalVehicleId}.");
                // Call the central method on the old vehicle too.
                $originalVehicle->updateStatusBasedOnPriority();
            }
        }
    }
}