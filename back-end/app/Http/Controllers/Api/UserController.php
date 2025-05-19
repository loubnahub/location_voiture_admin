<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User; // Your existing User model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role; // For Spatie role validation

class UserController extends Controller
{
    public function __construct()
    {
        // Optional: Apply middleware for authorization
        // $this->middleware('role:admin')->except(['show']); // Example
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query()->with('roles'); // Eager load Spatie roles

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('full_name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('phone', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        if (in_array($sortBy, ['full_name', 'email', 'created_at']) && in_array($sortDirection, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortDirection);
        }

        if ($request->boolean('all')) {
            $users = $query->get();
            // When returning collections directly, relationships like 'roles' will be included
            // if they are in $user->getRelations() (from with('roles')) or accessible via appends.
            // Spatie's roles are typically handled well.
            return response()->json($users);
        }

        $paginatedUsers = $query->paginate($request->input('per_page', 10));
        // The paginator object itself will be converted to JSON, including the 'data' array of users.
        return response()->json($paginatedUsers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $availableRoles = Role::pluck('name')->toArray();

        $validatedData = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'roles' => 'required|array',
            'roles.*' => ['required', Rule::in($availableRoles)],
            'default_address_id' => 'nullable|uuid|exists:addresses,id',
            'profile_picture_url' => 'nullable|url|max:2048',
            'loyalty_points' => 'nullable|integer|min:0',
        ]);

        $user = User::create([
            'full_name' => $validatedData['full_name'],
            'email' => $validatedData['email'],
            'phone' => $validatedData['phone'],
            'password' => $validatedData['password'], // Hashed by model's $casts
            'default_address_id' => $validatedData['default_address_id'] ?? null,
            'profile_picture_url' => $validatedData['profile_picture_url'] ?? null,
            'loyalty_points' => $validatedData['loyalty_points'] ?? 0,
        ]);

        if (!empty($validatedData['roles'])) {
            $user->assignRole($validatedData['roles']);
        }

        $user->load('roles'); // Eager load roles before returning
        return response()->json($user, 201); // Return the created user model directly
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user) // Route model binding
    {
        $user->load('roles', 'defaultAddress'); // Eager load desired relationships
        return response()->json($user); // Return the user model directly
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $availableRoles = Role::pluck('name')->toArray();

        $validatedData = $request->validate([
            'full_name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes','required','string','email','max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => ['nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'roles' => 'sometimes|array',
            'roles.*' => ['sometimes','required', Rule::in($availableRoles)],
            'default_address_id' => 'nullable|uuid|exists:addresses,id',
            'profile_picture_url' => 'nullable|url|max:2048',
            'loyalty_points' => 'nullable|integer|min:0',
        ]);
        
        $updateData = [];
        if ($request->has('full_name')) $updateData['full_name'] = $validatedData['full_name'];
        if ($request->has('email')) $updateData['email'] = $validatedData['email'];
        if ($request->has('phone')) $updateData['phone'] = $validatedData['phone'];
        if ($request->has('default_address_id')) $updateData['default_address_id'] = $validatedData['default_address_id'];
        if ($request->has('profile_picture_url')) $updateData['profile_picture_url'] = $validatedData['profile_picture_url'];
        if ($request->has('loyalty_points')) $updateData['loyalty_points'] = $validatedData['loyalty_points'];

        if (!empty($validatedData['password'])) {
            $updateData['password'] = $validatedData['password']; // Hashed by model
        }

        if (!empty($updateData)) {
            $user->update($updateData);
        }

        if ($request->has('roles') && !empty($validatedData['roles'])) {
            $user->syncRoles($validatedData['roles']);
        }
        
        $user->load('roles'); // Eager load roles after update
        return response()->json($user->fresh()->load('roles', 'defaultAddress')); // Return updated user model
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Add authorization checks
        $user->delete();
        return response()->json(['message' => 'User deleted successfully.'], 200);
    }
}