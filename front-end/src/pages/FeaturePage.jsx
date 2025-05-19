import React from 'react';
import ResourcePage from '../components/ResourcePage';
import {
  fetchAllFeatures,
  createFeature,
  updateFeature,
  deleteFeature
} from '../services/api';
import { Form, Alert } from 'react-bootstrap';
import { LuSettings2 } from 'react-icons/lu'; // Using a generic settings/feature icon

// 1. Define Columns for Features
const featureColumns = [
  {
    header: 'Name',
    key: 'name',
    className: 'data-cell-name',
  },
  {
    header: 'Category',
    key: 'category',
    render: (item) => item.category || <span className="text-muted-custom">N/A</span>,
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
    key: 'created_at', // Assuming backend sends this directly
    textAlign: 'center',
    className: 'data-cell-date',
    render: (item) =>
      item.created_at
        ? new Date(item.created_at).toLocaleDateString()
        : <span className="text-muted-custom">N/A</span>,
  },
];

// 2. Initial Form Data for Features
const initialFeatureData = {
  id: null,
  name: '',
  description: '',
  category: '',
};

// 3. Render Modal Form for Features
const renderFeatureModalForm = (formData, handleInputChange, modalFormErrors, isEditMode) => (
  <>
    <Form.Group className="mb-3" controlId="featureName">
      <Form.Label>Name <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="name"
        value={formData.name || ''}
        onChange={handleInputChange}
        required
        maxLength={255}
        placeholder="e.g., Sunroof, Adaptive Cruise Control"
        isInvalid={!!modalFormErrors?.name}
      />
      <Form.Control.Feedback type="invalid">
        {modalFormErrors?.name?.join(', ')}
      </Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-3" controlId="featureCategory">
      <Form.Label>Category</Form.Label>
      <Form.Control
        type="text"
        name="category"
        value={formData.category || ''}
        onChange={handleInputChange}
        maxLength={100}
        placeholder="e.g., Safety, Comfort, Infotainment"
        isInvalid={!!modalFormErrors?.category}
      />
      <Form.Control.Feedback type="invalid">
        {modalFormErrors?.category?.join(', ')}
      </Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-3" controlId="featureDescription">
      <Form.Label>Description</Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        name="description"
        value={formData.description || ''}
        onChange={handleInputChange}
        placeholder="Optional: A brief description of the feature."
        isInvalid={!!modalFormErrors?.description}
      />
      <Form.Control.Feedback type="invalid">
        {modalFormErrors?.description?.join(', ')}
      </Form.Control.Feedback>
    </Form.Group>
  </>
);

// The FeaturePage component
const FeaturePage = () => {
  return (
    <ResourcePage
      resourceName="Feature"
      resourceNamePlural="Features"
      IconComponent={LuSettings2}
      columns={featureColumns}
      initialFormData={initialFeatureData}
      renderModalForm={renderFeatureModalForm}
      fetchAllItems={fetchAllFeatures}
      createItem={createFeature}
      updateItem={updateFeature}
      deleteItem={deleteFeature}
      searchPlaceholder="Search by name, category, or description..."
    />
  );
};

export default FeaturePage;