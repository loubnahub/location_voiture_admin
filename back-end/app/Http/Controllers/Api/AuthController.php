<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\Address;

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
        // 1. Validate all incoming data from the React form.
        // The keys here match the 'name' attributes of your form inputs.
        $validator = Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:25',
            'address' => 'required|string|max:255', // This maps to 'street_line_1'
            'city' => 'required|string|max:255',
            'postalCode' => 'required|string|max:20',
            'country' => 'required|string|max:255',
            'profilePicture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // 2MB Max
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Use a Database Transaction for safety.
        // If any step fails, the entire process is rolled back.
        try {
            DB::beginTransaction();

            // 3. Create the User
            $user = User::create([
                'full_name' => $request->fullName,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
            ]);

            // 4. Create the Address and link it to the new user
            $address = Address::create([
                'user_id' => $user->id,
                'street_line_1' => $request->address,
                'city' => $request->city,
                'postal_code' => $request->postalCode,
                'country' => $request->country,
                'is_default_billing' => true, // Make it the default
                'is_default_shipping' => true,
            ]);

            // Set the default address foreign keys on the user model
            $user->default_billing_address_id = $address->id;
            $user->default_shipping_address_id = $address->id;

            // 5. Handle the Profile Picture Upload
            if ($request->hasFile('profilePicture')) {
                // Store in `storage/app/public/profiles` and get the path.
                // Ensure you've run `php artisan storage:link`.
                $path = $request->file('profilePicture')->store('profiles', 'public');
                $user->profile_photo_path = $path;
            }

            $user->save(); // Save the user again to store default address IDs and photo path

            if (method_exists($user, 'assignRole')) {
                $user->assignRole('customer');
            }

            DB::commit();

            // 6. Create an authentication token for automatic login
            $token = $user->createToken('auth_token')->plainTextToken;

            // 7. Return a success response with token and user data
            return response()->json([
                'message' => 'Registration successful!',
                'user' => $user->fresh(),
                'token' => $token,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Registration failed: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred during registration.'], 500);
        }
    }
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