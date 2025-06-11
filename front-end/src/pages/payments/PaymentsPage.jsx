import React, { useCallback } from 'react';
import ResourcePage from '../../components/ResourcePage'; // Adjust: Path to your OLD ResourcePage
import PaymentModalFormFields from '../../components/payments/PaymentModalFormFields'; // Adjust path
import {
    // Define these API service functions
    fetchAllPayments,
    createPayment,
    updatePayment,
    deletePayment,
    // fetchBookingsForDropdown, // Already used in ModalFormFields
    // fetchPaymentStatusOptions // If fetching from backend
} from '../../services/api'; // Adjust path
import { LuCreditCard } from 'react-icons/lu'; // Example Icon
import { Badge } from 'react-bootstrap';
import { PaymentStatus as PaymentStatusEnum } from '../../Enums'; // Adjust path
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

// --- Columns for the Payments Table ---
const paymentColumns = [
    {
        header: 'Booking Ref',
        key: 'booking_reference_display', // From controller transform or eager load
        render: (item) => item.booking_reference_display || <span className="text-muted-custom">N/A</span>
    },
    {
        header: 'Amount',
        key: 'amount',
        render: (item) => `${parseFloat(item.amount || 0).toFixed(2)} MAD` // Assuming currency
    },
    {
        header: 'Payment Date',
        key: 'payment_date',
        render: (item) => item.payment_date ? new Date(item.payment_date).toLocaleString() : 'N/A'
    },
    { header: 'Method', key: 'method' },
    {
        header: 'Status',
        key: 'status',
        render: (item) => {
            const statusObj = PaymentStatusEnum[Object.keys(PaymentStatusEnum).find(key => PaymentStatusEnum[key].value === item.status)];
            const label = statusObj ? statusObj.label : (item.status || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            let badgeBg = 'secondary';
            if (item.status === PaymentStatusEnum.COMPLETED.value) badgeBg = 'success';
            else if (item.status === PaymentStatusEnum.PENDING.value) badgeBg = 'warning';
            else if (item.status === PaymentStatusEnum.FAILED.value) badgeBg = 'danger';
            else if (item.status === PaymentStatusEnum.REFUNDED.value) badgeBg = 'info';
            return <Badge bg={badgeBg}>{label}</Badge>;
        }
    },
    { header: 'Transaction ID', key: 'transaction_id', render: (item) => item.transaction_id || <span className="text-muted-custom">N/A</span> },
    { header: 'Notes', key: 'notes', render: (item) => item.notes ? item.notes.substring(0, 30) + '...' : <span className="text-muted-custom">N/A</span> },
];

// --- Initial Form Data for the Modal ---
const initialPaymentFormData = {
    id: null,
    booking_id: '',
    amount: '',
    payment_date: new Date().toISOString().slice(0, 16), // Default to now for datetime-local
    method: '',
    status: PaymentStatusEnum.PENDING.value, // Default to pending
    transaction_id: '',
    notes: '',
};

// Helper to process data before sending to API
// In PaymentPage.jsx
const processPaymentDataForSubmit = (data) => {
    const processed = { ...data };
    console.log("[processPaymentDataForSubmit] Original data.payment_date:", data.payment_date);

    if (processed.payment_date && typeof processed.payment_date === 'string') {
        let dateToFormat = processed.payment_date;

        try {
            // Attempt to parse the date string, regardless of its initial format (T, Z, space, etc.)
            // This is robust for various ISO-like inputs.
            const d = new Date(dateToFormat);

            if (!isNaN(d.getTime())) { // Check if date is valid after parsing
                const year = d.getFullYear();
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                const day = d.getDate().toString().padStart(2, '0');
                
                // Get hours, minutes, seconds based on the parsed date.
                // If the original string had 'Z' or timezone info, new Date() would have
                // converted it to the local timezone of the browser/JS environment.
                // If your backend strictly expects UTC, this might need further adjustment
                // to re-convert to UTC before formatting. For now, assuming local time is fine
                // or backend handles timezone conversion from YYYY-MM-DD HH:MM:SS.
                const hours = d.getHours().toString().padStart(2, '0');
                const minutes = d.getMinutes().toString().padStart(2, '0');
                const seconds = d.getSeconds().toString().padStart(2, '0'); // Always include seconds

                processed.payment_date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            } else {
                // If parsing fails, it's an invalid date string.
                // Let backend validation catch it, or set to null if appropriate for your app.
                console.warn("[processPaymentDataForSubmit] Could not parse date string into a valid Date object:", dateToFormat);
                // If you want to send null for invalid dates instead of letting backend validate:
                // processed.payment_date = null;
            }
        } catch (e) {
            console.error("[processPaymentDataForSubmit] Error during date processing:", dateToFormat, e);
            // Fallback: send null or let backend validation handle the original malformed string.
            // processed.payment_date = null;
        }

    } else if (data.hasOwnProperty('payment_date') && !processed.payment_date) {
        // If payment_date was present in original data but is now falsy (e.g., "" from cleared input, or explicit null)
        // Send null if the backend column is nullable and this is the desired behavior for "empty".
        processed.payment_date = null;
    }
    // If payment_date was not in data at all, it remains absent from 'processed' unless explicitly added.

    console.log("[processPaymentDataForSubmit] Final processed.payment_date for API:", processed.payment_date);
    return processed;
};
const PaymentPage = () => {
    const renderModalFormLogic = useCallback((
        currentItemData,
        handleModalInputChange,
        modalFormErrors,
        isEditMode,
        setCurrentItemData // Available from OLD ResourcePage
    ) => {
        return (
            <PaymentModalFormFields
                formData={currentItemData}
                handleInputChange={handleModalInputChange}
                modalFormErrors={modalFormErrors}
                isEditMode={isEditMode}
                // setCurrentItemData is not needed by PaymentModalFormFields itself
            />
        );
    }, []);

    return (
        <ResourcePage
            resourceName="Payment"
            resourceNamePlural="Payments"
            IconComponent={LuCreditCard}
            columns={paymentColumns}
            initialFormData={initialPaymentFormData}
            fetchAllItems={fetchAllPayments}
            createItem={(data) => createPayment(processPaymentDataForSubmit(data))}
            updateItem={(id, data) => updatePayment(id, processPaymentDataForSubmit(data))}
            deleteItem={deletePayment}
            renderModalForm={renderModalFormLogic}
            searchPlaceholder="Search by booking ref, method, transaction ID..."
            // Add canCreate={true} if not default in your ResourcePage
        />
    );
};

export default PaymentPage;