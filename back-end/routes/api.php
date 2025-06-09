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

// --- Admin Controller Imports ---
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\RoleController as AdminRoleController;


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
    Route::apiResource('vehicle-types', VehicleTypeController::class)->parameters(['vehicle-types' => 'vehicle_type']);
    Route::apiResource('vehicle-models', VehicleModelController::class)->parameters(['vehicle-models' => 'vehicle_model']);
// Publicly viewable fleet information
Route::get('/vehicle-models/public', [VehicleModelController::class, 'publicIndex'])->name('public.vehicle-models.index');
Route::get('/vehicle-models/public/{vehicle_model}', [VehicleModelController::class, 'publicShow'])->name('public.vehicle-models.show');

// Special route for streaming 3D model files
Route::get('/stream-glb/{filepath}', function ($filepath) {
    if (Str::contains($filepath, '..')) { abort(403, 'Invalid file path.'); }
    $fullStoragePath = 'public/' . $filepath;
    if (!Storage::disk('local')->exists($fullStoragePath)) { abort(404, 'File not found.'); }
    return Storage::disk('local')->response($fullStoragePath);
})->where('filepath', '.*');


// ========================================================================
//   Group 2: Authenticated Routes (User MUST be logged in)
// ========================================================================
// All routes within this group are protected by Sanctum's authentication.

Route::middleware('auth:sanctum')->group(function () {

    // --- Core Authentication Routes ---
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/user', [AuthController::class, 'user'])->name('auth.user');

    // --- User Self-Service Routes ---
    Route::post('addresses', [AddressController::class, 'storeForCurrentUser'])->name('my-addresses.store');
    Route::delete('addresses/{address}', [AddressController::class, 'destroyForCurrentUser'])->name('my-addresses.destroy');
    Route::patch('user/default-address/{address}', [UserController::class, 'setDefaultAddress'])->name('user.default-address.update');
    Route::get('/my-promotion-codes', [PromotionCodeController::class, 'currentUserCodes'])->name('my-promotion-codes.index');

    // --- General Application Resources (CRUD) ---
    Route::apiResource('users', UserController::class);
    Route::apiResource('addresses', AddressController::class)->except(['store', 'destroy']);

    Route::apiResource('vehicles', VehicleController::class);
    Route::apiResource('extras', ExtraController::class);
    Route::apiResource('features', FeatureController::class);
    Route::apiResource('insurance-plans', InsurancePlanController::class)->parameters(['insurance-plans' => 'insurance_plan']);
    Route::apiResource('bookings', BookingController::class);
    Route::apiResource('operational-holds', OperationalHoldController::class)->parameters(['operational-holds' => 'operational_hold']);
    Route::apiResource('maintenance-records', MaintenanceRecordController::class)->parameters(['maintenance-records' => 'maintenance_record']);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('damage-reports', DamageReportController::class)->parameters(['damage-reports' => 'damage_report']);
    Route::apiResource('rental-agreements', RentalAgreementController::class)->except(['store']);
    Route::apiResource('promotion-campaigns', PromotionCampaignController::class)->parameters(['promotion-campaigns' => 'promotion_campaign']);
    Route::apiResource('promotion-codes', PromotionCodeController::class)->parameters(['promotion-codes' => 'promotion_code']);
    
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
    Route::get('/vehicle-models/list-all', [VehicleModelController::class, 'listAll']);
    Route::post('/bookings/{booking}/confirm', [BookingController::class, 'confirmBooking'])->name('bookings.confirm');
    Route::post('/bookings/{booking}/complete', [BookingController::class, 'completeBooking'])->name('bookings.complete');
    Route::get('/bookings/{booking}/payments', [PaymentController::class, 'indexForBooking'])->name('bookings.payments.index');
    Route::get('bookings-for-dropdown', [BookingController::class, 'forDropdown']);
    Route::get('payment-status-options', [PaymentController::class, 'getPaymentStatusOptions']);
    Route::get('promotion-codes/lov/users', [PromotionCodeController::class, 'getUsersForDropdown'])->name('promotion-codes.lov.users');
    Route::get('promotion-codes/lov/campaigns', [PromotionCodeController::class, 'getCampaignsForDropdown'])->name('promotion-codes.lov.campaigns');
    Route::post('promotion-codes/validate-apply', [PromotionCodeController::class, 'validateAndApplyPreview'])->name('promotion-codes.validate-apply');
    
    // Rental Agreement Custom Actions
    Route::post('rental-agreements/generate', [RentalAgreementController::class, 'store'])->name('rental-agreements.generate');
    Route::get('rental-agreements/{rental_agreement}/download', [RentalAgreementController::class, 'downloadDocument'])->name('rental-agreements.download');
    Route::post('rental-agreements/{rental_agreement}/send-notification', [RentalAgreementController::class, 'sendAgreementNotification'])->name('rental-agreements.send-notification');
    Route::get('/bookings/{booking}/rental-agreement', [RentalAgreementController::class, 'showForBooking'])->name('bookings.rental-agreement.show');


    // ========================================================================
    //   Group 3: ADMIN-ONLY Routes (Nested inside auth group)
    // ========================================================================
    // The request is first checked for a valid login (auth:sanctum),
    // THEN it's checked for the 'admin' role.
    Route::prefix('admin')
         ->name('admin.')
         ->middleware('role:admin') // Spatie's role middleware
         ->group(function() {
            Route::apiResource('users', AdminUserController::class);
            Route::get('roles-list', [AdminUserController::class, 'fetchRoles'])->name('roles.list');
            Route::apiResource('system/roles', AdminRoleController::class)
                  ->parameters(['roles' => 'role'])
                  ->names('system.roles');
    });

}); // --- End of Authenticated Routes Group ---


// ========================================================================
//   Fallback Route - This must be the very last route defined.
// ========================================================================
// Catches any request that doesn't match the routes above.
Route::fallback(function(){
    return response()->json(['message' => 'API route not found.'], 404);
});