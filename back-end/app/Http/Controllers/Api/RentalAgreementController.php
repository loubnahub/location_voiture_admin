<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RentalAgreement;
use App\Models\Booking;
use App\Models\Notification; // Your custom Notification model
use App\Models\User; // For type hinting and ensuring renter exists
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf; // If using laravel-dompdf for PDF generation
use Illuminate\Support\Facades\URL;

class RentalAgreementController extends Controller
{
    protected function transformRentalAgreement(RentalAgreement $agreement): array
    {
        $agreement->loadMissing([
            'booking:id,renter_user_id,vehicle_id',
            'booking.renter:id,full_name,email', // Added email for potential use
            'booking.vehicle:id,license_plate,vehicle_model_id',
            'booking.vehicle.vehicleModel:id,title'
        ]);

        $vehicleDisplay = null;
        if ($agreement->booking && $agreement->booking->vehicle) {
            $vehicle = $agreement->booking->vehicle;
            $vehicleDisplay = $vehicle->vehicleModel
                ? $vehicle->vehicleModel->title . ' (' . $vehicle->license_plate . ')'
                : $vehicle->license_plate;
        }

        return [
            'id' => $agreement->id,
            'booking_id' => $agreement->booking_id,
            'booking_identifier' => $agreement->booking ? 'Booking #' . substr($agreement->booking_id, 0, 8) . '...' : null,
            'renter_name' => $agreement->booking && $agreement->booking->renter ? $agreement->booking->renter->full_name : null,
            'vehicle_display' => $vehicleDisplay,
            'document_url' => $agreement->document_url ? Storage::disk('public')->url($agreement->document_url) : null,
            'generated_at' => $agreement->generated_at ? $agreement->generated_at->toDateTimeString() : null,
            'signed_by_renter_at' => $agreement->signed_by_renter_at ? $agreement->signed_by_renter_at->toDateTimeString() : null,
            'signed_by_platform_at' => $agreement->signed_by_platform_at ? $agreement->signed_by_platform_at->toDateTimeString() : null,
            'notes' => $agreement->notes,
        ];
    }

