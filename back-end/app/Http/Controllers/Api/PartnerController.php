<?php
// app/Http/Controllers/Api/PartnerController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PartnerController extends Controller
{
    /**
     * Display a listing of the resource. (Publicly accessible)
     */
    public function index()
    {
        // Fetch all partners, ordered by the 'order_column'
        $partners = Partner::orderBy('order_column', 'asc')->get();
        return response()->json($partners);
    }

    /**
     * Store a newly created resource in storage. (Admin only)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'logo' => 'required|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'order_column' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $path = $request->file('logo')->store('partner_logos', 'public');

        $partner = Partner::create([
            'name' => $request->name,
            'logo_path' => $path,
            'order_column' => $request->order_column ?? 0,
        ]);

        return response()->json($partner, 201);
    }

    /**
     * Display the specified resource. (Admin only)
     */
    public function show(Partner $partner)
    {
        return response()->json($partner);
    }

    /**
     * Update the specified resource in storage. (Admin only)
     */
    public function update(Request $request, Partner $partner)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'logo' => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'order_column' => 'sometimes|required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->only(['name', 'order_column']);

        if ($request->hasFile('logo')) {
            // Delete the old logo if it exists
            if ($partner->logo_path) {
                Storage::disk('public')->delete($partner->logo_path);
            }
            // Store the new logo and update the path
            $data['logo_path'] = $request->file('logo')->store('partner_logos', 'public');
        }

        $partner->update($data);

        return response()->json($partner);
    }

    /**
     * Remove the specified resource from storage. (Admin only)
     */
    public function destroy(Partner $partner)
    {
        // Delete the logo file from storage
        if ($partner->logo_path) {
            Storage::disk('public')->delete($partner->logo_path);
        }

        // Delete the database record
        $partner->delete();

        return response()->json(null, 204); // 204 No Content is standard for successful deletion
    }
}