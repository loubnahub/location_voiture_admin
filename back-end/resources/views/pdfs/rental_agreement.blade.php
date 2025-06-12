<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Rental Agreement - Booking #{{ substr($booking->id, 0, 8) }}</title>
    <style>
        @page { margin: 20mm; }
        body { font-family: 'DejaVu Sans', 'Helvetica', sans-serif; line-height: 1.5; font-size: 11px; color: #333; }
        .header-container { width: 100%; margin-bottom: 30px; border-bottom: 2px solid #0d6efd; padding-bottom: 10px; }
        .logo { float: left; width: auto; }
        .logo h2 { margin:0; color:#0d6efd; font-size: 24px; line-height: 1.2; font-weight: bold; }
        .company-info { float: right; text-align: right; font-size: 10px; max-width: 50%; }
        .company-info h3 { margin: 0 0 5px 0; color: #0d6efd; font-size: 14px; }
        .clear { clear: both; }
        h1.agreement-title { text-align: center; color: #333; font-size: 20px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
        .agreement-meta { text-align: center; font-size: 10px; margin-bottom: 25px; color: #555; }
        .section { margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 4px; }
        .section-title { font-size: 14px; font-weight: bold; color: #0d6efd; margin-top: 0; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #0d6efd; }
        table.info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .info-table th, .info-table td { border: 1px solid #ddd; padding: 6px; text-align: left; vertical-align: top; }
        .info-table th { background-color: #f8f9fa; font-weight: bold; width: 30%; }
        table.pricing-summary { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .pricing-summary th, .pricing-summary td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .pricing-summary th { background-color: #e9ecef; }
        .pricing-summary .subtotal-row td { border-top: 2px solid #ccc; }
        .pricing-summary .discount-row td { color: #198754; font-weight: bold; }
        .pricing-summary .total-row th, .pricing-summary .total-row td { font-weight: bold; background-color: #dee2e6; border-top: 2px solid #333; }
        .terms-conditions { font-size: 9px; line-height: 1.4; text-align: justify; }
        .signatures-container { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; }
        .signature-line { border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px; }
        .signature-block p { margin: 5px 0; }
        .footer { text-align: center; font-size: 9px; color: #777; position: fixed; bottom: -15mm; left: 0mm; right: 0mm; height: 10mm; }
        .page-number:before { content: "Page " counter(page); }
        .na-placeholder { color: #777; font-style: italic; }
    </style>
</head>
<body>
    <div class="header-container">
        <div class="logo">

           <img src='{{$logo_base64}}' width='200px'/>
        </div>
        <div class="company-info">
            <h3>RECALO Car Rentals</h3>
            <p>
                Oujda, Lazaret Street, Morocco<br>
                Phone: +212 6 06 60 44 05 | Email: contact@recalo.ma<br>
                Website: www.recalo.ma
            </p>
        </div>
        <div class="clear"></div>
    </div>

    <h1 class="agreement-title">Rental Agreement</h1>
    <p class="agreement-meta">
        <strong>Agreement ID:</strong> <span class="na-placeholder">{{ $agreement_id ?? 'Pending Finalization' }}</span> |
        <strong>Date Generated:</strong> {{ $agreement_date ? \Carbon\Carbon::parse($agreement_date)->format('F j, Y, g:i a') : now()->format('F j, Y, g:i a') }} |
        <strong>Booking Ref:</strong> {{ substr($booking->id, 0, 8) }}
    </p>

    <!-- Renter and Vehicle Information Sections (Table Layout) -->
    <table style="width: 100%; border-spacing: 10px 0; border-collapse: separate; margin-bottom: 15px;">
        <tr>
            <td style="width: 50%; vertical-align: top; padding: 0;">
                <div class="section" style="margin: 0;">
                    <h3 class="section-title">Renter Information</h3>
                    <table class="info-table">
                        <tr><th>Name:</th><td>{{ $booking->renter?->full_name ?? 'N/A' }}</td></tr>
                        <tr><th>Email:</th><td>{{ $booking->renter?->email ?? 'N/A' }}</td></tr>
                        <tr><th>Phone:</th><td>{{ $booking->renter?->phone ?? 'N/A' }}</td></tr>
                    </table>
                </div>
            </td>
            <td style="width: 50%; vertical-align: top; padding: 0;">
                <div class="section" style="margin: 0;">
                    <h3 class="section-title">Vehicle Information</h3>
                    <table class="info-table">
                        <tr><th>Vehicle:</th><td>{{ $booking->vehicle?->vehicleModel?->brand ?? '' }} {{ $booking->vehicle?->vehicleModel?->title ?? 'N/A' }}</td></tr>
                        <tr><th>License Plate:</th><td>{{ $booking->vehicle?->license_plate ?? 'N/A' }}</td></tr>
                        <tr><th>VIN:</th><td>{{ $booking->vehicle?->vin ?? 'N/A' }}</td></tr>
                        <tr><th>Year:</th><td>{{ $booking->vehicle?->vehicleModel->year ?? 'N/A' }}</td></tr>
                        <tr><th>Color:</th><td>{{ $booking->vehicle?->color ?? 'N/A' }}</td></tr>
                        <tr><th>Mileage Out:</th><td>
                            @if($booking->vehicle?->mileage)
                                {{ number_format($booking->vehicle?->mileage) }} km
                            @else
                                <span class="na-placeholder">_________ km</span>
                            @endif
                        </td></tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <!-- Rental Details Section -->
    <div class="section">
        <h3 class="section-title">Rental Details</h3>
        <table class="info-table">
            <tr><th>Booking ID:</th><td>{{ $booking->id }}</td></tr>
            <tr><th>Pickup Date & Time:</th><td>{{ $booking->start_date?->format('F j, Y, g:i a') ?? 'N/A' }}</td></tr>
            <tr><th>Return Date & Time:</th><td>{{ $booking->end_date?->format('F j, Y, g:i a') ?? 'N/A' }}</td></tr>
            <tr><th>Pickup Location:</th><td><span class="na-placeholder">{{ $booking->pickupLocation?->full_address_string ?? 'As per booking confirmation' }}</span></td></tr>
        </table>
    </div>

    <!-- Pricing Summary Section -->
    <div class="section">
        <h3 class="section-title">Pricing Summary</h3>
        <table class="pricing-summary">
            <thead><tr><th>Description</th><th style="text-align:right;">Amount (MAD)</th></tr></thead>
            <tbody>
                <tr>
                    <td>Base Rental Charge</td>
                    <td style="text-align:right;">{{ number_format($booking->calculated_base_price ?? 0, 2) }}</td>
                </tr>
                
                @if(($booking->calculated_extras_price ?? 0) > 0 && $booking->bookingExtras?->isNotEmpty())
                    @foreach($booking->bookingExtras as $bookedExtra)
                        <tr>
                            <td style="padding-left: 20px;">
                                Extra: {{ $bookedExtra->name ?? 'Unknown' }} ({{ $bookedExtra->pivot->quantity }} × {{ number_format($bookedExtra->pivot->price_at_booking, 2) }})
                            </td>
                            <td style="text-align:right;">{{ number_format($bookedExtra->pivot->quantity * $bookedExtra->pivot->price_at_booking, 2) }}</td>
                        </tr>
                    @endforeach
                @endif

                @if($booking->insurancePlan && ($booking->calculated_insurance_price ?? 0) > 0)
                    <tr>
                        <td>Insurance: {{ $booking->insurancePlan->name ?? 'N/A' }}</td>
                        <td style="text-align:right;">{{ number_format($booking->calculated_insurance_price, 2) }}</td>
                    </tr>
                @endif

                <tr class="subtotal-row">
                    <td><strong>Subtotal</strong></td>
                    <td style="text-align:right;"><strong>{{ number_format(($booking->calculated_base_price ?? 0) + ($booking->calculated_extras_price ?? 0) + ($booking->calculated_insurance_price ?? 0), 2) }}</strong></td>
                </tr>

                @if(($booking->discount_amount_applied ?? 0) > 0)
                    <tr class="discount-row">
                        <td>
                            Discount Applied
                            @if($booking->promotionCode)
                                (Code: {{ $booking->promotionCode->code_string }})
                            @endif
                        </td>
                        <td style="text-align:right;">-{{ number_format($booking->discount_amount_applied, 2) }}</td>
                    </tr>
                @endif

                <tr class="total-row">
                    <th>Grand Total</th>
                    <th style="text-align:right;">{{ number_format($booking->final_price ?? 0, 2) }}</th>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Insurance and Terms Sections -->
    @if($booking->insurancePlan)
    <div class="section">
        <h3 class="section-title">Insurance Coverage</h3>
        <p><strong>Plan Selected:</strong> {{ $booking->insurancePlan->name ?? 'N/A' }}</p>
        <p><strong>Description:</strong> {{ $booking->insurancePlan->description ?? 'N/A' }}</p>
        <p><strong>Deductible:</strong> {{ $booking->insurancePlan->deductible_amount ? number_format($booking->insurancePlan->deductible_amount, 2) . ' MAD' : 'N/A' }}</p>
    </div>
    @else
    <div class="section">
        <h3 class="section-title">Insurance Coverage</h3>
        <p>Renter has declined optional insurance coverage. Renter is responsible for all damages up to the full value of the vehicle as per the terms of this agreement.</p>
    </div>
    @endif

    <div class="section">
        <h3 class="section-title">Terms and Conditions</h3>
        <div class="terms-conditions">
            <p><strong>PLEASE READ CAREFULLY.</strong> This agreement binds you to its terms and conditions.</p>
            <p><em>RECALO (hereinafter referred to as "the Platform") agrees to rent the vehicle described herein to the Renter subject to all terms and conditions of this Agreement.</em></p>
            <ol>
                <li><strong>Definitions:</strong> "Agreement" refers to this Rental Agreement. "Renter" refers to the individual(s) listed above. "Vehicle" refers to the specific vehicle rented.</li>
                <li><strong>Authorized Use:</strong> The Vehicle shall be operated only by the Renter. It must not be used: (a) by anyone under the influence of alcohol or narcotics; (b) for any illegal purpose; (c) outside Morocco without prior written consent.</li>
                <li><strong>Return of Vehicle:</strong> Renter shall return the Vehicle to the agreed return location on or before the specified return date and time, in the same condition as received, ordinary wear and tear excepted.</li>
                <li><strong>Charges & Payment:</strong> Renter agrees to pay all charges specified herein. Late returns will be charged at a full daily rate.</li>
                <li><strong>Responsibility for Loss or Damage:</strong> Renter is responsible for all loss or damage to the Vehicle, regardless of fault (unless covered by purchased insurance and subject to its terms and deductible).</li>
                <li><strong>Accidents & Theft:</strong> Renter must immediately report any accident or theft involving the Vehicle to the Platform and to the police.</li>
                <li><strong>Indemnification:</strong> Renter agrees to indemnify and hold harmless the Platform from all claims arising out of the Renter's use of the Vehicle.</li>
                <li><strong>Governing Law:</strong> This Agreement shall be governed by the laws of Morocco.</li>
            </ol>
            <p><em>By signing below, Renter acknowledges having read, understood, and agreed to all terms and conditions on all pages of this Rental Agreement.</em></p>
        </div>
    </div>

    <!-- Signatures Section (Table Layout) -->
    <div class="signatures-container">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="width: 50%; padding-right: 20px; vertical-align: top;">
                    <p><strong>Renter's Signature:</strong></p>
                    <div class="signature-line">
                        @if($agreement_signed_by_renter_at)
                            <em style="font-size:10px;">Electronically Signed on {{ \Carbon\Carbon::parse($agreement_signed_by_renter_at)->format('F j, Y, g:i a') }}</em>
                        @endif
                    </div>
                    <p>Printed Name: {{ $booking->renter?->full_name ?? '____________________' }}</p>
                </td>
                <td style="width: 50%; padding-left: 20px; vertical-align: top;">
                    <p><strong>For and on behalf of RECALO:</strong></p>
                    <div class="signature-line">
                         @if($agreement_signed_by_platform_at)
                            <em style="font-size:10px;">Electronically Signed on {{ \Carbon\Carbon::parse($agreement_signed_by_platform_at)->format('F j, Y, g:i a') }}</em>
                        @endif
                    </div>
                    <p>Platform Representative</p>
                </td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer">
        RECALO Car Rentals | Agreement for Booking #{{ substr($booking->id, 0, 8) }} | <span class="page-number"></span>
    </div>
</body>
</html>