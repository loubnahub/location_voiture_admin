<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20', // Adjust validation as needed
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        // Optionally, assign a default role upon registration
        // if (class_exists(\Spatie\Permission\Models\Role::class)) {
        //     $defaultRole = \Spatie\Permission\Models\Role::findByName('renter', 'web'); // or your default guard
        //     if ($defaultRole) {
        //         $user->assignRole($defaultRole);
        //     }
        // }


        // Optionally, log the user in and return a token immediately
        // $token = $user->createToken('api-token')->plainTextToken;
        // return response()->json([
        //     'message' => 'User registered successfully.',
        //     'user' => $user->only(['id', 'full_name', 'email']), // Return minimal user info
        //     'token' => $token
        // ], 201);

        return response()->json(['message' => 'User registered successfully. Please log in.'], 201);
    }

    /**
     * Authenticate the user and return a token.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
            'device_name' => 'nullable|string|max:255' // Optional: for naming the token
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials.'
                // Or more detailed if you prefer:
                // 'errors' => ['email' => ['These credentials do not match our records.']]
            ], 401); // Or 422 if you want to show field-specific errors
        }

        $user = Auth::user();
        // Revoke all old tokens to ensure only one active session per device name if desired, or manage multiple tokens
        // $user->tokens()->delete(); // This revokes ALL tokens for the user. Be careful.
        // Or target specific tokens: $user->tokens()->where('name', $request->input('device_name', 'default_device'))->delete();

        $token = $user->createToken($request->input('device_name', 'auth_token'))->plainTextToken;

        // Eager load roles and permissions to include in the response
        // The exact structure of roles/permissions might vary based on how you want to consume it on the frontend.
        $user->load(['roles:name', 'permissions:name']); // Load only names

        $roles = $user->roles->pluck('name');
        $permissions = $user->getAllPermissions()->pluck('name'); // getAllPermissions includes inherited ones

        return response()->json([
            'message' => 'Login successful.',
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'profile_picture_url' => $user->profile_picture_url,
                'loyalty_points' => $user->loyalty_points,
                'roles' => $roles,
                'permissions' => $permissions,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Get the authenticated User.
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $user->load(['roles:name', 'permissions:name']); // Eager load roles and permissions

        $roles = $user->roles->pluck('name');
        $permissions = $user->getAllPermissions()->pluck('name');

        return response()->json([
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'profile_picture_url' => $user->profile_picture_url,
            'loyalty_points' => $user->loyalty_points,
            'roles' => $roles,
            'permissions' => $permissions,
            // Add other fields as needed, respecting $hidden in User model
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     */
    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out.']);
    }
}