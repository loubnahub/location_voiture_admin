<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Enums\BookingStatus;
use App\Enums\VehicleStatus;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        // --- 1. KPIs (This part is fine) ---
        $totalRevenue = Booking::whereIn('status', [BookingStatus::ACTIVE, BookingStatus::COMPLETED])->sum('final_price');
        $totalBookings = Booking::count();
        $totalUsers = User::count();
        $totalVehicles = Vehicle::count();

        // --- 2. Booking Status Breakdown (DEFINITIVE FIX) ---
        $bookingStatusCounts = Booking::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                $statusValue = $item->status;
                $statusEnum = null;

                // Handle both possibilities: is it already an object or just a string?
                if ($statusValue instanceof BookingStatus) {
                    $statusEnum = $statusValue;
                } elseif (is_string($statusValue)) {
                    $statusEnum = BookingStatus::tryFrom($statusValue);
                }
                
                // Now, we are SURE $statusEnum is either the Enum object or null.
                $label = $statusEnum?->label() ?? ucfirst(str_replace('_', ' ', $statusValue));
                return [$label => $item->count];
            });

        // --- 3. Vehicle Status Breakdown (DEFINITIVE FIX) ---
        $vehicleStatusCounts = Vehicle::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                $statusValue = $item->status;
                $statusEnum = null;

                if ($statusValue instanceof VehicleStatus) {
                    $statusEnum = $statusValue;
                } elseif (is_string($statusValue)) {
                    $statusEnum = VehicleStatus::tryFrom($statusValue);
                }
                
                $label = $statusEnum?->label() ?? ucfirst(str_replace('_', ' ', $statusValue));
                return [$label => $item->count];
            });

        // --- 4. Recent Activity (This part is fine) ---
        $recentBookings = Booking::with('renter:id,full_name', 'vehicle.vehicleModel:id,title')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'renter_name' => $booking->renter?->full_name,
                    'vehicle_name' => $booking->vehicle?->vehicleModel?->title,
                    'status' => $booking->status?->label(),
                    'start_date' => $booking->start_date?->toFormattedDateString(),
                    'final_price' => (float) $booking->final_price,
                ];
            });
            
        // --- 5. Revenue Over Time (This part is fine) ---
       // In getStats() method

// --- 5. Revenue Over Time (CORRECTED AND MORE ROBUST) ---
$revenueOverTime = Booking::query()
    // First, filter the records we need
    ->whereIn('status', [BookingStatus::ACTIVE, BookingStatus::COMPLETED])
    ->where('start_date', '>=', Carbon::now()->subDays(30))
    
    // Use selectRaw to be explicit. This is cleaner than multiple DB::raw calls.
    ->selectRaw('DATE(start_date) as date, SUM(final_price) as total_revenue')
    
    // Group by the actual expression, not the alias. This is more portable.
    ->groupByRaw('DATE(start_date)')
    
    // Order by the date
    ->orderBy('date', 'asc')
    
    // Execute the query
    ->get()
    
    // The mapping logic is perfect and doesn't need to change.
    ->map(function ($item) {
        return [
            'date' => Carbon::parse($item->date)->format('M d'),
            'revenue' => (float) $item->total_revenue, // Use the correct alias from selectRaw
        ];
    });
        return response()->json([
            'data' => [
                'kpis' => [
                    'total_revenue' => (float) $totalRevenue,
                    'total_bookings' => $totalBookings,
                    'total_users' => $totalUsers,
                    'total_vehicles' => $totalVehicles,
                ],
                'booking_status_counts' => $bookingStatusCounts,
                'vehicle_status_counts' => $vehicleStatusCounts,
                'recent_bookings' => $recentBookings,
                'revenue_over_time' => $revenueOverTime,
            ]
        ]);
    }
}