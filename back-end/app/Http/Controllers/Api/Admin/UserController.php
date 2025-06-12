<?php

namespace App\Http\Controllers\Api\Admin; // Note the Admin namespace

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Added for self-delete check
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role; // Import Spatie Role model
use Illuminate\Support\Facades\Log;
use App\Models\PromotionCode; // Make sure these are at the top
use App\Enums\PromotionCodeStatus;
class UserController extends Controller
{
    /**
     * Helper to transform user data for API response.
     */
    protected function transformUser(User $user): array
    {
        $user->loadMissing(['roles:id,name', 'defaultAddress']);

        return [
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'profile_picture_url' => $user->profile_picture_url,
            'loyalty_points' => (int) $user->loyalty_points,
            'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toDateTimeString() : null,
            'created_at' => $user->created_at->toDateTimeString(),
            'updated_at' => $user->updated_at->toDateTimeString(),
            'roles' => $user->roles->map(fn($role) => ['id' => $role->id, 'name' => $role->name])->toArray(),
            'role_names' => $user->getRoleNames()->toArray(),
            'default_address_summary' => $user->defaultAddress ? $user->defaultAddress->getSummaryAttribute() : null,
            'default_address_id' => $user->default_address_id,
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Log::info('Admin/UserController@index: Fetching users with params:', $request->all());

        $query = User::query()->with(['roles:id,name']);

        // Search
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('full_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('phone', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Filter by specific role name
        if ($request->filled('role')) {
            $roleName = $request->input('role');
            $query->whereHas('roles', function ($q) use ($roleName) {
                $q->where('name', $roleName);
            });
        }

        // --- THIS IS THE NEW, CORRECTED LOGIC ---
        // Filter by a "type" of user, e.g., only renters (non-admins)
        if ($request->input('role_type') === 'renter') {
            // This excludes any user who has the 'admin' role.
            // Adjust 'admin' if your role has a different name (e.g., 'super-admin').
            $query->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'admin');
            });
        }
        // --- END OF NEW LOGIC ---

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $allowedSorts = ['full_name', 'email', 'created_at', 'loyalty_points'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        if ($request->boolean('all')) {
            $users = $query->get();
            // Wrap in 'data' key for consistency with paginated responses
            return response()->json(['data' => $users->map(fn($user) => $this->transformUser($user))]);
        } else {
            $perPage = $request->input('per_page', config('pagination.default_per_page', 10));
            $usersPaginated = $query->paginate((int)$perPage);
            $usersPaginated->getCollection()->transform(fn($user) => $this->transformUser($user));
            return response()->json($usersPaginated);
        }
    }
    // In app/Http/Controllers/Api/Admin/UserController.php

// In app/Http/Controllers/Api/Admin/UserController.php

public function getUserRewards(Request $request, User $user)
{
    $freshUser = User::with(['promotionCodes.promotionCampaign'])->find($user->id);

    if (!$freshUser) {
        return response()->json(['message' => 'User not found.'], 404);
    }


    $loyaltyLevels = [5, 10, 20];
    
    $currentPoints = $freshUser->loyalty_points;
    $nextLevel = null;
    $pointsToNextLevel = null;

    foreach ($loyaltyLevels as $level) {
        if ($level > $currentPoints) {
            $nextLevel = $level;
            $pointsToNextLevel = $level - $currentPoints;
            break;
        }
    }

    $transformedCodes = $freshUser->promotionCodes->map(function ($code) {
        return [
            'id' => $code->id,
            'code_string' => $code->code_string,
            'status' => $code->status,
            'status_display' => $code->status?->label ?? ucfirst(str_replace('_', ' ', $code->status?->value ?? '')),
            'expires_at' => $code->expires_at?->toIso8601String(),
            'campaign_name' => $code->promotionCampaign?->name,
            'reward_display' => $code->promotionCampaign
                ? (float)$code->promotionCampaign->reward_value . ($code->promotionCampaign->reward_type->value === 'percentage' ? '%' : ' MAD') . ' OFF'
                : 'N/A',
        ];
    })->sortByDesc('issued_at')->values(); // Sort by issued_at to see the newest code first


    return response()->json([
        'data' => [
            'loyalty_points' => $currentPoints,
            'next_level_points' => $nextLevel,
            'points_to_next_level' => $pointsToNextLevel,
            'promotion_codes' => $transformedCodes,
        ]
    ]);
}
    /**
     * Store a newly created resource in storage.
     */
     public function store(Request $request)
    {
        // --- THIS IS THE UPDATED VALIDATION ---
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'loyalty_points' => 'sometimes|integer|min:0',
            'roles' => 'required|array|min:1', // Ensure 'roles' is an array with at least one item
            'roles.*' => [ // Validate each item in the array
                'required',
                'string',
                Rule::in(['admin', 'customer']), // The role must be either 'admin' or 'customer'
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        $user = User::create([
            'full_name' => $validatedData['full_name'],
            'email' => $validatedData['email'],
            'phone' => $validatedData['phone'] ?? null,
            'password' => Hash::make($validatedData['password']),
            'loyalty_points' => $validatedData['loyalty_points'] ?? 0,
        ]);

        // --- THIS IS THE UPDATED ROLE ASSIGNMENT ---
        // `syncRoles` is the recommended method from Spatie. It handles everything:
        // it removes old roles and adds the new ones provided.
        $user->syncRoles($validatedData['roles']);

        // Eager load the roles for the response
        $user->load('roles:id,name');

        return response()->json([
            'data' => $user,
            'message' => 'User created successfully.'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return response()->json(['data' => $this->transformUser($user)]);
    }

    /**
     * Update the specified resource in storage.
     */
    // ... inside the Admin\UserController class

    /**
     * Update the currently authenticated admin's own profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        // Dynamically build validation rules
        $rules = [
            'full_name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
        ];

        // Only validate for uniqueness if the email is actually being changed.
        if ($request->input('email') !== $user->email) {
            $rules['email'] = 'required|string|email|max:255|unique:users,email';
        } else {
            $rules['email'] = 'required|string|email|max:255';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        
        $user->update([
            'full_name' => $validatedData['full_name'] ?? $user->full_name,
            'email' => $validatedData['email'] ?? $user->email,
            'phone' => $validatedData['phone'] ?? $user->phone,
        ]);

        if (!empty($validatedData['password'])) {
            $user->password = Hash::make($validatedData['password']);
            $user->save();
        }

        return response()->json([
            'data' => $this->transformUser($user->fresh()),
            'message' => 'Your profile has been updated successfully.'
        ]);
    }


   public function update(Request $request, User $user)
    {
        // --- THIS IS THE UPDATED VALIDATION ---
        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes','required','string','email','max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed', // Password is now optional
            'loyalty_points' => 'sometimes|integer|min:0',
            'roles' => 'sometimes|required|array|min:1', // Ensure 'roles' is an array
            'roles.*' => [ // Validate each item
                'required',
                'string',
                Rule::in(['admin', 'customer']),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        // Update user's main details
        $user->update([
            'full_name' => $validatedData['full_name'] ?? $user->full_name,
            'email' => $validatedData['email'] ?? $user->email,
            'phone' => $validatedData['phone'] ?? $user->phone,
            'loyalty_points' => $validatedData['loyalty_points'] ?? $user->loyalty_points,
        ]);

        // Only update password if a new one was provided
        if (!empty($validatedData['password'])) {
            $user->password = Hash::make($validatedData['password']);
            $user->save();
        }

        // --- THIS IS THE UPDATED ROLE ASSIGNMENT ---
        // Sync roles if they were included in the request
        if (isset($validatedData['roles'])) {
            $user->syncRoles($validatedData['roles']);
        }

        // Eager load the fresh data for the response
        $user->load('roles:id,name');

        return response()->json([
            'data' => $user,
            'message' => 'User updated successfully.'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        if (Auth::id() === $user->id) {
            Log::warning('Admin/UserController@destroy: Attempt to delete self (User ID: ' . $user->id . ')');
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        Log::info('Admin/UserController@destroy: Attempting to delete User ID: ' . $user->id);
        $user->delete();
        Log::info('Admin/UserController@destroy: User deleted ID: ' . $user->id);

        return response()->json(['message' => 'User deleted successfully.'], 200);
    }

    /**
     * Fetch available roles for dropdowns.
     */
    public function fetchRoles(Request $request)
    {
        Log::info('Admin/UserController@fetchRoles: Fetching all roles.');
        $roles = Role::orderBy('name')->get(['id', 'name']);
        return response()->json(['data' => $roles]);
    }
}