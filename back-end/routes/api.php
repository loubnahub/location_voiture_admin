<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

// --- API Controller Imports ---
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\VehicleTypeController;
use App\Http\Controllers\Api\VehicleModelController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\VehicleModelMediaController;
use App\Http\Controllers\Api\VehicleModelColorController;
use App\Http\Controllers\Api\ExtraController;
use App\Http\Controllers\Api\FeatureController;
use App\Http\Controllers\Api\InsurancePlanController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\OperationalHoldController;
use App\Http\Controllers\Api\MaintenanceRecordController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\DamageReportController;
use App\Http\Controllers\Api\RentalAgreementController;
use App\Http\Controllers\Api\PromotionCampaignController;
use App\Http\Controllers\Api\PromotionCodeController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\NotificationController;
use App\Http\Controllers\Api\AvisController;
use App\Http\Controllers\Api\ContactSubmissionController;

// --- Admin Controller Imports ---
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\RoleController as AdminRoleController;
// in routes/api.php
use App\Http\Controllers\Api\PublicFleetController; // Using a new, dedicated controller
Route::get('/vehicle-models-client/{vehicleModel}', [PublicFleetController::class, 'show'])->name('public.vehicle-model.show');
Route::get('/all-cars', [PublicFleetController::class, 'index'])->name('public.all-cars');
Route::get('/vehicle-models-3d/{vehicleModel}', [PublicFleetController::class, 'show3d'])->name('public.vehicle-model.show3d');
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| This file is where you register API routes for your application.
| 
*/

// ========================================================================
//   Group 1: Public Routes (No Authentication Required)
// ========================================================================
// These routes are accessible to anyone, including guests.

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/vehicle-models/list-all', [VehicleModelController::class, 'listAll']);
Route::get('/lov/renters', [AdminUserController::class, 'getRentersForDropdown']);

// In routes/api.php, inside the `auth:sanctum` group but OUTSIDE the `admin` prefix group
Route::apiResource('vehicle-types', VehicleTypeController::class)->parameters(['vehicle-types' => 'vehicle_type']);
Route::apiResource('vehicle-models', VehicleModelController::class)->parameters(['vehicle-models' => 'vehicle_model']);
// Publicly viewable fleet information
Route::get('/vehicle-models/public', [VehicleModelController::class, 'publicIndex'])->name('public.vehicle-models.index');
Route::get('/vehicle-models/public/{vehicle_model}', [VehicleModelController::class, 'publicShow'])->name('public.vehicle-models.show');
Route::get('lov/vehicles-available', [VehicleController::class, 'getAvailableForDropdown']);
Route::get('lov/insurance-plans-active', [InsurancePlanController::class, 'getActiveForDropdown']);

Route::get('/stream-glb/vehicle_media/{filepath}', function ($filepath) {

    if (Str::contains($filepath, '..')) {
        Log::info('File not found at path: ' . storage_path('app/' . $fullStoragePath));
    }

   
    $fullStoragePath = 'public/vehicle_media/' . $filepath;

    if (!Storage::disk('local')->exists($fullStoragePath)) {
        // This log will now show the CORRECT path it's looking for.
        Log::info('File not found at path: ' . storage_path('app/' . $fullStoragePath));
      
    }

    // Return the file as a stream
    return Storage::disk('local')->response($fullStoragePath);

})->where('filepath', '.*'); 
Route::post('/client-bookings', [BookingController::class, 'storeClientBooking'])->name('client.bookings.store');
Route::apiResource('insurance-plans', InsurancePlanController::class)->parameters(['insurance-plans' => 'insurance_plan']);
Route::get('/my-rewards', [UserController::class, 'getMyRewards']);
// ========================================================================
//   Group 2: Authenticated Routes (User MUST be logged in)
// ========================================================================
// All routes within this group are protected by Sanctum's authentication.
Route::post('/contact-submissions', [ContactSubmissionController::class, 'store'])
    ->name('contact-submissions.store'); // Consistent naming


Route::get('/contact-submissions', [ContactSubmissionController::class, 'index'])
    ->name('contact-submissions.index');


