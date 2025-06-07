<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avi; // Make sure this model exists and is correctly named
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AvisController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Avi::query();

            if ($request->has('approved')) {
                $query->where('is_approved', filter_var($request->query('approved'), FILTER_VALIDATE_BOOLEAN));
            } else {
                // Default to public approved view if not specified otherwise
                // For an admin panel or specific views, you might remove this default or change it
                $query->where('is_approved', true); 
            }

            if ($request->has('carName')) {
                // Ensure your Avi model has a 'car_name' attribute or accessor if 'carName' is preferred.
                // If DB column is 'car_name', this is fine.
                $query->where('car_name', $request->query('carName')); 
            }

            $perPage = $request->input('per_page', 15); // Default per_page
            $avisList = $query->orderBy('created_at', 'desc')->paginate((int)$perPage);
            
            return response()->json($avisList);

        } catch (\Exception $e) {
            Log::error('Error retrieving avis: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                // 'trace' => $e->getTraceAsString() // Be cautious about sending full traces in production
            ]);
            return response()->json(['message' => 'Sorry, there was an error retrieving avis. Please check server logs.'], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'rating'      => 'required|integer|min:1|max:5',
            'comment'     => 'required|string|min:5|max:5000',
            'carName'     => 'nullable|string|max:255', // Frontend sends 'carName'
            'is_approved' => 'sometimes|boolean',      // Optional, for admin or specific cases
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $validatedData = $validator->validated();

            $dataToCreate = [
                'name'        => $validatedData['name'],
                'rating'      => $validatedData['rating'],
                'comment'     => $validatedData['comment'],
                // Default to true (approved) if 'is_approved' is not sent by client.
                // For user-submitted reviews, you might want to default this to false
                // and have an admin approve them.
                'is_approved' => $validatedData['is_approved'] ?? true, 
            ];

            // Map 'carName' from request to 'car_name' for database if necessary
            // If your Avi model has 'carName' in $fillable, Eloquent might handle it.
            // But explicit mapping is safer if DB column is 'car_name'.
            if (isset($validatedData['carName'])) {
                $dataToCreate['car_name'] = $validatedData['carName'];
            } else {
                // Default carName if not provided from frontend.
                // Ensure your DB column 'car_name' allows NULL or has a default.
                $dataToCreate['car_name'] = $validatedData['carName'] ?? "General Feedback"; 
            }


            $avi = Avi::create($dataToCreate);

            return response()->json([
                'message' => 'Thank you! Your Avis has been submitted.',
                'data'    => $avi
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error saving avi: ' . $e->getMessage(), [
                'request_payload' => $request->all(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                // 'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Sorry, there was an error submitting your Avis. Please try again later.'], 500);
        }
    }

    public function show(Avi $avi) // Uses route model binding
    {
        return response()->json(['message' => 'Avis retrieved successfully.', 'data' => $avi]);
    }

    public function update(Request $request, Avi $avi) // Uses route model binding
    {
        // Add authorization check here: e.g., if (auth()->user()->cannot('update', $avi)) abort(403);
        
        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|required|string|max:255',
            'rating'      => 'sometimes|required|integer|min:1|max:5',
            'comment'     => 'sometimes|required|string|min:5|max:5000',
            'carName'     => 'nullable|string|max:255',
            'is_approved' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $validatedData = $validator->validated();
            $updateData = [];

            // Explicitly map fields to avoid mass assignment issues if $fillable is strict
            if (isset($validatedData['name'])) $updateData['name'] = $validatedData['name'];
            if (isset($validatedData['rating'])) $updateData['rating'] = $validatedData['rating'];
            if (isset($validatedData['comment'])) $updateData['comment'] = $validatedData['comment'];
            if (array_key_exists('carName', $validatedData)) { // array_key_exists for nullable fields
                $updateData['car_name'] = $validatedData['carName'];
            }
            if (isset($validatedData['is_approved'])) $updateData['is_approved'] = $validatedData['is_approved'];

            if (!empty($updateData)) {
                $avi->update($updateData);
            }

            return response()->json([
                'message' => 'Avis updated successfully.',
                'data'    => $avi->fresh() // Return the updated model
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating avi: ' . $e->getMessage(), [
                'avi_id' => $avi->id,
                'request_payload' => $request->all(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json(['message' => 'Sorry, there was an error updating the Avis.'], 500);
        }
    }

    public function destroy(Avi $avi) // Uses route model binding
    {
        // Add authorization check here
        try {
            $avi->delete();
            return response()->json(['message' => 'Avis deleted successfully.']);
        } catch (\Exception $e) {
            Log::error('Error deleting avi: ' . $e->getMessage(), ['avi_id' => $avi->id]);
            return response()->json(['message' => 'Sorry, there was an error deleting the Avis.'], 500);
        }
    }
}