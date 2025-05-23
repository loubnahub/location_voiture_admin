import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Spinner ,Alert} from 'react-bootstrap';
import {
    fetchUsersForPromotionCodeDropdown,
    fetchCampaignsForPromotionCodeDropdown
} from '../../services/api'; // Adjust path
import { PromotionCodeStatus as PromotionCodeStatusEnum } from '../../Enums'; // Adjust path

// Prepare options for the Status dropdown from your Enum
const statusOptions = Object.values(PromotionCodeStatusEnum || {}).map(status => ({
    value: status.value || status, // Handle if enum cases have explicit values
    label: status.label || (typeof status === 'string' ? (status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')) : String(status))
}));


const PromotionCodeModalFormFields = ({ formData, handleInputChange, modalFormErrors, isEditMode }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);

    useEffect(() => {
        const fetchDropdownData = async () => {
            setLoadingDropdowns(true);
            try {
                const [campaignsRes, usersRes] = await Promise.all([
                    fetchCampaignsForPromotionCodeDropdown(),
                    fetchUsersForPromotionCodeDropdown()
                ]);
                setCampaigns(campaignsRes.data.data || []);
                setUsers(usersRes.data.data || []);
            } catch (error) {
                console.error("Error fetching dropdown data for promotion code form:", error);
                setCampaigns([]);
                setUsers([]);
            } finally {
                setLoadingDropdowns(false);
            }
        };
        fetchDropdownData();
    }, []);

    // Helper to format date for datetime-local input (YYYY-MM-DDTHH:MM)
    // or just date input (YYYY-MM-DD)
    const formatDateForInput = (dateString, type = 'date') => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            if (type === 'datetime-local') {
                const tzoffset = date.getTimezoneOffset() * 60000;
                return new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
            }
            return date.toISOString().slice(0, 10); // For 'date' input
        } catch (e) {
            console.error("Error formatting date for input:", dateString, e);
            return '';
        }
    };


    if (loadingDropdowns && !isEditMode) { // Only show full loading if creating new, for edit, form can show with old data
        return <div className="text-center p-3"><Spinner animation="border" size="sm" /> Loading options...</div>;
    }
    if (!formData) {
        return <p>Loading form data...</p>;
    }

    return (
        <>
            <Form.Group className="mb-3" controlId="pcCodeString">
                <Form.Label>Code String <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="text"
                    name="code_string"
                    value={formData.code_string || ''}
                    onChange={handleInputChange}
                    required
                    isInvalid={!!modalFormErrors?.code_string}
                    disabled={isEditMode && formData.status === PromotionCodeStatusEnum.USED.value} // Don't allow changing used code string
                />
                <Form.Control.Feedback type="invalid">{modalFormErrors?.code_string?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="pcPromotionCampaignId">
                <Form.Label>Promotion Campaign <span className="text-danger">*</span></Form.Label>
                <Form.Select
                    name="promotion_campaign_id"
                    value={formData.promotion_campaign_id || ''}
                    onChange={handleInputChange}
                    required
                    isInvalid={!!modalFormErrors?.promotion_campaign_id}
                    disabled={loadingDropdowns || (isEditMode && formData.status === PromotionCodeStatusEnum.USED.value)} // Don't allow changing campaign of used code
                >
                    <option value="">Select Campaign...</option>
                    {campaigns.map(campaign => (
                        <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{modalFormErrors?.promotion_campaign_id?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="pcUserId">
                <Form.Label>Assign to User (Optional)</Form.Label>
                <Form.Select
                    name="user_id"
                    value={formData.user_id || ''}
                    onChange={handleInputChange}
                    isInvalid={!!modalFormErrors?.user_id}
                    disabled={loadingDropdowns || (isEditMode && formData.status === PromotionCodeStatusEnum.USED.value)} // Don't allow changing user of used code
                >
                    <option value="">Generic Code (No specific user)...</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{modalFormErrors?.user_id?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="pcIssuedAt">
                        <Form.Label>Issued At</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="issued_at"
                            value={formatDateForInput(formData.issued_at, 'datetime-local')}
                            onChange={handleInputChange}
                            isInvalid={!!modalFormErrors?.issued_at}
                            // Typically system-set on create, could be editable by admin
                            // disabled={isEditMode} // Or only disabled if already issued
                        />
                        <Form.Text className="text-muted">Defaults to now if creating new and left blank.</Form.Text>
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.issued_at?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="pcExpiresAt">
                        <Form.Label>Expires At</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="expires_at"
                            value={formatDateForInput(formData.expires_at, 'datetime-local')}
                            onChange={handleInputChange}
                            isInvalid={!!modalFormErrors?.expires_at}
                        />
                        <Form.Text className="text-muted">Optional. Can be derived from campaign.</Form.Text>
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.expires_at?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3" controlId="pcStatus">
                <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                <Form.Select
                    name="status"
                    value={formData.status || ''} // Handles if formData.status is the enum object or its value
                    onChange={handleInputChange}
                    required
                    isInvalid={!!modalFormErrors?.status}
                    disabled={isEditMode && formData.status === PromotionCodeStatusEnum.USED.value} // Don't allow changing status of used code
                >
                    <option value="">Select Status...</option>
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{modalFormErrors?.status?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            {isEditMode && formData.used_on_booking_id && (
                <Alert variant="info" className="small">
                    This code was used on Booking ID: {formData.used_on_booking_id.substring(0,8)}...
                    {formData.used_at && ` at ${new Date(formData.used_at).toLocaleString()}`}
                </Alert>
            )}
        </>
    );
};

export default PromotionCodeModalFormFields;