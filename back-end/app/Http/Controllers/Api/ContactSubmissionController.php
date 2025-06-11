<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact; // Your Contact model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\ContactSubmissionResource; // For admin views

// use Illuminate\Support\Facades\Mail; // If you want to send email notifications
// use App\Mail\ContactFormSubmitted; // Example Mailable

class ContactSubmissionController extends Controller
{
    /**
     * Display a listing of the resource (for admin panel).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Authorization: Ensure only admin can access
        // if (!$request->user() || !$request->user()->isAdmin()) { // Example check
        //     return response()->json(['message' => 'Forbidden'], 403);
        // }

        try {
            $query = Contact::query();

            // Optional: Allow searching/filtering for admin
            if ($request->filled('search')) {
                $searchTerm = $request->query('search');
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('subject', 'LIKE', "%{$searchTerm}%");
                });
            }

            if ($request->has('is_read')) {
                $query->where('is_read', filter_var($request->query('is_read'), FILTER_VALIDATE_BOOLEAN));
            }
            
            $query->orderBy('created_at', 'desc');
            $perPage = $request->input('per_page', 15);
            $submissions = $query->paginate((int)$perPage);

            return ContactSubmissionResource::collection($submissions);
        } catch (\Exception $e) {
            Log::error('Error retrieving contact submissions: ' . $e->getMessage(), ['exception_trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Sorry, there was an error retrieving contact submissions.'], 500);
        }
    }

    /**
     * Store a newly created contact submission in storage (public endpoint).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'phone'   => 'nullable|string|max:30',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $validatedData = $validator->validated();
            $contactSubmissionData = $validatedData; // Start with validated data

            if (Auth::check()) {
                $contactSubmissionData['user_id'] = Auth::id();
            }
            // is_read defaults to false via migration

            $contactSubmission = Contact::create($contactSubmissionData);

            // Optional: Send an email notification to admin
            // try {
            //     Mail::to(config('mail.admin_address', 'admin@example.com'))->send(new ContactFormSubmitted($contactSubmission));
            // } catch (\Exception $mailException) {
            //     Log::error('Failed to send contact form submission email: ' . $mailException->getMessage());
            // }

            return response()->json([
                'message' => 'Thank you for your message! We have received it and will get back to you shortly.',
                // For public submission, you might not need to return the full data object,
                // or use a simpler resource if you do.
                'data'    => new ContactSubmissionResource($contactSubmission) 
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error saving contact submission: ' . $e->getMessage(), [
                'payload' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Sorry, there was an error submitting your message. Please try again later.'], 500);
        }
    }

    /**
     * Display the specified resource (for admin panel).
     *
     * @param  \App\Models\Contact  $contactSubmission // Route model binding (variable name must match route parameter)
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Contact $contactSubmission) // Renamed variable to match common resource naming
    {
        // Authorization: Ensure only admin can access
        // if (!request()->user() || !request()->user()->isAdmin()) {
        //     return response()->json(['message' => 'Forbidden'], 403);
        // }
        return new ContactSubmissionResource($contactSubmission);
    }

    /**
     * Update the specified resource in storage (e.g., mark as read, add notes - for admin).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Contact  $contactSubmission
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Contact $contactSubmission)
    {
        // Authorization: Ensure only admin can access
        // if (!$request->user() || !$request->user()->isAdmin()) {
        //     return response()->json(['message' => 'Forbidden'], 403);
        // }

        $validator = Validator::make($request->all(), [
            // Admin might update these fields if there was a typo or for internal records
            'name'        => 'sometimes|string|max:255',
            'email'       => 'sometimes|email|max:255',
            'phone'       => 'sometimes|nullable|string|max:30',
            'subject'     => 'sometimes|string|max:255',
            'message'     => 'sometimes|string|min:10|max:5000',
            // Admin specific fields
            'is_read'     => 'sometimes|boolean',
            'admin_notes' => 'nullable|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $contactSubmission->update($validator->validated());
            return response()->json([
                'message' => 'Contact submission updated successfully.',
                'data' => new ContactSubmissionResource($contactSubmission->fresh())
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating contact submission: ' . $e->getMessage(), [
                'contact_id' => $contactSubmission->id, 'payload' => $request->all(), 'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Sorry, there was an error updating the contact submission.'], 500);
        }
    }

    /**
     * Remove the specified resource from storage (for admin).
     *
     * @param  \App\Models\Contact  $contactSubmission
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Contact $contactSubmission)
    {
        // Authorization: Ensure only admin can access
        // if (!request()->user() || !request()->user()->isAdmin()) {
        //     return response()->json(['message' => 'Forbidden'], 403);
        // }

        try {
            $contactSubmission->delete();
            return response()->json(null, 204); // 204 No Content
        } catch (\Exception $e) {
            Log::error('Error deleting contact submission: ' . $e->getMessage(), [
                'contact_id' => $contactSubmission->id, 'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Sorry, there was an error deleting the contact submission.'], 500);
        }
    }
}