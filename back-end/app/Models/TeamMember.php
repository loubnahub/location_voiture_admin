<?php
// app/Models/TeamMember.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str; // Import the Str helper

class TeamMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'role',
        'image_path',
        'order_column',
    ];

    protected $appends = ['image_url'];

   
    public function getImageUrlAttribute(): ?string
    {
        $path = $this->image_path;

        if (!$path) {
            return null;
        }

        // 1. If the path is already a full URL, return it directly.
        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        // 2. Otherwise, treat it as a local path and build the URL with storage.
        return Storage::disk('public')->url($path);
    }
}