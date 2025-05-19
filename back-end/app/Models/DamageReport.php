<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\DamageReportStatus; // Assuming you created this Enum

class DamageReport extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was reportID
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'booking_id',
        'reported_by_user_id', // User or staff who reported
        'reported_at',
        'description',
        'status',
        'repair_cost',
    ];

    protected $casts = [
        'reported_at' => 'datetime',
        'status' => DamageReportStatus::class, // Use Enum for casting
        'repair_cost' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships:
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function reportedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by_user_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(DamageReportImage::class);
    }
}