<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\VehicleStatus; // Assuming you created this Enum

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
}