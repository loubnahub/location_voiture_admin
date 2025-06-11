<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
        ];
    }

    public function index(Request $request)
    {
        $query = Address::query();

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where('street_line_1', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('city', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('postal_code', 'LIKE', "%{$searchTerm}%");
        }
        
        if ($request->boolean('all')) {
            $addresses = $query->orderBy('city')->orderBy('street_line_1')->get();
            return response()->json(['data' => $addresses->map(fn($addr) => $this->transformAddress($addr))]);
        }

        $perPage = $request->input('per_page', 100);
        $paginatedAddresses = $query->orderBy('city')->orderBy('street_line_1')->paginate((int)$perPage);
        $paginatedAddresses->getCollection()->transform(fn($addr) => $this->transformAddress($addr));
        return response()->json($paginatedAddresses);
    }

    /**
     * The single, correct method for creating a new address.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'street_line_1' => 'required|string|max:255',
            'street_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $address = Address::create($validator->validated());

        return response()->json(['data' => $this->transformAddress($address), 'message' => 'Address created successfully.'], 201);
    }

    /**
     * The correct method for updating an existing address.
     */
    public function update(Request $request, Address $address)
    {
        $validator = Validator::make($request->all(), [
            'street_line_1' => 'sometimes|required|string|max:255',
            'street_line_2' => 'nullable|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $address->update($validator->validated());

        return response()->json(['data' => $this->transformAddress($address), 'message' => 'Address updated successfully.']);
    }

    /**
     * The correct method for deleting an address.
     */
    public function destroy(Address $address)
    {
        // Add a check here if you need to prevent deletion of addresses in use
        // For example: if ($address->vehicles()->exists()) { ... }

        $address->delete();

        return response()->json(['message' => 'Address deleted successfully.'], 200);
    }

    // You can keep this method for user-specific actions, but it's separate from the main CRUD
    public function storeForCurrentUser(Request $request)
    {
        // ... this method is fine as is ...
    }
}