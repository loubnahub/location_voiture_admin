// StatusLocationCard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Modal, Form, Spinner, Alert as BootstrapAlert } from 'react-bootstrap';
import { 
    LuPalette, LuGauge, LuMapPin, 
    LuCar, LuTag 
} from 'react-icons/lu'; 
import { Edit as EditIcon, Trash2 as DeleteIcon, ParkingCircle } from 'lucide-react';

import { VehicleStatus } from '../Enums'; 
// Ensure createAddress is exported from your api.js
import { updateVehicle, deleteVehicle, updateAddress, createAddress } from '../services/api'; 

const StatusLocationCard = ({ instance, onDataChange }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editError, setEditError] = useState('');
  
  const [formData, setFormData] = useState({
    license_plate: '', color: '', hexa_color_code: '#000000', mileage: 0, status: '',
    street_line_1: '', street_line_2: '', city: '', postal_code: '', country: '',
    location_notes: '',
  });

  useEffect(() => {
    if (instance) {
      setFormData({
        license_plate: instance.license_plate || '',
        color: instance.color || '',
        hexa_color_code: instance.hexa_color_code || '#000000',
        mileage: instance.mileage || 0,
        status: instance.status?.value || instance.status || '', 
        street_line_1: instance.current_location?.street_line_1 || '',
        street_line_2: instance.current_location?.street_line_2 || '',
        city: instance.current_location?.city || '',
        postal_code: instance.current_location?.postal_code || '',
        country: instance.current_location?.country || '',
        location_notes: instance.current_location?.notes || '',
      });
    }
  }, [instance]); 

  const {
    license_plate = 'N/A', status_display, color = 'N/A', mileage,
    status, current_location, hexa_color_code, model_details,
    id: instance_id, 
    current_location_address_id 
  } = instance || {}; 
  
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleShowEditModal = () => { setEditError(''); setShowEditModal(true); };
  const handleCloseEditModal = () => { setShowEditModal(false); setEditError(''); };
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  
  const handleColorChange = (e) => {
    const selectedHex = e.target.value;
    const modelColors = model_details?.available_colors_from_model || [];
    const selectedColorObject = modelColors.find(c => c.hex === selectedHex);
    setFormData(prev => ({
      ...prev,
      hexa_color_code: selectedHex || prev.hexa_color_code,
      color: selectedColorObject ? selectedColorObject.name : (selectedHex ? prev.color : '')
    }));
  };

  const handleDeleteConfirm = async () => {
    if (instance_id) {
      setIsDeleting(true);
      try {
        await deleteVehicle(instance_id); 
        if (onDataChange) onDataChange({ type: 'delete', success: true, id: instance_id });
      } catch (error) {
        console.error("Delete operation failed in StatusLocationCard:", error);
        alert(`Delete failed: ${error.response?.data?.message || error.message}`);
        if (onDataChange) onDataChange({ type: 'delete', success: false, error, id: instance_id });
      } finally {
        setIsDeleting(false);
        handleCloseDeleteModal();
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!instance_id) {
      setEditError("Instance ID is missing. Cannot save.");
      return;
    }

    setIsEditing(true);
    let overallSuccess = true;
    let anyApiCallMadeAndSucceeded = false; 
    let finalAddressIdToLink = current_location?.id || null;

    const addressPayload = {
        street_line_1: formData.street_line_1,
        street_line_2: formData.street_line_2 || null,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
        notes: formData.location_notes || null,
    };
    const hasAnyAddressDataInForm = Object.values(addressPayload).some(val => val !== null && val !== '' && val !== undefined);
    
    if (hasAnyAddressDataInForm) {
        if (current_location?.id) { 
            const addressFieldsActuallyChanged = Object.keys(addressPayload).some(key => 
                (addressPayload[key] ?? '') !== (current_location[key] ?? (key === 'street_line_2' || key === 'notes' ? null : ''))
            );
            if (addressFieldsActuallyChanged) {
                try {
                    await updateAddress(current_location.id, addressPayload);
                    anyApiCallMadeAndSucceeded = true;
                } catch (error) {
                    console.error("Failed to update address:", error);
                    setEditError(`Address update failed: ${error.response?.data?.message || error.message}`);
                    overallSuccess = false;
                }
            }
        } else { 
            try {
                if (typeof createAddress !== 'function') {
                    throw new Error("createAddress function is not available in API service.");
                }
                const newAddressResponse = await createAddress(addressPayload); 
                finalAddressIdToLink = newAddressResponse.data.data.id; 
                anyApiCallMadeAndSucceeded = true;
            } catch (error) {
                console.error("Failed to create address:", error);
                setEditError(`Address creation failed: ${error.response?.data?.message || error.message}`);
                overallSuccess = false;
            }
        }
    } else if (!hasAnyAddressDataInForm && current_location?.id) {
        finalAddressIdToLink = null; 
        // The change in address link will be caught by vehicleActuallyChanged
    }

    let vehicleActuallyChanged = false; // Define it here in the broader scope of handleEditSubmit
    if (overallSuccess) {
        const vehiclePayload = {
            license_plate: formData.license_plate,
            color: formData.color,
            hexa_color_code: formData.hexa_color_code,
            mileage: parseInt(formData.mileage, 10) || 0,
            status: formData.status,
            current_location_address_id: finalAddressIdToLink, 
        };

        vehicleActuallyChanged = 
            vehiclePayload.license_plate !== (instance.license_plate || '') ||
            vehiclePayload.color !== (instance.color || '') ||
            vehiclePayload.hexa_color_code !== (instance.hexa_color_code || '#000000') ||
            vehiclePayload.mileage !== (instance.mileage || 0) ||
            vehiclePayload.status !== (instance.status?.value || instance.status || '') ||
            vehiclePayload.current_location_address_id !== (current_location_address_id || null);

        if (vehicleActuallyChanged) {
            try {
                await updateVehicle(instance_id, vehiclePayload);
                anyApiCallMadeAndSucceeded = true;
            } catch (error) {
                console.error("Failed to update vehicle details:", error);
                setEditError(`Vehicle details update failed: ${error.response?.data?.message || error.message}`);
                overallSuccess = false;
            }
        }
    }

    setIsEditing(false);
    if (anyApiCallMadeAndSucceeded && overallSuccess) {
      if (onDataChange) onDataChange({ type: 'update', success: true, id: instance_id });
      handleCloseEditModal();
    } else if (!anyApiCallMadeAndSucceeded && overallSuccess) { 
        handleCloseEditModal(); 
    }
  };

  const statusOptions = Object.entries(VehicleStatus).map(([key, value]) => ({
    value: value,
    label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase().replace(/_/g, ' ')
  }));
  const modelColorOptions = model_details?.available_colors_from_model || [];

  let badgeVariant = 'secondary'; 
  const currentStatusValue = status?.value || status;
  if (currentStatusValue === VehicleStatus.AVAILABLE) badgeVariant = 'success';
  else if (currentStatusValue === VehicleStatus.RENTED) badgeVariant = 'primary';
  else if (currentStatusValue === VehicleStatus.MAINTENANCE) badgeVariant = 'warning';
  else if (currentStatusValue === VehicleStatus.BOOKED) badgeVariant = 'info';
  else if (currentStatusValue === VehicleStatus.DAMAGED) badgeVariant = 'danger';
  else if (currentStatusValue === VehicleStatus.UNAVAILABLE) badgeVariant = 'dark';
  else if (currentStatusValue === VehicleStatus.PENDING_INSPECTION) badgeVariant = 'light';

  const displayLocationLine1 = current_location?.street_line_1 || '--';
  const displayLocationLine2 = current_location?.street_line_2 || 'N/A';
  const displayCityPostal = `${current_location?.city || ''}${current_location?.city && current_location?.postal_code ? ', ' : ''}${current_location?.postal_code || ''}`.trim() || '--';
  const displayCountry = current_location?.country || '--';

  if (!instance) {
    return (
        <Card className="status-location-card shadow-sm mb-4">
            <Card.Header><h5 className="card-title mb-0">Status & Location</h5></Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center text-muted"> Vehicle data unavailable. </Card.Body>
        </Card>
    );
  }

  return (
    <>
      <Card className="status-location-card d-flex flex-column w-100">
        <Card.Header> <h5 className="card-title mb-0">Status & Location</h5> </Card.Header>
        <Card.Body className="flex-grow-1">
            <Row className="g-3 mb-4">
                <Col xs={6}><div className="status-chip"><div className="chip-icon-label"><LuCar size={16} className="chip-icon" /><small className="chip-label">License plate</small></div><strong className="chip-value">{license_plate}</strong></div></Col>
                <Col xs={6}><div className="status-chip"><div className="chip-icon-label"><LuTag size={16} className="chip-icon" /><small className="chip-label">Status</small></div><strong className="chip-value">{status_display ? <Badge pill bg={badgeVariant} className="status-badge-figma">{status_display}</Badge> : 'N/A'}</strong></div></Col>
                <Col xs={6}><div className="status-chip"><div className="chip-icon-label"><LuPalette size={16} className="chip-icon" /><small className="chip-label">Color</small></div><strong className="chip-value">{hexa_color_code && <span className="color-swatch me-1" style={{ backgroundColor: hexa_color_code }}></span>}{color}</strong></div></Col>
                <Col xs={6}><div className="status-chip"><div className="chip-icon-label"><LuGauge size={16} className="chip-icon" /><small className="chip-label">Mileage</small></div><strong className="chip-value">{mileage ? `${mileage.toLocaleString()} km` : 'N/A'}</strong></div></Col>
            </Row>
            <div className="location-details-block mb-3">
                <div className="block-header"><LuMapPin size={16} className="block-icon" /><span className="block-title">Current location</span></div>
                <Row className="location-address-row">
                    <Col xs={7} className="address-part"><small className="address-label">Street line</small><p className="address-value mb-1">{displayLocationLine1}</p><small className="address-label">Street line 2</small><p className="address-value text-muted-figma mb-0">{displayLocationLine2}</p></Col>
                    <Col xs={1} className="address-divider-col"><div className="address-divider"></div></Col>
                    <Col xs={4} className="address-part"><small className="address-label">City/Postal</small><p className="address-value mb-1">{displayCityPostal}</p><small className="address-label">Country</small><p className="address-value mb-0">{displayCountry}</p></Col>
                </Row>
            </div>
            {current_location?.notes && (<div className="location-details-block"><div className="block-header"><ParkingCircle size={16} className="block-icon" /><span className="block-title">Access Notes</span></div><p className="access-notes-text mb-0">{current_location.notes}</p></div>)}
        </Card.Body>
        <Card.Footer className="text-end">
          <Button variant="danger" className="footer-action-button delete-button me-2" size="sm" onClick={handleShowDeleteModal} disabled={isDeleting || isEditing}> {isDeleting ? <Spinner as="span" animation="border" size="sm" className="me-1"/> : <DeleteIcon size={16} className="me-1" />} Delete </Button>
          <Button variant="primary" className="footer-action-button edit-button" size="sm" onClick={handleShowEditModal} disabled={isDeleting || isEditing}> <EditIcon size={16} className="me-1" /> Edit </Button>
        </Card.Footer>
        <style jsx>{`
            .status-location-card { border-radius: 16px !important; background-color: #FFFFFF !important; border: none !important; box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.06) !important; padding: 0; }
            .status-location-card .card-header { background-color: transparent !important; border-bottom: none; padding: 1.25rem 1.5rem 0.75rem 1.5rem; }
            .status-location-card .card-title { font-size: 1.125rem; font-weight: 600; color: #212529; }
            .status-location-card .card-body { padding: 0.75rem 1.5rem 1.25rem 1.5rem; }
            .status-chip { background-color: #FFFFFF; border: 1px solid #F0F2F5; border-radius: 12px; padding: 0.6rem 0.75rem; text-align: left; height: 100%; display: flex; flex-direction: column; justify-content: center; }
            .chip-icon-label { display: flex; align-items: center; margin-bottom: 0.2rem; }
            .chip-icon { color: #868E96; margin-right: 0.4rem; }
            .chip-label { font-size: 0.6875rem; color: #868E96; }
            .chip-value { font-size: 0.875rem; font-weight: 500; color: #212529; display: flex; align-items: center; line-height: 1.2; }
            .color-swatch { width: 12px; height: 12px; border-radius: 2px; border: 1px solid #dee2e6; display: inline-block; }
            .status-badge-figma { font-size: 0.6875rem !important; font-weight: 600 !important; padding: 0.2em 0.5em !important; line-height: 1.3 !important; border-radius: 6px !important; text-transform: uppercase; letter-spacing: 0.05em; vertical-align: baseline; }
            .status-badge-figma.bg-success { background-color: #D1E7DD !important; color: #0F5132 !important; } 
            .status-badge-figma.bg-warning { background-color: #FFF3CD !important; color: #664D03 !important; }
            .status-badge-figma.bg-info { background-color: #CFE2FF !important; color: #055160 !important; }
            .status-badge-figma.bg-secondary { background-color: #E9ECEF !important; color: #41464B !important; }
            .status-badge-figma.bg-dark { background-color: #adb5bd !important; color: #fff !important; }
            .status-badge-figma.bg-danger { background-color: #F8D7DA !important; color: #58151C !important; }
            .status-badge-figma.bg-primary { background-color: #CFE2FF !important; color: #0A58CA !important; } 
            .status-badge-figma.bg-light { background-color: #F8F9FA !important; color: #212529 !important; } 
            .location-details-block { background-color: #FFFFFF; border: 1px solid #F0F2F5; border-radius: 12px; padding: 1rem; text-align: left; }
            .block-header { display: flex; align-items: center; margin-bottom: 0.6rem; }
            .block-icon { color: #868E96; margin-right: 0.5rem; }
            .block-title { font-size: 0.6875rem; font-weight: 500; color: #868E96; text-transform: uppercase; }
            .location-address-row { align-items: flex-start; }
            .address-label { font-size: 0.6875rem; color: #868E96; display: block; margin-bottom: 0.1rem; }
            .address-value { font-size: 0.875rem; color: #212529; font-weight: 400; margin-bottom: 0.4rem; line-height: 1.3; }
            .address-value.text-muted-figma { color: #ADB5BD !important; font-weight: 400; }
            .address-divider-col { display: flex; justify-content: center; padding: 0; align-self: stretch;}
            .address-divider { width: 1px; background-color: #E9ECEF; }
            .access-notes-text { font-size: 0.8125rem; color: #495057; line-height: 1.5; }
            .status-location-card .card-footer { background-color: transparent !important; border-top: none; padding: 1rem 1.5rem 1.25rem 1.5rem; }
            .footer-action-button { font-size: 0.8125rem !important; font-weight: 500 !important; padding: 0.45rem 1rem !important; border-radius: 8px !important; display: inline-flex; align-items: center; justify-content: center; line-height: 1.5; }
            .footer-action-button svg { margin-right: 0.4rem; }
            .delete-button { background-color: #FF5C5C !important; border-color: #FF5C5C !important; color: white !important; }
            .edit-button { background-color: #4A90E2 !important; border-color: #4A90E2 !important; color: white !important; }
        `}</style>
      </Card>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Deletion</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete vehicle: <strong>{instance?.license_plate || 'this vehicle'}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseDeleteModal} disabled={isDeleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1"/> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Edit - {instance?.license_plate || 'Vehicle'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {editError && <BootstrapAlert variant="danger" onClose={() => setEditError('')} dismissible>{editError}</BootstrapAlert>}
            <Row>
              <Col md={6}><Form.Group className="mb-3" controlId="editLicensePlate"><Form.Label>License Plate</Form.Label><Form.Control name="license_plate" type="text" value={formData.license_plate} onChange={handleInputChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3" controlId="editStatus"><Form.Label>Status</Form.Label><Form.Select name="status" value={formData.status} onChange={handleInputChange} required><option value="">-- Select Status --</option>{statusOptions.map(s_opt => (<option key={s_opt.value} value={s_opt.value}>{s_opt.label}</option>))}</Form.Select></Form.Group></Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="editColorFromModel"><Form.Label>Vehicle Color</Form.Label><Form.Select name="hexa_color_code" value={formData.hexa_color_code} onChange={handleColorChange}><option value="">-- Select from model colors --</option>{modelColorOptions.map(colorOpt => (<option key={colorOpt.hex} value={colorOpt.hex}>{colorOpt.name} ({colorOpt.hex})</option>))}</Form.Select></Form.Group>
                     {formData.hexa_color_code && formData.hexa_color_code !== '#000000' && (<div className="mb-3 d-flex align-items-center"><span className="color-swatch me-2" style={{ backgroundColor: formData.hexa_color_code, width: '24px', height: '24px', border: '1px solid #ccc' }}></span><span>Selected: {formData.color} ({formData.hexa_color_code})</span></div>)}
                </Col>
                <Col md={6}><Form.Group className="mb-3" controlId="editColorNameManual"><Form.Label>Color Name (Custom/Override)</Form.Label><Form.Control name="color" type="text" value={formData.color} onChange={handleInputChange} placeholder="e.g., Deep Blue Pearl" /></Form.Group></Col>
            </Row>
            <Form.Group className="mb-3" controlId="editMileage"><Form.Label>Mileage (km)</Form.Label><Form.Control name="mileage" type="number" value={formData.mileage} onChange={handleInputChange} min="0"/></Form.Group>
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
            <Button variant="outline-secondary" onClick={handleCloseEditModal} disabled={isEditing}>Cancel</Button>
            <Button variant="primary" type="submit" className="edit-button" disabled={isEditing}>
              {isEditing ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1"/> : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default StatusLocationCard;