import React, { useCallback } from 'react';
import ResourcePage from '../components/ResourcePage'; // Your generic CRUD page layout
import {
  fetchAllExtras,
  createExtra,
  updateExtra,
  deleteExtra
} from '../services/api';
import { Form, InputGroup } from 'react-bootstrap';
import { PlusSquare } from 'lucide-react';

// 1. Define Columns for the DynamicTable
// This should use 'default_price_per_day' as the key from your API/transformExtra
const extraColumns = [
  {
    header: 'Name',
    key: 'name',
    className: 'data-cell-name',
  },
  {
    header: 'Default Price/Day',
    key: 'default_price_per_day', // <<< REVERTED TO 'default_price_per_day'
    textAlign: 'right',
    render: (item) =>
      item.default_price_per_day !== null && item.default_price_per_day !== undefined
        ? `${parseFloat(item.default_price_per_day).toFixed(2)} MAD`
        : <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Description',
    key: 'description',
    className: 'data-cell-description',
    render: (item) =>
      item.description
        ? item.description.substring(0, 70) + (item.description.length > 70 ? '...' : '')
        : <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Created At',
    key: 'created_at',
    textAlign: 'center',
    className: 'data-cell-date',
    render: (item) =>
      item.created_at
        ? new Date(item.created_at).toLocaleDateString()
        : <span className="text-muted-custom">N/A</span>,
  },
];

// 2. Define the initial (empty) state for the form data
const initialExtraData = {
  id: null,
  name: '',
  description: '',
  default_price_per_day: '', // <<< REVERTED TO 'default_price_per_day'
};

// 3. Define a function that renders the actual form fields inside the modal
const renderExtraModalForm = (
    formData,
    handleInputChange,
    modalFormErrors,
    isEditMode
) => (
  <>
    <Form.Group className="mb-3" controlId="extraName">
      <Form.Label>Name <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="name"
        value={formData.name || ''}
        onChange={handleInputChange}
        required
        maxLength={255}
        placeholder="e.g., GPS Navigation, Child Seat"
        isInvalid={!!modalFormErrors?.name}
      />
      <Form.Control.Feedback type="invalid">
        {modalFormErrors?.name?.join(', ')}
      </Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-3" controlId="extraDefaultPricePerDay"> {/* Updated controlId */}
      <Form.Label>Default Price Per Day <span className="text-danger">*</span></Form.Label>
      <InputGroup>
        <InputGroup.Text>MAD</InputGroup.Text>
        <Form.Control
          type="number"
          name="default_price_per_day" // <<< REVERTED NAME ATTRIBUTE
          value={formData.default_price_per_day || ''} // <<< REVERTED FORMDATA KEY
          onChange={handleInputChange}
          required
          min="0"
          step="0.01"
          placeholder="e.g., 15.00"
          isInvalid={!!modalFormErrors?.default_price_per_day} // <<< REVERTED ERROR KEY
        />
      </InputGroup>
      {modalFormErrors?.default_price_per_day && ( // <<< REVERTED ERROR KEY
        <div className="invalid-feedback d-block">
          {modalFormErrors.default_price_per_day.join(', ')}
        </div>
      )}
    </Form.Group>

    <Form.Group className="mb-3" controlId="extraDescription">
      <Form.Label>Description</Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        name="description"
        value={formData.description || ''}
        onChange={handleInputChange}
        placeholder="Optional: A brief description of the extra."
        isInvalid={!!modalFormErrors?.description}
      />
      <Form.Control.Feedback type="invalid">
        {modalFormErrors?.description?.join(', ')}
      </Form.Control.Feedback>
    </Form.Group>
  </>
);

// The main page component for Extras
const ExtraPage = () => {
  // Helper function to ensure price is sent as a number
  const processFormData = useCallback((data) => {
    const processedData = { ...data };
    // Process 'default_price_per_day'
    if (processedData.hasOwnProperty('default_price_per_day')) {
      processedData.default_price_per_day =
        (processedData.default_price_per_day !== '' &&
         processedData.default_price_per_day !== null &&
         processedData.default_price_per_day !== undefined)
          ? parseFloat(processedData.default_price_per_day)
          : null; // Send null if empty, backend validation for 'required' will catch if needed
    }
    // Remove 'price' if it accidentally exists from previous attempts
    if (processedData.hasOwnProperty('price')) {
        delete processedData.price;
    }
    return processedData;
  }, []);

  return (
    <ResourcePage
      resourceName="Extra"
      resourceNamePlural="Extras"
      IconComponent={PlusSquare}
      columns={extraColumns}
      initialFormData={initialExtraData}
      renderModalForm={renderExtraModalForm}

      fetchAllItems={fetchAllExtras}
      createItem={(data) => createExtra(processFormData(data))}
      updateItem={(id, data) => updateExtra(id, processFormData(data))}
      deleteItem={deleteExtra}

      searchPlaceholder="Search by name or description..."
    />
  );
};

export default ExtraPage;