<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Extra extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was extraID
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'description',
        'default_price_per_day',
    ];

    protected $casts = [
        'default_price_per_day' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships:
    public function vehicleModels(): BelongsToMany
    {
        return $this->belongsToMany(VehicleModel::class, 'extra_vehicle_model');
    }
}