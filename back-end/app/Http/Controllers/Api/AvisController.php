<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avi;
use Illuminate\Http\Request;
// Removed: use Illuminate\Support\Facades\Auth; // No longer needed if not associating users
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\AvisResource;

class AvisController extends Controller
{
    // No constructor middleware needed for public access

    public function index(Request $request)
    {
        try {
            $query = Avi::query(); // Start with query builder

            // Removed 'approved' filter as is_approved column is removed
            // All fetched avis are considered public

            if ($request->filled('carName')) {
                $query->where('car_name', $request->query('carName'));
            }

            $query->orderBy('created_at', 'desc');

            $perPage = $request->input('per_page', 10);
            $avisList = $query->paginate((int)$perPage);

            return AvisResource::collection($avisList);
        } catch (\Exception $e) {
            Log::error('Error retrieving avis: ' . $e->getMessage(), ['exception_trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Sorry, there was an error retrieving reviews.'], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'rating'      => 'required|integer|min:1|max:5',
            'comment'     => 'required|string|min:10|max:5000',
            'carName'     => 'nullable|string|max:255',
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
                // 'is_approved' removed
                // 'user_id' removed
                // 'avatar_url' removed
            ];

            if (isset($validatedData['carName'])) {
                $dataToCreate['car_name'] = $validatedData['carName'];
            } else {
                $dataToCreate['car_name'] = null;
            }

            Log::info('Attempting to create Avi (Review) with data:', $dataToCreate);
            $avi = Avi::create($dataToCreate);
            Log::info('Avi (Review) created successfully', ['id' => $avi->id]);

            return response()->json([
                'message' => 'Thank you! Your review has been submitted.', // Simpler message
                'data'    => new AvisResource($avi)
            ], 201);

        } catch (\Illuminate\Database\QueryException $qe) {
            Log::error('Database Query Error saving review: ', ['message' => $qe->getMessage(), 'sql' => $qe->getSql(), 'bindings' => $qe->getBindings(), 'payload' => $request->all(), 'prepared_data' => $dataToCreate ?? [], 'trace' => $qe->getTraceAsString()]);
            return response()->json(['message' => 'Sorry, there was a database error submitting your review.'], 500);
        } catch (\Exception $e) {
            Log::error('General Error saving review: ', ['message' => $e->getMessage(), 'payload' => $request->all(), 'prepared_data' => $dataToCreate ?? [], 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Sorry, there was an error submitting your review.'], 500);
        }
    }

    public function show(Avi $avi)
    {
        return new AvisResource($avi);
    }

    public function update(Request $request, Avi $avi)
    {
        // Since user_id is removed, authorization for update/delete
        // would need a different mechanism if not admin-only (e.g., token-based edit for a limited time).
        // For now, assuming these might be admin actions or future enhancements.
        // $this->authorize('update', $avi); 

        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|required|string|max:255',
            'rating'      => 'sometimes|required|integer|min:1|max:5',
            'comment'     => 'sometimes|required|string|min:10|max:5000',
            'carName'     => 'sometimes|nullable|string|max:255',
            // 'is_approved' removed from validation
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $validatedData = $validator->validated();
            $updateData = [];

            if (isset($validatedData['name'])) $updateData['name'] = $validatedData['name'];
            if (isset($validatedData['rating'])) $updateData['rating'] = $validatedData['rating'];
            if (isset($validatedData['comment'])) $updateData['comment'] = $validatedData['comment'];
            if (array_key_exists('carName', $validatedData)) {
                $updateData['car_name'] = $validatedData['carName'];
            }
            // 'is_approved' removed
            
            if (!empty($updateData)) {
                $avi->update($updateData);
            }

            return response()->json([
                'message' => 'Review updated successfully.',
                'data'    => new AvisResource($avi->fresh())
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating review: ' . $e->getMessage(), ['avi_id' => $avi->id, 'payload' => $request->all(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Sorry, there was an error updating the review.'], 500);
        }
    }

    public function destroy(Avi $avi)
    {
        // $this->authorize('delete', $avi);
        try {
            $avi->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error deleting review: ' . $e->getMessage(), ['avi_id' => $avi->id, 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Sorry, there was an error deleting the review.'], 500);
        }
    }
}