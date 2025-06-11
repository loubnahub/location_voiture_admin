// src/components/forms/RenderVehicleModalForm.jsx

import React, { useMemo } from 'react';
import { Row, Col, Form, InputGroup, Card, Image, Alert } from 'react-bootstrap';
import { LuImageOff } from 'react-icons/lu';
import Select from 'react-select';
import { VehicleStatus } from '../Enums'; // Adjust path if needed

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Custom styles for react-select, same as in your create page
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
  menu: (provided) => ({ ...provided, zIndex: 9999 }), // High z-index for modals
};

// This is the "Dumb" form component
const RenderVehicleModalForm = ({
  formData,
  handleInputChange,
  modalFormErrors,
  isEditMode,
  // Props passed down from VehiclePage
  vehicleModels,
  addresses,
  onModelChange,
  selectedModel,
  onColorChange,
}) => {

  const modelOptions = useMemo(() =>
    vehicleModels.map(model => ({
      value: model.id,
      label: `${model.title} (${model.brand})`,
      fullModel: model
    })),
    [vehicleModels]
  );

  const statusOptions = useMemo(() => Object.values(VehicleStatus).map(value => ({
    value, label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, ' ')
  })), []);

  const selectedModelImage = selectedModel?.thumbnail_url || null;

  return (
    <>
      <style>{`
        .color-preview-swatch { display: inline-block; width: 24px; height: 24px; border-radius: 4px; border: 1px solid #dee2e6; vertical-align: middle; }
      `}</style>
      
      {/* Display general form errors from API validation */}
      {modalFormErrors && Object.keys(modalFormErrors).length > 0 && (
          <Alert variant="danger" className="mb-3">Please correct the highlighted errors below.</Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="border-0">
            <Card.Body className="p-0">
              <Form.Group className="mb-3">
                <Form.Label>Vehicle Model <span className="text-danger">*</span></Form.Label>
                <Select
                  options={modelOptions}
                  value={modelOptions.find(option => option.value === formData.vehicle_model_id)}
                  onChange={onModelChange}
                  placeholder="-- Select a Model --"
                  isClearable
                  isSearchable
                  styles={customSelectStyles}
                  inputId="vehicle-model-select-modal"
                />
                {modalFormErrors.vehicle_model_id && <div className="text-danger small mt-1">{modalFormErrors.vehicle_model_id}</div>}
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>License Plate <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="license_plate" value={formData.license_plate || ''} onChange={handleInputChange} isInvalid={!!modalFormErrors.license_plate} required />
                    <Form.Control.Feedback type="invalid">{modalFormErrors.license_plate}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3"><Form.Label>VIN</Form.Label><Form.Control type="text" name="vin" value={formData.vin || ''} onChange={handleInputChange} /></Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 mt-3">
            <Card.Body className="p-0">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Color Palette</Form.Label>
                    <Form.Select name="hexa_color_code_select" value={formData.hexa_color_code || ''} onChange={onColorChange} disabled={!selectedModel || !selectedModel.available_colors || selectedModel.available_colors.length === 0}>
                      <option value="">{selectedModel ? "Select pre-defined color..." : "Select a model first"}</option>
                      {selectedModel?.available_colors?.map(c => (<option key={c.hex} value={c.hex}>{c.name}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Color Name (Override) <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="color" value={formData.color || ''} onChange={handleInputChange} isInvalid={!!modalFormErrors.color} placeholder="e.g. Cherry Red" required />
                     <Form.Control.Feedback type="invalid">{modalFormErrors.color}</Form.Control.Feedback>
                  </Form.Group>
                  {formData.hexa_color_code && (
                    <div className="d-flex align-items-center mt-2 text-muted small">
                      <span className="color-preview-swatch me-2" style={{ backgroundColor: formData.hexa_color_code }} />
                      <span>Preview: {formData.color} ({formData.hexa_color_code})</span>
                    </div>
                  )}
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mileage <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <Form.Control type="number" name="mileage" value={formData.mileage || ''} onChange={handleInputChange} isInvalid={!!modalFormErrors.mileage} required min="0" />
                      <InputGroup.Text>km</InputGroup.Text>
                      <Form.Control.Feedback type="invalid">{modalFormErrors.mileage}</Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                    <Form.Select name="status" value={formData.status || 'available'} onChange={handleInputChange} required>{statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3"><Form.Label>Acquisition Date</Form.Label><Form.Control type="date" name="acquisition_date" value={formData.acquisition_date || ''} onChange={handleInputChange} /></Form.Group>
            </Card.Body>
          </Card>

          <Card className="border-0 mt-3">
             <Card.Body className="p-0">
                <Form.Group className="mb-3">
                  <Form.Label>Current Address</Form.Label>
                  <Form.Select name="current_location_address_id" value={formData.isCreatingNewAddress ? 'CREATE_NEW' : formData.current_location_address_id || ''} onChange={handleInputChange}>
                    <option value="">-- No Address (Unassigned) --</option>
                    {addresses.map(addr => (<option key={addr.id} value={addr.id}>{`${addr.street_line_1}, ${addr.city}`}</option>))}
                    <option value="CREATE_NEW" className="fw-bold text-primary">[+] Add New Address</option>
                  </Form.Select>
                </Form.Group>

                {/* --- THIS IS THE CORRECTED, FULLY IMPLEMENTED SECTION --- */}
                {formData.isCreatingNewAddress && (
                  <div className="p-3 border rounded bg-light mb-3 mt-3">
                    <h5 className="mb-3 small text-muted">NEW ADDRESS DETAILS</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Street Line 1 <span className="text-danger">*</span></Form.Label>
                      <Form.Control name="new_address_street_1" type="text" value={formData.new_address_street_1 || ''} onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Street Line 2</Form.Label>
                      <Form.Control name="new_address_street_2" type="text" value={formData.new_address_street_2 || ''} onChange={handleInputChange} />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>City <span className="text-danger">*</span></Form.Label>
                          <Form.Control name="new_address_city" type="text" value={formData.new_address_city || ''} onChange={handleInputChange} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Postal Code</Form.Label>
                          <Form.Control name="new_address_postal_code" type="text" value={formData.new_address_postal_code || ''} onChange={handleInputChange} />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Control name="new_address_country" type="text" value={formData.new_address_country || ''} onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Notes</Form.Label>
                      <Form.Control as="textarea" rows={2} name="new_address_notes" value={formData.new_address_notes || ''} onChange={handleInputChange} />
                    </Form.Group>
                  </div>
                )}
                {/* --- END OF CORRECTED SECTION --- */}
             </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header>Model Preview</Card.Header>
            <Card.Body className="text-center">
              {selectedModelImage ? (<Image src={`${API_BASE_URL}/storage/${selectedModelImage.replace('public/', '')}`} fluid rounded />) : (<div className="d-flex flex-column align-items-center justify-content-center text-muted bg-light" style={{height: '150px', borderRadius: 'var(--bs-card-inner-border-radius)'}}><LuImageOff size={30} /><p className="mt-2 mb-0 small">Select a model to see a preview</p></div>)}
              {selectedModel && (<div className="mt-3"><h6 className="mb-0">{selectedModel.title}</h6><p className="text-muted small mb-0">{selectedModel.brand} / {selectedModel.year}</p></div>)}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default RenderVehicleModalForm;