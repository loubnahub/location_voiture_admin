<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PromotionCampaign extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was campaignID
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'description',
        'required_rental_count',
        'reward_value',
        'is_active',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'required_rental_count' => 'integer',
        'reward_value' => 'decimal:2',
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships:
    public function promotionCodes(): HasMany
    {
        return $this->hasMany(PromotionCode::class);
    }
}