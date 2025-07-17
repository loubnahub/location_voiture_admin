<?php
// app/Models/AgencyInfo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class AgencyInfo extends Model
{
    use HasFactory;

    // Point the model to the correct table
    protected $table = 'agency_info';

    // The primary key is 'id' by default, which is correct.

    protected $fillable = [
        'logo_url',
        'agency_name',
        'phone_number',
        'phone_fixed',
        'email',
        'address',
        'office_hours',
        'google_maps_url',
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'youtube_url',
        'whatsapp_url',
    ];

    // Add an accessor to automatically create the full public URL for the logo
    public function getLogoFullUrlAttribute(): ?string
    {
        if ($this->logo_url) {
            // Assumes you are using the 'public' disk
            return Storage::disk('public')->url($this->logo_url);
        }
        return null;
    }

    // Append the accessor to model's array and JSON representations
    protected $appends = ['logo_full_url'];
}