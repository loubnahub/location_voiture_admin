<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Enums\BookingStatus; // Assuming you created this Enum

class Booking extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was bookingID
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'renter_user_id',
        'vehicle_id',
        'insurance_plan_id',
        'promotion_code_id', // The code applied to this booking
        'start_date',
        'end_date',
        'status',
        'calculated_base_price',
        'calculated_extras_price',
        'calculated_insurance_price',
        'discount_amount_applied',
        'final_price',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'status' => BookingStatus::class, // Use Enum for casting
        'calculated_base_price' => 'decimal:2',
        'calculated_extras_price' => 'decimal:2',
        'calculated_insurance_price' => 'decimal:2',
        'discount_amount_applied' => 'decimal:2',
        'final_price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
public function bookingExtras()
{
    return $this->belongsToMany(Extra::class, 'booking_extra', 'booking_id', 'extra_id')
                ->withPivot('quantity', 'price_at_booking'); // Include any pivot data you need/have
    // If no pivot data, ->withPivot(...) is not needed.
}
    // Relationships:
    public function renter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'renter_user_id');
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function insurancePlan(): BelongsTo
    {
        return $this->belongsTo(InsurancePlan::class);
    }

    public function promotionCode(): BelongsTo // The specific code instance used
    {
        return $this->belongsTo(PromotionCode::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function damageReports(): HasMany
    {
        return $this->hasMany(DamageReport::class);
    }

    public function rentalAgreement(): HasOne
    {
        return $this->hasOne(RentalAgreement::class);
    }

    public function operationalHolds(): HasMany // Holds necessitated BY this booking
    {
        return $this->hasMany(OperationalHold::class);
    }
}