<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role; // Use Spatie's Role model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth; // If you add authorization checks

// use Spatie\Permission\Models\Permission; // Import if managing permissions later

class RoleController extends Controller
{
    /**
     * Helper to transform role data for API response.
     */
    protected function transformRole(Role $role): array
    {
        // You might want to load permissions count or specific permissions later
        // $role->loadMissing('permissions:id,name');
        return [
            'id' => $role->id, // Spatie roles usually have integer auto-incrementing IDs by default
            'name' => $role->name,
            'guard_name' => $role->guard_name,
            'created_at' => $role->created_at ? $role->created_at->toDateTimeString() : null,
            'updated_at' => $role->updated_at ? $role->updated_at->toDateTimeString() : null,
            // 'permissions_count' => $role->permissions()->count(),
            // 'permissions' => $role->permissions->pluck('name')->toArray(), // Example
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Add authorization: e.g.,
        // if (Auth::check() && !Auth::user()->can('view roles')) {
        //     return response()->json(['message' => 'Forbidden: You do not have permission to view roles.'], 403);
        // }
        Log::info('Admin/RoleController@index: Fetching roles with params:', $request->all());

        $query = Role::query(); // Query directly on Spatie's Role model

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where('name', 'LIKE', "%{$searchTerm}%");
        }

        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        $allowedSorts = ['name', 'created_at']; // Spatie Role ID is usually int, so not UUID sortable
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('name', 'asc');
        }

        if ($request->boolean('all')) {
            $roles = $query->get();
            return response()->json(['data' => $roles->map(fn($role) => $this->transformRole($role))]);
        } else {
            $perPage = $request->input('per_page', config('pagination.default_per_page', 10));
            $rolesPaginated = $query->paginate((int)$perPage);
            $rolesPaginated->getCollection()->transform(fn($role) => $this->transformRole($role));
            return response()->json($rolesPaginated);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // if (Auth::check() && !Auth::user()->can('create roles')) { abort(403); }
        Log::info('Admin/RoleController@store: Request data:', $request->all());

        $defaultGuardName = config('auth.defaults.guard'); // Get default guard name

        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:125', // Max length for role names in Spatie default config
                Rule::unique('roles', 'name')->where(function ($query) use ($request, $defaultGuardName) {
                    // Scope uniqueness to the guard_name
                    return $query->where('guard_name', $request->input('guard_name', $defaultGuardName));
                }),
            ],
            'guard_name' => 'nullable|string|max:125',
            // 'permissions' => 'nullable|array', // For assigning permissions later
            // 'permissions.*' => 'string|exists:permissions,name', // Assuming permissions are identified by name
        ]);

        if ($validator->fails()) {
            Log::error('Admin/RoleController@store: Validation failed.', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        if (empty($validatedData['guard_name'])) {
            $validatedData['guard_name'] = $defaultGuardName; // Use default guard if not provided
        }

        $role = Role::create([
            'name' => $validatedData['name'],
            'guard_name' => $validatedData['guard_name'],
        ]);
        Log::info('Admin/RoleController@store: Role created with ID: ' . $role->id . ' and Name: ' . $role->name);

        // if (!empty($validatedData['permissions'])) {
        //     $role->syncPermissions($validatedData['permissions']);
        //     Log::info('Admin/RoleController@store: Permissions synced for role: ' . $role->name);
        // }

        return response()->json([
            'data' => $this->transformRole($role->refresh()),
            'message' => 'Role created successfully.'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role) // Route model binding for Spatie's Role
    {
        // if (Auth::check() && !Auth::user()->can('view roles')) { abort(403); }
        return response()->json(['data' => $this->transformRole($role)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        // if (Auth::check() && !Auth::user()->can('edit roles')) { abort(403); }
        Log::info('Admin/RoleController@update: Request data for Role ID ' . $role->id . ':', $request->all());
        $defaultGuardName = $role->guard_name; // Use existing guard name as default for unique check

        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes', // Make 'name' optional if other fields can be updated without it
                'required',
                'string',
                'max:125',
                Rule::unique('roles', 'name')->ignore($role->id)->where(function ($query) use ($request, $defaultGuardName) {
                     // Scope uniqueness to the guard_name being used for update or existing one
                    return $query->where('guard_name', $request->input('guard_name', $defaultGuardName));
                }),
            ],
            // guard_name is typically not changed after role creation, but if you allow it:
            // 'guard_name' => 'sometimes|required|string|max:125',
            // 'permissions' => 'sometimes|array',
            // 'permissions.*' => 'string|exists:permissions,name',
        ]);

        if ($validator->fails()) {
            Log::error('Admin/RoleController@update: Validation failed for Role ID ' . $role->id, $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        // Only update fields that are present in validatedData
        $role->fill($validatedData);
        $role->save();

        Log::info('Admin/RoleController@update: Role updated for ID: ' . $role->id);

        // if ($request->has('permissions')) { // Only sync if 'permissions' key is present
        //     $permissionsToSync = $validatedData['permissions'] ?? [];
        //     $role->syncPermissions($permissionsToSync);
        //     Log::info('Admin/RoleController@update: Permissions synced for role: ' . $role->name);
        // }

        return response()->json([
            'data' => $this->transformRole($role->refresh()),
            'message' => 'Role updated successfully.'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        // if (Auth::check() && !Auth::user()->can('delete roles')) { abort(403); }

        if (in_array($role->name, config('permission.protected_roles', ['super-admin', 'admin']))) {
            Log::warning('Admin/RoleController@destroy: Attempt to delete protected role: ' . $role->name);
            return response()->json(['message' => 'Cannot delete protected system role: ' . $role->name], 403);
        }
        if ($role->users()->count() > 0) {
            Log::warning('Admin/RoleController@destroy: Attempt to delete role in use: ' . $role->name);
            return response()->json(['message' => 'Cannot delete role: ' . $role->name . ' as it is currently assigned to ' . $role->users()->count() . ' user(s).'], 409);
        }

        Log::info('Admin/RoleController@destroy: Attempting to delete Role ID: ' . $role->id . ' Name: ' . $role->name);
        $role->delete(); // Spatie handles detaching permissions and users (from model_has_roles)
        Log::info('Admin/RoleController@destroy: Role deleted.');

        return response()->json(['message' => 'Role deleted successfully.'], 200);
    }
}