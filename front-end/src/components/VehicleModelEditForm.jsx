// src/components/VehicleModelEditForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Button, Form, Spinner, Alert, ListGroup, Modal } from 'react-bootstrap';
import {
  LuTag, LuCalendarDays, LuDollarSign, LuFuel, LuDoorOpen, LuUsers, LuSettings2, LuInfo,
  LuGripVertical, LuTrash2, LuShieldCheck, LuGalleryHorizontal,LuArrowLeft // Added for the new button
} from 'react-icons/lu';
import { PlusCircle, XCircle, Save } from 'lucide-react';
import {useNavigate} from 'react-router-dom'
import {
  fetchAllFeatures,
  fetchAllExtras,
  fetchAllInsurancePlans,
  fetchAllVehicleTypes
} from '../services/api';
 // Assuming this contains relevant styles
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first
import './VehicleModelDetailView.css';
// --- ICON HELPERS --- (Keep as is)
const formatPrice = (amount, currency = 'MAD') => {
  if (amount === null || amount === undefined) return 'N/A';
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return 'Invalid Price';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(numericAmount);
};
const SpecIcon = ({ type }) => {
  const iconSize = 18;
  const commonClasses = "me-2 d-inline text-muted spec-icon";
  const iconMap = {
    type: <LuTag size={iconSize} className={commonClasses} />,
    brand: <LuGripVertical size={iconSize} className={commonClasses} />,
    year: <LuCalendarDays size={iconSize} className={commonClasses} />,
    model: <LuTag size={iconSize} className={commonClasses} />,
    price: <LuDollarSign size={iconSize} className={commonClasses} />,
    fuel: <LuFuel size={iconSize} className={commonClasses} />,
    doors: <LuDoorOpen size={iconSize} className={commonClasses} />,
    seats: <LuUsers size={iconSize} className={commonClasses} />,
    transmission: <LuSettings2 size={iconSize} className={commonClasses} />,
    quantity: <span className={`fw-bold ${commonClasses}`}>#</span>
  };
  return iconMap[type] || <LuInfo size={iconSize} className={commonClasses} />;
};
const ExtraIconComponent = ({ identifier }) => {
  const commonClasses = "text-secondary extra-icon";
  const iconMap = {
    child_seat: <LuShieldCheck size={20} className={commonClasses} title="Child Seat" />,
    gps_navigation: <LuShieldCheck size={20} className={commonClasses} title="GPS" />,
    wifi_hotspot: <LuShieldCheck size={20} className={commonClasses} title="WiFi" />,
  };
  return iconMap[identifier] || <span className={commonClasses}><LuShieldCheck size={20} title="Extra" /></span>;
};
const InsurancePlanIcon = () => {
  const commonClasses = "text-secondary extra-icon";
  return <LuShieldCheck size={22} className={commonClasses} title="Insurance Plan" />;
};
// --- END ICON HELPERS ---

