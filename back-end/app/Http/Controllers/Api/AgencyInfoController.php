<?php
// app/Http/Controllers/Api/AgencyInfoController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgencyInfo; // RENAME: Use the new model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AgencyInfoController extends Controller
{
    /**
     * Display the agency info. (Publicly accessible)
     */
    public function show()
    {
        // Use the new model name
        $info = AgencyInfo::firstOrFail();
        return response()->json($info);
    }

    /**
     * Get the agency info for the admin panel. (Protected)
     */
    public function getForAdmin()
    {
        $info = AgencyInfo::firstOrFail();
        return response()->json($info);
    }

    /**
     * Update the agency info. (Admin only)
     * Using POST to handle multipart/form-data for the logo upload.
     */
    public function update(Request $request)
    {
        // Validation rules remain the same
        $validator = Validator::make($request->all(), [/* ... validation rules ... */]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $info = AgencyInfo::findOrFail(1);
        $data = $request->except('logo'); // Exclude the file from initial data array

        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($info->logo_url && Storage::disk('public')->exists($info->logo_url)) {
                Storage::disk('public')->delete($info->logo_url);
            }
            // Store new logo
            $path = $request->file('logo')->store('logos', 'public');
            $data['logo_url'] = $path;
        }

        $info->update($data);

        return response()->json($info->fresh());
    }
}