Route::get('/contact-submissions/{contactSubmission}', [ContactSubmissionController::class, 'show'])
    ->name('contact-submissions.show')
    ->whereNumber('contactSubmission'); // Ensures the {contactSubmission} parameter is a number (ID)


Route::put('/contact-submissions/{contactSubmission}', [ContactSubmissionController::class, 'update'])
    ->name('contact-submissions.update')
    ->whereNumber('contactSubmission');
// Note: Route::patch(...) is also common for partial updates and maps to the same 'update' method.


Route::delete('/contact-submissions/{contactSubmission}', [ContactSubmissionController::class, 'destroy'])
    ->name('contact-submissions.destroy')
    ->whereNumber('contactSubmission');
Route::apiResource('avis', AvisController::class);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index'); // For regular users
    Route::post('/notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');
    Route::delete('/notifications/clear-read', [NotificationController::class, 'clearRead'])->name('notifications.clear-read'); // User clears their own read
    Route::delete('/notifications/clear-all', [NotificationController::class, 'clearAll'])->name('notifications.clear-all');

    // --- Core Authentication Routes ---
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/user', [AuthController::class, 'user'])->name('auth.user');

    // --- User Self-Service Routes ---
    Route::post('addresses', [AddressController::class, 'storeForCurrentUser'])->name('my-addresses.store');
    Route::delete('addresses/{address}', [AddressController::class, 'destroyForCurrentUser'])->name('my-addresses.destroy');
    Route::patch('user/default-address/{address}', [UserController::class, 'setDefaultAddress'])->name('user.default-address.update');
    Route::get('/my-promotion-codes', [PromotionCodeController::class, 'currentUserCodes'])->name('my-promotion-codes.index');
    Route::get('/vehicles/{vehicle}/schedule', [VehicleController::class, 'getSchedule'])->name('vehicles.schedule');
    // --- General Application Resources (CRUD) ---
    Route::apiResource('users', UserController::class);
    Route::apiResource('addresses', AddressController::class);
    Route::apiResource('vehicles', VehicleController::class);
    Route::apiResource('extras', ExtraController::class);
    Route::apiResource('features', FeatureController::class);
    Route::apiResource('operational-holds', OperationalHoldController::class)->parameters(['operational-holds' => 'operational_hold']);
    Route::apiResource('maintenance-records', MaintenanceRecordController::class)->parameters(['maintenance-records' => 'maintenance_record']);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('damage-reports', DamageReportController::class)->parameters(['damage-reports' => 'damageReport']);
    Route::apiResource('rental-agreements', RentalAgreementController::class)->except(['store']);
    Route::apiResource('promotion-campaigns', PromotionCampaignController::class)->parameters(['promotion-campaigns' => 'promotion_campaign']);
    Route::apiResource('promotion-codes', PromotionCodeController::class)->parameters(['promotion-codes' => 'promotion_code']);
    Route::apiResource('bookings', BookingController::class);

    // Nested Media routes for Vehicle Models
    Route::apiResource('vehicle-models.media', VehicleModelMediaController::class)
        ->parameters(['vehicle-models' => 'vehicleModel', 'media' => 'medium'])->shallow();
    Route::post('vehicle-models/{vehicleModel}/media/reorder', [VehicleModelMediaController::class, 'reorder'])->name('vehicle-models.media.reorder');

    // Vehicle Model Color Management
    Route::get('/vehicle-models/{vehicleModel}/colors', [VehicleModelColorController::class, 'index']);
    Route::post('/vehicle-models/{vehicleModel}/colors', [VehicleModelColorController::class, 'store']);
    Route::put('/vehicle-models/{vehicleModel}/colors', [VehicleModelColorController::class, 'updateColors']);
    Route::delete('/vehicle-models/{vehicleModel}/colors/{color}', [VehicleModelColorController::class, 'destroy']);

    // --- Custom Actions & Helper Routes ---
    Route::post('/bookings/{booking}/confirm', [BookingController::class, 'confirmBooking'])->name('bookings.confirm');
    Route::post('/bookings/{booking}/complete', [BookingController::class, 'completeBooking'])->name('bookings.complete');
    Route::get('/bookings/{booking}/payments', [PaymentController::class, 'indexForBooking'])->name('bookings.payments.index');
    Route::get('bookings-for-dropdown', [BookingController::class, 'forDropdown']);
    Route::get('payment-status-options', [PaymentController::class, 'getPaymentStatusOptions']);
    Route::get('promotion-codes/lov/users', [PromotionCodeController::class, 'getUsersForDropdown'])->name('promotion-codes.lov.users');
    Route::get('promotion-codes/lov/campaigns', [PromotionCodeController::class, 'getCampaignsForDropdown'])->name('promotion-codes.lov.campaigns');
    Route::post('promotion-codes/validate-apply', [PromotionCodeController::class, 'validateAndApplyPreview'])->name('promotion-codes.validate-apply');
    Route::get('bookings-for-agreement', [BookingController::class, 'forAgreementDropdown'])->name('bookings.for-agreement-dropdown');

    // Rental Agreement Custom Actions
    Route::post('rental-agreements/generate', [RentalAgreementController::class, 'store'])->name('rental-agreements.generate');
    Route::get('rental-agreements/{rental_agreement}/download', [RentalAgreementController::class, 'downloadDocument'])->name('rental-agreements.download');
    Route::post('rental-agreements/{rental_agreement}/send-notification', [RentalAgreementController::class, 'sendAgreementNotification'])->name('rental-agreements.send-notification');
    Route::get('/bookings/{booking}/rental-agreement', [RentalAgreementController::class, 'showForBooking'])->name('bookings.rental-agreement.show');
    Route::apiResource('bookings', BookingController::class);



    Route::get('/users/{user}/bookings', [UserController::class, 'getUserBookings'])->name('users.bookings.index');
    // In routes/api.php

    // ... inside Route::middleware('auth:sanctum')->group(...)
    // ... inside Route::prefix('admin')->middleware('role:admin')->group(...)


    // ========================================================================
    //   Group 3: ADMIN-ONLY Routes (Nested inside auth group)
    // ========================================================================
    // The request is first checked for a valid login (auth:sanctum),
    // THEN it's checked for the 'admin' role.

    Route::prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get('users/{user}/rewards', [AdminUserController::class, 'getUserRewards']);
            Route::apiResource('users', AdminUserController::class);
            // ... inside Route::prefix('admin')->group(...)

            // New route for updating the logged-in admin's own profile
            Route::post('/profile', [AdminUserController::class, 'updateProfile'])->name('profile.update');

            // New route for clearing old read notifications
            Route::delete('notifications/clear-old-read', [NotificationController::class, 'clearOldRead'])->name('notifications.clear-old-read');
            Route::get('roles-list', [AdminUserController::class, 'fetchRoles'])->name('roles.list');
            Route::apiResource('system/roles', AdminRoleController::class)
                ->parameters(['roles' => 'role'])
                ->names('system.roles');
            Route::delete('notifications/clear-all', [NotificationController::class, 'clearAll'])->name('admin.notifications.clear-all');
            Route::delete('notifications/clear-read', [NotificationController::class, 'clearRead'])->name('admin.notifications.clear-read');
            // ... inside Route::prefix('admin')->group(...)

            // --- NEW ROUTE for pruning addresses ---
            Route::delete('addresses/prune-unused', [AddressController::class, 'pruneUnused'])->name('addresses.prune-unused');
            Route::get('dashboard-stats', [DashboardController::class, 'getStats'])->name('admin.dashboard.stats');
            Route::get('notifications', [NotificationController::class, 'index'])->name('admin.notifications.index');
        });
}); // --- End of Authenticated Routes Group ---


// ========================================================================
//   Fallback Route - This must be the very last route defined.
// ========================================================================
// Catches any request that doesn't match the routes above.
Route::fallback(function () {
    return response()->json(['message' => 'API route not found.'], 404);
});
