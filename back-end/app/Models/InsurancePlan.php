<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InsurancePlan extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was insuranceID
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'provider',
        'coverage_details',
        'price_per_day',
        'is_active',
    ];

    protected $casts = [
        'price_per_day' => 'decimal:2',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships:
    public function vehicleModels(): BelongsToMany
    {
        return $this->belongsToMany(VehicleModel::class, 'insurance_plan_vehicle_model');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}