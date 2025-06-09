import React from 'react';
import { Form, Row, Col, FormCheck } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

// Assuming your PromotionRewardType Enum from backend is available here
// You might define this array based on your App\Enums\PromotionRewardType
const rewardTypeOptions = [
    { value: 'percentage', label: 'Percentage Discount' },
    { value: 'fixed_amount', label: 'Fixed Amount Discount' },
    // Add more if your enum supports them
];

const PromotionCampaignModalFormFields = ({ formData, handleInputChange, modalFormErrors }) => {
    if (!formData) {
        return <p>Loading form data...</p>; // Or a spinner
    }

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
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="pcRequiredRentalCount">
                        <Form.Label>Required Rental Count <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            name="required_rental_count"
                            value={formData.required_rental_count || ''}
                            onChange={handleInputChange}
                            required
                            min="1"
                            isInvalid={!!modalFormErrors?.required_rental_count}
                        />
                        <Form.Control.Feedback type="invalid">{modalFormErrors?.required_rental_count?.join(', ')}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
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
                            step="0.01" // For decimal values
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
                            How many days generated codes are valid. Leave blank if not applicable or if expiry is tied to campaign end date only.
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
                            type="date" // Using 'date' for simplicity, use 'datetime-local' if time is needed
                            name="start_date"
                            value={formData.start_date ? formData.start_date.substring(0, 10) : ''} // Assuming ISO string, take date part
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
                            value={formData.end_date ? formData.end_date.substring(0, 10) : ''}
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