import React from 'react';
import ResourcePage from '../components/ResourcePage';
import {
  fetchAllInsurancePlans,
  createInsurancePlan,
  updateInsurancePlan,
  deleteInsurancePlan
} from '../services/api';
import { Form, Alert, InputGroup, FormCheck } from 'react-bootstrap'; // Added FormCheck for boolean
import { LuShieldCheck } from 'react-icons/lu'; // Icon for Insurance Plans

// 1. Define Columns for Insurance Plans
const insurancePlanColumns = [
  {
    header: 'Name',
    key: 'name',
    className: 'data-cell-name',
  },
  {
    header: 'Provider',
    key: 'provider',
    render: (item) => item.provider || <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Price/Day',
    key: 'price_per_day',
    textAlign: 'right',
    render: (item) =>
      item.price_per_day !== null && item.price_per_day !== undefined
        ? `${parseFloat(item.price_per_day).toFixed(2)} MAD`
        : <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Active',
    key: 'is_active',
    textAlign: 'center',
    render: (item) => (
      item.is_active
        ? <span className="badge bg-success-light text-success-dark">Active</span>
        : <span className="badge bg-danger-light text-danger-dark">Inactive</span>
    ), // Requires custom badge CSS
  },
  {
    header: 'Coverage Highlights', // Truncated description or key coverage points
    key: 'coverage_details',
    className: 'data-cell-description',
    render: (item) =>
      item.coverage_details
        ? item.coverage_details.substring(0, 50) + (item.coverage_details.length > 50 ? '...' : '')
        : <span className="text-muted-custom">N/A</span>,
  },
];

// 2. Initial Form Data for Insurance Plans
const initialInsurancePlanData = {
  id: null,
  name: '',
  provider: '',
  coverage_details: '',
  price_per_day: '',
  is_active: true, // Default to active
};

// 3. Render Modal Form for Insurance Plans
const renderInsurancePlanModalForm = (formData, handleInputChange, modalFormErrors, isEditMode) => (
  <>
    <Form.Group className="mb-3" controlId="planName">
      <Form.Label>Plan Name <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="name"
        value={formData.name || ''}
        onChange={handleInputChange}
        required
        maxLength={255}
        placeholder="e.g., Basic Coverage, Premium Shield"
        isInvalid={!!modalFormErrors?.name}
      />
      <Form.Control.Feedback type="invalid">{modalFormErrors?.name?.join(', ')}</Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-3" controlId="planProvider">
      <Form.Label>Provider</Form.Label>
      <Form.Control
        type="text"
        name="provider"
        value={formData.provider || ''}
        onChange={handleInputChange}
        maxLength={255}
        placeholder="Optional: Insurance company name"
        isInvalid={!!modalFormErrors?.provider}
      />
      <Form.Control.Feedback type="invalid">{modalFormErrors?.provider?.join(', ')}</Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-3" controlId="planPricePerDay">
      <Form.Label>Price Per Day <span className="text-danger">*</span></Form.Label>
      <InputGroup>
        <InputGroup.Text>MAD</InputGroup.Text>
        <Form.Control
          type="number"
          name="price_per_day"
          value={formData.price_per_day || ''}
          onChange={handleInputChange}
          required
          min="0"
          step="0.01"
          placeholder="e.g., 25.50"
          isInvalid={!!modalFormErrors?.price_per_day}
        />
      </InputGroup>
      {modalFormErrors?.price_per_day && (
        <div className="invalid-feedback d-block">{modalFormErrors.price_per_day.join(', ')}</div>
      )}
    </Form.Group>

    <Form.Group className="mb-3" controlId="planCoverageDetails">
      <Form.Label>Coverage Details <span className="text-danger">*</span></Form.Label>
      <Form.Control
        as="textarea"
        rows={4}
        name="coverage_details"
        value={formData.coverage_details || ''}
        onChange={handleInputChange}
        required
        placeholder="Describe what this insurance plan covers."
        isInvalid={!!modalFormErrors?.coverage_details}
      />
      <Form.Control.Feedback type="invalid">{modalFormErrors?.coverage_details?.join(', ')}</Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-3" controlId="planIsActive">
      <FormCheck
        type="switch"
        id="is_active_switch"
        label="Plan is Active"
        name="is_active"
        checked={formData.is_active}
        onChange={handleInputChange} // handleInputChange in ResourcePage handles checkbox 'checked' property
      />
    </Form.Group>
  </>
);

// The InsurancePlanPage component
const InsurancePlanPage = () => {
  const processFormDataForAPI = (data) => {
    return {
      ...data,
      price_per_day: data.price_per_day !== '' ? parseFloat(data.price_per_day) : null,
      is_active: Boolean(data.is_active), // Ensure it's a boolean
    };
  };

  return (
    <ResourcePage
      resourceName="Insurance Plan"
      resourceNamePlural="Insurance Plans"
      IconComponent={LuShieldCheck}
      columns={insurancePlanColumns}
      initialFormData={initialInsurancePlanData}
      renderModalForm={renderInsurancePlanModalForm}
      fetchAllItems={fetchAllInsurancePlans}
      createItem={(data) => createInsurancePlan(processFormDataForAPI(data))}
      updateItem={(id, data) => updateInsurancePlan(id, processFormDataForAPI(data))}
      deleteItem={deleteInsurancePlan}
      searchPlaceholder="Search by name, provider, or coverage..."
    />
  );
};

export default InsurancePlanPage;