import React, { useCallback } from 'react'; // Added useCallback
import ResourcePage from '../../components/ResourcePage'; // Adjust path (Ensure this is the OLD ResourcePage)
import PromotionCampaignModalFormFields from '../../components/promotions/PromotionCampaignModalFormFields'; // Adjust path
import {
    fetchAllPromotionCampaigns,
    createPromotionCampaign,
    updatePromotionCampaign,
    deletePromotionCampaign
} from '../../services/api'; // Adjust path
import { LuMegaphone } from 'react-icons/lu';
import { Badge } from 'react-bootstrap';
import { CheckCircle, XCircle } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

// --- Columns for the Promotion Campaign Table ---
const campaignColumns = [
    { header: 'Name', key: 'name', render: (item) => <strong>{item.name}</strong> },
    { header: 'Description', key: 'description', render: (item) => item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : <span className="text-muted-custom">N/A</span> },
    { header: 'Req. Rentals', key: 'required_rental_count', textAlign: 'center' },
    {
        header: 'Reward',
        key: 'reward_display',
        render: (item) => `${parseFloat(item.reward_value || 0).toFixed(2)} ${item.reward_type === 'percentage' ? '%' : 'MAD'}`
    },
    {
        header: 'Validity',
        key: 'validity_display',
        render: (item) => {
            const start = item.start_date ? new Date(item.start_date).toLocaleDateString() : 'N/A';
            const end = item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Ongoing';
            return `${start} - ${end}`;
        }
    },
    {
        header: 'Code Validity',
        key: 'code_validity_days',
        render: (item) => item.code_validity_days ? `${item.code_validity_days} days` : <span className="text-muted-custom">Default/Campaign End</span>,
        textAlign: 'center'
    },
    {
        header: 'Status',
        key: 'is_active',
        textAlign: 'center',
        render: (item) => (
            item.is_active
                ? <Badge bg="success" pill><CheckCircle size={14} className="me-1" /> Active</Badge>
                : <Badge bg="secondary" pill><XCircle size={14} className="me-1" /> Inactive</Badge>
        )
    },
    { header: 'Codes Issued', key: 'promotion_codes_count', textAlign: 'center' }
];

// --- Initial Form Data for the Modal ---
const initialCampaignFormData = {
    id: null,
    name: '',
    description: '',
    required_rental_count: '',
    reward_value: '',
    reward_type: '',
    code_validity_days: '',
    is_active: false, // Default to false for new campaigns
    start_date: '',
    end_date: '',
};

// Main PromotionCampaignPage Component
const PromotionCampaignPage = () => {

    const processCampaignDataForSubmit = (data) => {
        const processedData = { ...data };
        processedData.is_active = !!processedData.is_active;

        if (processedData.code_validity_days === '' || processedData.code_validity_days === null) {
            processedData.code_validity_days = null;
        } else {
            processedData.code_validity_days = parseInt(processedData.code_validity_days, 10);
        }

        if (processedData.required_rental_count === '' || processedData.required_rental_count === null) {
            // Decide if it should be null or if validation will catch it.
            // For now, let's assume it's required and will be a number.
            // If it can be null, set it to null.
        } else {
             processedData.required_rental_count = parseInt(processedData.required_rental_count, 10);
        }

        if (processedData.reward_value === '' || processedData.reward_value === null) {
            // Similar to above
        } else {
            processedData.reward_value = parseFloat(processedData.reward_value);
        }
        
        // Dates: Ensure they are null if empty, or formatted as YYYY-MM-DD
        if (!processedData.start_date) {
            processedData.start_date = null;
        }
        if (!processedData.end_date) {
            processedData.end_date = null;
        }

        return processedData;
    };

    // This function will be passed to ResourcePage's renderModalForm prop
    // It matches the signature expected by the OLD ResourcePage
    const renderModalFormLogic = useCallback((
        currentItemData,       // This is formData for the fields component
        handleModalInputChange, // This is handleInputChange for the fields component
        modalFormErrors,
        isEditMode,
        setCurrentItemData     // This is available from the OLD ResourcePage if needed by a more complex child
    ) => {
        return (
            <PromotionCampaignModalFormFields
                formData={currentItemData}
                handleInputChange={handleModalInputChange}
                modalFormErrors={modalFormErrors}
                // isEditMode is not explicitly used by PromotionCampaignModalFormFields, but good to pass if available
                // setCurrentItemData is not needed by PromotionCampaignModalFormFields as it's simple
            />
        );
    }, []); // Empty dependency array as it's just a pass-through renderer

    return (
        <ResourcePage
            resourceName="Promotion Campaign"
            resourceNamePlural="Promotion Campaigns"
            IconComponent={LuMegaphone}
            columns={campaignColumns}
            initialFormData={initialCampaignFormData}
            fetchAllItems={fetchAllPromotionCampaigns}
            createItem={(data) => createPromotionCampaign(processCampaignDataForSubmit(data))}
            updateItem={(id, data) => updatePromotionCampaign(id, processCampaignDataForSubmit(data))}
            deleteItem={deletePromotionCampaign}
            renderModalForm={renderModalFormLogic} // Pass the correctly defined function
            searchPlaceholder="Search campaigns by name or description..."
        />
    );
};

export default PromotionCampaignPage;