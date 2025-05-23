<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Rental Agreement - Booking #{{ substr($booking->id, 0, 8) }}</title>
    <style>
        @page { margin: 20mm; }
        body { font-family: 'DejaVu Sans', 'Helvetica', sans-serif; line-height: 1.5; font-size: 11px; color: #333; }
        .header-container { display: block; width: 100%; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .logo { float: left; width: auto; max-width: 200px; /* Allow logo to size naturally up to a max width */ }
        .logo h2 { margin:0; color:#007bff; font-size: 18px; line-height: 1.2; }
        .logo img { max-width: 100%; max-height: 60px; display: block; }
        .company-info { float: right; text-align: right; font-size: 10px; max-width: 50%; }
        .company-info h3 { margin: 0 0 5px 0; color: #007bff; font-size: 14px; }
        .clear { clear: both; height: 0; line-height: 0; } /* Better clear fix */
        h1.agreement-title { text-align: center; color: #333; font-size: 20px; margin-bottom: 5px; text-transform: uppercase; }
        .agreement-meta { text-align: center; font-size: 10px; margin-bottom: 25px; color: #555; }
        .section { margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 4px; }
        .section-title { font-size: 14px; font-weight: bold; color: #007bff; margin-top: 0; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #007bff; }
        table.info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .info-table th, .info-table td { border: 1px solid #ddd; padding: 6px; text-align: left; vertical-align: top; }
        .info-table th { background-color: #f8f9fa; font-weight: bold; width: 30%; }
        table.pricing-summary { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .pricing-summary th, .pricing-summary td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .pricing-summary th { background-color: #e9ecef; }
        .pricing-summary .total-row th, .pricing-summary .total-row td { font-weight: bold; background-color: #dee2e6; }
        .pricing-summary ul { margin: 0; padding-left: 15px; font-size: 10px; }
        .terms-conditions { font-size: 9px; line-height: 1.4; text-align: justify; }
        .signatures-container { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; }
        .signature-block { width: 48%; display: inline-block; vertical-align: top; margin-bottom: 20px; }
        .signature-block.left { margin-right: 2%; }
        .signature-line { border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px; }
        .signature-block p { margin: 5px 0; }
        .footer { text-align: center; font-size: 9px; color: #777; position: fixed; bottom: -15mm; /* Adjust based on @page margin */ left: 0mm; right: 0mm; height: 10mm; }
        .page-number:before { content: "Page " counter(page); }
        .two-column-section .column { width: 48%; display: inline-block; vertical-align: top; }
        .two-column-section .column.left { margin-right: 2%; }
        .na-placeholder { color: #777; font-style: italic; }
    </style>
</head>
<body>
    <div class="header-container">
        <div class="logo">
            {{-- To use an image from public/img/logo.png --}}
            {{-- <img src="{{ public_path('img/logo.png') }}" alt="Company Logo"/> --}}
            <h2>YOUR COMPANY NAME</h2> {{-- Replace with your actual company name --}}
        </div>
        <div class="company-info">
            <h3>Your Company Legal Name</h3>
            <p>
                123 Your Street, Your City, Postal Code<br>
                Phone: (555) 123-4567 | Email: contact@yourcompany.com<br>
                Website: www.yourcompany.com
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

    <div class="section two-column-section">
        <div class="column left">
            <h3 class="section-title">Renter Information</h3>
            <table class="info-table">
                <tr><th>Name:</th><td>{{ $booking->renter?->full_name ?? 'N/A' }}</td></tr>
                <tr><th>Email:</th><td>{{ $booking->renter?->email ?? 'N/A' }}</td></tr>
                <tr><th>Phone:</th><td>{{ $booking->renter?->phone ?? 'N/A' }}</td></tr>
                <tr><th>Address:</th><td>{{ $booking->renter?->defaultAddress?->full_address_string ?? 'N/A' }}</td></tr>
            </table>
        </div>
        <div class="column right">
            <h3 class="section-title">Vehicle Information</h3>
            <table class="info-table">
                <tr><th>Vehicle:</th><td>{{ $booking->vehicle?->vehicleModel?->title ?? 'N/A' }}</td></tr>
                <tr><th>License Plate:</th><td>{{ $booking->vehicle?->license_plate ?? 'N/A' }}</td></tr>
                <tr><th>VIN:</th><td>{{ $booking->vehicle?->vin ?? 'N/A' }}</td></tr>
                <tr><th>Make:</th><td>{{ $booking->vehicle?->vehicleModel?->brand ?? ($booking->vehicle?->make_legacy ?? 'N/A') }}</td></tr>
                <tr><th>Model:</th><td>{{ $booking->vehicle?->vehicleModel?->title ?? ($booking->vehicle?->model_legacy ?? 'N/A') }}</td></tr>
                <tr><th>Year:</th><td><span class="na-placeholder">{{ $booking->vehicle?->vehicleModel?->year ?? 'N/A' }}</span></td></tr> {{-- Changed to a placeholder if 'year' field doesn't exist on vehicle model --}}
                <tr><th>Color:</th><td>{{ $booking->vehicle?->color ?? 'N/A' }}</td></tr>
                <tr><th>Mileage Out:</th><td><span class="na-placeholder">_________ miles/km</span></td></tr>
            </table>
        </div>
        <div class="clear"></div>
    </div>

    <div class="section">
        <h3 class="section-title">Rental Details</h3>
        <table class="info-table">
            <tr><th>Booking ID:</th><td>{{ $booking->id }}</td></tr>
            <tr><th>Pickup Date & Time:</th><td>{{ $booking->start_date?->format('F j, Y, g:i a') ?? 'N/A' }}</td></tr>
            <tr><th>Pickup Location:</th><td><span class="na-placeholder">{{ $booking->pickupLocation?->full_address_string ?? 'As per booking confirmation' }}</span></td></tr>
            <tr><th>Return Date & Time:</th><td>{{ $booking->end_date?->format('F j, Y, g:i a') ?? 'N/A' }}</td></tr>
            <tr><th>Return Location:</th><td><span class="na-placeholder">{{ $booking->dropoffLocation?->full_address_string ?? 'As per booking confirmation' }}</span></td></tr>
        </table>
    </div>

    <div class="section">
        <h3 class="section-title">Pricing Summary</h3>
        <table class="pricing-summary">
            <thead><tr><th>Description</th><th style="text-align:right;">Amount (MAD)</th></tr></thead>
            <tbody>
                <tr><td>Base Rental Charge</td><td style="text-align:right;">{{ number_format($booking->calculated_base_price ?? 0, 2) }}</td></tr>
                
                @if(($booking->calculated_extras_price ?? 0) > 0 && $booking->bookingExtras?->count() > 0)
                    <tr>
                        <td colspan="2" style="padding: 5px 8px 2px 8px; font-weight:bold; background-color: #f8f9fa;">Extras:</td>
                    </tr>
                    @foreach($booking->bookingExtras as $bookedExtra) {{-- $bookedExtra is an App\Models\Extra instance --}}
                        <tr>
                            <td style="padding-left: 25px;">
                                {{ $bookedExtra->name ?? 'Unknown Extra' }}
                                @if(isset($bookedExtra->pivot) && $bookedExtra->pivot->quantity > 0)
                                    (Quantity: {{ $bookedExtra->pivot->quantity }}
                                    @if(isset($bookedExtra->pivot->price_at_booking))
                                        x {{ number_format($bookedExtra->pivot->price_at_booking, 2) }} MAD
                                    @endif
                                    )
                                @endif
                            </td>
                            @if(isset($bookedExtra->pivot) && isset($bookedExtra->pivot->quantity) && isset($bookedExtra->pivot->price_at_booking))
                                <td style="text-align:right;">{{ number_format($bookedExtra->pivot->quantity * $bookedExtra->pivot->price_at_booking, 2) }}</td>
                            @else
                                <td style="text-align:right;"><span class="na-placeholder"></span></td>
                            @endif
                        </tr>
                    @endforeach
                @endif

                @if($booking->insurancePlan && ($booking->calculated_insurance_price ?? 0) > 0)
                    <tr><td>Insurance: {{ $booking->insurancePlan->name ?? 'N/A' }}</td><td style="text-align:right;">{{ number_format($booking->calculated_insurance_price, 2) }}</td></tr>
                @endif
                @if(($booking->discount_amount_applied ?? 0) > 0)
                    <tr><td>Discount Applied</td><td style="text-align:right;">-{{ number_format($booking->discount_amount_applied, 2) }}</td></tr>
                @endif
                <tr class="total-row"><th>Grand Total</th><th style="text-align:right;">{{ number_format($booking->final_price ?? 0, 2) }}</th></tr>
            </tbody>
        </table>
    </div>

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
        <p>Renter has declined optional insurance coverage or will provide their own. Renter is responsible for all damages as per the terms of this agreement.</p>
    </div>
    @endif

    <div class="section">
        <h3 class="section-title">Terms and Conditions</h3>
        <div class="terms-conditions">
            <p><strong>PLEASE READ CAREFULLY.</strong> This agreement binds you to its terms and conditions.</p>
            <p><em>[Your Company Name] (hereinafter referred to as "the Platform") agrees to rent the vehicle described herein to the Renter subject to all terms and conditions of this Agreement.</em></p>
            <ol>
                <li><strong>Definitions:</strong> "Agreement" refers to this Rental Agreement. "Renter" refers to the individual(s) listed above and any authorized additional drivers. "Vehicle" refers to the specific vehicle rented.</li>
                <li><strong>Rental Period:</strong> The rental period commences and terminates as specified in the "Rental Details" section.</li>
                <li><strong>Authorized Use:</strong> The Vehicle shall be operated only by the Renter and pre-approved additional drivers. The Vehicle must not be used: (a) by anyone under the influence of alcohol or narcotics; (b) for any illegal purpose; (c) to carry persons or property for hire; (d) to propel or tow any vehicle or trailer; (e) in any race, test, or contest; (f) outside the permitted geographical area [Specify if any, e.g., "within Morocco"]; (g) if the Vehicle is obtained from the Platform by fraud or misrepresentation.</li>
                <li><strong>Return of Vehicle:</strong> Renter shall return the Vehicle to the agreed return location on or before the specified return date and time, in the same condition as received, ordinary wear and tear excepted. Late returns may incur additional charges.</li>
                <li><strong>Fuel:</strong> Vehicle must be returned with the fuel level indicated at "Fuel Level Out". If returned with less, Renter will be charged for refueling at a rate of [Specify Rate, e.g., X MAD per liter] plus a service fee.</li>
                <li><strong>Charges & Payment:</strong> Renter agrees to pay all charges specified in this Agreement, including rental charges, mileage (if applicable), taxes, fees, charges for loss or damage to the Vehicle, fines, tolls, and administrative fees for handling such items.</li>
                <li><strong>Responsibility for Loss or Damage:</strong> Renter is responsible for all loss or damage to the Vehicle, regardless of fault (unless covered by purchased insurance and subject to its terms and deductible). This includes but is not limited to collision, theft, vandalism, tire damage, and glass breakage.</li>
                <li><strong>Accidents & Theft:</strong> Renter must immediately report any accident, theft, or vandalism involving the Vehicle to the Platform and to the police or relevant authorities. Renter must provide a full written report and cooperate fully with the Platform's investigation.</li>
                <li><strong>Indemnification:</strong> Renter agrees to indemnify and hold harmless the Platform, its agents, and employees from and against all claims, liabilities, costs, and expenses arising out of or connected with the Renter's use or possession of the Vehicle.</li>
                <li><strong>Personal Property:</strong> The Platform is not responsible for loss or damage to any personal property left, stored, or transported by Renter or any other person in or upon the Vehicle.</li>
                {{-- ADD MORE OF YOUR SPECIFIC TERMS AND CONDITIONS --}}
                <li><strong>Governing Law:</strong> This Agreement shall be governed by and construed in accordance with the laws of [Your Country/Jurisdiction, e.g., Morocco].</li>
            </ol>
            <p><em>By signing below, Renter acknowledges having read, understood, and agreed to all terms and conditions on all pages of this Rental Agreement.</em></p>
        </div>
    </div>

    <div class="signatures-container">
        <div class="signature-block left">
            <p><strong>Renter's Acknowledgement & Signature:</strong></p>
            <div class="signature-line">
                @if($agreement_signed_by_renter_at)
                    <em style="font-size:10px;">Electronically Signed on {{ \Carbon\Carbon::parse($agreement_signed_by_renter_at)->format('F j, Y, g:i a') }}</em>
                @endif
            </div>
            <p>Printed Name: {{ $booking->renter?->full_name ?? '____________________' }}</p>
            <p>Date: {{ $agreement_signed_by_renter_at ? \Carbon\Carbon::parse($agreement_signed_by_renter_at)->format('F j, Y') : '____________________' }}</p>
        </div>
        <div class="signature-block right">
            <p><strong>Platform Representative Signature:</strong></p>
            <p>For and on behalf of: YOUR COMPANY NAME</p>
            <div class="signature-line">
                 @if($agreement_signed_by_platform_at)
                    <em style="font-size:10px;">Electronically Signed on {{ \Carbon\Carbon::parse($agreement_signed_by_platform_at)->format('F j, Y, g:i a') }}</em>
                @endif
            </div>
            <p>Printed Name: ____________________</p>
            <p>Date: {{ $agreement_signed_by_platform_at ? \Carbon\Carbon::parse($agreement_signed_by_platform_at)->format('F j, Y') : '____________________' }}</p>
        </div>
        <div class="clear"></div>
    </div>

    <div class="footer">
        YOUR COMPANY NAME - Rental Agreement | Booking #{{ substr($booking->id, 0, 8) }} | <span class="page-number"></span>
    </div>

    {{-- Script for dompdf page numbering (if CSS content: counter(page) doesn't work well for you) --}}
    {{-- <script type="text/php">
        if (isset($pdf)) {
            $text = "Page {PAGE_NUM} of {PAGE_COUNT}";
            $size = 8;
            $font = $fontMetrics->getFont("DejaVu Sans", "normal");
            $width = $fontMetrics->getTextWidth($text, $font, $size);
            $x = ($pdf->get_width() - $width) / 2; // Center
            $y = $pdf->get_height() - ($pdf->get_option('margin_bottom') / 2) - ($size / 2) ; // Position in bottom margin
            $pdf->text($x, $y, $text, $font, $size);
        }
    </script> --}}
</body>
</html>