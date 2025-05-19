<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RentalAgreement extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was agreementID
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // Specific date fields used

    protected $fillable = [
        'booking_id',
        'document_url',
        'generated_at',
        'signed_by_renter_at',
        'signed_by_platform_at',
        'notes',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'signed_by_renter_at' => 'datetime',
        'signed_by_platform_at' => 'datetime',
    ];

    // Relationships:
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}