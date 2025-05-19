<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model; // Or use Illuminate\Notifications\DatabaseNotification if using Laravel's system
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// If this is a custom notification table and not directly for Laravel's DatabaseChannel
class Notification extends Model
{
    use HasFactory, HasUuid;

    protected $primaryKey = 'id'; // was notificationID
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // 'timestamp' field acts as created_at

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'timestamp',
        'is_read',
        // If you were using Laravel's system, 'type' and 'data' would be common.
        // 'type',
        // 'data',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'is_read' => 'boolean',
        // 'data' => 'array', // If you add a data column for JSON payload
    ];

    // Relationships:
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}