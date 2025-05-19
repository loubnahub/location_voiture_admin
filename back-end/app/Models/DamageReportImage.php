<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DamageReportImage extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was imageID
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // uploaded_at serves as creation timestamp

    protected $fillable = [
        'damage_report_id',
        'url',
        'caption',
        'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    // Relationships:
    public function damageReport(): BelongsTo
    {
        return $this->belongsTo(DamageReport::class);
    }
}