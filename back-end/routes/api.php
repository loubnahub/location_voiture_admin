<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- API Controllers ---
use App\Http\Controllers\Api\PromotionCampaignController; // Import it
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController; // Generic User Controller
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\VehicleTypeController;
use App\Http\Controllers\Api\VehicleModelController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\VehicleModelMediaController;
use App\Http\Controllers\Api\ExtraController;
use App\Http\Controllers\Api\FeatureController;
use App\Http\Controllers\Api\InsurancePlanController;
use App\Http\Controllers\Api\BookingController;
// use App\Http\Controllers\Api\UserBookingController;
use App\Http\Controllers\Api\OperationalHoldController;
use App\Http\Controllers\Api\MaintenanceRecordController;
use App\Http\Controllers\Api\PaymentController;
// use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\DamageReportController;
// use App\Http\Controllers\Api\DamageReportImageController;
use App\Http\Controllers\Api\RentalAgreementController; // Your controller
// use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PromotionCodeController;
use App\Http\Controllers\Api\VehicleModelColorController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Public Routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/vehicle-models/public', [VehicleModelController::class, 'publicIndex'])->name('public.vehicle-models.index');
Route::get('/vehicle-models/public/{vehicle_model}', [VehicleModelController::class, 'publicShow'])->name('public.vehicle-models.show');
Route::get('/vehicle-models/{vehicleModel}/colors', [VehicleModelColorController::class, 'index']);
Route::post('/vehicle-models/{vehicleModel}/colors', [VehicleModelColorController::class, 'store']);
Route::delete('/vehicle-models/{vehicleModel}/colors/{color}', [VehicleModelColorController::class, 'destroy']);// Route::middleware('auth:sanctum')->group(function () { // Assuming you'll uncomment this later
Route::put('/vehicle-models/{vehicleModel}/colors', [VehicleModelColorController::class, 'updateColors']);
   
// --- Authentication Related ---
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/user', [AuthController::class, 'user'])->name('auth.user');
// In routes/web.php (or api.php if you prefer /api/storage-files/)

Route::get('/stream-glb/{filepath}', function ($filepath) {
    // Sanitize filepath to prevent directory traversal if needed
    if (Str::contains($filepath, '..')) { abort(403); }
    $fullStoragePath = 'public/' . $filepath;
    if (!Storage::disk('local')->exists($fullStoragePath)) { abort(404); }

    // This is the important part for this test
    $response = Storage::disk('local')->response($fullStoragePath);
$response->headers->set('Access-Control-Allow-Origin', 'http://localhost:3000');
$response->headers->set('Access-Control-Allow-Methods', 'GET, OPTIONS');
$response->headers->set('Access-Control-Allow-Credentials', 'true');
return $response;// If withCredentials is true on frontend
})->where('filepath', '.*'); // Allow slashes in filepath


Route::get('/vehicle-models/list-all', [VehicleModelController::class, 'listAll']);

// Your existing vehicle-models route can stay as it is
Route::apiResource('/vehicle-models', VehicleModelController::class);

