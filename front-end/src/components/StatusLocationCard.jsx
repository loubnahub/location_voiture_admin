import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Modal, Form, Spinner, Alert as BootstrapAlert } from 'react-bootstrap';
import { LuPalette, LuGauge, LuMapPin, LuCar, LuTag, LuCalendarDays, LuFingerprint } from 'react-icons/lu';
import { Edit as EditIcon, Trash2 as DeleteIcon, ParkingCircle } from 'lucide-react';

import { VehicleStatus } from '../Enums';
import { updateVehicle, deleteVehicle, updateAddress, createAddress } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

const StatusLocationCard = ({ instance, onDataChange }) => {
  // --- State Management ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({});

  // --- Effect to sync form state with instance prop ---
  useEffect(() => {
    if (instance) {
      setFormData({
        license_plate: instance.license_plate || '',
        vin: instance.vin || '',
        color: instance.color || '',
        hexa_color_code: instance.hexa_color_code || '#000000',
        mileage: instance.mileage || 0,
        status: instance.status || '',
        acquisition_date: instance.acquisition_date || '',
        street_line_1: instance.current_location?.street_line_1 || '',
        street_line_2: instance.current_location?.street_line_2 || '',
        city: instance.current_location?.city || '',
        postal_code: instance.current_location?.postal_code || '',
        country: instance.current_location?.country || '',
        location_notes: instance.current_location?.notes || '',
      });
    }
  }, [instance]);

  // --- Event Handlers ---
  const handleShowEditModal = () => { setSubmitError(''); setShowEditModal(true); };
  const handleCloseEditModal = () => setShowEditModal(false);
  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleColorChange = (e) => {
    const selectedHex = e.target.value;
    const modelColors = safeParseJson(instance?.model_details?.available_colors_from_model);
    const selectedColorObject = modelColors.find(c => c.hex === selectedHex);
    setFormData(prev => ({ ...prev, hexa_color_code: selectedHex, color: selectedColorObject ? selectedColorObject.name : prev.color }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      let finalAddressId = instance.current_location?.id || null;
      const addressPayload = {
        street_line_1: formData.street_line_1, street_line_2: formData.street_line_2 || null, city: formData.city,
        postal_code: formData.postal_code, country: formData.country, notes: formData.location_notes || null,
      };
      const hasAddressDataInForm = Object.values(addressPayload).some(val => val);
      if (hasAddressDataInForm) {
        if (instance.current_location?.id) { await updateAddress(instance.current_location.id, addressPayload); }
        else { const res = await createAddress(addressPayload); finalAddressId = res.data.data.id; }
      } else if (instance.current_location?.id) { finalAddressId = null; }
      
      const vehiclePayload = {
        license_plate: formData.license_plate, vin: formData.vin, color: formData.color,
        hexa_color_code: formData.hexa_color_code, mileage: parseInt(formData.mileage, 10) || 0,
        status: formData.status, acquisition_date: formData.acquisition_date || null,
        current_location_address_id: finalAddressId,
      };
      await updateVehicle(instance.id, vehiclePayload);
      handleCloseEditModal();
      if (onDataChange) onDataChange({ type: 'update', success: true, id: instance.id });
    } catch (error) {
      const msg = error.response?.data?.message || 'An unexpected error occurred.';
      const validation = error.response?.data?.errors ? ' Details: ' + Object.values(error.response.data.errors).flat().join(' ') : '';
      setSubmitError(msg + validation);
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await deleteVehicle(instance.id);
      if (onDataChange) onDataChange({ type: 'delete', success: true, id: instance.id });
    } catch (error) {
      alert(`Delete failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  // --- THE DEFINITIVE FIX: A safe JSON parsing utility ---
  const safeParseJson = (jsonStringOrArray) => {
    if (Array.isArray(jsonStringOrArray)) {
      return jsonStringOrArray; // It's already an array, return it.
    }
    if (typeof jsonStringOrArray === 'string' && jsonStringOrArray.startsWith('[')) {
      try {
        return JSON.parse(jsonStringOrArray); // It's a string, so we parse it.
      } catch (e) {
        console.error("Failed to parse color options JSON string:", e);
        return []; // Return empty array on parsing error.
      }
    }
    return []; // If it's not an array or a parsable string, return empty array.
  };

  if (!instance || !instance.id || !instance.model_details) {
    return (
      <Card className="status-location-card shadow-sm mb-4">
        <Card.Body className="d-flex align-items-center justify-content-center text-muted" style={{ minHeight: '200px' }}>
          <Spinner animation="border" size="sm" className="me-2" /> Loading Vehicle Details...
        </Card.Body>
      </Card>
    );
  }

  const { license_plate, vin, status_display, color, mileage, status, current_location, hexa_color_code, acquisition_date, model_details } = instance;
  
  const statusOptions = Object.values(VehicleStatus).map(value => ({
    value, label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, ' ')
  }));
  
  // Use the safe parser to guarantee modelColorOptions is an array.
  const modelColorOptions = safeParseJson(model_details.available_colors_from_model);

  const getBadgeVariant = () => {
    switch (status) {
      case VehicleStatus.AVAILABLE: return 'success';
      case VehicleStatus.RENTED: return 'primary';
      case VehicleStatus.MAINTENANCE: return 'warning';
      case VehicleStatus.BOOKED: return 'info';
      case VehicleStatus.DAMAGED: return 'danger';
      case VehicleStatus.UNAVAILABLE: return 'dark';
      case VehicleStatus.PENDING_INSPECTION: return 'light';
      default: return 'secondary';
    }
  };

  return (
    <>
      <Card className="status-location-card d-flex flex-column w-100">
          <Card.Header> <h5 className="card-title mb-0">Status & Location</h5> </Card.Header>
          <Card.Body className="flex-grow-1">
              <Row className="g-3 mb-4">
                <Col xs={6} md={4}><div className="status-chip"><div className="chip-icon-label"><LuCar size={16} className="chip-icon" /><small className="chip-label">License plate</small></div><strong className="chip-value">{license_plate || 'N/A'}</strong></div></Col>
                <Col xs={6} md={4}><div className="status-chip"><div className="chip-icon-label"><LuFingerprint size={16} className="chip-icon" /><small className="chip-label">VIN</small></div><strong className="chip-value">{vin || 'N/A'}</strong></div></Col>
                <Col xs={6} md={4}><div className="status-chip"><div className="chip-icon-label"><LuTag size={16} className="chip-icon" /><small className="chip-label">Status</small></div><strong className="chip-value">{status_display ? <Badge pill bg={getBadgeVariant()} className="status-badge-figma">{status_display}</Badge> : 'N/A'}</strong></div></Col>
                <Col xs={6} md={4}><div className="status-chip"><div className="chip-icon-label"><LuPalette size={16} className="chip-icon" /><small className="chip-label">Color</small></div><strong className="chip-value">{hexa_color_code && <span className="color-swatch me-1" style={{ backgroundColor: hexa_color_code }}></span>}{color || 'N/A'}</strong></div></Col>
                <Col xs={6} md={4}><div className="status-chip"><div className="chip-icon-label"><LuGauge size={16} className="chip-icon" /><small className="chip-label">Mileage</small></div><strong className="chip-value">{mileage ? `${mileage.toLocaleString()} km` : 'N/A'}</strong></div></Col>
                <Col xs={6} md={4}><div className="status-chip"><div className="chip-icon-label"><LuCalendarDays size={16} className="chip-icon" /><small className="chip-label">Acquired On</small></div><strong className="chip-value">{acquisition_date || 'N/A'}</strong></div></Col>
              </Row>
              <div className="location-details-block mb-3">
                  <div className="block-header"><LuMapPin size={16} className="block-icon" /><span className="block-title">Current location</span></div>
                  <Row className="location-address-row">
                      <Col xs={7} className="address-part"><small className="address-label">Street line</small><p className="address-value mb-1">{current_location?.street_line_1 || '--'}</p><small className="address-label">Street line 2</small><p className="address-value text-muted-figma mb-0">{current_location?.street_line_2 || 'N/A'}</p></Col>
                      <Col xs={1} className="address-divider-col"><div className="address-divider"></div></Col>
                      <Col xs={4} className="address-part"><small className="address-label">City/Postal</small><p className="address-value mb-1">{`${current_location?.city || ''}${current_location?.city && current_location?.postal_code ? ', ' : ''}${current_location?.postal_code || ''}`.trim() || '--'}</p><small className="address-label">Country</small><p className="address-value mb-0">{current_location?.country || '--'}</p></Col>
                  </Row>
              </div>
              {current_location?.notes && (<div className="location-details-block"><div className="block-header"><ParkingCircle size={16} className="block-icon" /><span className="block-title">Access Notes</span></div><p className="access-notes-text mb-0">{current_location.notes}</p></div>)}
          </Card.Body>
          <Card.Footer className="text-end">
            <Button variant="danger" className="footer-action-button delete-button me-2" size="sm" onClick={() => setShowDeleteModal(true)} disabled={isSubmitting}> {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : <DeleteIcon size={16} />} Delete </Button>
            <Button variant="primary" className="footer-action-button edit-button" size="sm" onClick={handleShowEditModal} disabled={isSubmitting}> <EditIcon size={16} /> Edit </Button>
          </Card.Footer>
      </Card>
      
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg" backdrop="static">
          <Form onSubmit={handleEditSubmit}>
            <Modal.Header closeButton><Modal.Title>Edit - {instance.license_plate}</Modal.Title></Modal.Header>
            <Modal.Body>
              {submitError && <BootstrapAlert variant="danger" onClose={() => setSubmitError('')} dismissible>{submitError}</BootstrapAlert>}
                <Row>
                    <Col md={6}><Form.Group className="mb-3" controlId="editLicensePlate"><Form.Label>License Plate</Form.Label><Form.Control name="license_plate" type="text" value={formData.license_plate} onChange={handleInputChange} required /></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3" controlId="editVin"><Form.Label>VIN</Form.Label><Form.Control name="vin" type="text" value={formData.vin} onChange={handleInputChange} /></Form.Group></Col>
                </Row>
                <Row>
                    <Col md={6}><Form.Group className="mb-3" controlId="editStatus"><Form.Label>Status</Form.Label><Form.Select name="status" value={formData.status} onChange={handleInputChange} required><option value="">-- Select Status --</option>{statusOptions.map(s_opt => (<option key={s_opt.value} value={s_opt.value}>{s_opt.label}</option>))}</Form.Select></Form.Group></Col>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="editColorFromModel">
                            <Form.Label>Vehicle Color</Form.Label>
                            <Form.Select name="hexa_color_code" value={formData.hexa_color_code} onChange={handleColorChange}>
                                <option value="">-- Select from model colors --</option>
                                {modelColorOptions.map(colorOpt => (<option key={colorOpt.hex} value={colorOpt.hex}>{colorOpt.name} ({colorOpt.hex})</option>))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}><Form.Group className="mb-3" controlId="editColorNameManual"><Form.Label>Color Name (Custom/Override)</Form.Label><Form.Control name="color" type="text" value={formData.color} onChange={handleInputChange} placeholder="e.g., Deep Blue Pearl" /></Form.Group></Col>
                    <Col md={6}>{formData.hexa_color_code && (<div className="mt-md-4 pt-md-2 d-flex align-items-center"><span className="color-swatch me-2" style={{ backgroundColor: formData.hexa_color_code, width: '24px', height: '24px', border: '1px solid #ccc' }}></span><span>Selected: {formData.color} ({formData.hexa_color_code})</span></div>)}</Col>
                </Row>
                <Row>
                    <Col md={6}><Form.Group className="mb-3" controlId="editMileage"><Form.Label>Mileage (km)</Form.Label><Form.Control name="mileage" type="number" value={formData.mileage} onChange={handleInputChange} min="0"/></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3" controlId="editAcquisitionDate"><Form.Label>Acquisition Date</Form.Label><Form.Control name="acquisition_date" type="date" value={formData.acquisition_date} onChange={handleInputChange} /></Form.Group></Col>
                </Row>
                <hr className="my-4"/>
                <h5>Location Details</h5>
                <Row>
                    <Col md={6}><Form.Group className="mb-3" controlId="editStreet1"><Form.Label>Street Line 1</Form.Label><Form.Control name="street_line_1" type="text" value={formData.street_line_1} onChange={handleInputChange} /></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3" controlId="editStreet2"><Form.Label>Street Line 2 (Optional)</Form.Label><Form.Control name="street_line_2" type="text" value={formData.street_line_2} onChange={handleInputChange} /></Form.Group></Col>
                </Row>
                <Row>
                    <Col md={4}><Form.Group className="mb-3" controlId="editCity"><Form.Label>City</Form.Label><Form.Control name="city" type="text" value={formData.city} onChange={handleInputChange} /></Form.Group></Col>
                    <Col md={4}><Form.Group className="mb-3" controlId="editPostalCode"><Form.Label>Postal Code</Form.Label><Form.Control name="postal_code" type="text" value={formData.postal_code} onChange={handleInputChange} /></Form.Group></Col>
                    <Col md={4}><Form.Group className="mb-3" controlId="editCountry"><Form.Label>Country</Form.Label><Form.Control name="country" type="text" value={formData.country} onChange={handleInputChange} /></Form.Group></Col>
                </Row>
                <Form.Group className="mb-3" controlId="editLocationNotes"><Form.Label>Access Notes (Optional)</Form.Label><Form.Control name="location_notes" as="textarea" rows={3} value={formData.location_notes} onChange={handleInputChange} /></Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={handleCloseEditModal} disabled={isSubmitting}>Cancel</Button>
              <Button variant="primary" type="submit" className="edit-button" disabled={isSubmitting}>
                {isSubmitting ? <><Spinner as="span" animation="border" size="sm" /> Saving...</> : 'Save Changes'}
              </Button>
            </Modal.Footer>
          </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Deletion</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete vehicle: <strong>{instance.license_plate}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={isSubmitting}>
            {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .status-location-card {
            border-radius: 16px !important; background-color: #FFFFFF !important;
            border: none !important; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06) !important; padding: 0;
        }
        .status-location-card .card-header, .status-location-card .card-footer {
            background-color: transparent !important; border-top: none; border-bottom: none;
            padding: 1.25rem 1.5rem;
        }
        .status-location-card .card-header { padding-bottom: 0.75rem; }
        .status-location-card .card-body { padding: 0.75rem 1.5rem 1.25rem 1.5rem; }
        .status-chip {
            background-color: #FFFFFF; border: 1px solid #F0F2F5; border-radius: 12px;
            padding: 0.6rem 0.75rem; text-align: left; height: 100%;
            display: flex; flex-direction: column; justify-content: center;
        }
        .chip-icon-label { display: flex; align-items: center; margin-bottom: 0.2rem; }
        .chip-icon { color: #868E96; margin-right: 0.4rem; }
        .chip-label { font-size: 0.6875rem; color: #868E96; }
        .chip-value {
            font-size: 0.875rem; font-weight: 500; color: #212529; display: flex;
            align-items: center; line-height: 1.2; word-break: break-word;
        }
        .color-swatch { width: 12px; height: 12px; border-radius: 2px; border: 1px solid #dee2e6; display: inline-block; }
        .status-badge-figma {
            font-size: 0.6875rem !important; font-weight: 600 !important;
            padding: 0.2em 0.5em !important; line-height: 1.3 !important;
            border-radius: 6px !important; text-transform: uppercase;
            letter-spacing: 0.05em; vertical-align: baseline;
        }
        .status-badge-figma.bg-success { background-color: #D1E7DD !important; color: #0F5132 !important; }
        .status-badge-figma.bg-warning { background-color: #FFF3CD !important; color: #664D03 !important; }
        .status-badge-figma.bg-info { background-color: #CFE2FF !important; color: #055160 !important; }
        .status-badge-figma.bg-secondary { background-color: #E9ECEF !important; color: #41464B !important; }
        .status-badge-figma.bg-dark { background-color: #adb5bd !important; color: #fff !important; }
        .status-badge-figma.bg-danger { background-color: #F8D7DA !important; color: #58151C !important; }
        .status-badge-figma.bg-primary { background-color: #CFE2FF !important; color: #0A58CA !important; }
        .status-badge-figma.bg-light { background-color: #F8F9FA !important; color: #212529 !important; border: 1px solid #dee2e6; }
        .location-details-block { background-color: #FFFFFF; border: 1px solid #F0F2F5; border-radius: 12px; padding: 1rem; text-align: left; }
        .block-header { display: flex; align-items: center; margin-bottom: 0.6rem; }
        .block-icon { color: #868E96; margin-right: 0.5rem; }
        .block-title { font-size: 0.6875rem; font-weight: 500; color: #868E96; text-transform: uppercase; }
        .location-address-row { align-items: flex-start; }
        .address-part { padding-right: 0.5rem; padding-left: 0.5rem; }
        .address-label { font-size: 0.6875rem; color: #868E96; display: block; margin-bottom: 0.1rem; }
        .address-value { font-size: 0.875rem; color: #212529; font-weight: 400; margin-bottom: 0.4rem; line-height: 1.3; }
        .address-value.text-muted-figma { color: #ADB5BD !important; font-weight: 400; }
        .address-divider-col { display: flex; justify-content: center; padding: 0; align-self: stretch; }
        .address-divider { width: 1px; background-color: #E9ECEF; }
        .access-notes-text { font-size: 0.8125rem; color: #495057; line-height: 1.5; }
        .footer-action-button {
            font-size: 0.8125rem !important; font-weight: 500 !important; padding: 0.45rem 1rem !important;
            border-radius: 8px !important; display: inline-flex; align-items: center;
            justify-content: center; line-height: 1.5;
        }
        .footer-action-button svg { margin-right: 0.4rem; }
        .delete-button {
            background-color: #FF5C5C !important; border-color: #FF5C5C !important; color: white !important;
        }
        .delete-button:hover { background-color: #e65353 !important; border-color: #e65353 !important; }
        .edit-button {
            background-color: #4A90E2 !important; border-color: #4A90E2 !important; color: white !important;
        }
        .edit-button:hover { background-color: #4281cb !important; border-color: #4281cb !important; }
      `}</style>
    </>
  );
};

export default StatusLocationCard;