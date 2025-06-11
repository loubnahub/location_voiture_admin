<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Enums\VehicleStatus;
use App\Enums\BookingStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class VehicleStatusService
{
    /**
     * Calculate and update the status for a given Vehicle based on a clear priority.
     *
     * @param Vehicle|int|string $vehicle The Vehicle model or its ID (integer or UUID string).
     */
    public function updateStatus(Vehicle | int | string $vehicle): void
    {
        $vehicleIdForLog = $vehicle instanceof Vehicle ? $vehicle->id : $vehicle;
        Log::info("--- SERVICE: VehicleStatusService->updateStatus() CALLED for Vehicle ID: {$vehicleIdForLog} ---");

        if (!$vehicle instanceof Vehicle) {
            $vehicle = Vehicle::with(['damageReports', 'operationalHolds', 'bookings'])->find($vehicleIdForLog);
        }

        if (!$vehicle) {
            Log::warning("VehicleStatusService: Vehicle not found with ID: {$vehicleIdForLog}");
            return;
        }

        $vehicle->loadMissing(['damageReports', 'operationalHolds', 'bookings']);
        
        $now = Carbon::now();
        $newStatus = null;

        // Priority 1: DAMAGED
        if ($vehicle->damageReports()->where('damage_reports.status', 'open')->exists()) {
            $newStatus = VehicleStatus::DAMAGED;
        }

        // Priority 2: MAINTENANCE / UNAVAILABLE (due to a hold)
        elseif ($activeHold = $vehicle->operationalHolds()->where('start_date', '<=', $now)->where('end_date', '>=', $now)->first()) {
            $newStatus = ($activeHold->reason === 'Maintenance') ? VehicleStatus::MAINTENANCE : VehicleStatus::UNAVAILABLE;
        }

        // Priority 3: RENTED (currently with a customer)
        elseif ($vehicle->bookings()->whereIn('status',['active','completed'] )->where('start_date', '<=', $now)->where('end_date', '>=', $now)->exists()) {
            $newStatus = VehicleStatus::RENTED;
        }

        // --- THIS IS THE NEW, CRITICAL LOGIC BLOCK ---
        // Priority 4: UNAVAILABLE (reserved for a future booking)
        elseif ($vehicle->bookings()
                         ->whereIn('status', [
                            BookingStatus::CONFIRMED,
                            BookingStatus::PENDING_PAYMENT,
                         ])
                         ->where('end_date', '>', $now) // Any confirmed booking that hasn't ended yet
                         ->exists()) 
        {
            $newStatus = VehicleStatus::UNAVAILABLE;
        }
        
        // Default: AVAILABLE
        else {
            $newStatus = VehicleStatus::AVAILABLE;
        }

        if ($vehicle->status !== $newStatus) {
            $originalStatus = $vehicle->status?->value ?? 'null';
            $vehicle->status = $newStatus;
            $vehicle->save();
            Log::info("Vehicle Status Updated for Vehicle ID {$vehicle->id}: From '{$originalStatus}' to '{$newStatus->value}'.");
        } else {
             Log::info("Vehicle Status check for Vehicle ID {$vehicle->id}: Status remains '{$vehicle->status->value}'. No update needed.");
        }
    }
}