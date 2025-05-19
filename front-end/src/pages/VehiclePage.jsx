import React, { useState, useEffect } from 'react'; // useEffect and useState needed for fetching dropdown data
import ResourcePage from '../components/ResourcePage';
import {
  fetchAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  fetchAllVehicleModels, // To populate dropdown for VehicleModel
  fetchAllAddresses    // To populate dropdown for Address (or create new)
} from '../services/api';
import { Form, Alert, InputGroup, Row, Col, Spinner } from 'react-bootstrap';
import { LuCar, LuWarehouse } from 'react-icons/lu'; // LuWarehouse or LuCar for "Vehicles"
import { VehicleStatus } from '../Enums'; // Assuming you create/have this Enum in React

// Helper to get display values from your Enums if they exist in React
// Otherwise, you might hardcode or fetch these from backend if they are dynamic
const vehicleStatusOptions = Object.values(VehicleStatus || {}).map(status => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
}));
// Example: if VehicleStatus is { AVAILABLE: 'available', RENTED: 'rented' }
// vehicleStatusOptions would be [{ value: 'available', label: 'Available' }, ...]


// 1. Define Columns for Vehicles
const vehicleColumns = [
  {
    header: 'License Plate',
    key: 'license_plate',
    className: 'data-cell-name', // For bolder text
  },
  {
    header: 'Model',
    key: 'vehicle_model_title', // From backend transformVehicle
    render: (item) => item.vehicle_model_title || <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Color',
    key: 'color',
  },
  {
    header: 'Mileage',
    key: 'mileage',
    textAlign: 'right',
    render: (item) => item.mileage?.toLocaleString() || <span className="text-muted-custom">N/A</span>,
  },
  {
    header: 'Status',
    key: 'status_display', // From backend transformVehicle
    textAlign: 'center',
    render: (item) => {
        let badgeBg = 'secondary';
        switch (item.status?.toLowerCase()) {
            case 'available': badgeBg = 'success'; break;
            case 'rented': badgeBg = 'warning'; break;
            case 'maintenance': badgeBg = 'info'; break;
            case 'unavailable': case 'damaged': badgeBg = 'danger'; break;
            default: break;
        }
        return item.status_display ? <span className={`badge bg-${badgeBg}-light text-${badgeBg}-dark`}>{item.status_display}</span> : <span className="text-muted-custom">N/A</span>;
    }
  },
  {
    header: 'Location',
    key: 'current_location_display', // From backend transformVehicle
    render: (item) => item.current_location_display || <span className="text-muted-custom">N/A</span>,
  },
];

// 2. Initial Form Data for Vehicles
const initialVehicleData = {
  id: null,
  vehicle_model_id: '',
  current_location_address_id: '', // Or null
  license_plate: '',
  vin: '',
  color: '',
  hexa_color_code: '',
  mileage: '',
  status: VehicleStatus?.AVAILABLE || 'available', // Default to available
  acquisition_date: '',
  // For creating a new address inline (optional)
  // new_address_street_line_1: '',
  // new_address_city: '',
  // new_address_postal_code: '',
  // new_address_country: '',
};

