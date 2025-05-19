<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OperationalHold extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was holdID
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'booking_id', // Link to the booking that may have necessitated this hold
        'vehicle_id',
        'created_by_user_id', // User (staff/admin) who created the hold
        'start_date',
        'end_date',
        'reason',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships:
    public function booking(): BelongsTo // The booking that might be related
    {
        return $this->belongsTo(Booking::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function maintenanceRecord(): HasOne // A hold MIGHT have one maintenance record
    {
        return $this->hasOne(MaintenanceRecord::class);
    }
}