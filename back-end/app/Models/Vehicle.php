<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\VehicleStatus; // Assuming you created this Enum
use App\Enums\BookingStatus; // Assuming you created this Enum
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use App\Enums\DamageReportStatus;
class Vehicle extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'vehicle_model_id',
        'current_location_address_id',
        'license_plate',
        'vin',
        'color',
        'hexa_color_code', // was hexa
        'mileage',
        'status', // Actual availability status of this specific vehicle
        'acquisition_date',
    ];

    protected $casts = [
        'mileage' => 'integer',
        'status' => VehicleStatus::class, // Use the Enum for casting
        'acquisition_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships:
    public function vehicleModel(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class);
    }

    public function currentLocationAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'current_location_address_id');
    }
      public function damageReports(): HasManyThrough
    {
        
        return $this->hasManyThrough(DamageReport::class, Booking::class);}

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function operationalHolds(): HasMany
    {
        return $this->hasMany(OperationalHold::class);
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class);
    }
     public function hasActiveOperationalHold(): bool
    {
        return $this->operationalHolds()
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->exists();
    }

    // In app/Models/Vehicle.php

 public function updateStatusBasedOnPriority(): bool
    {
        $originalStatus = $this->status;
        $newStatus = null;

        // PRIORITY 1: Check for active Operational Holds.
        if ($this->hasActiveOperationalHold()) {
            $newStatus = VehicleStatus::MAINTENANCE;
        }
        // PRIORITY 2: Check for unresolved Damage Reports.
        elseif ($this->hasUnresolvedDamage()) {
            $newStatus = VehicleStatus::DAMAGED;
        }
        // PRIORITY 3: Check for an active Booking.
        elseif ($this->hasActiveBooking()) {
            $newStatus = VehicleStatus::RENTED; // Or BOOKED, matching your enum
        }
        // DEFAULT: If none of the above, the vehicle is available.
        else {
            $newStatus = VehicleStatus::AVAILABLE;
        }

        if ($originalStatus !== $newStatus) {
            $this->status = $newStatus;
            return $this->save();
        }

        return false;
    }

public function hasUnresolvedDamage(): bool
{
    // Define the statuses that mean a damage report is considered resolved or closed.
    $resolvedStatuses = [
        DamageReportStatus::RESOLVED_PAID,
        DamageReportStatus::RESOLVED_NO_COST,
        DamageReportStatus::CLOSED,
        // Assuming your 'closed_archived' from JS is now 'closed' in PHP
    ];

    return $this->damageReports()
        ->whereNotIn('damage_reports.status', $resolvedStatuses)
        // --- THIS IS THE FIX ---
        // Only consider damage reports where the reported date is now or in the past.
        ->where('damage_reports.reported_at', '<=', now())
        // --- END OF FIX ---
        ->exists();
}

    public function hasActiveBooking(): bool
    {
        return $this->bookings()
            ->whereIn('status', [BookingStatus::CONFIRMED, BookingStatus::ACTIVE]) // More precise
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->exists();
    }
}