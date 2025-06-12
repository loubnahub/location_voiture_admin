<?php

namespace App\Http\Controllers\Api\Admin; // Or Api\ if it's for regular users too

use App\Http\Controllers\Controller;
use App\Models\Notification; // Your custom Notification model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use  Illuminate\Support\Str;
use Stringable;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications for the authenticated user.
     * Can be used for the header dropdown (latest unread) or a full notifications page.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            // Use user_id from your Notification model if it's different from Laravel's default 'notifiable_id'
            $query = Notification::where('user_id', $user->id); 

            // For the header dropdown, we want the latest unread
            if ($request->boolean('unread_only') && $request->has('limit')) {
                $query->where('is_read', false) // or whereNull('read_at') if using Laravel's default
                      ->latest('timestamp'); // or latest('created_at')
                $notifications = $query->take((int)$request->input('limit', 3))->get();
                // For this specific dropdown case, we don't need pagination from Laravel,
                // but we do need to format it somewhat consistently.
                return response()->json([
                    'data' => $notifications->map(function ($notification) {
                        return [
                            'id' => $notification->id,
                            'title' => $notification->title,
                            'message' => Str::limit($notification->message, 100), // Truncate message
                            'timestamp_human' => $notification->timestamp ? $notification->timestamp->diffForHumans() : null,
                            'timestamp' => $notification->timestamp ? $notification->timestamp->toIso8601String() : null,
                            'is_read' => (bool) $notification->is_read,
                            // 'link' => $notification->data['link'] ?? null, // Example if you store links in data
                        ];
                    }),
                    'unread_count' => Notification::where('user_id', $user->id)->where('is_read', false)->count() // Send total unread count
                ]);
            } else {
                // For a full notifications page (paginated)
                $query->latest('timestamp'); // or latest('created_at')
                $perPage = $request->input('per_page', 15);
                $notifications = $query->paginate($perPage);
                 // You'd likely use an API Resource here for consistency
                return response()->json($notifications);
            }

        } catch (\Exception $e) {
            Log::error('Failed to fetch notifications for user ' . $user->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Could not retrieve notifications.'], 500);
        }
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, Notification $notification) // Route model binding
    {
        $user = Auth::user();
        // Authorization: Ensure the notification belongs to the authenticated user
        if (!$user || $notification->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized or notification not found.'], 403);
        }

        try {
            // If using 'is_read' boolean
            $notification->update(['is_read' => true]);
            // If using Laravel's default 'read_at' timestamp
            // if (!$notification->read_at) {
            //     $notification->markAsRead();
            // }
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
                        ->where('is_read', false) // or whereNull('read_at')
                        ->update(['is_read' => true]); // or update(['read_at' => now()])
            
            return response()->json(['message' => 'All unread notifications marked as read.']);
        } catch (\Exception $e) {
            Log::error('Failed to mark all notifications as read: ' . $e->getMessage());
            return response()->json(['message' => 'Could not mark all notifications as read.'], 500);
        }
    }


    // clearRead and clearAll methods from your provided controller
    public function clearRead()
    {
        $user = Auth::user();
         if (!$user) { return response()->json(['message' => 'Unauthenticated.'], 401); }
        // Log::info('User action: Clearing all read notifications. User: ' . $user->id);
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
        // Log::info('User action: Clearing ALL notifications. User: ' . $user->id);
        try {
            $deletedCount = Notification::where('user_id', $user->id)->delete();
            return response()->json(['message' => "Successfully cleared all {$deletedCount} notifications."]);
        } catch (\Exception $e) {
            Log::error('Failed to clear all notifications for user ' . $user->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while clearing all notifications.'], 500);
        }
    }
}