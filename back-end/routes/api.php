<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- API Controllers ---
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController; 
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\VehicleTypeController;
use App\Http\Controllers\Api\VehicleModelController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\VehicleModelMediaController;
use App\Http\Controllers\Api\ExtraController;
use App\Http\Controllers\Api\FeatureController;
use App\Http\Controllers\Api\InsurancePlanController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\UserBookingController; 
use App\Http\Controllers\Api\OperationalHoldController;
use App\Http\Controllers\Api\MaintenanceRecordController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\DamageReportController;
use App\Http\Controllers\Api\DamageReportImageController;
use App\Http\Controllers\Api\RentalAgreementController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PromotionCampaignController;
use App\Http\Controllers\Api\PromotionCodeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// --- Public Routes ---
// (Routes accessible without authentication)

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/vehicle-models/public', [VehicleModelController::class, 'publicIndex'])->name('public.vehicle-models.index');
Route::get('/vehicle-models/public/{vehicle_model}', [VehicleModelController::class, 'publicShow'])->name('public.vehicle-models.show');


// Route::middleware('auth:sanctum')->group(function () {

    // --- Authentication Related ---
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/user', [AuthController::class, 'user'])->name('auth.user'); // Get current authenticated user

    Route::apiResource('my-addresses', AddressController::class)->parameters(['my-addresses' => 'address'])->except(['store', 'update', 'destroy']); // User views their addresses, typically managed through user profile
    Route::post('my-addresses', [AddressController::class, 'storeForCurrentUser'])->name('my-addresses.store');
    Route::put('my-addresses/{address}', [AddressController::class, 'updateForCurrentUser'])->name('my-addresses.update');
    Route::delete('my-addresses/{address}', [AddressController::class, 'destroyForCurrentUser'])->name('my-addresses.destroy');
    Route::patch('user/default-address/{address}', [UserController::class, 'setDefaultAddress'])->name('user.default-address.update');

Route::apiResource('users', UserController::class);
    Route::get('/my-bookings', [UserBookingController::class, 'index'])->name('my-bookings.index');
    Route::get('/my-bookings/{booking}', [UserBookingController::class, 'show'])->name('my-bookings.show');
    Route::post('/my-bookings/{booking}/cancel', [UserBookingController::class, 'cancel'])->name('my-bookings.cancel');

    Route::get('/my-promotion-codes', [PromotionCodeController::class, 'currentUserCodes'])->name('my-promotion-codes.index');

    Route::apiResource('my-notifications', NotificationController::class)->parameters(['my-notifications' => 'notification'])->only(['index', 'show']);
    Route::post('/my-notifications/mark-as-read', [NotificationController::class, 'markAllAsRead'])->name('my-notifications.mark-all-read');
    Route::post('/my-notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('my-notifications.mark-as-read');


    Route::apiResource('vehicle-types', VehicleTypeController::class)->parameters(['vehicle-types' => 'vehicle_type']);

    Route::apiResource('vehicle-models.media', VehicleModelMediaController::class)->parameters(['vehicle-models' => 'vehicle_model', 'media' => 'media'])->shallow();

    Route::apiResource('vehicles', VehicleController::class);


    Route::apiResource('extras', ExtraController::class);


    Route::apiResource('features', FeatureController::class);


    Route::apiResource('insurance-plans', InsurancePlanController::class)->parameters(['insurance-plans' => 'insurance_plan']);


    Route::apiResource('bookings', BookingController::class);
    Route::post('/bookings/{booking}/confirm', [BookingController::class, 'confirmBooking'])->name('bookings.confirm');
    Route::post('/bookings/{booking}/complete', [BookingController::class, 'completeBooking'])->name('bookings.complete');


    Route::apiResource('operational-holds', OperationalHoldController::class)->parameters(['operational-holds' => 'operational_hold']);

    Route::apiResource('maintenance-records', MaintenanceRecordController::class)->parameters(['maintenance-records' => 'maintenance_record']);

    Route::apiResource('payments', PaymentController::class)->except(['store']); // Payments are usually created as part of booking flow
    Route::get('/bookings/{booking}/payments', [PaymentController::class, 'indexForBooking'])->name('bookings.payments.index');


    Route::apiResource('reviews', ReviewController::class);

    Route::apiResource('damage-reports', DamageReportController::class)->parameters(['damage-reports' => 'damage_report']);
    Route::apiResource('damage-reports.images', DamageReportImageController::class)->parameters(['damage-reports' => 'damage_report', 'images' => 'image'])->shallow();


    Route::apiResource('rental-agreements', RentalAgreementController::class)->parameters(['rental-agreements' => 'rental_agreement'])->except(['store', 'update']); // Usually generated, not directly created via API
    Route::get('/bookings/{booking}/rental-agreement', [RentalAgreementController::class, 'showForBooking'])->name('bookings.rental-agreement.show');


    Route::apiResource('promotion-campaigns', PromotionCampaignController::class)->parameters(['promotion-campaigns' => 'promotion_campaign']);

    Route::apiResource('promotion-codes', PromotionCodeController::class)->parameters(['promotion-codes' => 'promotion_code']);


    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function() {
        Route::apiResource('users', UserController::class); 
        // Add other admin-specific routes here
        // e.g., Route::get('/dashboard-stats', [AdminDashboardController::class, 'stats']);
    });

// });


Route::fallback(function(){
    return response()->json(['message' => 'Not Found.'], 404);
});
    Route::apiResource('vehicle-models', VehicleModelController::class)->parameters(['vehicle-models' => 'vehicle_model']);
