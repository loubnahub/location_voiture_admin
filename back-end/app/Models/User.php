<?php

namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Concerns\HasUuid;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles; // For Spatie Permissions

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasUuid, HasRoles,HasApiTokens;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'default_address_id',
        'full_name',
        'email',
        'phone',
        'password',
        'profile_picture_url',
        'loyalty_points',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'loyalty_points' => 'integer',
        'created_at' => 'datetime', // from $table->timestamps()
        'updated_at' => 'datetime', // from $table->timestamps()
    ];

    // Relationships:
    public function defaultAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'default_address_id');
    }

    // 'roles()' relationship is provided by Spatie's HasRoles trait

    public function bookingsAsRenter(): HasMany // Renamed for clarity
    {
        return $this->hasMany(Booking::class, 'renter_user_id');
    }

    public function createdOperationalHolds(): HasMany
    {
        return $this->hasMany(OperationalHold::class, 'created_by_user_id');
    }

    public function reviewsMade(): HasMany // Renamed for clarity
    {
        return $this->hasMany(Review::class, 'reviewer_user_id');
    }

     public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->orderBy('timestamp', 'desc');
    }

    public function promotionCodes(): HasMany
    {
        return $this->hasMany(PromotionCode::class);
    }

    public function damageReportsFiled(): HasMany // If users can file damage reports
    {
        return $this->hasMany(DamageReport::class, 'reported_by_user_id');
    }
}