const VehicleModelEditForm = ({
  modelId,
  initialFormData,
  initialFeatures = [],
  initialExtras = [],
  initialInsurancePlans = [],
  vehicleTypeOptions = [],
  onSave,
  onCancel,
  isSavingParent,
  saveErrorParent,
  onOpenMediaManager, // <<<< NEW PROP
}) => {
  // ... (all existing state and useEffect hooks remain the same) ...
  const [formData, setFormData] = useState({});
  const [editableFeatures, setEditableFeatures] = useState([]);
  const [editableExtras, setEditableExtras] = useState([]);
  const [editableInsurancePlans, setEditableInsurancePlans] = useState([]);
  const [localVehicleTypes, setLocalVehicleTypes] = useState(vehicleTypeOptions || []);

  // Modal states
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [showAddExtraModal, setShowAddExtraModal] = useState(false);
  const [showAddInsurancePlanModal, setShowAddInsurancePlanModal] = useState(false);

  const [allGlobalFeatures, setAllGlobalFeatures] = useState([]);
  const [allGlobalExtras, setAllGlobalExtras] = useState([]);
  const [allGlobalInsurancePlans, setAllGlobalInsurancePlans] = useState([]);
  const [loadingGlobals, setLoadingGlobals] = useState(false);

  // Modal selection states
  const [selectedFeaturesInModal, setSelectedFeaturesInModal] = useState([]);
  const [selectedExtrasInModal, setSelectedExtrasInModal] = useState([]);
  const [selectedPlansInModal, setSelectedPlansInModal] = useState([]);

  // Fetch vehicle types if not provided
  useEffect(() => {
    if (!vehicleTypeOptions || vehicleTypeOptions.length === 0) {
      fetchAllVehicleTypes().then(res => {
        setLocalVehicleTypes(res.data.data || []);
      }).catch(() => setLocalVehicleTypes([]));
    } else {
      setLocalVehicleTypes(vehicleTypeOptions);
    }
  }, []);

  // Initialize form data and editable lists
  useEffect(() => {
    setFormData({
      ...initialFormData,
      vehicle_type_id: initialFormData?.vehicle_type_id ? String(initialFormData.vehicle_type_id) : '',
    });
    setEditableFeatures(initialFeatures.map(f => ({ ...f, _temp_id: f._temp_id || `mf-${f.id}-${Math.random().toString(16).slice(2)}` })));
    setEditableExtras(initialExtras.map(e => ({ ...e, _temp_id: e._temp_id || `me-${e.id}-${Math.random().toString(16).slice(2)}` })));
    setEditableInsurancePlans(initialInsurancePlans.map(p => ({ ...p, _temp_id: p._temp_id || `ip-${p.id}-${Math.random().toString(16).slice(2)}` })));
  }, [initialFormData, initialFeatures, initialExtras, initialInsurancePlans]);

  // Fetch global lists for modals
  useEffect(() => {
    let needFeatures = showAddFeatureModal && allGlobalFeatures.length === 0;
    let needExtras = showAddExtraModal && allGlobalExtras.length === 0;
    let needPlans = showAddInsurancePlanModal && allGlobalInsurancePlans.length === 0;
    if (!(needFeatures || needExtras || needPlans)) return;
    setLoadingGlobals(true);
    Promise.all([
      needFeatures ? fetchAllFeatures({ all: true }).then(r => r.data.data || []).catch(() => []) : allGlobalFeatures,
      needExtras ? fetchAllExtras({ all: true }).then(r => r.data.data || []).catch(() => []) : allGlobalExtras,
      needPlans ? fetchAllInsurancePlans({ all: true }).then(r => r.data.data || []).catch(() => []) : allGlobalInsurancePlans,
    ])
      .then(([features, extras, plans]) => {
        if (needFeatures) setAllGlobalFeatures(features);
        if (needExtras) setAllGlobalExtras(extras);
        if (needPlans) setAllGlobalInsurancePlans(plans);
      })
      .finally(() => setLoadingGlobals(false));
  }, [showAddFeatureModal, showAddExtraModal, showAddInsurancePlanModal, allGlobalFeatures, allGlobalExtras, allGlobalInsurancePlans]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'vehicle_type_id' ? String(value) : value)
    }));
  };

  // --- Feature Handlers ---
  const handleFeatureNotesChange = (tempId, newNotes) => setEditableFeatures(prev => prev.map(f => f._temp_id === tempId ? { ...f, notes: newNotes } : f));
  const handleToggleFeatureInModal = (featureId) => setSelectedFeaturesInModal(prev => prev.includes(featureId) ? prev.filter(id => id !== featureId) : [...prev, featureId]);
  const handleAddSelectedFeatures = () => {
    const featuresToAdd = allGlobalFeatures.filter(gf => selectedFeaturesInModal.includes(gf.id) && !editableFeatures.some(cf => cf.id === gf.id));
    setEditableFeatures(prev => [...prev, ...featuresToAdd.map(f => ({ id: f.id, name: f.name, category_name: f.category, notes: '', _temp_id: `mf-${f.id}-${Math.random().toString(16).slice(2)}` }))]);
    setSelectedFeaturesInModal([]); setShowAddFeatureModal(false);
  };
  const handleRemoveFeatureFromList = (tempId) => setEditableFeatures(editableFeatures.filter(f => f._temp_id !== tempId));

  // --- Extra Handlers ---
  const handleToggleExtraInModal = (extraId) => setSelectedExtrasInModal(prev => prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]);
  const handleAddSelectedExtras = () => {
    const extrasToAdd = allGlobalExtras.filter(ge => selectedExtrasInModal.includes(ge.id) && !editableExtras.some(ce => ce.id === ge.id));
    setEditableExtras(prev => [...prev, ...extrasToAdd.map(e => ({ ...e, _temp_id: `me-${e.id}-${Math.random().toString(16).slice(2)}` }))]);
    setSelectedExtrasInModal([]); setShowAddExtraModal(false);
  };
  const handleRemoveExtraFromList = (tempId) => setEditableExtras(editableExtras.filter(e => e._temp_id !== tempId));
  const navigate=useNavigate()
  // --- Insurance Plan Handlers ---
  const handleTogglePlanInModal = (planId) => setSelectedPlansInModal(prev => prev.includes(planId) ? prev.filter(id => id !== planId) : [...prev, planId]);
  const handleAddSelectedPlans = () => {
    const plansToAdd = allGlobalInsurancePlans.filter(gp => selectedPlansInModal.includes(gp.id) && !editableInsurancePlans.some(cp => cp.id === gp.id));
    setEditableInsurancePlans(prev => [...prev, ...plansToAdd.map(p => ({ ...p, _temp_id: `ip-${p.id}-${Math.random().toString(16).slice(2)}` }))]);
    setSelectedPlansInModal([]); setShowAddInsurancePlanModal(false);
  };
  const handleRemoveInsurancePlanFromList = (tempId) => setEditableInsurancePlans(editableInsurancePlans.filter(p => p._temp_id !== tempId));

  // --- Memoized available for modal ---
  const availableGlobalFeatures = useMemo(() => {
    if (loadingGlobals) return [];
    return allGlobalFeatures.filter(gf => !editableFeatures.some(cf => cf.id === gf.id));
  }, [allGlobalFeatures, editableFeatures, loadingGlobals]);
  const availableGlobalExtras = useMemo(() => {
    if (loadingGlobals) return [];
    return allGlobalExtras.filter(ge => !editableExtras.some(ce => ce.id === ge.id));
  }, [allGlobalExtras, editableExtras, loadingGlobals]);
  const availableGlobalInsurancePlans = useMemo(() => {
    if (loadingGlobals) return [];
    return allGlobalInsurancePlans.filter(gp => !editableInsurancePlans.some(cp => cp.id === gp.id));
  }, [allGlobalInsurancePlans, editableInsurancePlans, loadingGlobals]);

  // --- Save payload ---
  const prepareSavePayload = () => {
    const payload = { ...formData };
    delete payload.available_colors;
    payload.year = parseInt(payload.year, 10) || null;
    payload.number_of_seats = parseInt(payload.number_of_seats, 10) || 0;
    payload.number_of_doors = parseInt(payload.number_of_doors, 10) || 0;
    payload.base_price_per_day = parseFloat(payload.base_price_per_day) || 0;
    if (formData.vehicle_type_id) payload.vehicle_type_id = String(formData.vehicle_type_id);
    payload.features = editableFeatures.map(f => ({ feature_id: f.id, notes: f.notes || '' }));
    payload.extras = editableExtras.map(e => e.id);
    payload.insurance_plans = editableInsurancePlans.map(p => p.id);
    return payload;
  };

  const specificationsForForm = [
    { label: 'Type', icon: 'type', field: 'vehicle_type_id', type: 'select', options: localVehicleTypes },
    { label: 'Brand', icon: 'brand', field: 'brand', type: 'text' },
    { label: 'Year', icon: 'year', field: 'year', type: 'number' },
    { label: 'Model', icon: 'model', field: 'model_name', type: 'text' },
    { label: 'Price/Day', icon: 'price', field: 'base_price_per_day', type: 'number', step: '0.01' },
    { label: 'Fuel type', icon: 'fuel', field: 'fuel_type', type: 'text' },
    { label: 'Doors', icon: 'doors', field: 'number_of_doors', type: 'number' },
    { label: 'Seats', icon: 'seats', field: 'number_of_seats', type: 'number' },
    { label: 'Transmission', icon: 'transmission', field: 'transmission', type: 'text' },
  ];


  return (
    <div className="vehicle-model-edit-form-wrapper bg-white p-5  rounded-4 shadow-sm ">
      <Row className="mb-4 align-items-center">
        <Col>
                            <Button
                            
                            className="back-link-maquette bg-light text-dark p-2 shadow-sm border-0 "
                            
                            onClick={() => navigate(-1)}
                            title="Back to Details View"
                            >
                            <LuArrowLeft size={22} />
                            </Button>
                           
                        
        </Col>
        {modelId && onOpenMediaManager && ( // Only show if modelId exists and handler is provided
            <Col xs="auto">
                <Button 
                    variant="dark" 
                    onClick={onOpenMediaManager} 
                    size="sm"
                    className="manage-media-btn-maquette rounded-2 py-2 px-3"
                    disabled={isSavingParent}
                >
                    <LuGalleryHorizontal size={16} className="me-2 d-inline" /> Manage Media & Colors
                </Button>
            </Col>
        )}
        
      </Row>
      <hr className="mt-0 mb-4" />

      {saveErrorParent && <Alert variant="danger">{saveErrorParent}</Alert>}

      <Form onSubmit={e => { e.preventDefault(); onSave(prepareSavePayload()); }}>
        <Row className="mb-3">
          <Form.Group as={Col} md="8" controlId="formEditModelTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" name="title" value={formData.title || ''} onChange={handleInputChange} placeholder="Vehicle Model Title" className="h1-like-input bg-transparent" required />
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="formEditIsGenerallyAvailable" className="pt-md-4">
            <Form.Check type="switch" name="is_generally_available" label="Generally Available"
              checked={formData.is_generally_available || false} onChange={handleInputChange} />
          </Form.Group>
        </Row>

        <div className="mb-4 p-3 border rounded bg-light shadow-sm">
          <h5 className="mb-3 description-title-maquette">Specifications</h5>
          <Row xs={1} md={2} lg={3} className="g-3">
            {specificationsForForm.map((spec) => (
              <Col key={spec.label}>
                <Form.Group controlId={`formEditSpec-${spec.field}`}>
                  <Form.Label className="spec-label-maquette fw-500  mb-1" style={{fontSize:'13px',fontWeight:'500'}}>
                    <SpecIcon type={spec.icon} /> {spec.label}
                  </Form.Label>
                  {spec.type === 'select' ? (
                    <Form.Select
                      size="md"
                      name={spec.field}
                      value={formData[spec.field] || ''}
                      onChange={handleInputChange}
                      className="form-control-sm-maquette"
                      required={spec.field === 'vehicle_type_id'}
                    >
                      <option value="">Select type...</option>
                      {spec.options.map(opt => (
                        <option key={opt.id || opt.name} value={String(opt.id)}>{opt.name}</option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control size="md" type={spec.type || 'text'} name={spec.field}
                      value={spec.field === 'base_price_per_day' ? (formData[spec.field] ?? '') : (formData[spec.field] || '')}
                      onChange={handleInputChange} step={spec.step} className="form-control-sm-maquette" />
                  )}
                </Form.Group>
              </Col>
            ))}
          </Row>
        </div>

        <div className="mb-4 p-3 border rounded bg-light shadow-sm">
          <Form.Group controlId="formEditModelDescription">
            <Form.Label className="description-title-maquette"><LuInfo size={20} className="me-2 d-inline" /> Description</Form.Label>
            <Form.Control as="textarea" rows={5} name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Model description" className="form-control-maquette" />
          </Form.Group>
        </div>

        {/* Editable Features */}
        <div className="mb-4 p-3 border rounded bg-light shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0 section-title-maquette">Features</h5>
            <Button variant="outline-primary" size="sm" onClick={() => { setSelectedFeaturesInModal([]); setShowAddFeatureModal(true); }} className="add-item-btn-maquette">
              <PlusCircle size={16} className="me-1 d-inline" /> Add Feature
            </Button>
          </div>
          <ListGroup variant="flush" className="editable-list-maquette">
            {editableFeatures.length > 0 ? editableFeatures.map((feature) => (
              <ListGroup.Item key={feature._temp_id} className="editable-list-item-maquette">
                <Row className="g-2 align-items-center">
                  <Col md={5} className="py-1"><span className="fw-medium editable-field-display text-truncate" title={feature.name}>{feature.name}</span><small className="text-muted d-block">Category: {feature.category_name}</small></Col>
                  <Col md={6}><Form.Control as="textarea" rows={1} placeholder="Notes for this feature" value={feature.notes || ''} onChange={e => handleFeatureNotesChange(feature._temp_id, e.target.value)} size="sm" className="editable-field" /></Col>
                  <Col md={1} xs="auto" className="text-end"><Button variant="link" className="text-danger p-1 remove-button" onClick={() => handleRemoveFeatureFromList(feature._temp_id)} title="Remove"><LuTrash2 size={16} /></Button></Col>
                </Row>
              </ListGroup.Item>
            )) : <ListGroup.Item className="text-muted small">No features. Click 'Add Feature'.</ListGroup.Item>}
          </ListGroup>
        </div>

        {/* Editable Extras */}
        <div className="mb-4 p-3 border rounded bg-light shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0 section-title-maquette">Extras</h5>
            <Button variant="outline-primary" size="sm" onClick={() => { setSelectedExtrasInModal([]); setShowAddExtraModal(true); }} className="add-item-btn-maquette">
              <PlusCircle size={16} className="me-1 d-inline" /> Add Extra
            </Button>
          </div>
          <ListGroup variant="flush" className="editable-list-maquette">
            {editableExtras.length > 0 ? editableExtras.map((extra) => (
              <ListGroup.Item key={extra._temp_id} className="editable-list-item-maquette">
                <Row className="g-2 align-items-center">
                  <Col className="py-1"><div className="d-flex align-items-center"><ExtraIconComponent identifier={extra.icon_identifier} /><div className="ms-2"><p className="mb-0 fw-medium">{extra.name}</p><small className="text-muted">Price: {formatPrice(extra.default_price_per_day)}</small></div></div></Col>
                  <Col xs="auto" className="text-end"><Button variant="link" className="text-danger p-1 remove-button" onClick={() => handleRemoveExtraFromList(extra._temp_id)} title="Remove"><LuTrash2 size={16} /></Button></Col>
                </Row>
              </ListGroup.Item>
            )) : <ListGroup.Item className="text-muted small">No extras. Click 'Add Extra'.</ListGroup.Item>}
          </ListGroup>
        </div>

        {/* Editable Insurance Plans */}
        <div className="mb-4 p-3 border rounded bg-light shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0 section-title-maquette">Insurance Plans</h5>
            <Button variant="outline-primary" size="sm" onClick={() => { setSelectedPlansInModal([]); setShowAddInsurancePlanModal(true); }} className="add-item-btn-maquette">
              <PlusCircle size={16} className="me-1 d-inline" /> Add Insurance Plan
            </Button>
          </div>
          <ListGroup variant="flush" className="editable-list-maquette">
            {editableInsurancePlans.length > 0 ? editableInsurancePlans.map((plan) => (
              <ListGroup.Item key={plan._temp_id} className="editable-list-item-maquette">
                <Row className="g-2 align-items-center">
                  <Col className="py-1">
                    <div className="d-flex align-items-center">
                      <InsurancePlanIcon />
                      <div className="ms-2">
                        <p className="mb-0 fw-medium">{plan.name}</p>
                        <small className="text-muted">Provider: {plan.provider || 'N/A'} - Price: {formatPrice(plan.price_per_day)}</small>
                      </div>
                    </div>
                  </Col>
                  <Col xs="auto" className="text-end">
                    <Button variant="link" className="text-danger p-1 remove-button" onClick={() => handleRemoveInsurancePlanFromList(plan._temp_id)} title="Remove"><LuTrash2 size={16} /></Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            )) : <ListGroup.Item className="text-muted small">No insurance plans. Click 'Add Plan'.</ListGroup.Item>}
          </ListGroup>
        </div>


        <div className="mt-4 pt-3 border-top text-end edit-actions-footer-maquette">
          <Button variant="outline-secondary" type="button" onClick={onCancel} disabled={isSavingParent} className="me-2 d-inline cancel-btn-maquette">
            <XCircle size={18} className="me-1 d-inline" /> Cancel
          </Button>
          <Button variant="success" type="submit" disabled={isSavingParent} className="save-btn-maquette">
            {isSavingParent ? <><Spinner as="span" animation="border" size="sm" /> Saving...</> : <><Save size={18} className="me-1 d-inline" /> Save Changes</>}
          </Button>
        </div>
      </Form>

      {/* MODALS (Keep as is) */}
      <Modal show={showAddFeatureModal} onHide={() => { setShowAddFeatureModal(false); setSelectedFeaturesInModal([]); }} centered scrollable>
        <Modal.Header closeButton><Modal.Title>Select Features to Add</Modal.Title></Modal.Header>
        <Modal.Body>
          {loadingGlobals && <div className="text-center"><Spinner animation="border" size="sm" /> Loading...</div>}
          {!loadingGlobals && availableGlobalFeatures.length > 0 ? (
            <Form>
              <ListGroup variant="flush">
                {availableGlobalFeatures.map(feature => (
                  <ListGroup.Item key={feature.id} as="label" className="d-flex align-items-center modal-list-item">
                    <Form.Check type="checkbox" id={`modal-feat-${feature.id}`}
                      checked={selectedFeaturesInModal.includes(feature.id)}
                      onChange={() => handleToggleFeatureInModal(feature.id)}
                      className="me-2 d-inline"
                    />
                    {feature.name} <small className="text-muted ms-1">({feature.category || 'General'})</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Form>
          ) : !loadingGlobals && <p className="text-muted">All features are already associated or none found.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowAddFeatureModal(false); setSelectedFeaturesInModal([]); }}>Cancel</Button>
          <Button variant="primary" onClick={handleAddSelectedFeatures} disabled={selectedFeaturesInModal.length === 0}>
            Add Selected ({selectedFeaturesInModal.length})
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddExtraModal} onHide={() => { setShowAddExtraModal(false); setSelectedExtrasInModal([]); }} centered scrollable>
        <Modal.Header closeButton><Modal.Title>Select Extras to Add</Modal.Title></Modal.Header>
        <Modal.Body>
          {loadingGlobals && <div className="text-center"><Spinner animation="border" size="sm" /> Loading...</div>}
          {!loadingGlobals && availableGlobalExtras.length > 0 ? (
            <Form>
              <ListGroup variant="flush">
                {availableGlobalExtras.map(extra => (
                  <ListGroup.Item key={extra.id} as="label" className="d-flex align-items-center modal-list-item">
                    <Form.Check type="checkbox" id={`modal-extra-${extra.id}`}
                      checked={selectedExtrasInModal.includes(extra.id)}
                      onChange={() => handleToggleExtraInModal(extra.id)}
                      className="me-2 d-inline"
                    />
                    {extra.name} - {formatPrice(extra.default_price_per_day)}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Form>
          ) : !loadingGlobals && <p className="text-muted">All extras are already associated or none found.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowAddExtraModal(false); setSelectedExtrasInModal([]); }}>Cancel</Button>
          <Button variant="primary" onClick={handleAddSelectedExtras} disabled={selectedExtrasInModal.length === 0}>
            Add Selected ({selectedExtrasInModal.length})
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddInsurancePlanModal} onHide={() => { setShowAddInsurancePlanModal(false); setSelectedPlansInModal([]); }} centered scrollable>
        <Modal.Header closeButton><Modal.Title>Select Insurance Plans to Add</Modal.Title></Modal.Header>
        <Modal.Body>
          {loadingGlobals && <div className="text-center"><Spinner animation="border" size="sm" /> Loading...</div>}
          {!loadingGlobals && availableGlobalInsurancePlans.length > 0 ? (
            <Form>
              <ListGroup variant="flush">
                {availableGlobalInsurancePlans.map(plan => (
                  <ListGroup.Item key={plan.id} as="label" className="d-flex align-items-center modal-list-item">
                    <Form.Check type="checkbox" id={`modal-plan-${plan.id}`}
                      checked={selectedPlansInModal.includes(plan.id)}
                      onChange={() => handleTogglePlanInModal(plan.id)}
                      className="me-2 d-inline"
                    />
                    {plan.name} ({plan.provider || 'N/A'}) - {formatPrice(plan.price_per_day)}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Form>
          ) : !loadingGlobals && <p className="text-muted">All plans are already associated or none found.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowAddInsurancePlanModal(false); setSelectedPlansInModal([]); }}>Cancel</Button>
          <Button variant="primary" onClick={handleAddSelectedPlans} disabled={selectedPlansInModal.length === 0}>
            Add Selected ({selectedPlansInModal.length})
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default VehicleModelEditForm;