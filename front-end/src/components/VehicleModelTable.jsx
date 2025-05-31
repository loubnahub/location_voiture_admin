// src/components/VehicleModelTable.jsx
import React from 'react';
import { Table, Button, Badge, Image } from 'react-bootstrap'; // Added Image for thumbnail
import { LuArrowUpDown, LuArrowUp, LuArrowDown, LuEye,LuTrash2 } from 'react-icons/lu'; // Corrected LuEdit2
// import './VehicleModelTable.css'; // Ensure this CSS file is created and styled
import {Edit2}from 'lucide-react'
// Helper to format price
const formatPrice = (amount, currency = 'MAD') => {
  if (amount === null || amount === undefined) return 'N/A';
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return 'N/A'; // Or 'Invalid Price'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(numericAmount);
};

// Helper to format date (can be moved to a utils file)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

const VehicleModelTable = ({
  models,
  onSort,
  currentSortBy,
  currentSortDirection,
  onViewDetails,
  onEditModel,  // Changed from onEdit to onEditModel for clarity
  onDeleteModel, // Changed from onDelete to onDeleteModel for clarity
}) => {

  const renderSortIcon = (columnKey) => {
    if (currentSortBy === columnKey) {
      return currentSortDirection === 'asc' ? <LuArrowUp className="ms-1" size={14} /> : <LuArrowDown className="ms-1" size={14} />;
    }
    return <LuArrowUpDown className="ms-1 text-muted" size={14} />;
  };

  // Define table headers - now potentially including more fields
  // Add 'accessor' if the data key is different from the 'key' used for sorting/internal logic
  const tableHeaders = [
    { key: 'title', label: 'Title', sortable: true, className: 'col-title' },
    { key: 'brand', label: 'Brand', sortable: true, className: 'col-brand' },
    { key: 'model', label: 'Model', sortable: true, className: 'col-model' }, // Assuming API returns 'model'
    { key: 'year', label: 'Year', sortable: true, className: 'text-center col-year' },
    { key: 'vehicle_type_name', label: 'Type', sortable: false, className: 'col-type' }, // Not directly sortable on this derived name by default
    { key: 'fuel_type', label: 'Fuel', sortable: true, className: 'col-fuel' },
    { key: 'transmission', label: 'Transmission', sortable: true, className: 'col-transmission' },
    { key: 'number_of_seats', label: 'Seats', sortable: true, className: 'text-center col-seats' },
    // { key: 'number_of_doors', label: 'Doors', sortable: true, className: 'text-center col-doors' }, // Example of another field
    { key: 'base_price_per_day', label: 'Price/Day', sortable: true, className: 'text-end col-price' },
    { key: 'is_available', label: 'Status', sortable: true, className: 'text-center col-status' },
    { key: 'created_at', label: 'Created', sortable: true, className: 'col-created', accessor: 'created_at_formatted' }, // Use formatted for display
    { key: 'actions', label: 'Actions', sortable: false, className: 'text-center col-actions' },
  ];

  if (!models || models.length === 0) {
    return null; // VehicleModelPage handles the "no data" message
  }

  return (
    <div className="table-responsive vehicle-model-table-wrapper shadow-sm rounded">
      <Table hover responsive="md" className="vehicle-model-table mb-0 align-middle"> {/* align-middle for vertical centering */}
        <thead className="table-light">
          <tr>
            {tableHeaders.map(header => (
              <th
                key={header.key}
                className={`${header.className || ''} ${header.sortable ? 'sortable-header' : ''}`}
                onClick={header.sortable && onSort ? () => onSort(header.key) : undefined}
                style={header.sortable ? { cursor: 'pointer' } : {}}
              >
                {header.label}
                {header.sortable && renderSortIcon(header.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.id}>
            
              <td className={tableHeaders.find(h => h.key === 'title')?.className}>
                <span className="fw-medium text-primary-emphasis d-block">{model.title || 'N/A'}</span>
                <small className="text-muted">ID: {model.id ? model.id.substring(0, 8) + '...' : 'N/A'}</small>
              </td>
              <td className={tableHeaders.find(h => h.key === 'brand')?.className}>{model.brand || 'N/A'}</td>
              <td className={tableHeaders.find(h => h.key === 'model')?.className}>{model.model || 'N/A'}</td>
              <td className={tableHeaders.find(h => h.key === 'year')?.className}>{model.year || 'N/A'}</td>
              <td className={tableHeaders.find(h => h.key === 'vehicle_type_name')?.className}>{model.vehicle_type_name || 'N/A'}</td>
              <td className={tableHeaders.find(h => h.key === 'fuel_type')?.className}>{model.fuel_type || 'N/A'}</td>
              <td className={tableHeaders.find(h => h.key === 'transmission')?.className}>{model.transmission || 'N/A'}</td>
              <td className={tableHeaders.find(h => h.key === 'number_of_seats')?.className}>{model.number_of_seats || 'N/A'}</td>
              {/* <td className={tableHeaders.find(h => h.key === 'number_of_doors')?.className}>{model.number_of_doors || 'N/A'}</td> */}
              <td className={tableHeaders.find(h => h.key === 'base_price_per_day')?.className}>
                {formatPrice(model.base_price_per_day, 'MAD')}
              </td>
              <td className={tableHeaders.find(h => h.key === 'is_available')?.className}>
                {model.is_available ? (
                  <Badge pill bg="success-subtle" text="success-emphasis" className="status-badge">Available</Badge>
                ) : (
                  <Badge pill bg="danger-subtle" text="danger-emphasis" className="status-badge">Unavailable</Badge>
                )}
              </td>
              <td className={tableHeaders.find(h => h.key === 'created_at')?.className}>
                {formatDate(model.created_at_formatted || model.created_at)}
              </td>
              <td className={tableHeaders.find(h => h.key === 'actions')?.className}>
                <Button variant="link" size="sm" className="p-1 me-1 action-icon-btn text-info" title="View Details" onClick={() => onViewDetails && onViewDetails(model.id)}>
                  <LuEye size={18} />
                </Button>
                <Button variant="link" size="sm" className="p-1 me-1 action-icon-btn text-primary" title="Edit Model" onClick={() => onEditModel && onEditModel(model.id)}>
                  <Edit2 size={18} />
                </Button>
                <Button variant="link" size="sm" className="p-1 action-icon-btn text-danger" title="Delete Model" onClick={() => onDeleteModel && onDeleteModel(model.id)}>
                  <LuTrash2 size={18} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default VehicleModelTable;