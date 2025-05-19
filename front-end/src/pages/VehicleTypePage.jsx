import React from 'react';
import ResourcePage from '../components/ResourcePage'; // Import the generic CRUD page layout
import {
  fetchAllVehicleTypes, // API function to get all vehicle types
  createVehicleType,    // API function to create a vehicle type
  updateVehicleType,    // API function to update a vehicle type
  deleteVehicleType     // API function to delete a vehicle type
} from '../services/api';   // Your API service functions
import { Form, Alert } from 'react-bootstrap'; // For rendering the modal form fields
import { LuListTree } from 'react-icons/lu';   // Icon for the page title

// 1. Define Columns for the DynamicTable (specific to Vehicle Types)
const vehicleTypeColumns = [
  {
    header: 'Name',
    key: 'name', // Corresponds to 'name' property in your vehicle type data objects
    className: 'data-cell-name', // Optional: if DynamicTable.css has specific styling
                                 // for primary identifiers.
  },
  {
    header: 'Description',
    key: 'description',
    className: 'data-cell-description', // Optional
    render: (item) => // Custom render function for how this cell's data is displayed
      item.description
        ? item.description.substring(0, 70) + (item.description.length > 70 ? '...' : '')
        : <span className="text-muted-custom">N/A</span>, // Assumes .text-muted-custom is styled
  },
  {
    header: 'Notes',
    key: 'notes',
    className: 'data-cell-description', // Can reuse or create new style
    render: (item) =>
      item.notes
        ? item.notes.substring(0, 50) + (item.notes.length > 50 ? '...' : '')
        : <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Created At',
    key: 'created_at', // Assuming your backend controller transforms this
    textAlign: 'center', // DynamicTable will apply text-center to th and td
    className: 'data-cell-date', // Optional
    render: (item) =>
      item.created_at
        ? new Date(item.created_at).toLocaleDateString() // Simple date format
        : <span className="text-muted-custom">N/A</span>,
  },
  // The "Actions" column is automatically added by ResourcePage's DynamicTable
  // if 'actions' prop is configured and passed to DynamicTable
];

// 2. Define the initial (empty) state for the form data used in the create/edit modal
const initialVehicleTypeData = {
  id: null, // Will be populated when editing
  name: '',
  description: '',
  notes: '',
};

// 3. Define a function that renders the actual form fields inside the modal
// This function is passed to ResourcePage via the 'renderModalForm' prop.
// It receives:
// - formData: The current state of the form data in the modal
// - handleInputChange: The function to call onChange of form inputs
// - modalFormErrors: An object with field-specific validation errors from the backend
// - isEditMode: Boolean indicating if the modal is for editing or creating
// - setCurrentItemData (optional): Function to programmatically set form data state
const renderVehicleTypeModalForm = (formData, handleInputChange, modalFormErrors, isEditMode) => (
  <>
    {/* Display a general error message if modalFormErrors has keys, handled by ResourcePage */}
    {/* We could also display a summary here:
    {modalFormErrors && Object.keys(modalFormErrors).length > 0 && !modalError && ( // modalError is for non-field general errors
      <Alert variant="danger" className="mb-3">
        Please correct the highlighted errors.
      </Alert>
    )}
    */}
    <Form.Group className="mb-3" controlId="vehicleTypeName">
      <Form.Label>Name <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="name" // This 'name' MUST match a key in initialVehicleTypeData and formData
        value={formData.name || ''}
        onChange={handleInputChange}
        required
        maxLength={255}
        placeholder="e.g., Sedan, SUV, Luxury Van"
        isInvalid={!!modalFormErrors?.name} // Highlight field if 'name' key exists in errors
      />
      <Form.Control.Feedback type="invalid">
        {modalFormErrors?.name?.join(', ')} {/* Display backend error for 'name' */}
      </Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-3" controlId="vehicleTypeDescription">
      <Form.Label>Description</Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        name="description" // Must match a key in formData
        value={formData.description || ''}
        onChange={handleInputChange}
        placeholder="Optional: A brief description of the vehicle type."
        isInvalid={!!modalFormErrors?.description}
      />
      <Form.Control.Feedback type="invalid">
        {modalFormErrors?.description?.join(', ')}
      </Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-3" controlId="vehicleTypeNotes">
      <Form.Label>Notes</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        name="notes" // Must match a key in formData
        value={formData.notes || ''}
        onChange={handleInputChange}
        placeholder="Optional: Internal notes about this type."
        isInvalid={!!modalFormErrors?.notes}
      />
      <Form.Control.Feedback type="invalid">
        {modalFormErrors?.notes?.join(', ')}
      </Form.Control.Feedback>
    </Form.Group>
  </>
);


// The main page component for Vehicle Types
const VehicleTypePage = () => {
  return (
    <ResourcePage
      // --- Essential Configuration Props ---
      resourceName="Vehicle Type" // Singular name for messages, modal titles
      resourceNamePlural="Vehicle Types" // Plural name for page title, search placeholder
      IconComponent={LuListTree} // Icon for the page title
      columns={vehicleTypeColumns} // Defined above for the table
      initialFormData={initialVehicleTypeData} // Defined above for the modal form
      renderModalForm={renderVehicleTypeModalForm} // Defined above

      // --- API Function Props (passed directly from your services/api.js) ---
      fetchAllItems={fetchAllVehicleTypes}
      createItem={createVehicleType}
      updateItem={updateVehicleType}
      deleteItem={deleteVehicleType}

      // --- Optional Customization Props (ResourcePage has defaults for these) ---
      // itemsPerPage={10} // Default is 10
      // searchPlaceholder="Search vehicle types by name or description..." // Default is "Search {resourceNamePlural}..."
      // canCreate={true} // Default is true
      // showSearch={true} // Default is true
      // tableActionsConfig={{ onView: (item) => console.log("View type:", item) }} // To add a "View" action
    />
  );
};

export default VehicleTypePage;