<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Enums\PromotionCodeStatus; // Assuming you created this Enum

class PromotionCode extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was promotionCodeID
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // Specific date fields used (issued_at, expires_at, used_at)

    protected $fillable = [
        'promotion_campaign_id',
        'user_id',
        'code_string',
        'issued_at',
        'expires_at',
        'status',
        'used_at',
        'used_on_booking_id',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'status' => PromotionCodeStatus::class, // Use Enum for casting
        'used_at' => 'datetime',
    ];

    // Relationships:
    public function promotionCampaign(): BelongsTo
    {
        return $this->belongsTo(PromotionCampaign::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bookingUsedOn(): BelongsTo // If a code is used on ONE booking
    {
        return $this->belongsTo(Booking::class, 'used_on_booking_id');
    }

    // A booking can have one promotion code applied
    public function booking(): HasOne
    {
        return $this->hasOne(Booking::class); // Assuming 'promotion_code_id' is in bookings table
    }
}