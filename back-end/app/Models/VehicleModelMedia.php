<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleModelMedia extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was imageID in diagram, using 'id' for consistency
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // uploaded_at serves as creation timestamp

    protected $fillable = [
        'vehicle_model_id',
        'url',
        'caption',
        'is_cover',
        'order',
        'uploaded_at',
    ];

    protected $casts = [
        'is_cover' => 'boolean',
        'order' => 'integer',
        'uploaded_at' => 'datetime',
    ];

    // Relationships:
    public function vehicleModel(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class);
    }
}