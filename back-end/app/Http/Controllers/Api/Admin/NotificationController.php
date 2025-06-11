<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification; // Your custom Notification model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications for the admin panel.
     */
    public function index(Request $request)
    {
        $query = Notification::query()->with('user:id,full_name')->latest('timestamp');

        // Optional: Add search functionality if needed later
        // if ($request->filled('search')) { ... }

        $perPage = $request->input('per_page', 20);
        $notifications = $query->paginate($perPage);

        return response()->json($notifications);
    }

    /**
     * Delete all notifications that have been marked as read.
     * This is the recommended cleanup method.
     */
    public function clearRead()
    {
        Log::info('Admin action: Clearing all read notifications. User: ' . auth()->id());

        try {
            // Find all notifications where is_read is true and delete them
            $deletedCount = Notification::where('is_read', true)->delete();

            return response()->json([
                'message' => "Successfully cleared {$deletedCount} read notifications."
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to clear read notifications: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while clearing notifications.'], 500);
        }
    }

    /**
     * Delete ALL notifications from the system.
     * This is a destructive action and should be used with caution.
     */
    public function clearAll()
    {

        try {
            // Use truncate for maximum efficiency on large tables. It resets the table.
            // Or use delete() if you want a count of deleted rows.
            $deletedCount = Notification::query()->delete(); // Gets a count
            // Notification::truncate(); // Faster, but no count returned

            return response()->json([
                'message' => "Successfully cleared all {$deletedCount} notifications from the system."
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to clear all notifications: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while clearing all notifications.'], 500);
        }
    }
}