// 3. Render Modal Form for Vehicles
// This component will need to fetch VehicleModels and Addresses for dropdowns
const RenderVehicleModalForm = ({ formData, handleInputChange, modalFormErrors, isEditMode, setCurrentItemData }) => {
  const [vehicleModels, setVehicleModels] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [dropdownError, setDropdownError] = useState(null); // New state for dropdown errors

  useEffect(() => {
    const fetchDataForDropdowns = async () => {
      setLoadingDropdowns(true);
      setDropdownError(null); // Clear previous errors
      try {
        // Ensure fetchAllVehicleModels in api.js can handle the parameters passed
        const modelsPromise = fetchAllVehicleModels('', 'all'); // Assuming 'all' fetches all models for dropdown
        const addressesPromise = fetchAllAddresses({ all: true });

        const [modelsRes, addressesRes] = await Promise.all([modelsPromise, addressesPromise]);

        setVehicleModels(modelsRes.data.data || []);
        setAddresses(addressesRes.data.data || []);
      } catch (error) {
        console.error("Failed to load data for dropdowns:", error);
        setDropdownError('Could not load options for the form. Please try again.');
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDataForDropdowns();
  }, []);
  // Logic to handle creating a new address could go here if you add an "Add New Address" option
 if (!formData) {
    console.error("RenderVehicleModalForm: formData is still null or undefined!");
    // This indicates an issue with how ResourcePage initializes or passes currentItemData
    return <Alert variant="danger">Critical Error: Form data is missing. Cannot render form.</Alert>;
  }
  if (loadingDropdowns) {
    return <div className="text-center p-3"><Spinner animation="border" size="sm" /> Loading form options...</div>;
  }

  return (
    <>
     {modalFormErrors && Object.keys(modalFormErrors).length > 0 && (
        <Alert variant="danger" className="mb-3">
          Please correct the highlighted errors.
        </Alert>
      )}
      <Form.Group className="mb-3" controlId="vehicleVehicleModelId">
        <Form.Label>Vehicle Model <span className="text-danger">*</span></Form.Label>
        <Form.Select
          name="vehicle_model_id"
          value={formData.vehicle_model_id || ''}
          onChange={handleInputChange}
          required
          isInvalid={!!modalFormErrors?.vehicle_model_id}
        >
          <option value="">Select Model...</option>
          {vehicleModels.map(model => (
            <option key={model.id} value={model.id}>{model.title} ({model.brand} {model.model_name || model.model})</option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">{modalFormErrors?.vehicle_model_id?.join(', ')}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="vehicleLicensePlate">
        <Form.Label>License Plate <span className="text-danger">*</span></Form.Label>
        <Form.Control type="text" name="license_plate" value={formData.license_plate || ''} onChange={handleInputChange} required maxLength={20} placeholder="e.g., ABC-123" isInvalid={!!modalFormErrors?.license_plate} />
        <Form.Control.Feedback type="invalid">{modalFormErrors?.license_plate?.join(', ')}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="vehicleVin">
        <Form.Label>VIN</Form.Label>
        <Form.Control type="text" name="vin" value={formData.vin || ''} onChange={handleInputChange} maxLength={100} placeholder="Vehicle Identification Number" isInvalid={!!modalFormErrors?.vin} />
        <Form.Control.Feedback type="invalid">{modalFormErrors?.vin?.join(', ')}</Form.Control.Feedback>
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="vehicleColor">
            <Form.Label>Color <span className="text-danger">*</span></Form.Label>
            <Form.Control type="text" name="color" value={formData.color || ''} onChange={handleInputChange} required maxLength={50} placeholder="e.g., White, Midnight Blue" isInvalid={!!modalFormErrors?.color}/>
            <Form.Control.Feedback type="invalid">{modalFormErrors?.color?.join(', ')}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="vehicleHexColorCode">
            <Form.Label>Hex Color Code</Form.Label>
            <Form.Control type="text" name="hexa_color_code" value={formData.hexa_color_code || ''} onChange={handleInputChange} maxLength={7} placeholder="e.g., #FFFFFF" isInvalid={!!modalFormErrors?.hexa_color_code}/>
            <Form.Control.Feedback type="invalid">{modalFormErrors?.hexa_color_code?.join(', ')}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="vehicleMileage">
        <Form.Label>Mileage <span className="text-danger">*</span></Form.Label>
        <InputGroup>
          <Form.Control type="number" name="mileage" value={formData.mileage || ''} onChange={handleInputChange} required min="0" placeholder="e.g., 25000" isInvalid={!!modalFormErrors?.mileage}/>
          <InputGroup.Text>km</InputGroup.Text> {/* Or miles */}
        </InputGroup>
        {modalFormErrors?.mileage && (<div className="invalid-feedback d-block">{modalFormErrors.mileage.join(', ')}</div>)}
      </Form.Group>

      <Form.Group className="mb-3" controlId="vehicleStatus">
        <Form.Label>Status <span className="text-danger">*</span></Form.Label>
        <Form.Select name="status" value={formData.status || ''} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.status}>
          <option value="">Select Status...</option>
          {vehicleStatusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">{modalFormErrors?.status?.join(', ')}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="vehicleAcquisitionDate">
        <Form.Label>Acquisition Date</Form.Label>
        <Form.Control type="date" name="acquisition_date" value={formData.acquisition_date || ''} onChange={handleInputChange} isInvalid={!!modalFormErrors?.acquisition_date}/>
        <Form.Control.Feedback type="invalid">{modalFormErrors?.acquisition_date?.join(', ')}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="vehicleCurrentLocationAddressId">
        <Form.Label>Current Location Address</Form.Label>
        <Form.Select name="current_location_address_id" value={formData.current_location_address_id || ''} onChange={handleInputChange} isInvalid={!!modalFormErrors?.current_location_address_id}>
          <option value="">Select Address (Optional)...</option>
          {/* TODO: Add an option to create a new address inline */}
          {addresses.map(address => (
            <option key={address.id} value={address.id}>
              {address.street_line_1}, {address.city}, {address.postal_code}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">{modalFormErrors?.current_location_address_id?.join(', ')}</Form.Control.Feedback>
        {/* Add fields for new address here if implementing inline creation */}
      </Form.Group>
    </>
  );
};


// The VehiclePage component
const VehiclePage = () => {
  // Helper to process form data before sending to API
  const processVehicleData = (data) => {
    const processed = { ...data };
    if (processed.mileage === '' || isNaN(parseInt(processed.mileage))) {
      processed.mileage = 0; // Or handle as error
    } else {
      processed.mileage = parseInt(processed.mileage);
    }
    if (processed.acquisition_date === '') {
      processed.acquisition_date = null;
    }
    if (processed.current_location_address_id === '') {
        processed.current_location_address_id = null;
    }
    // Remove new_address fields if they are not part of the main submission object
    // delete processed.new_address_street_line_1; // etc.
    return processed;
  };


  return (
    <ResourcePage
      resourceName="Vehicle"
      resourceNamePlural="Vehicles"
      IconComponent={LuWarehouse} // Or LuCar
      columns={vehicleColumns}
      initialFormData={initialVehicleData}
      renderModalForm={RenderVehicleModalForm} // Note: This is a component now
      fetchAllItems={fetchAllVehicles}
      createItem={(data) => createVehicle(processVehicleData(data))}
      updateItem={(id, data) => updateVehicle(id, processVehicleData(data))}
      deleteItem={deleteVehicle}
      searchPlaceholder="Search by License Plate, VIN, Model, Color..."
      // You might want backend pagination for Vehicles if the list can be very large
      // itemsPerPage={15}
    />
  );
};

export default VehiclePage;