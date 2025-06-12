<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str; // Make sure Str is imported

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications for the authenticated user.
     * This method now handles both the full page and the header dropdown.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            // Base query for the current user's notifications
            $baseQuery = Notification::where('user_id', $user->id);

            // --- THIS IS THE NEW LOGIC FOR THE HEADER ---
            // It checks for the 'unread_only' and 'limit' query parameters from the frontend.
            if ($request->boolean('unread_only') && $request->has('limit')) {
                
                // Clone the base query to get the total unread count *before* applying the limit
                $countQuery = clone $baseQuery;
                $totalUnreadCount = $countQuery->where('is_read', false)->count();

                // Now, get the limited number of recent unread notifications for the dropdown
                $notifications = $baseQuery
                    ->where('is_read', false)
                    ->latest('timestamp') // Get the newest first
                    ->take((int)$request->input('limit', 5))
                    ->get();
                
                // Return data in the specific format the header expects
                return response()->json([
                    'data' => $notifications->map(function ($notification) {
                        return [
                            'id' => $notification->id,
                            'title' => $notification->title,
                            'message' => Str::limit($notification->message, 100), // Truncate message for preview
                            'timestamp_human' => $notification->timestamp ? $notification->timestamp->diffForHumans() : null, // Add human-readable time
                            'is_read' => (bool) $notification->is_read,
                        ];
                    }),
                    'unread_count' => $totalUnreadCount
                ]);
            }
            
            // --- THIS IS THE EXISTING LOGIC FOR THE FULL NOTIFICATIONS PAGE ---
            // It returns all notifications for the user.
            $notifications = Notification::where('user_id', $user->id)->latest('timestamp')->get();
            return response()->json($notifications);

        } catch (\Exception $e) {
            Log::error('Failed to fetch notifications for user ' . $user->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Could not retrieve notifications.'], 500);
        }
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        $user = Auth::user();
        if (!$user || $notification->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized or notification not found.'], 403);
        }

        try {
            $notification->update(['is_read' => true]);
            return response()->json(['message' => 'Notification marked as read.']);
        } catch (\Exception $e) {
            Log::error('Failed to mark notification as read: ' . $e->getMessage());
            return response()->json(['message' => 'Could not mark notification as read.'], 500);
        }
    }

    /**
     * Mark all unread notifications for the user as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        try {
            Notification::where('user_id', $user->id)
                        ->where('is_read', false)
                        ->update(['is_read' => true]);
            
            return response()->json(['message' => 'All unread notifications marked as read.']);
        } catch (\Exception $e) {
            Log::error('Failed to mark all notifications as read: ' . $e->getMessage());
            return response()->json(['message' => 'Could not mark all notifications as read.'], 500);
        }
    }

    // --- YOUR CLEAR METHODS (Unchanged) ---
    public function clearRead()
    {
        $user = Auth::user();
        if (!$user) { return response()->json(['message' => 'Unauthenticated.'], 401); }
        try {
            $deletedCount = Notification::where('user_id', $user->id)->where('is_read', true)->delete();
            return response()->json(['message' => "Successfully cleared {$deletedCount} read notifications."]);
        } catch (\Exception $e) {
            Log::error('Failed to clear read notifications for user ' . $user->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while clearing notifications.'], 500);
        }
    }

    public function clearAll()
    {
        $user = Auth::user();
        if (!$user) { return response()->json(['message' => 'Unauthenticated.'], 401); }
        try {
            $deletedCount = Notification::where('user_id', $user->id)->delete();
            return response()->json(['message' => "Successfully cleared all {$deletedCount} notifications."]);
        } catch (\Exception $e) {
            Log::error('Failed to clear all notifications for user ' . $user->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while clearing all notifications.'], 500);
        }
    }
}