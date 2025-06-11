<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Avi extends Model
{
    use HasFactory;
    protected $table = 'avis';
    protected $fillable = [
         'name', 'rating', 'comment', 'car_name', 
    ];
    protected $casts = [
         'rating' => 'integer',
        'created_at' => 'datetime', 'updated_at' => 'datetime',
    ];
    public function user() { return $this->belongsTo(User::class); }

    // Accessor/Mutator to handle carName <=> car_name if frontend sends carName
    // and DB column is car_name. $fillable should list 'car_name'.
    // If $fillable contains 'carName', this setup ensures it maps to 'car_name' db column
    protected function carName(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => $attributes['car_name'] ?? null,
            set: fn ($value) => ['car_name' => $value]
        );
    }
}