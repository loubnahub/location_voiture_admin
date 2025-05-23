<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking; // For dropdown
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use App\Enums\PaymentStatus;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Payment::with('booking:id'); // Eager load booking reference

        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('method', 'like', "%{$searchTerm}%")
                  ->orWhere('transaction_id', 'like', "%{$searchTerm}%")
                  ->orWhere('notes', 'like', "%{$searchTerm}%")
                  ->orWhereHas('booking', function ($bq) use ($searchTerm) {
                      $bq->where('id', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Handle basic sorting if needed, e.g., by payment_date
        $payments = $query->orderBy('payment_date', 'desc')->paginate($request->input('per_page', 15));

        // Transform data if needed, e.g., to include booking_reference directly
        $payments->getCollection()->transform(function ($payment) {
            $payment->booking_reference_display = $payment->booking ? $payment->booking->id : 'N/A';
            // You might want to format dates or status labels here too if not handled by frontend
            // $payment->status_label = $payment->status->label();
            return $payment;
        });


        return response()->json([
            'data' => $payments->items(),
            'current_page' => $payments->currentPage(),
            'last_page' => $payments->lastPage(),
            'per_page' => $payments->perPage(),
            'total' => $payments->total(),
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|string|exists:bookings,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'method' => 'required|string|max:255',
            'status' => ['required', new Enum(PaymentStatus::class)],
            'transaction_id' => 'nullable|string|max:255|unique:payments,transaction_id',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::create($validator->validated());

        $payment->load('booking:id'); // Load for immediate response
        $payment->booking_reference_display = $payment->booking ? $payment->booking->id : 'N/A';

        return response()->json(['data' => $payment, 'message' => 'Payment recorded successfully.'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        $payment->load('booking:id');
        $payment->booking_reference_display = $payment->booking ? $payment->booking->id : 'N/A';
        return response()->json(['data' => $payment]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'sometimes|required|string|exists:bookings,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'payment_date' => 'sometimes|required|date',
            'method' => 'sometimes|required|string|max:255',
            'status' => ['sometimes', 'required', new Enum(PaymentStatus::class)],
            'transaction_id' => 'nullable|string|max:255|unique:payments,transaction_id,' . $payment->id,
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment->update($validator->validated());
        $payment->load('booking:id');
        $payment->booking_reference_display = $payment->booking ? $payment->booking->id : 'N/A';

        return response()->json(['data' => $payment, 'message' => 'Payment updated successfully.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        // Add any business logic before deletion, e.g., cannot delete completed payments
        // if ($payment->status === PaymentStatus::COMPLETED) {
        //     return response()->json(['message' => 'Cannot delete completed payments.'], 403);
        // }
        $payment->delete();
        return response()->json(['message' => 'Payment deleted successfully.']);
    }

    // --- Additional methods for dropdowns ---
    public function getPaymentStatusOptions()
    {
        return response()->json(['data' => PaymentStatus::forDropdown()]);
    }
}