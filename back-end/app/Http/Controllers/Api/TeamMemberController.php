<?php
// app/Http/Controllers/Api/TeamMemberController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TeamMemberController extends Controller
{
    // PUBLIC: Fetch all team members for the frontend
    public function index()
    {
        return TeamMember::orderBy('order_column', 'asc')->get();
    }

    // ADMIN: Store a new team member
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
            'order_column' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $path = $request->file('image')->store('team_images', 'public');

        $teamMember = TeamMember::create([
            'name' => $request->name,
            'role' => $request->role,
            'image_path' => $path,
            'order_column' => $request->order_column ?? 0,
        ]);

        return response()->json($teamMember, 201);
    }

    // ADMIN: Get a single team member for editing
    public function show(TeamMember $teamMember)
    {
        return $teamMember;
    }

    // ADMIN: Update a team member
    public function update(Request $request, TeamMember $teamMember)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'order_column' => 'sometimes|integer',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->only(['name', 'role', 'order_column']);

        if ($request->hasFile('image')) {
            if ($teamMember->image_path) {
                Storage::disk('public')->delete($teamMember->image_path);
            }
            $data['image_path'] = $request->file('image')->store('team_images', 'public');
        }

        $teamMember->update($data);

        return response()->json($teamMember);
    }

    // ADMIN: Delete a team member
    public function destroy(TeamMember $teamMember)
    {
        if ($teamMember->image_path) {
            Storage::disk('public')->delete($teamMember->image_path);
        }
        $teamMember->delete();

        return response()->json(null, 204);
    }
}