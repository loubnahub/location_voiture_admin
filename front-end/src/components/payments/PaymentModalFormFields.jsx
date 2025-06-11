import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
// Assuming you have an API service to fetch bookings for dropdown
import { fetchBookingsForDropdown } from '../../services/api'; // Adjust path
import { paymentStatusOptions } from '../../Enums'; // Adjust path
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

const PaymentModalFormFields = ({ formData, handleInputChange, modalFormErrors, isEditMode }) => {
    const [bookings, setBookings] = useState([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);

    useEffect(() => {
        const loadDropdowns = async () => {
            setLoadingDropdowns(true);
            try {
                // Replace with your actual API call for bookings
                const bookingsRes = await fetchBookingsForDropdown(); // Example API call
                setBookings(bookingsRes.data.data || []);
            } catch (error) {
                console.error("Error fetching bookings for payment form:", error);
                setBookings([]);
            } finally {
                setLoadingDropdowns(false);
            }
        };
        loadDropdowns();
    }, []);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            // Format for 'datetime-local' input: YYYY-MM-DDTHH:MM
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
            console.error("Error formatting date for input:", dateString, e);
            return '';
        }
    };

    if (loadingDropdowns && !isEditMode) {
        return <div className="text-center p-3"><Spinner animation="border" size="sm" /> Loading options...</div>;
    }
    if (!formData) {
        return <p>Loading form data...</p>;
    }

    return (
        <>
            <Form.Group className="mb-3" controlId="paymentBookingId">
                <Form.Label>Booking <span className="text-danger">*</span></Form.Label>
                <Form.Select
                    name="booking_id"
                    value={formData.booking_id || ''}
                    onChange={handleInputChange}
                    required
                    isInvalid={!!modalFormErrors?.booking_id}
                    disabled={loadingDropdowns || isEditMode} // Often can't change booking on edit
                >
                    <option value="">Select Booking...</option>
                    {bookings.map(booking => (
                       <option key={booking.id} value={booking.id}>
            {/* Adjust how you display the booking in the dropdown */}
            Booking ID: {booking.id.substring(0, 8)}...
            {/* Or if you added a display_label from backend: {booking.display_label} */}
        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{modalFormErrors?.booking_id?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="paymentAmount">
                        <Form.Label>Amount <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            name="amount"
                            value={formData.amount || ''}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                            isInvalid={!!modalFormErrors?.amount}
                        />
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.amount?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="paymentDate">
                        <Form.Label>Payment Date <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="payment_date"
                            value={formatDateForInput(formData.payment_date)}
                            onChange={handleInputChange}
                            required
                            isInvalid={!!modalFormErrors?.payment_date}
                        />
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.payment_date?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="paymentMethod">
                        <Form.Label>Payment Method <span className="text-danger">*</span></Form.Label>
                        <Form.Control // Or Form.Select if you have predefined methods
                            type="text"
                            name="method"
                            value={formData.method || ''}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., Credit Card, Cash"
                            isInvalid={!!modalFormErrors?.method}
                        />
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.method?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="paymentStatus">
                        <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            name="status"
                            value={formData.status || ''}
                            onChange={handleInputChange}
                            required
                            isInvalid={!!modalFormErrors?.status}
                        >
                            <option value="">Select Status...</option>
                            {paymentStatusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.status?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3" controlId="paymentTransactionId">
                <Form.Label>Transaction ID (Optional)</Form.Label>
                <Form.Control
                    type="text"
                    name="transaction_id"
                    value={formData.transaction_id || ''}
                    onChange={handleInputChange}
                    isInvalid={!!modalFormErrors?.transaction_id}
                />
                <Form.Control.Feedback type="invalid">{modalFormErrors?.transaction_id?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="paymentNotes">
                <Form.Label>Notes (Optional)</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    isInvalid={!!modalFormErrors?.notes}
                />
                <Form.Control.Feedback type="invalid">{modalFormErrors?.notes?.join(', ')}</Form.Control.Feedback>
            </Form.Group>
        </>
    );
};

export default PaymentModalFormFields;