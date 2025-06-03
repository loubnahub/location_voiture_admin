<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    protected function transformAddress(Address $address) {
        return [
            'id' => $address->id,
            'street_line_1' => $address->street_line_1,
            'street_line_2' => $address->street_line_2,
            'city' => $address->city,
            'postal_code' => $address->postal_code,
            'country' => $address->country,
            'notes' => $address->notes,
            // Add user full_name if this address is linked to a user and you want to display it
            // 'user_full_name' => $address->user ? $address->user->full_name : null,
        ];
    }

    public function index(Request $request)
    {
        // For now, let's make it public for the dropdown.
        // Add permission checks later if needed.

        $query = Address::query();

        // Add search if needed for an address management page
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where('street_line_1', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('city', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('postal_code', 'LIKE', "%{$searchTerm}%");
        }

        // For dropdowns, we usually want all addresses (or a relevant subset)
        // The { all: true } param from frontend indicates this.
        if ($request->boolean('all')) {
            $addresses = $query->orderBy('city')->orderBy('street_line_1')->get();
            return response()->json(['data' => $addresses->map(fn($addr) => $this->transformAddress($addr))]);
        }

        // Default to pagination if not requesting all
        $perPage = $request->input('per_page', 100); // Default to more for dropdowns if not 'all'
        $paginatedAddresses = $query->orderBy('city')->orderBy('street_line_1')->paginate((int)$perPage);
        $paginatedAddresses->getCollection()->transform(fn($addr) => $this->transformAddress($addr));

        return response()->json($paginatedAddresses);
    }

    // You can add store, show, update, destroy methods later if you build a full CRUD for Addresses.
    // For now, the index method is most important for the dropdown.

    // Example store method for user's own addresses (from your api.php routes)
    public function storeForCurrentUser(Request $request)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'street_line_1' => 'required|string|max:255',
            'street_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'notes' => 'nullable|string',
        ]);

        // Add user_id if your Address model has a user_id foreign key
        // $address = $user->addresses()->create($validated);
        // For now, assuming Address is general or linked via User's default_address_id

        $address = Address::create($validated); // This will get a new UUID via HasUuid trait

        // Optionally set as default if a flag is passed
        if ($request->boolean('set_as_default') && $user) {
            $user->default_address_id = $address->id;
            $user->save();
        }

        return response()->json(['data' => $this->transformAddress($address), 'message' => 'Address created.'], 201);
    }
    public function update(Request $request, Address $address)
{
    $validatedData = $request->validate([
        'street_line_1' => 'nullable|string|max:255',
        'street_line_2' => 'nullable|string|max:255',
        'city' => 'nullable|string|max:100',
        'postal_code' => 'nullable|string|max:20',
        'country' => 'nullable|string|max:100',
        'notes' => 'nullable|string',
    ]);

    $address->update($validatedData);
    return response()->json(['data' => $address, 'message' => 'Address updated successfully.']);
}
public function store(Request $request)
{
    $validatedData = $request->validate([
        'street_line_1' => 'nullable|string|max:255',
        'street_line_2' => 'nullable|string|max:255',
        'city' => 'nullable|string|max:100',
        'postal_code' => 'nullable|string|max:20',
        'country' => 'nullable|string|max:100',
        'notes' => 'nullable|string',
    ]);

    Address::create($validatedData);
    return response()->json(['data' => $address, 'message' => 'Address updated successfully.']);
}
    // Add updateForCurrentUser, destroyForCurrentUser, etc.
}