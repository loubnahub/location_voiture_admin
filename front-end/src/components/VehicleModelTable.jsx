// src/components/VehicleModelTable.jsx
import React, { useState } from 'react'; // Added useState
import { Badge, Modal, Button as BootstrapButton, Spinner } from 'react-bootstrap'; // Added Modal, BootstrapButton, Spinner
import DynamicTable from './DynamicTable'; // Assuming DynamicTable.jsx is in the same folder
import { AlertTriangle } from 'lucide-react'; // For modal title icon
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

// Helper to format price (can remain the same)
const formatPrice = (amount, currency = 'MAD') => {
  if (amount === null || amount === undefined) return 'N/A';
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return 'N/A';
  // Using the simple string concatenation as per your example
  return numericAmount + ' ' + currency;
};

const VehicleModelTable = ({
  models,
  loading,
  onViewDetails,
  onEditModel,  // This will be used to navigate to detail view in edit mode
  onDeleteModel, // This will be called after confirmation
  isDeleting, // New prop: boolean to indicate if a delete operation is in progress (for spinner on confirm button)
}) => {
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null); // To store { id, title } of model

  const handleDeleteClick = (item) => {
    setModelToDelete({ id: item.id, title: item.title });
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = () => {
    if (modelToDelete && onDeleteModel) {
      onDeleteModel(modelToDelete.id); // Call the actual delete handler passed from parent
    }
    setShowDeleteConfirmModal(false);
    setModelToDelete(null);
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      className: 'col-title ', 
      render: (item) => (
        <div>
          {/* Using dt-column-no-wrap and dt-column-wide directly in the DynamicTable.css would be better */}
          <span className="fw-medium" style={{ whiteSpace: 'nowrap', minWidth: '150px', display: 'inline-block' }}> 
            {item.title || 'N/A'}
          </span>
        </div>
      ),
    },
    { key: 'brand', header: 'Brand', className: 'col-brand' },
    {
      key: 'model_name',
      header: 'Model',
      className: 'col-model',
      render: (item) => item.model_name || item.model || 'N/A',
    },
    { key: 'year', header: 'Year', className: 'text-center col-year', textAlign: 'center' },
    { key: 'vehicle_type_name', header: 'Type', className: 'col-type' },
    { key: 'fuel_type', header: 'Fuel', className: 'col-fuel' },
    { key: 'transmission', header: 'Transmission', className: 'col-transmission' },
    {
      key: 'base_price_per_day',
      header: 'Price/Day',
      className: 'text-end col-price',
      textAlign: 'end',
      render: (item) => formatPrice(item.base_price_per_day, 'MAD'),
    },
    {
      key: 'is_available',
      header: 'Status',
      className: 'text-center col-status',
      textAlign: 'center',
      render: (item) =>
        item.is_generally_available || item.is_available ? (
          <Badge pill bg="success-subtle" text="success-emphasis" className="status-badge">Available</Badge>
        ) : (
          <Badge pill bg="danger-subtle" text="danger-emphasis" className="status-badge">Unavailable</Badge>
        ),
    },
  ];

  // Actions for DynamicTable
  // The 'onDelete' here will now trigger our local confirmation modal
  const tableActions = {
    onView: onViewDetails ? (item) => onViewDetails(item.id) : undefined,
    onEdit: onEditModel ? (item) => onEditModel(item.id) : undefined, // This is correct, parent handles navigation with mode=edit
    onDelete: handleDeleteClick, // Changed to call our local handler
  };

  return (
    <>
      <DynamicTable
        columns={columns}
        items={models}
        loading={loading}
        actions={tableActions}
        getKey={(item) => item.id}
        noDataMessage="No vehicle models found to display."
        _resourceNameForDebug="VehicleModel"
      />

      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <AlertTriangle size={24} className="me-2" style={{ verticalAlign: 'bottom' }} /> Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the model "<strong>{modelToDelete?.title || 'this model'}</strong>"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <BootstrapButton variant="secondary" onClick={() => setShowDeleteConfirmModal(false)} disabled={isDeleting}>
            Cancel
          </BootstrapButton>
          <BootstrapButton variant="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                Deleting...
              </>
            ) : "Delete"}
          </BootstrapButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default VehicleModelTable;