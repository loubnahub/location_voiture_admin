<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\PaymentStatus; // Assuming you created this Enum

class Payment extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was paymentID
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'booking_id',
        'amount',
        'payment_date',
        'method',
        'status',
        'transaction_id',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'status' => PaymentStatus::class, // Use Enum for casting
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships:
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}