<?php

namespace App\Http\Traits;

use App\Models\Booking;
use App\Models\Extra;

trait TransformsBookings
{
    /**
     * Transforms a Booking model into a consistent API response array.
     */
    public function transformBooking(Booking $booking): array
    {
        $booking->loadMissing([
            'renter:id,full_name,email,phone',
            'vehicle:id,license_plate,vehicle_model_id',
            'vehicle.vehicleModel:id,title,brand', // Ensure this field exists
            'insurancePlan:id,name,price_per_day',
            'promotionCode:id,code_string',
            'bookingExtras'
        ]);

        $bookingExtrasOutput = [];
        if ($booking->relationLoaded('bookingExtras') && $booking->bookingExtras) {
            $bookingExtrasOutput = $booking->bookingExtras->map(function (Extra $extra) {
                return [
                    'extra_id' => $extra->id,
                    'name' => $extra->name,
                    'quantity' => $extra->pivot->quantity,
                    'price_at_booking' => (float) $extra->pivot->price_at_booking,
                    'default_price_per_day' => (float) $extra->default_price_per_day,
                ];
            })->toArray();
        }

        return [
            'id' => $booking->id,
            'renter_user_id' => $booking->renter_user_id,
            'renter_name' => $booking->renter?->full_name,
            'renter_email' => $booking->renter?->email,
            'renter_phone' => $booking->renter?->phone,
            'vehicle_id' => $booking->vehicle_id,
            'vehicle_display' => $booking->vehicle?->vehicleModel
                ? $booking->vehicle->vehicleModel->title . ($booking->vehicle->year ? ' ' . $booking->vehicle->year : '') . ' (' . $booking->vehicle->license_plate . ')'
                : ($booking->vehicle?->license_plate),
            'vehicle_image_url' => $booking->vehicle?->vehicleModel?->main_image_url,
            'insurance_plan_id' => $booking->insurance_plan_id,
            'insurance_plan_name' => $booking->insurancePlan?->name,
            'promotion_code_id' => $booking->promotion_code_id,
            'promotion_code_string' => $booking->promotionCode?->code_string,
            'start_date' => $booking->start_date?->toDateTimeString(),
            'end_date' => $booking->end_date?->toDateTimeString(),
            'status' => $booking->status,
            'status_display' => $booking->status ? ($booking->status->label ?? ucfirst(str_replace('_', ' ', $booking->status->value))) : null,
            'calculated_base_price' => (float) $booking->calculated_base_price,
            'calculated_extras_price' => (float) $booking->calculated_extras_price,
            'calculated_insurance_price' => (float) $booking->calculated_insurance_price,
            'discount_amount_applied' => (float) $booking->discount_amount_applied,
            'discount_percentage' => $booking->discount_percentage,
            'final_price' => (float) $booking->final_price,
            'booking_extras' => $bookingExtrasOutput,
            'created_at' => $booking->created_at?->toDateTimeString(),
            'updated_at' => $booking->updated_at?->toDateTimeString(),
        ];
    }
}