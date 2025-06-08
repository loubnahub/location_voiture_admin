// src/pages/admin/vehicles/VehicleCreatePage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, Spinner,
  Alert, InputGroup, Image
} from 'react-bootstrap';
import {
 LuCar, LuPalette, LuSave, LuX, LuImageOff, LuMapPin
} from 'react-icons/lu';
import { PlusCircle } from 'lucide-react';
import Select from 'react-select';

import {
  createVehicle,
  fetchAllVehicleModelsForDropdown,
  fetchAllAddresses,
  createAddress
} from '../services/api';
import { VehicleStatus } from '../Enums';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '38px',
    borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, .25)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#86b7fe' : '#b3b3b3',
    }
  }),
  menu: (provided) => ({ ...provided, zIndex: 10 }),
};

const VehicleCreatePage = () => {
  const navigate = useNavigate();

  // All state management is already correct and remains the same
  const [formData, setFormData] = useState({
    vehicle_model_id: '',
    current_location_address_id: '',
    license_plate: '', vin: '', color: '', hexa_color_code: '',
    mileage: '', status: 'available',
    acquisition_date: new Date().toISOString().split('T')[0],
    isCreatingNewAddress: false,
    new_address_street_1: '', new_address_street_2: '',
    new_address_city: '', new_address_postal_code: '',
    new_address_country: '', new_address_notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedModelImage, setSelectedModelImage] = useState(null);

  // Data fetching and event handlers remain the same
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
        setError('Could not load required data (Models & Addresses). Please try again.');
      } finally {
        setDropdownsLoading(false);
      }
    };
    loadDropdownData();
  }, [safeParseJson]);

  const modelOptions = useMemo(() => 
    vehicleModels.map(model => ({
      value: model.id,
      label: `${model.title} (${model.brand})`,
      fullModel: model 
    })), 
    [vehicleModels]
  );
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'current_location_address_id') {
      setFormData(prev => ({ ...prev, isCreatingNewAddress: value === 'CREATE_NEW', [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleModelChange = (selectedOption) => {
    if (selectedOption) {
      const model = selectedOption.fullModel;
      setSelectedModel(model || null);
      setSelectedModelImage(model?.thumbnail_url || null);
      setFormData(prev => ({ ...prev, vehicle_model_id: model.id, color: '', hexa_color_code: '' }));
    } else {
      setSelectedModel(null);
      setSelectedModelImage(null);
      setFormData(prev => ({ ...prev, vehicle_model_id: '', color: '', hexa_color_code: '' }));
    }
  };

  const handleColorChange = (e) => {
    const selectedHex = e.target.value;
    const selectedColorObject = selectedModel?.available_colors?.find(c => c.hex === selectedHex);
    setFormData(prev => ({...prev, hexa_color_code: selectedHex, color: selectedColorObject ? selectedColorObject.name : '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      let finalAddressId = formData.current_location_address_id;
      if (formData.isCreatingNewAddress) {
        const newAddressPayload = {
          street_line_1: formData.new_address_street_1, street_line_2: formData.new_address_street_2,
          city: formData.new_address_city, postal_code: formData.new_address_postal_code,
          country: formData.new_address_country, notes: formData.new_address_notes
        };
        if (!newAddressPayload.street_line_1 || !newAddressPayload.city) {
          throw new Error("Street Line 1 and City are required for a new address.");
        }
        const res = await createAddress(newAddressPayload);
        finalAddressId = res.data.data.id;
      }
      const vehiclePayload = {
        vehicle_model_id: formData.vehicle_model_id,
        current_location_address_id: finalAddressId === 'CREATE_NEW' ? null : finalAddressId,
        license_plate: formData.license_plate, vin: formData.vin, color: formData.color,
        hexa_color_code: formData.hexa_color_code, mileage: formData.mileage || 0,
        status: formData.status, acquisition_date: formData.acquisition_date || null,
      };
      await createVehicle(vehiclePayload);
      navigate('/admin/inventory/vehicles', {
        state: { successMessage: `Vehicle ${vehiclePayload.license_plate} created successfully!` }
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      const validation = err.response?.data?.errors ? ' Details: ' + Object.values(err.response.data.errors).flat().join(' ') : '';
      setError(msg + validation);
    } finally {
      setIsSaving(false);
    }
  };

  if (dropdownsLoading) {
    return (
      <Container className="p-4 text-center"><Spinner animation="border" /><p className="mt-2">Loading...</p></Container>
    );
  }

  const statusOptions = Object.values(VehicleStatus).map(value => ({
    value, label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, ' ')
  }));

  return (
    <Container fluid className="p-4">
      <style>{`
        .color-preview-swatch { display: inline-block; width: 24px; height: 24px; border-radius: 4px; border: 1px solid #dee2e6; vertical-align: middle; }
      `}</style>
      
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center"><PlusCircle size={32} className="me-2 text-primary" /><h1 className="h3 mb-0">Create New Vehicle</h1></div>
          <p className="text-muted mt-1">Add a new specific vehicle instance to your fleet.</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Form onSubmit={handleSave}>
        <Row>
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header><LuCar className="me-2"/>Core Information</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3"><Form.Label>Vehicle Model <span className="text-danger">*</span></Form.Label><Select options={modelOptions} value={modelOptions.find(option => option.value === formData.vehicle_model_id)} onChange={handleModelChange} placeholder="-- Type to search or select a Model --" isClearable isSearchable isLoading={dropdownsLoading} styles={customSelectStyles} inputId="vehicle-model-select" /></Form.Group>
                <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>License Plate <span className="text-danger">*</span></Form.Label><Form.Control type="text" name="license_plate" value={formData.license_plate} onChange={handleInputChange} required /></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label>VIN</Form.Label><Form.Control type="text" name="vin" value={formData.vin} onChange={handleInputChange} /></Form.Group></Col></Row>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mb-4">
              <Card.Header><LuPalette className="me-2" />Details & Status</Card.Header>
              <Card.Body>
                <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Color</Form.Label><Form.Select name="hexa_color_code" value={formData.hexa_color_code} onChange={handleColorChange} disabled={!selectedModel || selectedModel.available_colors.length === 0}><option value="">{selectedModel ? "Select from model's palette..." : "Select a model first"}</option>{selectedModel?.available_colors.map(c => (<option key={c.hex} value={c.hex}>{c.name}</option>))}</Form.Select></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label>Color Name (Override)</Form.Label><Form.Control type="text" name="color" value={formData.color} onChange={handleInputChange} placeholder="e.g. Cherry Red" /></Form.Group>{formData.hexa_color_code && (<div className="d-flex align-items-center mt-2 text-muted small"><span className="color-preview-swatch me-2" style={{ backgroundColor: formData.hexa_color_code }} /><span>Preview: {formData.color} ({formData.hexa_color_code})</span></div>)}</Col></Row>
                <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Mileage <span className="text-danger">*</span></Form.Label><InputGroup><Form.Control type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} required min="0" /><InputGroup.Text>km</InputGroup.Text></InputGroup></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label>Status <span className="text-danger">*</span></Form.Label><Form.Select name="status" value={formData.status} onChange={handleInputChange} required>{statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Form.Select></Form.Group></Col></Row>
                <Form.Group className="mb-3"><Form.Label>Acquisition Date</Form.Label><Form.Control type="date" name="acquisition_date" value={formData.acquisition_date} onChange={handleInputChange} /></Form.Group>
              </Card.Body>
            </Card>

            {/* <<< --- NEW LOCATION CARD ADDED HERE --- >>> */}
            <Card className="shadow-sm mb-4">
              <Card.Header><LuMapPin className="me-2"/>Location</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Current Address</Form.Label>
                  <Form.Select name="current_location_address_id" value={formData.isCreatingNewAddress ? 'CREATE_NEW' : formData.current_location_address_id || ''} onChange={handleInputChange}>
                    <option value="">-- No Address (Unassigned) --</option>
                    {addresses.map(addr => (<option key={addr.id} value={addr.id}>{`${addr.street_line_1}, ${addr.city}`}</option>))}
                    <option value="CREATE_NEW" className="fw-bold text-primary">[+] Add New Address</option>
                  </Form.Select>
                </Form.Group>
                
                {formData.isCreatingNewAddress && (
                  <div className="p-3 border rounded bg-light mb-3 mt-3">
                    <h5 className="mb-3 small text-muted">NEW ADDRESS DETAILS</h5>
                    <Form.Group className="mb-3"><Form.Label>Street Line 1 <span className="text-danger">*</span></Form.Label><Form.Control name="new_address_street_1" type="text" onChange={handleInputChange} /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Street Line 2</Form.Label><Form.Control name="new_address_street_2" type="text" onChange={handleInputChange} /></Form.Group>
                    <Row>
                      <Col md={6}><Form.Group className="mb-3"><Form.Label>City <span className="text-danger">*</span></Form.Label><Form.Control name="new_address_city" type="text" onChange={handleInputChange} /></Form.Group></Col>
                      <Col md={6}><Form.Group className="mb-3"><Form.Label>Postal Code</Form.Label><Form.Control name="new_address_postal_code" type="text" onChange={handleInputChange} /></Form.Group></Col>
                    </Row>
                    <Form.Group className="mb-3"><Form.Label>Country</Form.Label><Form.Control name="new_address_country" type="text" onChange={handleInputChange} /></Form.Group>
                    <Form.Group className="mb-2"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={2} name="new_address_notes" onChange={handleInputChange} /></Form.Group>
                  </div>
                )}
              </Card.Body>
            </Card>

            <div className="text-end">
                <Button variant="outline-secondary" className="me-2" onClick={() => navigate(-1)} disabled={isSaving} type="button"><LuX className="me-1"/> Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSaving}><LuSave className="me-1" />{isSaving ? 'Creating...' : 'Create Vehicle'}</Button>
            </div>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm sticky-top" style={{top: '20px'}}>
              <Card.Header>Model Preview</Card.Header>
              <Card.Body className="text-center">
                {selectedModelImage ? (<Image src={`${API_BASE_URL}/storage/${selectedModelImage.replace('public/', '')}`} fluid rounded />) : (<div className="d-flex flex-column align-items-center justify-content-center text-muted bg-light" style={{height: '200px', borderRadius: 'var(--bs-card-inner-border-radius)'}}><LuImageOff size={40} /><p className="mt-2 mb-0">Select a model to see a preview</p></div>)}
                {selectedModel && (<div className="mt-3"><h5 className="mb-0">{selectedModel.title}</h5><p className="text-muted small">{selectedModel.brand} / {selectedModel.year}</p></div>)}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default VehicleCreatePage;