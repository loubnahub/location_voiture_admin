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
}