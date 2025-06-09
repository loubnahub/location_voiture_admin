import React, { useCallback } from 'react'; // Added useCallback
import ResourcePage from '../../components/ResourcePage'; // Adjust path (Ensure this is the OLD ResourcePage)
import PromotionCodeModalFormFields from '../../components/promotions/PromotionCodeModalFormFields'; // Adjust path
import {
    fetchAllPromotionCodes,
    createPromotionCode,
    updatePromotionCode,
    deletePromotionCode
} from '../../services/api'; // Adjust path
import { LuTicket, LuClock, LuBan } from 'react-icons/lu';
import { Badge } from 'react-bootstrap';
import { PromotionCodeStatus as PromotionCodeStatusEnum } from '../../Enums'; // Adjust path
import { CheckCircle, XCircle } from 'lucide-react'; // Corrected import
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

// --- Columns for the Promotion Code Table ---
const codeColumns = [
    { header: 'Code', key: 'code_string', render: (item) => <strong>{item.code_string}</strong> },
    { header: 'Campaign', key: 'campaign_name', render: (item) => item.campaign_name || <span className="text-muted-custom">N/A</span> },
    { header: 'User', key: 'user_name', render: (item) => item.user_name ? `${item.user_name} (${item.user_email || 'No Email'})` : <Badge bg="light" text="dark" pill>Generic</Badge> }, // Changed badge for better contrast
    {
        header: 'Status',
        key: 'status_display',
        textAlign: 'center',
        render: (item) => {
            let badgeBg = 'secondary';
            let icon = <LuClock size={14} className="me-1" />;
            const statusValue = (typeof item.status === 'object' && item.status !== null) ? item.status.value : item.status;

            switch (statusValue) {
                case PromotionCodeStatusEnum.ACTIVE.value:
                    badgeBg = 'success';
                    icon = <CheckCircle size={14} className="me-1" />;
                    break;
                case PromotionCodeStatusEnum.USED.value:
                    badgeBg = 'primary';
                    icon = <CheckCircle size={14} className="me-1" />;
                    break;
                case PromotionCodeStatusEnum.EXPIRED.value:
                    badgeBg = 'warning';
                    icon = <LuClock size={14} className="me-1" />;
                    break;
                case PromotionCodeStatusEnum.INACTIVE.value: // Assuming INACTIVE is defined in your enum
                    badgeBg = 'danger'; // Or 'secondary'
                    icon = <LuBan size={14} className="me-1" />;
                    break;
                default: // For any other status or if item.status_display is not present
                    return <Badge bg="light" text="dark" pill>{item.status_display || statusValue || 'Unknown'}</Badge>;
            }
            // Ensure status_display provides a user-friendly label
            const label = item.status_display || (statusValue ? statusValue.toString().charAt(0).toUpperCase() + statusValue.toString().slice(1).replace(/_/g, ' ') : 'Unknown');
            return <Badge bg={badgeBg} pill>{icon} {label}</Badge>;
        }
    },
    { header: 'Issued At', key: 'issued_at', render: (item) => item.issued_at ? new Date(item.issued_at).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A' },
    { header: 'Expires At', key: 'expires_at', render: (item) => item.expires_at ? new Date(item.expires_at).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : <span className="text-muted-custom">Campaign End</span> },
    {
        header: 'Used On Booking',
        key: 'booking_ref_used_on', // Make sure this key exists in your API response or transform
        render: (item) => item.booking_ref_used_on || <span className="text-muted-custom">Not Used</span>
    },
];

// --- Initial Form Data for the Modal ---
const initialCodeFormData = {
    id: null,
    promotion_campaign_id: '',
    user_id: '',
    code_string: '',
    issued_at: '',
    expires_at: '',
    status: PromotionCodeStatusEnum.ACTIVE.value, // Ensure PromotionCodeStatusEnum.ACTIVE.value exists
};

// Helper function to prepare data for submission
const processCodeDataForSubmit = (data) => {
    const processedData = { ...data };

    if (processedData.user_id === '') processedData.user_id = null;

    // For datetime-local, the value is already in ISO-like format (YYYY-MM-DDTHH:MM)
    // If your backend expects 'YYYY-MM-DD HH:MM:SS', you might need to replace 'T' with a space and add ':00'
    // For now, assuming backend can handle YYYY-MM-DDTHH:MM or you adjust it here if necessary.
    if (processedData.issued_at === '') {
        delete processedData.issued_at; // Let backend default to now() if it's designed to do so
    } else if (processedData.issued_at && typeof processedData.issued_at === 'string' && processedData.issued_at.includes('T')) {
        // Example: Convert "YYYY-MM-DDTHH:MM" to "YYYY-MM-DD HH:MM:00" if backend needs it
        // processedData.issued_at = processedData.issued_at.replace('T', ' ') + ':00';
    }

    if (processedData.expires_at === '') {
        processedData.expires_at = null;
    } else if (processedData.expires_at && typeof processedData.expires_at === 'string' && processedData.expires_at.includes('T')) {
        // processedData.expires_at = processedData.expires_at.replace('T', ' ') + ':00';
    }


    if (processedData.id === null) {
        delete processedData.id;
    }
    return processedData;
};

// Main PromotionCodePage Component
const PromotionCodePage = () => {

    const renderModalFormLogic = useCallback((
        currentItemData,
        handleModalInputChange,
        modalFormErrors,
        isEditMode,
        setCurrentItemData // Received from OLD ResourcePage
    ) => {
        return (
            <PromotionCodeModalFormFields
                formData={currentItemData}
                handleInputChange={handleModalInputChange}
                modalFormErrors={modalFormErrors}
                isEditMode={isEditMode}
                // setCurrentItemData is not directly needed by PromotionCodeModalFormFields
                // as it doesn't have complex child-managed state that needs this specific setter.
            />
        );
    }, []);

    return (
        <ResourcePage
            resourceName="Promotion Code"
            resourceNamePlural="Promotion Codes"
            IconComponent={LuTicket}
            columns={codeColumns}
            initialFormData={initialCodeFormData}
            fetchAllItems={fetchAllPromotionCodes}
            createItem={(data) => createPromotionCode(processCodeDataForSubmit(data))}
            updateItem={(id, data) => updatePromotionCode(id, processCodeDataForSubmit(data))}
            deleteItem={deletePromotionCode}
            renderModalForm={renderModalFormLogic} // Use the adapted function
            searchPlaceholder="Search codes, users, campaigns..."
            canCreate={true}
        />
    );
};

export default PromotionCodePage;