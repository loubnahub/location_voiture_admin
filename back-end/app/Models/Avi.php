<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids; // If you use UUIDs for IDs

class Avi extends Model
{
    use HasFactory;
    // use HasUuids; // Uncomment if your 'id' column is a UUID

    // If your primary key is not 'id' or not an auto-incrementing integer:
    // public $incrementing = false;
    // protected $keyType = 'string'; // if UUID

    protected $table = 'avis'; // Explicitly define table name

    protected $fillable = [
        'name',
        'rating',
        'comment',
        'car_name',    // Database column name
        'is_approved',
        // 'carName' // You could add this if you want Eloquent to auto-map, 
                     // but then be consistent or use mutators. Simpler to map in controller.
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_approved' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Optional: Accessor to allow using $avi->carName in PHP if you prefer
    // public function getCarNameAttribute($value)
    // {
    //     return $this->attributes['car_name']; // Assuming DB column is car_name
    // }

    // Optional: Mutator if you want to always save 'carName' from request to 'car_name' field
    // public function setCarNameAttribute($value)
    // {
    //     $this->attributes['car_name'] = $value;
    // }
}