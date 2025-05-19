<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Feature extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was featureID
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'description',
        'category',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships:
    public function vehicleModels(): BelongsToMany
    {
        return $this->belongsToMany(VehicleModel::class, 'feature_vehicle_model')
                    ->withPivot('notes');
    }
}