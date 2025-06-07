<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
// Optional: If you want to send email notifications
// use Illuminate\Support\Facades\Mail;
// use App\Mail\NewContactMessage; // You'd need to create this Mailable
// use App\Mail\ContactMessageUpdated; // Example for update notification

class ContactController extends Controller
{
    /**
     * Display a listing of the contact messages.
     * GET /api/contacts
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // SECURITY NOTE: In a real application, protect this endpoint with authentication
        // and authorization to ensure only admins can view all contacts.
        try {
            $contacts = Contact::orderBy('created_at', 'desc')->get();
            // For pagination:
            // $contacts = Contact::orderBy('created_at', 'desc')->paginate(15);

            return response()->json([
                'message' => 'Contacts retrieved successfully.',
                'data' => $contacts
            ], 200); // 200 OK

        } catch (\Exception $e) {
            Log::error('Error retrieving contacts: ' . $e->getMessage());
            return response()->json(['message' => 'Sorry, there was an error retrieving contacts.'], 500);
        }
    }

    /**
     * Store a newly created contact message in storage.
     * POST /api/contacts
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $contact = Contact::create($validator->validated());

            // Optional: Send an email notification to an admin
            // Mail::to('admin@yourapp.com')->send(new NewContactMessage($contact));

            return response()->json([
                'message' => 'Thank you for your message! We will contact you shortly.',
                'data' => $contact
            ], 201); // 201 Created

        } catch (\Exception $e) {
            Log::error('Error saving contact message: ' . $e->getMessage());
            return response()->json(['message' => 'Sorry, there was an error sending your message. Please try again later.'], 500);
        }
    }

    /**
     * Display the specified contact message.
     * GET /api/contacts/{contact}
     *
     * @param  \App\Models\Contact  $contact  (Route Model Binding)
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Contact $contact)
    {
        // SECURITY NOTE: In a real application, protect this endpoint.
        // Route Model Binding automatically handles 404 if not found.
        return response()->json([
            'message' => 'Contact retrieved successfully.',
            'data' => $contact
        ], 200);
    }

    /**
     * Update the specified contact message in storage.
     * PUT/PATCH /api/contacts/{contact}
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Contact  $contact (Route Model Binding)
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Contact $contact)
    {
        // SECURITY NOTE: In a real application, protect this endpoint.
        // You might want different validation rules for update, e.g., some fields might not be required
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255', // 'sometimes' means validate only if present
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'sometimes|required|string|max:255',
            'message' => 'sometimes|required|string',
            // You could add a 'status' field here if you want to mark contacts as 'read', 'archived' etc.
            // 'status' => 'sometimes|string|in:new,read,archived'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $contact->update($validator->validated());

            // Optional: Send notification about update
            // Mail::to($contact->email)->send(new ContactMessageUpdated($contact)); // Notify user
            // Mail::to('admin@yourapp.com')->send(new ContactMessageUpdatedByAdmin($contact)); // Notify admin

            return response()->json([
                'message' => 'Contact message updated successfully.',
                'data' => $contact
            ], 200); // 200 OK

        } catch (\Exception $e) {
            Log::error('Error updating contact message: ' . $e->getMessage());
            return response()->json(['message' => 'Sorry, there was an error updating the message.'], 500);
        }
    }

    /**
     * Remove the specified contact message from storage.
     * DELETE /api/contacts/{contact}
     *
     * @param  \App\Models\Contact  $contact (Route Model Binding)
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Contact $contact)
    {
        // SECURITY NOTE: In a real application, protect this endpoint.
        try {
            $contact->delete();

            return response()->json([
                'message' => 'Contact message deleted successfully.'
            ], 200); // Or 204 No Content if you prefer not to send a body

        } catch (\Exception $e) {
            Log::error('Error deleting contact message: ' . $e->getMessage());
            return response()->json(['message' => 'Sorry, there was an error deleting the message.'], 500);
        }
    }
}