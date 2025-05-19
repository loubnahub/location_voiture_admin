<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Review extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was reviewID
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // Only created_at as per diagram and migration

    protected $fillable = [
        'booking_id', // If the review is specifically for a booking
        'reviewer_user_id',
        'subject_type', // e.g. 'vehicle', 'platform', 'booking'. Consider morphTo if linking to specific models.
        'rating',
        'comment',
        'created_at',
    ];

    protected $casts = [
        'rating' => 'integer',
        'created_at' => 'datetime',
    ];

    // Relationships:
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_user_id');
    }

    // If you decide to make reviews polymorphic (able to review different types of models directly):
    // public function reviewable(): MorphTo
    // {
    //     return $this->morphTo();
    // }
    // If using MorphTo, you wouldn't need 'subject_type' explicitly in fillable,
    // and your migration would use $table->uuidMorphs('reviewable');
}