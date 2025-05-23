<?php

namespace App\Http\Controllers\Api\Admin; // Note the Admin namespace

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role; // Import Spatie Role model
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Helper to transform user data for API response.
     */
    protected function transformUser(User $user): array
    {
        $user->loadMissing(['roles:id,name', 'defaultAddress']); // Eager load roles and defaultAddress

        return [
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'profile_picture_url' => $user->profile_picture_url, // You might want Storage::url() if storing relative paths
            'loyalty_points' => (int) $user->loyalty_points,
            'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toDateTimeString() : null,
            'created_at' => $user->created_at->toDateTimeString(),
            'updated_at' => $user->updated_at->toDateTimeString(),
            'roles' => $user->roles->map(fn($role) => ['id' => $role->id, 'name' => $role->name])->toArray(), // Array of role objects
            'role_names' => $user->getRoleNames()->toArray(), // Array of role name strings
            'default_address_summary' => $user->defaultAddress ? $user->defaultAddress->getSummaryAttribute() : null, // Assuming Address model has a getSummaryAttribute
            'default_address_id' => $user->default_address_id,
        ];
    }

    /**
     * Display a listing of the resource.
     * (Corresponds to fetchAllUsersForAdmin in your api.js)
     */
    public function index(Request $request)
    {
        // Add authorization: e.g., if (!Auth::user()->can('view users')) { abort(403); }
        Log::info('Admin/UserController@index: Fetching users with params:', $request->all());

        $query = User::query()->with(['roles:id,name']); // Eager load roles

        // Search
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('full_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('phone', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $roleName = $request->input('role');
            $query->whereHas('roles', function ($q) use ($roleName) {
                $q->where('name', $roleName);
            });
        }

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
            return response()->json(['data' => $users->map(fn($user) => $this->transformUser($user))]);
        } else {
            $perPage = $request->input('per_page', config('pagination.default_per_page', 10));
            $usersPaginated = $query->paginate((int)$perPage);
            $usersPaginated->getCollection()->transform(fn($user) => $this->transformUser($user));
            return response()->json($usersPaginated);
        }
    }

    /**
     * Store a newly created resource in storage.
     * (Corresponds to createUserAdmin in your api.js)
     */
    public function store(Request $request)
    {
        // if (!Auth::user()->can('create users')) { abort(403); }
        Log::info('Admin/UserController@store: Request data:', $request->all());

        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:25', // Add phone validation if needed
            'password' => ['required', 'string', Password::defaults(), 'confirmed'], // Requires password_confirmation field
            'profile_picture_url' => 'nullable|url|max:2048',
            'loyalty_points' => 'nullable|integer|min:0',
            'roles' => 'nullable|array', // Expects an array of role names or IDs
            'roles.*' => ['string', Rule::exists('roles', 'name')], // Validate each role name exists
            // 'default_address_id' => 'nullable|uuid|exists:addresses,id', // If managing address link
        ]);

        if ($validator->fails()) {
            Log::error('Admin/UserController@store: Validation failed.', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $roleNames = $validatedData['roles'] ?? [];
        unset($validatedData['roles']); // Remove before User::create

        $validatedData['password'] = Hash::make($validatedData['password']); // Hash password

        $user = User::create($validatedData);
        Log::info('Admin/UserController@store: User created with ID: ' . $user->id);

        if (!empty($roleNames)) {
            $user->syncRoles($roleNames); // Assign roles by name
            Log::info('Admin/UserController@store: Roles synced for user ID ' . $user->id . ':', $roleNames);
        }

        return response()->json([
            'data' => $this->transformUser($user->refresh()),
            'message' => 'User created successfully.'
        ], 201);
    }

    /**
     * Display the specified resource.
     * (Corresponds to fetchUserAdmin in your api.js)
     */
    public function show(User $user) // Route model binding
    {
        // if (!Auth::user()->can('view users')) { abort(403); }
        return response()->json(['data' => $this->transformUser($user)]);
    }

    /**
     * Update the specified resource in storage.
     * (Corresponds to updateUserAdmin in your api.js)
     */
    public function update(Request $request, User $user)
    {
        // if (!Auth::user()->can('edit users')) { abort(403); }
        Log::info('Admin/UserController@update: Request data for User ID ' . $user->id . ':', $request->all());

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes','required','string','email','max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:25',
            'password' => ['nullable', 'string', Password::defaults(), 'confirmed'], // Password change is optional
            'profile_picture_url' => 'nullable|url|max:2048',
            'loyalty_points' => 'nullable|integer|min:0',
            'roles' => 'sometimes|array', // 'sometimes' means if 'roles' key is present, then it must be an array
            'roles.*' => ['string', Rule::exists('roles', 'name')],
            // 'default_address_id' => 'nullable|uuid|exists:addresses,id',
        ]);

        if ($validator->fails()) {
            Log::error('Admin/UserController@update: Validation failed for User ID ' . $user->id, $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        if (!empty($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        } else {
            unset($validatedData['password']); // Don't update password if not provided
        }

        $roleNames = null;
        if ($request->has('roles')) { // Check if 'roles' key was explicitly sent
            $roleNames = $validatedData['roles'] ?? []; // Use validated roles, default to empty if key sent but null
        }
        unset($validatedData['roles']); // Remove before $user->update

        $user->update($validatedData);
        Log::info('Admin/UserController@update: User base data updated for ID: ' . $user->id);

        if ($roleNames !== null) { // Only sync roles if 'roles' key was part of the request
            $user->syncRoles($roleNames);
            Log::info('Admin/UserController@update: Roles synced for user ID ' . $user->id . ':', $roleNames);
        }

        return response()->json([
            'data' => $this->transformUser($user->refresh()),
            'message' => 'User updated successfully.'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * (Corresponds to deleteUserAdmin in your api.js)
     */
    public function destroy(User $user)
    {
        // if (!Auth::user()->can('delete users')) { abort(403); }

        // Business logic: Cannot delete currently authenticated user? Cannot delete last admin?
        if (Auth::id() === $user->id) {
            Log::warning('Admin/UserController@destroy: Attempt to delete self (User ID: ' . $user->id . ')');
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }
        // Add more checks if needed, e.g., preventing deletion of the only user with a super-admin role.

        Log::info('Admin/UserController@destroy: Attempting to delete User ID: ' . $user->id);
        // Spatie roles/permissions are typically detached automatically via model events or foreign key constraints
        $user->delete();
        Log::info('Admin/UserController@destroy: User deleted ID: ' . $user->id);

        return response()->json(['message' => 'User deleted successfully.'], 200);
    }

    /**
     * Fetch available roles for dropdowns.
     * (Corresponds to fetchAvailableRoles in your api.js)
     */
    public function fetchRoles(Request $request)
    {
        // Optional: Authorization check if only certain users can see all roles
        // if (!Auth::user()->can('view roles')) { abort(403); }
        Log::info('Admin/UserController@fetchRoles: Fetching all roles.');
        $roles = Role::orderBy('name')->get(['id', 'name']); // Get only id and name
        return response()->json(['data' => $roles]);
    }
}