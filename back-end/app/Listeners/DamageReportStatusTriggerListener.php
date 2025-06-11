<?php

namespace App\Listeners;

use App\Models\DamageReport;
use App\Services\VehicleStatusService;
use Illuminate\Support\Facades\Log;

class DamageReportStatusTriggerListener 
{
    /**
     * The VehicleStatusService instance.
     * The 'protected' keyword in the constructor automatically creates this property.
     */
    // protected $vehicleStatusService; // No need to declare it here with PHP 8+ constructor promotion

    /**
     * Create the event listener.
     * Laravel's service container will automatically inject the VehicleStatusService here.
     *
     * @param \App\Services\VehicleStatusService $vehicleStatusService
     */
    public function __construct(protected VehicleStatusService $vehicleStatusService) 
    {
        // With constructor property promotion, this is all you need.
        // The property is automatically assigned.
    }

    /**
     * Handle the event when a DamageReport is saved or deleted.
     *
     * @param \App\Models\DamageReport $damageReport The DamageReport model instance.
     * @return void
     */
    public function handle(DamageReport $damageReport): void
    {
        // Eager load the relationships to prevent N+1 issues and ensure they exist.
        $damageReport->load('booking.vehicle');
        
        // Find the vehicle associated with this damage report through its booking.
        $vehicle = $damageReport->booking?->vehicle;

        if ($vehicle) {
            Log::info("DamageReport Listener: Triggered for vehicle ID {$vehicle->id}. Calling VehicleStatusService.");
            
            // Now, this will work because the constructor set the property.
            $this->vehicleStatusService->updateStatus($vehicle->id);

        } else {
            Log::warning("DamageReport Listener: Could not find a vehicle for DamageReport ID: {$damageReport->id}. No status update performed.");
        }
    }
}