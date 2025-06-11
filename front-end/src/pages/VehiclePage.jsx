// src/pages/VehiclePage.jsx

// --- IMPORTS ---
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, InputGroup, Form } from 'react-bootstrap';
import { LuCar, LuEye, LuFilter } from 'react-icons/lu';
import * as Yup from 'yup';

import {
  fetchAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  fetchAllVehicleModelsForDropdown, // Correct, lightweight function for dropdowns
  fetchAllAddresses,
  createAddress
} from '../services/api'; // Adjust path if needed
import { VehicleStatus } from '../Enums'; // Adjust path if needed
import ResourcePage from '../components/ResourcePage'; // Adjust path if needed
import RenderVehicleModalForm from '../components/RenderVehicleModalForm'; // Adjust path to your new form component

// ===================================================================================
// VEHICLE PAGE SPECIFIC CONFIGURATIONS
// ===================================================================================

const renderStatusBadge = (status, statusDisplay) => {
  let config = { bg: 'secondary' };
  switch (status?.toLowerCase()) {
    case 'available': config = { bg: 'success' }; break;
    case 'rented': config = { bg: 'warning', text: 'dark' }; break;
    case 'maintenance': config = { bg: 'info', text: 'dark' }; break;
    case 'unavailable': case 'damaged': config = { bg: 'danger' }; break;
    default: config = { bg: 'light', text: 'dark' }; break;
  }
  return <span className={`badge rounded-pill text-bg-${config.bg}`}>{statusDisplay}</span>;
};

const vehicleColumns = [
    { header: 'License Plate', key: 'license_plate', className: 'fw-bold' },
    { header: 'Model', key: 'vehicle_model_title', render: item => item.vehicle_model_title || <span className="text-muted">N/A</span> },
    { header: 'Color', key: 'color', render: item => item.color || <span className="text-muted">N/A</span> },
    { header: 'Mileage', key: 'mileage', textAlign: 'right', render: item => item.mileage?.toLocaleString() || <span className="text-muted">N/A</span> },
    { header: 'Status', key: 'status_display', textAlign: 'center', render: item => renderStatusBadge(item.status, item.status_display) },
    { header: 'Location', key: 'current_location_display', render: item => item.current_location_display || <span className="text-muted">N/A</span> },
];

const vehicleStatusOptions = Object.values(VehicleStatus || {}).map(status => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
}));

// --- FORM CONFIGURATION ---
const initialVehicleData = {
    id: null,
    vehicle_model_id: '',
    current_location_address_id: '',
    license_plate: '', vin: '', color: '', hexa_color_code: '',
    mileage: '', status: 'available', acquisition_date: '',
    isCreatingNewAddress: false,
    new_address_street_1: '', new_address_street_2: '',
    new_address_city: '', new_address_postal_code: '',
    new_address_country: '', new_address_notes: ''
};

const vehicleValidationSchema = Yup.object().shape({
    vehicle_model_id: Yup.string().required('Vehicle model is required.'),
    license_plate: Yup.string().required('License plate is required.'),
    mileage: Yup.number().typeError('Mileage must be a number').required('Mileage is required.').min(0, 'Mileage cannot be negative.'),
    status: Yup.string().required('Status is required.'),
    color: Yup.string().required('Color name is required.'),
});

// A helper function to process form data before sending to the API
const processVehicleDataForApi = async (data) => {
    let processedData = { ...data };
    let newAddress = null;

    if (processedData.isCreatingNewAddress) {
        const newAddressPayload = {
            street_line_1: processedData.new_address_street_1,
            street_line_2: processedData.new_address_street_2,
            city: processedData.new_address_city,
            postal_code: processedData.new_address_postal_code,
            country: processedData.new_address_country,
            notes: processedData.new_address_notes
        };
        if (!newAddressPayload.street_line_1 || !newAddressPayload.city) {
          throw new Error("Street Line 1 and City are required for a new address.");
        }
        const res = await createAddress(newAddressPayload);
        newAddress = res.data.data;
        processedData.current_location_address_id = newAddress.id;
    }

    const fieldsToDelete = [
        'isCreatingNewAddress', 'new_address_street_1', 'new_address_street_2', 'new_address_city',
        'new_address_postal_code', 'new_address_country', 'new_address_notes'
    ];
    fieldsToDelete.forEach(field => delete processedData[field]);

    processedData.mileage = processedData.mileage || 0;
    if (processedData.acquisition_date === '') processedData.acquisition_date = null;
    if (processedData.current_location_address_id === 'CREATE_NEW') processedData.current_location_address_id = null;

    return { processedData, newAddress };
};


