<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Helper to transform the authenticated user for API response.
     * This ensures the format matches your frontend expectations perfectly.
     */
    private function transformAuthenticatedUser(User $user)
    {
        // Eager load the roles to make sure they are available.
        $user->load('roles');

        return [
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'profile_picture_url' => $user->profile_picture_url,
            // CRITICAL: Use getRoleNames() to return a simple array like ['admin', 'customer']
            'roles' => $user->getRoleNames()->toArray(),
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
        ];
    }

    /**
     * Handle user registration.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create($validated);

        // --- FIXED ROLE NAME ---
        // Assign the 'customer' role, which exists in your database.
        $user->assignRole('customer');
        
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $this->transformAuthenticatedUser($user),
            'token' => $token
        ], 201);
    }

    /**
     * Handle user login.
     */
  // In app/Http/Controllers/Api/AuthController.php

    /**
     * Handle user login.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'The provided credentials do not match our records.'
            ], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // It's good practice to delete old tokens
        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        // --- THIS IS THE FIX ---
        // Return BOTH the user object (using your transformer) AND the token.
        return response()->json([
            'user' => $this->transformAuthenticatedUser($user),
            'token' => $token
        ]);
    }

    /**
     * Handle user logout for both SPA and API tokens.
     */
 // In app/Http/Controllers/Api/AuthController.php

    /**
     * Handle user logout for both SPA and API tokens.
     */
   // In app/Http/Controllers/Api/AuthController.php

/**
 * Handle user logout for both SPA and API tokens.
 */
public function logout(Request $request)
{
    /** @var \App\Models\User $user */
    $user = $request->user();

    // Check if the user was authenticated via an API token.
    // The `token()` method returns a PersonalAccessToken instance if so.
    if ($user && method_exists($user, 'token') && $user->token()) {
        $user->token()->delete(); // Delete the specific token used for the request.
    }
    
    // Invalidate the session for SPA-based authentication.
    // This is safe to run even if the user wasn't authenticated via session.
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return response()->json([
        'message' => 'Successfully logged out'
    ]);
}
    

    /**
     * Get the authenticated User.
     * This is the method for the GET /api/user route.
     */
    public function user(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        // This is a redundant check, but good for safety.
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Use the same universal transformer to guarantee the data format.
        return response()->json($this->transformAuthenticatedUser($user));
    }
}