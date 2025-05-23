<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromotionCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Enums\PromotionRewardType; // Import your Enum
use Illuminate\Validation\Rule; // For Enum rule
use Illuminate\Support\Facades\Log;

class PromotionCampaignController extends Controller
{
    protected function transformPromotionCampaign(PromotionCampaign $campaign): array
    {
        // Eager load promotionCodes count if you want to display it
        $campaign->loadCount('promotionCodes');

        return [
            'id' => $campaign->id,
            'name' => $campaign->name,
            'description' => $campaign->description,
            'required_rental_count' => $campaign->required_rental_count,
            'reward_value' => (float) $campaign->reward_value,
            'reward_type' => $campaign->reward_type, // Will be the Enum instance or its value
            'reward_type_display' => $campaign->reward_type?->label(), // Use the label from Enum
            'code_validity_days' => $campaign->code_validity_days,
            'is_active' => (bool) $campaign->is_active,
            'start_date' => $campaign->start_date?->toIso8601String(), // Or ->toDateTimeString()
            'end_date' => $campaign->end_date?->toIso8601String(),   // Or ->toDateTimeString()
            'promotion_codes_count' => $campaign->promotion_codes_count,
            'created_at' => $campaign->created_at?->toIso8601String(),
            'updated_at' => $campaign->updated_at?->toIso8601String(),
        ];
    }

    public function index(Request $request)
    {
        // Add authorization: e.g., if (!auth()->user()->can('view promotion campaigns')) { abort(403); }
        Log::info('PromotionCampaignController@index: Fetching campaigns', $request->all());

        $query = PromotionCampaign::query()->withCount('promotionCodes');

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        // Add more allowed sort columns if needed
        $allowedSorts = ['name', 'created_at', 'start_date', 'end_date', 'is_active', 'required_rental_count'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        if ($request->boolean('all')) {
            $campaigns = $query->get();
            return response()->json(['data' => $campaigns->map(fn($c) => $this->transformPromotionCampaign($c))]);
        } else {
            $perPage = $request->input('per_page', config('pagination.default_per_page', 15));
            $campaignsPaginated = $query->paginate((int)$perPage);
            $campaignsPaginated->getCollection()->transform(fn($c) => $this->transformPromotionCampaign($c));
            return response()->json($campaignsPaginated);
        }
    }

    public function store(Request $request)
    {
        // Add authorization
        Log::info('PromotionCampaignController@store: Received data', $request->all());

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:promotion_campaigns,name',
            'description' => 'nullable|string|max:1000',
            'required_rental_count' => 'required|integer|min:1',
            'reward_value' => 'required|numeric|min:0',
            'reward_type' => ['required', Rule::in(array_column(PromotionRewardType::cases(), 'value'))], // Validate against Enum values
            'code_validity_days' => 'nullable|integer|min:1',
            'is_active' => 'sometimes|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            Log::error('PromotionCampaignController@store: Validation failed', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        if (!isset($validatedData['is_active'])) { // Default is_active to false if not provided
            $validatedData['is_active'] = false;
        }

        $campaign = PromotionCampaign::create($validatedData);
        Log::info('PromotionCampaignController@store: Campaign created successfully', ['id' => $campaign->id]);

        return response()->json([
            'data' => $this->transformPromotionCampaign($campaign),
            'message' => 'Promotion campaign created successfully.'
        ], 201);
    }

    public function show(PromotionCampaign $promotionCampaign)
    {
        // Add authorization
        Log::info('PromotionCampaignController@show: Fetching campaign', ['id' => $promotionCampaign->id]);
        return response()->json(['data' => $this->transformPromotionCampaign($promotionCampaign)]);
    }

    public function update(Request $request, PromotionCampaign $promotionCampaign)
    {
        // Add authorization
        Log::info('PromotionCampaignController@update: Received data for update', ['id' => $promotionCampaign->id, 'data' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('promotion_campaigns')->ignore($promotionCampaign->id)],
            'description' => 'nullable|string|max:1000',
            'required_rental_count' => 'sometimes|required|integer|min:1',
            'reward_value' => 'sometimes|required|numeric|min:0',
            'reward_type' => ['sometimes', 'required', Rule::in(array_column(PromotionRewardType::cases(), 'value'))],
            'code_validity_days' => 'nullable|integer|min:1',
            'is_active' => 'sometimes|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            Log::error('PromotionCampaignController@update: Validation failed', ['id' => $promotionCampaign->id, 'errors' => $validator->errors()->toArray()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $promotionCampaign->update($validator->validated());
        Log::info('PromotionCampaignController@update: Campaign updated successfully', ['id' => $promotionCampaign->id]);

        return response()->json([
            'data' => $this->transformPromotionCampaign($promotionCampaign->fresh()), // Use fresh() to get updated relations if any
            'message' => 'Promotion campaign updated successfully.'
        ]);
    }

    public function destroy(PromotionCampaign $promotionCampaign)
    {
        // Add authorization
        Log::info('PromotionCampaignController@destroy: Attempting to delete campaign', ['id' => $promotionCampaign->id]);
        // Consider business logic: e.g., cannot delete if it has active/used promotion codes.
        // For now, simple delete.
        // $promotionCampaign->promotionCodes()->delete(); // If you want to delete associated codes
        $promotionCampaign->delete();
        Log::info('PromotionCampaignController@destroy: Campaign deleted successfully', ['id' => $promotionCampaign->id]);

        return response()->json(['message' => 'Promotion campaign deleted successfully.'], 200);
    }
}