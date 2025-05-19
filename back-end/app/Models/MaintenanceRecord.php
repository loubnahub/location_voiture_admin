<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRecord extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was maintenanceID
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'vehicle_id',
        'operational_hold_id', // If the maintenance is part of a hold
        'description',
        'cost',
        'notes',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime', // Assuming the record can be updated
    ];

    // Relationships:
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function operationalHold(): BelongsTo
    {
        return $this->belongsTo(OperationalHold::class);
    }
}