// ... other routes
    // --- User Self-Service Routes ---
    Route::apiResource('addresses', AddressController::class)->parameters(['my-addresses' => 'address'])->except(['store', 'update', 'destroy']);
    Route::post('addresses', [AddressController::class, 'storeForCurrentUser'])->name('my-addresses.store');
    Route::put('addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('addresses/{address}', [AddressController::class, 'destroyForCurrentUser'])->name('my-addresses.destroy');
    Route::patch('user/default-address/{address}', [UserController::class, 'setDefaultAddress'])->name('user.default-address.update');

    // Route::get('/my-bookings', [UserBookingController::class, 'index'])->name('my-bookings.index');
    // Route::get('/my-bookings/{booking}', [UserBookingController::class, 'show'])->name('my-bookings.show');
    // Route::post('/my-bookings/{booking}/cancel', [UserBookingController::class, 'cancel'])->name('my-bookings.cancel');

    Route::get('/my-promotion-codes', [PromotionCodeController::class, 'currentUserCodes'])->name('my-promotion-codes.index');

    // Route::apiResource('my-notifications', NotificationController::class)->parameters(['my-notifications' => 'notification'])->only(['index', 'show']);
    // Route::post('/my-notifications/mark-as-read', [NotificationController::class, 'markAllAsRead'])->name('my-notifications.mark-all-read');
    // Route::post('/my-notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('my-notifications.mark-as-read');


    // --- General Application Resources ---
    Route::apiResource('users', UserController::class); // General User CRUD (if separate from AdminUserController)
    Route::apiResource('vehicle-types', VehicleTypeController::class)->parameters(['vehicle-types' => 'vehicle_type']);
    Route::apiResource('vehicle-models', VehicleModelController::class)->parameters(['vehicle-models' => 'vehicle_model']);
Route::apiResource('vehicle-models.media', VehicleModelMediaController::class)
         ->parameters([
             'vehicle-models' => 'vehicleModel', // Parameter name for VehicleModel in nested routes
             'media' => 'medium'                 // Parameter name for VehicleModelMedia in shallow routes
         ])
         ->shallow();

    // Additional custom route for reordering, as apiResource doesn't cover it
    Route::post('vehicle-models/{vehicleModel}/media/reorder', [VehicleModelMediaController::class, 'reorder'])
         ->name('vehicle-models.media.reorder');    Route::apiResource('vehicles', VehicleController::class);
    Route::apiResource('extras', ExtraController::class);
    Route::apiResource('features', FeatureController::class);
    Route::apiResource('insurance-plans', InsurancePlanController::class)->parameters(['insurance-plans' => 'insurance_plan']);
    Route::apiResource('bookings', BookingController::class);
    Route::post('/bookings/{booking}/confirm', [BookingController::class, 'confirmBooking'])->name('bookings.confirm');
    Route::post('/bookings/{booking}/complete', [BookingController::class, 'completeBooking'])->name('bookings.complete');
    Route::apiResource('operational-holds', OperationalHoldController::class)->parameters(['operational-holds' => 'operational_hold']);
    Route::apiResource('maintenance-records', MaintenanceRecordController::class)->parameters(['maintenance-records' => 'maintenance_record']);
    Route::apiResource('payments', PaymentController::class);
    Route::get('/bookings/{booking}/payments', [PaymentController::class, 'indexForBooking'])->name('bookings.payments.index');
    Route::get('payment-status-options', [PaymentController::class, 'getPaymentStatusOptions']);
    // Route::apiResource('reviews', ReviewController::class);
    Route::apiResource('damage-reports', DamageReportController::class)->parameters(['damage-reports' => 'damage_report']);
    // Route::apiResource('damage-reports.images', DamageReportImageController::class)->parameters(['damage-reports' => 'damage_report', 'images' => 'image'])->shallow();
// In routes/api.php
// ...
Route::get('bookings-for-dropdown', [BookingController::class, 'forDropdown']);
// ... (inside your auth middleware group or general API section)
Route::get('promotion-codes/lov/users', [PromotionCodeController::class, 'getUsersForDropdown'])->name('promotion-codes.lov.users');
Route::get('promotion-codes/lov/campaigns', [PromotionCodeController::class, 'getCampaignsForDropdown'])->name('promotion-codes.lov.campaigns');
Route::apiResource('promotion-codes', PromotionCodeController::class)->parameters(['promotion-codes' => 'promotion_code']);
Route::post('promotion-codes/validate-apply', [PromotionCodeController::class, 'validateAndApplyPreview'])->name('promotion-codes.validate-apply');
    // --- Rental Agreement Routes ---
    // Specific route for GENERATING a new agreement (maps to controller's 'store' method)
    Route::post('rental-agreements/generate', [RentalAgreementController::class, 'store'])->name('rental-agreements.generate');

    // Specific route for downloading/viewing the PDF
    Route::get('rental-agreements/{rental_agreement}/download', [RentalAgreementController::class, 'downloadDocument'])->name('rental-agreements.download');

    // Specific route for sending IN-APP notification to customer
    Route::post('rental-agreements/{rental_agreement}/send-notification', [RentalAgreementController::class, 'sendAgreementNotification'])->name('rental-agreements.send-notification');

    // Resourceful routes for RentalAgreements (index, show, update, destroy)
    Route::apiResource('rental-agreements', RentalAgreementController::class)
        ->parameters(['rental-agreements' => 'rental_agreement'])
        ->except(['store', 'create']); // 'store' (generation) and 'create' (HTML form) are handled differently or not needed for API

    // Optional: If you need to fetch an agreement specifically by booking ID
    Route::get('/bookings/{booking}/rental-agreement', [RentalAgreementController::class, 'showForBooking'])->name('bookings.rental-agreement.show');


    // --- ADMIN SPECIFIC ROUTES ---
    Route::prefix('admin')
         ->name('admin.')
         //->middleware(['auth:sanctum', 'role:admin']) // Protect admin routes
         ->group(function() {
            Route::apiResource('users', AdminUserController::class);
            Route::get('roles-list', [AdminUserController::class, 'fetchRoles'])->name('roles.list');
            Route::apiResource('system/roles', AdminRoleController::class)
                  ->parameters(['roles' => 'role'])
                  ->names('system.roles');
    });

// }); // End of auth:sanctum group
// In routes/api.php
// ...

// ... (inside your auth middleware group or general API section)
Route::apiResource('promotion-campaigns', PromotionCampaignController::class)->parameters(['promotion-campaigns' => 'promotion_campaign']);
Route::fallback(function(){
    return response()->json(['message' => 'Not Found.'], 404);
});