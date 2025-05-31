<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class VehicleModel extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'vehicle_type_id',
        'title',
        'brand',
        'model',
        'year',
        'fuel_type',
        'transmission',
        'available_colors',
        'number_of_seats',
        'number_of_doors',
        'base_price_per_day',
        'description',
        'is_available',
    ];

    protected $casts = [
        'year' => 'integer',
        'available_colors' => 'array',
        'number_of_seats' => 'integer',
        'number_of_doors' => 'integer',
        'base_price_per_day' => 'decimal:2',
        'is_available' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships:
    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(VehicleType::class);
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(VehicleModelMedia::class);
    }

    public function extras(): BelongsToMany
    {
        return $this->belongsToMany(Extra::class, 'extra_vehicle_model');
    }

    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'feature_vehicle_model')
                    ->withPivot('notes');
    }

    public function insurancePlans(): BelongsToMany
    {
        return $this->belongsToMany(InsurancePlan::class, 'insurance_plan_vehicle_model');
    }
}