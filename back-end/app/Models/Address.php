<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Address extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // As per your diagram (no created_at/updated_at)

    protected $fillable = [
        'street_line_1',
        'street_line_2',
        'city',
        'postal_code',
        'country',
        'notes',
    ];

    // Relationships:
    // An Address can be the default address for many Users.
    public function usersDefault(): HasMany
    {
        return $this->hasMany(User::class, 'default_address_id');
    }
public function getFullAddressStringAttribute(): string
{
    $parts = array_filter([
        $this->street_line_1,
        $this->street_line_2,
        $this->city,
        $this->postal_code,
        $this->country
    ]);
    return implode(', ', $parts) ?: 'N/A'; // Return 'N/A' if all parts are empty
}
    // An Address can be the current location for many Vehicles.
    public function vehiclesLocatedHere(): HasMany
    {
        return $this->hasMany(Vehicle::class, 'current_location_address_id');
    }
}