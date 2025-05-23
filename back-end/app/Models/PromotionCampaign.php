<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\PromotionRewardType; // <<< ADD THIS IMPORT

class PromotionCampaign extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'description',
        'required_rental_count',
        'reward_value',
        'reward_type',          // <<< ADDED
        'code_validity_days',   // <<< ADDED
        'is_active',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'required_rental_count' => 'integer',
        'reward_value' => 'decimal:2',
        'reward_type' => PromotionRewardType::class, // <<< ADDED (Cast to Enum)
        'code_validity_days' => 'integer',         // <<< ADDED
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