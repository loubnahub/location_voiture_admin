<?php

namespace App\Listeners;

use App\Models\OperationalHold;
use App\Services\VehicleStatusService;
use Illuminate\Support\Facades\Log;

class OperationalHoldStatusTriggerListener 
{
    /**
     * Create the event listener.
     * Laravel's service container will automatically inject the VehicleStatusService.
     */
    public function __construct(protected VehicleStatusService $vehicleStatusService) 
    {
        // Constructor is already correct, leaving it for clarity.
    }

    /**
     * Handle the event when an OperationalHold is saved OR deleted.
     * 
     * --- THIS IS THE FIX ---
     * We type-hint the OperationalHold model directly. Laravel will pass the
     * model instance into this variable for both 'saved' and 'deleted' events.
     *
     * @param \App\Models\OperationalHold $operationalHold The model instance.
     * @return void
     */
    public function handle(OperationalHold $operationalHold): void
    {
        // The OperationalHold model has a direct vehicle_id, which makes this simpler.
        $vehicleId = $operationalHold->vehicle_id;

        if ($vehicleId) {
            Log::info("OperationalHold Listener: Triggered for vehicle ID {$vehicleId}. Calling VehicleStatusService.");
            
            // Call the service to re-evaluate the vehicle's status.
            $this->vehicleStatusService->updateStatus($vehicleId);

        } else {
            Log::warning("OperationalHold Listener: Could not find a vehicle_id for OperationalHold ID: {$operationalHold->id}.");
        }
    }
}