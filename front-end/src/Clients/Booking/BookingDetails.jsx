import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaEuroSign, FaFileInvoice, FaCar, FaShieldAlt, FaChevronLeft } from 'react-icons/fa';
import { fetchBooking } from '../../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- INVOICE TEMPLATE WITH LOGO IMAGE ---
const InvoiceTemplate = React.forwardRef(({ booking }, ref) => {
    if (!booking) return null;

    // Helper to get status display and color
    const getInvoiceStatus = (status) => {
        // Assuming booking.status is the enum string like 'completed'
        switch (status) {
            case 'completed':
                return { text: 'Paid', color: '#16a34a', bg: '#dcfce7' };
            case 'active':
                return { text: 'In Progress', color: '#2563eb', bg: '#dbeafe' };
            case 'confirmed':
                 return { text: 'Due', color: '#f59e0b', bg: '#fef3c7' };
            default:
                return { text: 'N/A', color: '#6b7280', bg: '#f3f4f6' };
        }
    };
    const invoiceStatus = getInvoiceStatus(booking.status?.value || booking.status);

    // Dummy data for line items
    const lineItems = [
        { description: `Car Rental (${booking.vehicle_display})`, amount: (booking.final_price * 0.80).toFixed(2) },
        { description: `Insurance (${booking.insurance_plan_name || 'Standard'})`, amount: (booking.final_price * 0.05).toFixed(2) },
        { description: 'Platform & Service Fees', amount: (booking.final_price * 0.15).toFixed(2) },
    ];
    
    return (
        <div ref={ref} style={{
            position: 'absolute', left: '-9999px', top: 0,
            width: '8.5in',
            height: '11in',
            padding: '0.5in',
            backgroundColor: 'white',
            color: '#111827',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            fontSize: '12px'
        }}>
            {/* Header Section */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f59e0b', paddingBottom: '20px' }}>
                <div>
                    {/* <<< CHANGE HERE: Replaced H1 with IMG tag for the logo */}
                    <img
                        src="\images\Logo\Logoblue.png" // This path points to your `public` folder
                        alt="Recalo Logo"
                        style={{ height: '150px', width: '180px', marginBottom: '10px' }}
                    />
                    <p style={{ margin: '5px 0 0', color: '#6b7280' }}>123 Car Street, Paris, France</p>
                    <p style={{ margin: '2px 0 0', color: '#6b7280' }}>contact@recalo.com | +33 1 23 45 67 89</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '1.75rem', margin: 0, color: '#007BFF' }}>INVOICE</h2>
                    <p style={{ margin: '5px 0 0' }}><strong>Invoice #:</strong> {booking.id.substring(0, 8).toUpperCase()}</p>
                    <p style={{ margin: '2px 0 0' }}><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}</p>
                    
                </div>
            </header>

            {/* Billing Information Section */}
            <section style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <div>
                    <h3 style={{ color: '#6b7280', fontWeight: 'bold', margin: 0, fontSize: '11px', textTransform: 'uppercase' }}>Billed To</h3>
                    <p style={{ margin: '5px 0 0', fontWeight: 'bold', fontSize: '14px' }}>{booking.renter_name || 'Valued Customer'}</p>
                    <p style={{ margin: '2px 0 0', color: '#4b5563' }}>{booking.renter_email || 'email@example.com'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                     <h3 style={{ color: '#6b7280', fontWeight: 'bold', margin: 0, fontSize: '11px', textTransform: 'uppercase' }}>Booking Period</h3>
                     <p style={{ margin: '5px 0 0' }}>
                        {new Date(booking.start_date).toLocaleDateString('en-GB')} - {new Date(booking.end_date).toLocaleDateString('en-GB')}
                     </p>
                </div>
            </section>

            {/* Line Items Table */}
            <table style={{ width: '100%', marginTop: '40px', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', borderBottom: '1px solid #e5e7eb' }}>Description</th>
                        <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', borderBottom: '1px solid #e5e7eb' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {lineItems.map((item, index) => (
                         <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{item.description}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>{item.amount} €</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Subtotal</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{booking.final_price.toFixed(2)} €</td>
                    </tr>
                    <tr style={{ borderTop: '2px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem' }}>Total</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: '#007BFF' }}>{booking.final_price.toFixed(2)} €</td>
                    </tr>
                </tfoot>
            </table>

            {/* Footer Section */}
            <footer style={{ position: 'absolute', bottom: '0.5in', left: '0.5in', right: '0.5in', textAlign: 'center', color: '#6b7280', fontSize: '11px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                <p style={{ margin: 0 }}>Thank you for choosing Recalo. We hope you enjoyed your ride!</p>
                <p style={{ margin: '5px 0 0' }}>If you have any questions, please contact our support.</p>
            </footer>
        </div>
    );
});


// --- THE MAIN DETAILS COMPONENT (No changes needed here) ---
const BookingDetails = () => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const invoiceRef = useRef();

    useEffect(() => {
        const loadBookingDetails = async () => {
            try {
                setLoading(true);
                const response = await fetchBooking(bookingId);
                setBooking(response.data.data);
            } catch (err) {
                console.error("Failed to fetch booking details:", err);
                setError("Could not load booking details. It might not exist or an error occurred.");
            } finally {
                setLoading(false);
            }
        };

        if (bookingId) {
            loadBookingDetails();
        }
    }, [bookingId]);

    const handleDownloadInvoice = () => {
        const input = invoiceRef.current;
        html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-Recalo-${booking.id.substring(0, 8)}.pdf`);
        });
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    if (loading) return <div className="tw-text-center tw-py-24 tw-text-gray-300">Loading Booking Details...</div>;
    if (error) return <div className="tw-text-center tw-py-24 tw-text-red-400">{error}</div>;
    if (!booking) return null;

    return (
        <div className="tw-bg-brand-bg tw-min-h-screen tw-p-4 sm:tw-p-8">
            <div className='tw-mt-28'></div>
            <div className="tw-max-w-4xl tw-mx-auto">
                 <Link to="/" className="tw-inline-flex tw-items-center tw-gap-2 tw-text-brand-amber hover:tw-text-yellow-400 tw-mb-6">
                    <FaChevronLeft />
                    Back to Home
                </Link>

                <div className="tw-bg-brand-card tw-rounded-xl tw-p-6 sm:tw-p-8 tw-border tw-border-gray-700">
                    <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start tw-pb-6 tw-border-b tw-border-gray-700">
                        <div>
                            <h1 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-white">{booking.vehicle_display}</h1>
                            <p className="tw-text-gray-400">Booking ID: #{booking.id}</p>
                        </div>
                        <button
                            onClick={handleDownloadInvoice}
                            className="tw-mt-4 sm:tw-mt-0 tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-brand-amber tw-text-black tw-font-bold tw-rounded-lg hover:tw-bg-yellow-400 tw-transition-colors">
                            <FaFileInvoice />
                            Download Invoice
                        </button>
                    </div>

                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-py-6">
                        <div className="tw-flex tw-items-start tw-gap-4">
                            <FaCalendarAlt className="tw-text-brand-amber tw-text-xl tw-mt-1" />
                            <div>
                                <h3 className="tw-text-gray-400 tw-font-semibold">Booking Period</h3>
                                <p className="tw-text-white">{formatDate(booking.start_date)}</p>
                                <p className="tw-text-gray-400 tw-text-sm">to</p>
                                <p className="tw-text-white">{formatDate(booking.end_date)}</p>
                            </div>
                        </div>

                        <div className="tw-flex tw-items-start tw-gap-4">
                            <FaEuroSign className="tw-text-brand-amber tw-text-xl tw-mt-1" />
                            <div>
                                <h3 className="tw-text-gray-400 tw-font-semibold">Total Cost</h3>
                                <p className="tw-text-white tw-text-2xl tw-font-bold">{Number(booking.final_price).toFixed(2).replace('.', ',')} €</p>
                                <p className="tw-text-gray-500 tw-text-sm">Includes taxes and fees</p>
                            </div>
                        </div>

                        <div className="tw-flex tw-items-start tw-gap-4">
                            <FaCar className="tw-text-brand-amber tw-text-xl tw-mt-1" />
                            <div>
                                <h3 className="tw-text-gray-400 tw-font-semibold">Vehicle</h3>
                                <p className="tw-text-white">{booking.vehicle_display}</p>
                            </div>
                        </div>

                        <div className="tw-flex tw-items-start tw-gap-4">
                            <FaShieldAlt className="tw-text-brand-amber tw-text-xl tw-mt-1" />
                            <div>
                                <h3 className="tw-text-gray-400 tw-font-semibold">Insurance</h3>
                                <p className="tw-text-white">{booking.insurance_plan_name || 'Standard'}</p>
                                <p className="tw-text-gray-500 tw-text-sm">Included in the price</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* The hidden invoice template is still here, but now with the new design */}
            <InvoiceTemplate ref={invoiceRef} booking={booking} />
        </div>
    );
};

export default BookingDetails;