    public function index(Request $request)
    {
        // Add authorization as needed (e.g., Spatie permissions)
        // if (!auth()->user()->can('view rental agreements')) { abort(403); }

        Log::info('RentalAgreementController@index: Fetching list of agreements.', $request->all());
        $query = RentalAgreement::query()->with([
            'booking:id,renter_user_id,vehicle_id',
            'booking.renter:id,full_name,email',
            'booking.vehicle:id,license_plate,vehicle_model_id',
            'booking.vehicle.vehicleModel:id,title'
        ]);

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('id', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('notes', 'LIKE', "%{$searchTerm}%")
                  ->orWhereHas('booking', function ($bq) use ($searchTerm) {
                      $bq->where('id', 'LIKE', "%{$searchTerm}%") // Search by full booking ID if provided
                         ->orWhereRaw('SUBSTRING(id, 1, 8) LIKE ?', ["%{$searchTerm}%"]) // Search by short booking ID
                         ->orWhereHas('renter', fn($rq) => $rq->where('full_name', 'LIKE', "%{$searchTerm}%")->orWhere('email', 'LIKE', "%{$searchTerm}%"))
                         ->orWhereHas('vehicle', function ($vq) use ($searchTerm) {
                            $vq->where('license_plate', 'LIKE', "%{$searchTerm}%")
                               ->orWhereHas('vehicleModel', fn($vmq) => $vmq->where('title', 'LIKE', "%{$searchTerm}%"));
                         });
                  });
            });
        }

        // ... (other filters like booking_id, vehicle_id if needed) ...

        $sortBy = $request->input('sort_by', 'generated_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $allowedSorts = ['id', 'generated_at', 'signed_by_renter_at', 'signed_by_platform_at'];
        // For sorting by related fields (booking_identifier, renter_name, vehicle_display),
        // you'd typically need to join or handle it client-side after transformation if complex.
        // For simplicity, we'll stick to direct model fields for sorting here.
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('generated_at', 'desc'); // Default sort
        }

        if ($request->boolean('all')) {
            $agreements = $query->get();
            return response()->json(['data' => $agreements->map(fn($ag) => $this->transformRentalAgreement($ag))]);
        } else {
            $perPage = $request->input('per_page', config('pagination.default_per_page', 15));
            $agreementsPaginated = $query->paginate((int)$perPage);
            $agreementsPaginated->getCollection()->transform(fn($ag) => $this->transformRentalAgreement($ag));
            return response()->json($agreementsPaginated);
        }
    }

    // This 'store' method is for GENERATING a new agreement (called by POST /rental-agreements/generate)
    public function store(Request $request)
    {
        // if (!auth()->user()->can('generate rental agreements')) { abort(403); }
        Log::info('RentalAgreementController@store (generate): Request data:', $request->all());

        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|uuid|exists:bookings,id|unique:rental_agreements,booking_id',
            'notes' => 'nullable|string|max:1000',
            'signed_by_renter_at' => 'nullable|date_format:Y-m-d H:i:s|sometimes', // Expects 'YYYY-MM-DD HH:MM:SS'
            'signed_by_platform_at' => 'nullable|date_format:Y-m-d H:i:s|sometimes',
        ]);

        if ($validator->fails()) {
            Log::error('RentalAgreementController@store: Validation failed.', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $bookingId = $validatedData['booking_id'];

       $booking = Booking::with([
    'renter.defaultAddress', // Eager load the defaultAddress for the renter
    'vehicle.vehicleModel',
    'insurancePlan',
    'bookingExtras',
    'promotionCode' , // Assuming 'extra' is the relationship on the pivot model or BookingExtra model
])->find($bookingId);

        if (!$booking) {
            Log::error('RentalAgreementController@store: Booking not found for ID: ' . $bookingId);
            return response()->json(['message' => 'Booking not found.'], 404);
        }
  $logoPath = public_path('logo/Logobe.png');
            
            // 2. Base64 encode the image. This is the most reliable method
            //    as it embeds the image directly into the HTML, bypassing all pathing issues.
            $logoType = pathinfo($logoPath, PATHINFO_EXTENSION);
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/' . $logoType . ';base64,' . base64_encode($logoData);
        // --- PDF Generation Logic ---
        try {
            $pdfData = [
                'booking' => $booking,
                        'logo_base64' => $logoBase64,
                 'agreement_id' => null, 
                 'agreement_date' => now(), // This is the generation date for the PDF view

                'agreement_signed_by_renter_at' => $validatedData['signed_by_renter_at'] ?? null,
                'agreement_signed_by_platform_at' => $validatedData['signed_by_platform_at'] ?? null,
            ];
            // Ensure you have: resources/views/apdfs/rental_agreement.blade.php
            $pdf = Pdf::loadView('pdfs.rental_agreement', $pdfData);
            $fileName = 'rental_agreement_' . $booking->id . '_' . time() . '.pdf';
            $filePath = 'rental_agreements/' . $fileName; // Relative to storage/app/public

            Storage::disk('public')->put($filePath, $pdf->output());
            Log::info('RentalAgreementController@store: PDF generated and stored at: ' . $filePath);

        } catch (\Exception $e) {
            Log::error('RentalAgreementController@store: PDF generation/storage failed for booking ' . $booking->id . ': ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Failed to generate or store rental agreement PDF.', 'error_details' => $e->getMessage()], 500);
        }
        // --- End PDF Generation ---

        $agreement = RentalAgreement::create([
            'booking_id' => $booking->id,
            'document_url' => $filePath,
            'generated_at' => now(),
            'notes' => $validatedData['notes'] ?? null,
            'signed_by_renter_at' => $validatedData['signed_by_renter_at'] ?? null,
            'signed_by_platform_at' => $validatedData['signed_by_platform_at'] ?? null,
        ]);
        Log::info('RentalAgreementController@store: RentalAgreement record created with ID: ' . $agreement->id);

        return response()->json([
            'data' => $this->transformRentalAgreement($agreement->refresh()),
            'message' => 'Rental agreement generated and saved successfully.'
        ], 201);
    }

    public function show(RentalAgreement $rentalAgreement)
    {
        // if (!auth()->user()->can('view rental agreements')) { abort(403); }
        return response()->json(['data' => $this->transformRentalAgreement($rentalAgreement)]);
    }

    // For updating notes or signing statuses (NOT re-generating PDF)
    public function update(Request $request, RentalAgreement $rentalAgreement)
    {
        // if (!auth()->user()->can('manage rental agreements')) { abort(403); }
        Log::info('RentalAgreementController@update: Request data for Agreement ID ' . $rentalAgreement->id . ':', $request->all());

        $validator = Validator::make($request->all(), [
            'signed_by_renter_at' => 'nullable|date_format:Y-m-d H:i:s|sometimes',
            'signed_by_platform_at' => 'nullable|date_format:Y-m-d H:i:s|sometimes',
            'notes' => 'nullable|string|max:1000|sometimes',
        ]);

        if ($validator->fails()) {
            Log::error('RentalAgreementController@update: Validation failed.', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        // Ensure that if a date is sent empty, it's treated as null explicitly
        if ($request->has('signed_by_renter_at') && empty($validatedData['signed_by_renter_at'])) {
            $validatedData['signed_by_renter_at'] = null;
        }
        if ($request->has('signed_by_platform_at') && empty($validatedData['signed_by_platform_at'])) {
            $validatedData['signed_by_platform_at'] = null;
        }

        $rentalAgreement->update($validatedData);
        Log::info('RentalAgreementController@update: Agreement updated ID: ' . $rentalAgreement->id);

        return response()->json([
            'data' => $this->transformRentalAgreement($rentalAgreement->refresh()),
            'message' => 'Rental agreement updated successfully.'
        ]);
    }

    public function downloadDocument(RentalAgreement $rentalAgreement)
    {
        // if (!auth()->user()->can('view rental agreements')) { abort(403); }
        Log::info('RentalAgreementController@downloadDocument: Attempting for Agreement ID: ' . $rentalAgreement->id);

        if (!$rentalAgreement->document_url || !Storage::disk('public')->exists($rentalAgreement->document_url)) {
            Log::error('RentalAgreementController@downloadDocument: Document not found for Agreement ID: ' . $rentalAgreement->id . ' at path: ' . $rentalAgreement->document_url);
            return response()->json(['message' => 'Document not found.'], 404);
        }
        return Storage::disk('public')->response($rentalAgreement->document_url); // Displays in browser
    }

    public function destroy(RentalAgreement $rentalAgreement)
    {
        // if (!auth()->user()->can('delete rental agreements')) { abort(403); }
        Log::info('RentalAgreementController@destroy: Attempting to delete Agreement ID: ' . $rentalAgreement->id);

        // Optional business logic: e.g., cannot delete if signed
        // if ($rentalAgreement->signed_by_renter_at || $rentalAgreement->signed_by_platform_at) {
        //     Log::warning('RentalAgreementController@destroy: Attempt to delete signed agreement ID: ' . $rentalAgreement->id);
        //     return response()->json(['message' => 'Cannot delete a signed rental agreement.'], 403);
        // }

        if ($rentalAgreement->document_url && Storage::disk('public')->exists($rentalAgreement->document_url)) {
            Storage::disk('public')->delete($rentalAgreement->document_url);
            Log::info('RentalAgreementController@destroy: Deleted PDF file: ' . $rentalAgreement->document_url);
        }
        $rentalAgreement->delete();
        Log::info('RentalAgreementController@destroy: Agreement record deleted ID: ' . $rentalAgreement->id);

        return response()->json(['message' => 'Rental agreement deleted successfully.'], 200);
    }

    /**
     * Send an in-app notification to the renter about their rental agreement.
     */
       public function sendAgreementNotification(Request $request, RentalAgreement $rentalAgreement)
    {
        Log::info('RentalAgreementController@sendAgreementNotification: Attempting for Agreement ID: ' . $rentalAgreement->id);

        // Eager load necessary relationships
        $rentalAgreement->loadMissing('booking.renter');

        // --- VALIDATION (Good to have) ---
        if (!$rentalAgreement->booking || !$rentalAgreement->booking->renter) {
            Log::warning('RentalAgreementController@sendAgreementNotification: Booking or Renter info missing for Agreement ID: ' . $rentalAgreement->id);
            return response()->json(['message' => 'Booking or Renter information is missing for this agreement.'], 404);
        }
        if (!$rentalAgreement->document_url || !Storage::disk('public')->exists($rentalAgreement->document_url)) {
            Log::warning('RentalAgreementController@sendAgreementNotification: PDF document not found for Agreement ID: ' . $rentalAgreement->id);
            return response()->json(['message' => 'Rental agreement PDF document not found. Cannot send notification.'], 404);
        }

        $renter = $rentalAgreement->booking->renter;
        $bookingIdentifier = 'Booking #' . substr($rentalAgreement->booking_id, 0, 8);

        try {
            // --- THE SIMPLIFIED LOGIC ---
            // 1. Generate the temporary, secure URL for the download route.
            $secureDownloadUrl = URL::temporarySignedRoute(
                'rental-agreements.download', // The name of your download route in api.php
                now()->addDays(7),             // Link expiration time
                ['rental_agreement' => $rentalAgreement->id]
            );

            // 2. Create the notification message with the URL directly inside it.
            // We use line breaks (\n) to make it easier for the frontend to parse or display.
            $notificationMessage = "The rental agreement for your {$bookingIdentifier} is ready. " .
                                   "Please review and sign it.\n\n" .
                                   "Download Link: {$secureDownloadUrl}";

            // 3. Create the notification record using your existing model and table structure.
            Notification::create([
                'user_id'   => $renter->id,
                'title'     => 'Your Rental Agreement is Ready!',
                'message'   => $notificationMessage, // The message now contains the URL
                'timestamp' => now(),
                'is_read'   => false,
            ]);
            // --- END OF SIMPLIFIED LOGIC ---

            Log::info('RentalAgreementController@sendAgreementNotification: In-app notification created for Renter ID: ' . $renter->id);
            return response()->json(['message' => 'Notification with download link has been sent to the renter.']);

        } catch (\Exception $e) {
            Log::error('RentalAgreementController@sendAgreementNotification: Failed to create notification. Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send rental agreement notification.'], 500);
        }
    }


    public function showForBooking(Booking $booking)
    {
        // if (!auth()->user()->can('view rental agreements')) { abort(403); } // Or check if user is renter of this booking
        Log::info('RentalAgreementController@showForBooking: Attempting for Booking ID: ' . $booking->id);

        $rentalAgreement = RentalAgreement::where('booking_id', $booking->id)->first();

        if (!$rentalAgreement) {
            Log::warning('RentalAgreementController@showForBooking: No rental agreement found for Booking ID: ' . $booking->id);
            return response()->json(['message' => 'No rental agreement found for this booking.'], 404);
        }

        return response()->json(['data' => $this->transformRentalAgreement($rentalAgreement)]);
    }
       
}