// ===================================================================================
// MAIN VehiclePage COMPONENT
// ===================================================================================
const VehiclePage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [dropdownsLoading, setDropdownsLoading] = useState(true);
  const [dropdownsError, setDropdownsError] = useState(null);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const safeParseJson = useCallback((jsonStringOrArray) => {
    if (Array.isArray(jsonStringOrArray)) return jsonStringOrArray;
    if (typeof jsonStringOrArray === 'string') {
      try { return JSON.parse(jsonStringOrArray); } catch (e) { return []; }
    } return [];
  }, []);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [modelsRes, addressesRes] = await Promise.all([
          fetchAllVehicleModelsForDropdown(),
          fetchAllAddresses({ all: true })
        ]);
        const parsedModels = (modelsRes.data.data || []).map(model => ({
          ...model,
          available_colors: safeParseJson(model.available_colors)
        }));
        setVehicleModels(parsedModels);
        setAddresses(addressesRes.data.data || []);
      } catch (err) {
        setDropdownsError('Could not load page dependencies.');
      } finally {
        setDropdownsLoading(false);
      }
    };
    loadDropdownData();
  }, [safeParseJson]);

  const fetchAndFilterAllVehicles = useCallback(async () => {
    const response = await fetchAllVehicles({ all: true });
    let vehicles = response.data.data || response.data || [];
    if (statusFilter) {
      vehicles = vehicles.filter(vehicle => vehicle.status === statusFilter);
    }
    return { data: { data: vehicles } };
  }, [statusFilter]);

  const handleModelChangeForForm = (setCurrentItemData) => (selectedOption) => {
      const model = selectedOption ? selectedOption.fullModel : null;
      setCurrentItemData(prev => ({
          ...prev,
          vehicle_model_id: model ? model.id : '',
          color: '',
          hexa_color_code: ''
      }));
  };

  const handleColorChangeForForm = (setCurrentItemData, selectedModel) => (e) => {
      const selectedHex = e.target.value;
      const selectedColorObject = selectedModel?.available_colors?.find(c => c.hex === selectedHex);
      setCurrentItemData(prev => ({
          ...prev,
          hexa_color_code: selectedHex,
          color: selectedColorObject ? selectedColorObject.name : prev.color
      }));
  };

  const handleGenericInputChange = (setCurrentItemData) => (e) => {
      const { name, value, type, checked } = e.target;
      if (name === 'current_location_address_id') {
          setCurrentItemData(prev => ({
              ...prev,
              [name]: value,
              isCreatingNewAddress: value === 'CREATE_NEW',
          }));
      } else {
          setCurrentItemData(prev => ({
              ...prev,
              [name]: type === 'checkbox' ? checked : value
          }));
      }
  };

  if (dropdownsLoading) {
    return (
      <div className="p-5 text-center"><Spinner animation="border" /><p className="mt-2">Loading Page Data...</p></div>
    );
  }
  if (dropdownsError) {
    return <Alert variant="danger">{dropdownsError}</Alert>;
  }

  const viewAction = {
    icon: <LuEye size={18} style={{ color: '#10b981' }} />,
    title: 'View Vehicle Details',
    handler: (item) => navigate(`/admin/vehicle-instance/${item.id}`),
  };

  const StatusFilterControl = (
    <InputGroup style={{ maxWidth: '200px' }}>
      <InputGroup.Text><LuFilter /></InputGroup.Text>
      <Form.Select
        name="status"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All Statuses</option>
        {vehicleStatusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
      </Form.Select>
    </InputGroup>
  );

  return (
    <ResourcePage
      resourceName="Vehicle"
      resourceNamePlural="Vehicles"
      IconComponent={LuCar}
      columns={vehicleColumns}
      searchPlaceholder="Search by License Plate, VIN, Model..."
      fetchAllItems={fetchAndFilterAllVehicles}
      
      createItem={async (data) => {
        const { processedData, newAddress } = await processVehicleDataForApi(data);
        if (newAddress) {
            setAddresses(currentAddresses => [newAddress, ...currentAddresses]);
        }
        return createVehicle(processedData);
      }}
      
      updateItem={async (id, data) => {
        const { processedData, newAddress } = await processVehicleDataForApi(data);
        if (newAddress) {
            setAddresses(currentAddresses => [newAddress, ...currentAddresses]);
        }
        return updateVehicle(id, processedData);
      }}
      
      deleteItem={deleteVehicle}
      initialFormData={initialVehicleData}
      validationSchema={vehicleValidationSchema}
      
      renderModalForm={(formData, handleInputChange, modalFormErrors, isEditMode, setCurrentItemData) => {
        const currentSelectedModel = vehicleModels.find(m => String(m.id) === String(formData.vehicle_model_id));
        return (
          <RenderVehicleModalForm
            formData={formData}
            handleInputChange={handleGenericInputChange(setCurrentItemData)}
            modalFormErrors={modalFormErrors}
            isEditMode={isEditMode}
            vehicleModels={vehicleModels}
            addresses={addresses}
            selectedModel={currentSelectedModel} 
            onModelChange={handleModelChangeForForm(setCurrentItemData)}
            onColorChange={handleColorChangeForForm(setCurrentItemData, currentSelectedModel)}
          />
        );
      }}
      
      tableActionsConfig={[viewAction]}
      additionalControls={StatusFilterControl}
      key={statusFilter}
    />
  );
};

export default VehiclePage;