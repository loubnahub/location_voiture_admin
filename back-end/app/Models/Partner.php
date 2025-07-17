<?php
// app/Models/Partner.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Partner extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'logo_path',
        'order_column',
    ];

    /**
     * The accessors to append to the model's array form.
     * This makes 'logo_url' available in API responses automatically.
     */
    protected $appends = ['logo_url'];

    /**
     * Accessor to get the full public URL for the logo.
     *
     * @return string|null
     */
    public function getLogoUrlAttribute(): ?string
    {
        if ($this->logo_path) {
            // Assumes you are using the 'public' disk and have run `php artisan storage:link`
            return Storage::disk('public')->url($this->logo_path);
        }
        return null;
    }
}