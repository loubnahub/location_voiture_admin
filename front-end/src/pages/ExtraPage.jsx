import React from 'react';
import ResourcePage from '../components/ResourcePage'; // Your generic CRUD page layout
import {
  fetchAllExtras,   // API function to get all extras
  createExtra,      // API function to create an extra
  updateExtra,      // API function to update an extra
  deleteExtra       // API function to delete an extra
} from '../services/api';     // Your API service functions
import { Form, Alert, InputGroup } from 'react-bootstrap'; // For rendering the modal form fields
import { PlusSquare } from 'lucide-react'; // Example icon for "Extras" (a plus in a square)
                                          // Alternatives: LuGift, LuPackage, LuStar

// 1. Define Columns for the DynamicTable (specific to Extras)
const extraColumns = [
  {
    header: 'Name',
    key: 'name',
    className: 'data-cell-name', // Re-use styling from DynamicTable.css
  },
  {
    header: 'Default Price/Day',
    key: 'default_price_per_day',
    textAlign: 'right', // Align price to the right
    render: (item) => // Custom render to format as currency
      item.default_price_per_day !== null && item.default_price_per_day !== undefined
        ? `${parseFloat(item.default_price_per_day).toFixed(2)} MAD` // Using MAD as per your earlier example
        : <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Description',
    key: 'description',
    className: 'data-cell-description', // Re-use styling
    render: (item) =>
      item.description
        ? item.description.substring(0, 70) + (item.description.length > 70 ? '...' : '')
        : <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Created At',
    key: 'created_at', // Assuming backend sends this directly (or created_at_formatted)
    textAlign: 'center',
    className: 'data-cell-date', // Re-use styling
    render: (item) =>
      item.created_at
        ? new Date(item.created_at).toLocaleDateString()
        : <span className="text-muted-custom">N/A</span>,
  },
];

// 2. Define the initial (empty) state for the form data used in the create/edit modal
const initialExtraData = {
  id: null,
  name: '',
  description: '',
  default_price_per_day: '', // Input type="number" handles string to number conversion
};

// 3. Define a function that renders the actual form fields inside the modal
const renderExtraModalForm = (formData, handleInputChange, modalFormErrors, isEditMode) => (
  <>
    {/* modalFormErrors are displayed by ResourcePage if general modalError is set */}
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

    <Form.Group className="mb-3" controlId="extraDefaultPrice">
      <Form.Label>Default Price Per Day <span className="text-danger">*</span></Form.Label>
      <InputGroup>
        <InputGroup.Text>MAD</InputGroup.Text> {/* Currency Symbol */}
        <Form.Control
          type="number"
          name="default_price_per_day"
          value={formData.default_price_per_day || ''}
          onChange={handleInputChange}
          required
          min="0"
          step="0.01" // For decimal values (e.g., 15.00)
          placeholder="e.g., 15.00"
          isInvalid={!!modalFormErrors?.default_price_per_day}
        />
      </InputGroup>
      {/* Custom display for InputGroup feedback because default doesn't always show well */}
      {modalFormErrors?.default_price_per_day && (
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
  const processFormData = (data) => {
    return {
      ...data,
      default_price_per_day: data.default_price_per_day !== '' ? parseFloat(data.default_price_per_day) : null,
    };
  };

  return (
    <ResourcePage
      // --- Configuration Props ---
      resourceName="Extra"
      resourceNamePlural="Extras"
      IconComponent={PlusSquare} // Icon for the page title
      columns={extraColumns}
      initialFormData={initialExtraData}
      renderModalForm={renderExtraModalForm}

      // --- API Function Props ---
      fetchAllItems={fetchAllExtras}
      // Wrap createItem and updateItem to process form data before sending
      createItem={(data) => createExtra(processFormData(data))}
      updateItem={(id, data) => updateExtra(id, processFormData(data))}
      deleteItem={deleteExtra}

      // --- Optional Customization ---
      searchPlaceholder="Search by name or description..."
    />
  );
};

export default ExtraPage;