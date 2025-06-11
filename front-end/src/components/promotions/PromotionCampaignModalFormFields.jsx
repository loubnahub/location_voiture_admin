// src/components/promotion_campaigns/PromotionCampaignModalFormFields.jsx

import React from 'react';
import { Form, Row, Col, FormCheck } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

const rewardTypeOptions = [
    { value: 'percentage', label: 'Percentage Discount' },
    { value: 'fixed_amount', label: 'Fixed Amount Discount' },
];

const PromotionCampaignModalFormFields = ({ formData, handleInputChange, modalFormErrors }) => {
    if (!formData) {
        return <p>Loading form data...</p>;
    }

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().slice(0, 10); // Format as YYYY-MM-DD
        } catch (e) {
            return '';
        }
    };

    return (
        <>
            <Form.Group className="mb-3" controlId="pcName">
                <Form.Label>Campaign Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                    isInvalid={!!modalFormErrors?.name}
                />
                <Form.Control.Feedback type="invalid">{modalFormErrors?.name?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="pcDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    isInvalid={!!modalFormErrors?.description}
                />
                <Form.Control.Feedback type="invalid">{modalFormErrors?.description?.join(', ')}</Form.Control.Feedback>
            </Form.Group>

            <Row>
                {/* --- THIS IS THE MODIFIED FIELD --- */}
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="pcRequiredRentalCount">
                        <Form.Label>Loyalty Points Threshold</Form.Label>
                        <Form.Control
                            type="number"
                            name="required_rental_count" // The DB column name remains the same
                            value={formData.required_rental_count || ''}
                            onChange={handleInputChange}
                            min="1"
                            placeholder="e.g., 500"
                            isInvalid={!!modalFormErrors?.required_rental_count}
                        />
                        <Form.Text className="text-muted">
                            Triggers reward when user crosses this point total. Leave blank for standard campaigns.
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.required_rental_count?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                {/* --- END OF MODIFIED FIELD --- */}
                
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="pcRewardValue">
                        <Form.Label>Reward Value <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            name="reward_value"
                            value={formData.reward_value || ''}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                            isInvalid={!!modalFormErrors?.reward_value}
                        />
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.reward_value?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="pcRewardType">
                        <Form.Label>Reward Type <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            name="reward_type"
                            value={formData.reward_type || ''}
                            onChange={handleInputChange}
                            required
                            isInvalid={!!modalFormErrors?.reward_type}
                        >
                            <option value="">Select Reward Type...</option>
                            {rewardTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.reward_type?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="pcCodeValidityDays">
                        <Form.Label>Code Validity (Days from Issue)</Form.Label>
                        <Form.Control
                            type="number"
                            name="code_validity_days"
                            value={formData.code_validity_days || ''}
                            onChange={handleInputChange}
                            min="1"
                            placeholder="e.g., 30 (optional)"
                            isInvalid={!!modalFormErrors?.code_validity_days}
                        />
                        <Form.Text className="text-muted">
                            How many days generated codes are valid.
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.code_validity_days?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="pcStartDate">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="start_date"
                            value={formatDateForInput(formData.start_date)}
                            onChange={handleInputChange}
                            isInvalid={!!modalFormErrors?.start_date}
                        />
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.start_date?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="pcEndDate">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="end_date"
                            value={formatDateForInput(formData.end_date)}
                            onChange={handleInputChange}
                            isInvalid={!!modalFormErrors?.end_date}
                        />
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.end_date?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3" controlId="pcIsActive">
                <FormCheck
                    type="switch"
                    name="is_active"
                    label="Campaign is Active"
                    checked={!!formData.is_active}
                    onChange={handleInputChange}
                />
            </Form.Group>
        </>
    );
};

export default PromotionCampaignModalFormFields;