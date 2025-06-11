<?php

namespace App\Enums;

enum VehicleStatus: string
{
    case AVAILABLE = 'available';
    case RENTED = 'rented';
    case MAINTENANCE = 'maintenance';
    case UNAVAILABLE = 'unavailable'; 
    case PENDING_INSPECTION = 'pending_inspection'; 
    case DAMAGED = 'damaged'; 

    // --- ADD THIS METHOD ---
    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE => 'Available',
            self::RENTED => 'Rented',
            self::MAINTENANCE => 'In Maintenance',
            self::UNAVAILABLE => 'Unavailable',
            self::PENDING_INSPECTION => 'Pending Inspection',
            self::DAMAGED => 'Damaged',
            // A fallback just in case
            default => ucfirst($this->value),
        };
    }
    // --- END OF METHOD ---
}