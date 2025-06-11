<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Enums\VehicleStatus;
use Illuminate\Support\Facades\Log;

class VehicleStatusService
{
    /**
     * The single source of truth for updating a vehicle's status based on a clear priority hierarchy.
     * Priority: Operational Hold > Unresolved Damage > Active Booking > Available.
     *
     * @param string $vehicleId The UUID of the vehicle to update.
     * @return void
     */
    public function updateStatus(string $vehicleId): void
    {
        $vehicle = Vehicle::find($vehicleId);

        if (!$vehicle) {
            Log::warning("VehicleStatusService: Could not find Vehicle with ID: {$vehicleId}");
            return;
        }

        $originalStatus = $vehicle->status;
        $newStatus = null;

        // PRIORITY 1: Check for active Operational Holds.
        if ($vehicle->hasActiveOperationalHold()) {
            $newStatus = VehicleStatus::MAINTENANCE;
        }
        // PRIORITY 2: Check for unresolved Damage Reports.
        // This is where "damaged" status will dominate any booking status.
        elseif ($vehicle->hasUnresolvedDamage()) {
            $newStatus = VehicleStatus::DAMAGED;
        }
        // PRIORITY 3: Check for an active Booking.
        elseif ($vehicle->hasActiveBooking()) {
            // Your enum uses 'rented', let's stick to that for consistency
            $newStatus = VehicleStatus::RENTED;
        }
        // DEFAULT: If none of the above, the vehicle is available.
        else {
            $newStatus = VehicleStatus::AVAILABLE;
        }

        // Only update the database if the status has actually changed.
        if ($originalStatus !== $newStatus) {
            Log::info("VehicleStatusService: Updating status for Vehicle ID {$vehicleId} from '{$originalStatus->value}' to '{$newStatus->value}'.");
            $vehicle->status = $newStatus;
            $vehicle->save();
        } else {
            Log::info("VehicleStatusService: Status for Vehicle ID {$vehicleId} remains '{$originalStatus->value}'. No update needed.");
        }
    }
}