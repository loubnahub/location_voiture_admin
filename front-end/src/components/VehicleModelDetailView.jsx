// VehicleModelDetailView.js

import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Badge, Dropdown, Alert, Modal, Image, Spinner } from 'react-bootstrap';
import {
  LuArrowLeft, LuListTree, LuTag, LuCalendarDays, LuDollarSign,
  LuFuel, LuDoorOpen, LuUsers, LuSettings2, LuInfo, LuChevronDown,
  LuGripVertical, LuShieldCheck, LuTrash2, LuCamera, LuGalleryThumbnails
} from 'react-icons/lu';
import { Edit2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import './VehicleModelDetailView.css'; 
import VehicleModelEditForm from './VehicleModelEditForm'; 
import { updateVehicleModel, fetchVehicleModelById, deleteVehicleModel } from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// --- Helper Functions (Keep as provided before) ---
const formatPrice = (amount, currency = 'MAD') => {
  if (amount === null || amount === undefined) return 'N/A';
  const n = Number(amount); if (isNaN(n)) return 'Invalid Price';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
};
const SpecIcon = ({ type }) => {
  const s = 18, c = "me-2 text-muted spec-icon";
  const m = { type: <LuTag size={s} className={c} />, brand: <LuGripVertical size={s} className={c} />, year: <LuCalendarDays size={s} className={c} />, model: <LuTag size={s} className={c} />, price: <LuDollarSign size={s} className={c} />, fuel: <LuFuel size={s} className={c} />, doors: <LuDoorOpen size={s} className={c} />, seats: <LuUsers size={s} className={c} />, transmission: <LuSettings2 size={s} className={c} />, quantity: <span className={`fw-bold ${c}`}>#</span> };
  return m[type] || <LuInfo size={s} className={c} />;
};
const ExtraIconComponent = ({ identifier }) => {
  const commonClasses = "text-secondary extra-icon";
  const iconMap = { child_seat: <LuShieldCheck size={20} className={commonClasses} title="Child Seat" />, gps_navigation: <LuShieldCheck size={20} className={commonClasses} title="GPS" />, wifi_hotspot: <LuShieldCheck size={20} className={commonClasses} title="WiFi" />, default: <LuShieldCheck size={20} className={commonClasses} title="Extra" /> };
  return iconMap[identifier] || iconMap.default;
};
const InsurancePlanIcon = () => {
  const commonClasses = "text-secondary extra-icon";
  return <LuShieldCheck size={22} className={commonClasses} title="Insurance Plan" />;
};
// --- End Helper Functions ---

const VehicleModelDetailView = ({
  vehicleTypeOptions = [],
}) => {
  const { modelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentViewMode, setCurrentViewMode] = useState('details');
  const [selectedFeatureCategoryView, setSelectedFeatureCategoryView] = useState('All Features');
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);
  const [formSaveError, setFormSaveError] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [viewModel, setViewModel] = useState(null);
  const [activeInstanceId, setActiveInstanceId] = useState(null); // Initialized to null
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!modelId) {
      setError("Model ID is missing from the URL.");
      setIsLoading(false);
      setViewModel(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    fetchVehicleModelById(modelId)
      .then(response => {
        setViewModel(response.data.data);
        if (searchParams.get('mode') === 'edit' && response.data.data) {
            setCurrentViewMode('editForm');
        }
      })
      .catch(err => {
        console.error("Error fetching vehicle model by ID:", err);
        setError(err.response?.data?.message || "Failed to load vehicle model data. It may not exist or there was a network issue.");
        setViewModel(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [modelId, searchParams]);

  useEffect(() => {
    const featuresGrouped = viewModel?.features_grouped;
    if (selectedFeatureCategoryView !== 'All Features') {
        if (!featuresGrouped || !Array.isArray(featuresGrouped) || featuresGrouped.length === 0 ||
            !featuresGrouped.some(g => g.category_name === selectedFeatureCategoryView)) {
            setSelectedFeatureCategoryView('All Features');
        }
    }
  }, [viewModel, selectedFeatureCategoryView]);

  // MODIFIED: useEffect for activeInstanceId to ensure placeholder shows initially
  useEffect(() => {
    const currentInstances = viewModel?.vehicle_instances;
  
    if (!Array.isArray(currentInstances) || currentInstances.length === 0) {
      if (activeInstanceId !== null) {
        setActiveInstanceId(null);
      }
    }
    
  }, [viewModel, activeInstanceId]); // Keep activeInstanceId to react to external changes if any


  const handleSetViewMode = (mode) => { setFormSaveError(null); setCurrentViewMode(mode); };
  const handleNavigateToGallery = () => { if (viewModel?.id) navigate(`/admin/fleet/vehicle-models/${viewModel.id}/gallery`); };
  const handleDataRefreshNeeded = async () => {
    if (!viewModel?.id) return;
    setIsSavingInProgress(true);
    try {
      const response = await fetchVehicleModelById(viewModel.id);
      setViewModel(response.data.data);
    } catch (errDt) { // Renamed error variable to avoid conflict
      console.error("Error refreshing model data:", errDt);
      setFormSaveError("Could not refresh model data. Displayed information might be stale.");
    } finally {
      setIsSavingInProgress(false);
    }
  };
  const handleDeleteClick = () => setShowDeleteConfirmModal(true);
  const confirmDelete = async () => {
    if (viewModel?.id) {
      setIsSavingInProgress(true); setFormSaveError(null);
      try {
        await deleteVehicleModel(viewModel.id);
        alert(`Model "${viewModel.title}" deleted successfully.`);
        navigate('/admin/fleet/vehicle-models');
      } catch (deleteErr) {
        console.error("Error deleting model:", deleteErr);
        setFormSaveError(deleteErr.response?.data?.message || "Failed to delete model. It might have associated vehicles.");
        setIsSavingInProgress(false);
      }
    }
    setShowDeleteConfirmModal(false);
  };

  if (isLoading) { return <div className="p-5 text-center"><Spinner animation="border" variant="primary" /> <p className="mt-2">Loading model details...</p></div>; }
  if (error) { return <div className="p-5 text-center"><Alert variant="danger">{error}</Alert><Button variant="outline-primary" onClick={() => navigate('/admin/fleet/vehicle-models')}>Back to Models List</Button></div>; }
  if (!viewModel) { return <div className="p-5 text-center text-muted">Vehicle model not found or could not be loaded.</div>; }

  const {
    id, title = '', header_subtitle = 'N/A', brand = 'N/A', model_name = '', year = '',
    fuel_type = '', transmission = '', number_of_seats = 0, number_of_doors = 0,
    base_price_per_day = 0, description = '', is_generally_available = false,
    main_image_url, 
    available_colors_from_model = [],
    vehicle_type, features_grouped = [], extras_available = [],
    insurance_plans_associated = [], vehicle_instances = [],
  } = viewModel;
  
  const quantity_display = Array.isArray(vehicle_instances) ? vehicle_instances.length : (viewModel.quantity_placeholder || 0);
  const safeFeaturesGrouped = Array.isArray(features_grouped) ? features_grouped : [];
  const displayedFeaturesListForView = safeFeaturesGrouped.find(g => g.category_name === selectedFeatureCategoryView)?.items || (selectedFeatureCategoryView === 'All Features' ? safeFeaturesGrouped.flatMap(g => Array.isArray(g.items) ? g.items : []) : []);
  const safeExtrasAvailable = Array.isArray(extras_available) ? extras_available : [];
  const safeInsurancePlans = Array.isArray(insurance_plans_associated) ? insurance_plans_associated : [];
  const safeVehicleInstances = Array.isArray(vehicle_instances) ? vehicle_instances : [];
  const specifications = [
    { label: 'Type', view_value: vehicle_type?.name || 'N/A', icon: 'type' }, { label: 'Brand', view_value: brand, icon: 'brand' }, { label: 'Year', view_value: year, icon: 'year' }, { label: 'Model', view_value: model_name, icon: 'model' }, { label: 'Price/Day', view_value: formatPrice(base_price_per_day, 'MAD'), icon: 'price' }, { label: 'Fuel type', view_value: fuel_type, icon: 'fuel' }, { label: 'Doors', view_value: number_of_doors, icon: 'doors' }, { label: 'Seats', view_value: number_of_seats, icon: 'seats' }, { label: 'Transmission', view_value: transmission, icon: 'transmission' }, { label: 'Total Quantity', view_value: quantity_display, icon: 'quantity' },
  ];
  
  let resolvedMainImageUrl = null;
  if (main_image_url && typeof main_image_url === 'string' && main_image_url.trim() !== '') {
    if (main_image_url.toLowerCase().startsWith('http://') || main_image_url.toLowerCase().startsWith('https://')) {
      resolvedMainImageUrl = main_image_url;
    } else {
      let cleanedPath = main_image_url.replace(/^\/?(storage|public)\//i, '');
      cleanedPath = cleanedPath.replace(/^\/+/, '');
      resolvedMainImageUrl = `${API_BASE_URL}/storage/${cleanedPath}`;
      resolvedMainImageUrl = resolvedMainImageUrl.replace(/([^:])\/\//g, '$1/');
    }
  }

  let contentToRender;
  if (currentViewMode === 'editForm') {
    contentToRender = ( <VehicleModelEditForm modelId={id} initialFormData={{ title, brand, model_name, year, fuel_type, transmission, number_of_seats, number_of_doors, base_price_per_day, description, is_generally_available, vehicle_type_id: vehicle_type?.id || '', available_colors: Array.isArray(available_colors_from_model) ? available_colors_from_model : [], }} initialFeatures={safeFeaturesGrouped.flatMap(group => Array.isArray(group.items) ? group.items.map(item => ({ id: item.id, name: item.name, category_name: group.category_name, notes: item.pivot?.notes || item.description || '' })) : [])} initialExtras={safeExtrasAvailable} initialInsurancePlans={safeInsurancePlans} vehicleTypeOptions={vehicleTypeOptions} onSave={async (payloadFromEditForm) => { setIsSavingInProgress(true); setFormSaveError(null); try { await updateVehicleModel(id, payloadFromEditForm); await handleDataRefreshNeeded(); handleSetViewMode('details'); } catch (errFormSave) { const message = errFormSave.response?.data?.message || errFormSave.response?.data?.error || "An error occurred saving the model."; if (errFormSave.response?.data?.errors) { const validationErrors = Object.values(errFormSave.response.data.errors).flat().join(' '); setFormSaveError(`Save failed: ${validationErrors}`); } else { setFormSaveError(message); } } finally { setIsSavingInProgress(false); } }} onCancel={() => handleSetViewMode('details')} isSavingParent={isSavingInProgress} saveErrorParent={formSaveError} /> );
  } else { 
    contentToRender = (
      <>
        <div className="maquette-action-buttons-bar"> <Button variant="danger" className="action-button me-2 delete-button" onClick={handleDeleteClick} disabled={isSavingInProgress}> <LuTrash2 size={16} /> Delete </Button> <Button variant="primary" className="action-button edit-button" onClick={() => handleSetViewMode('editForm')} disabled={isSavingInProgress}> <Edit2 size={16} /> Edit </Button> </div>
        {formSaveError && !isSavingInProgress && <Alert variant="warning" dismissible onClose={() => setFormSaveError(null)}>{formSaveError}</Alert>}
        {isSavingInProgress && <div className="text-center my-3"><Spinner animation="border" size="sm" /> Refreshing data...</div>}
        <Row>
          <Col lg={8} className="mb-4 mb-lg-0">
            <Button variant="link" onClick={() => navigate('/admin/fleet/vehicle-models')} className="text-muted p-0 mb-3 d-flex align-items-center back-button"> <LuArrowLeft size={20} className="me-1" /> Back to Models List </Button>
            <div className="mb-3"> <h1 className="display-5 fw-bold mb-1 title-maquette">{title}</h1> <p className="text-muted fs-5 mb-2 subtitle-maquette">{header_subtitle}</p> </div>
           <div> {is_generally_available ? <Badge bg="transparent" text="success" className="p-2 mb-3 fs-6 status-badge-maquette"><CheckCircle size={16} className="me-1" /> Available</Badge> : <Badge bg="secondary-subtle" text="secondary-emphasis" className="p-2 mb-3 fs-6 status-badge-maquette"><AlertTriangle size={16} className="me-1" /> Not Available</Badge> }</div>
            {safeVehicleInstances.length > 0 && (
                <Dropdown className="d-inline-block mb-3 ms-md-2 license-plate-dropdown-maquette">
                <Dropdown.Toggle variant="dark" size="sm" id="license-plate-dropdown-btn" className="dropdown-toggle-maquette license-plate-button">
                    <LuListTree size={16} className="me-1" /> 
                    {activeInstanceId && safeVehicleInstances.find(inst => inst.id === activeInstanceId)?.license_plate 
                        ? `Instance: ${safeVehicleInstances.find(inst => inst.id === activeInstanceId).license_plate}` 
                        : "Select an Instance"} {/* Placeholder text */}
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-maquette">
                    {safeVehicleInstances.map(inst => (
                    <Dropdown.Item
                        key={inst.id}
                        active={activeInstanceId === inst.id}
                        onClick={() => {
                          // For this dropdown, clicking an instance navigates to its detail page.
                          // activeInstanceId is more for potentially highlighting if we came from an instance.
                          navigate(`/admin/vehicle-instance/${inst.id}`); 
                        }}
                    >
                        {inst.license_plate}
                        <Badge 
                            bg={inst.status?.value === 'Available' ? "success-subtle" : "secondary-subtle"} 
                            text={inst.status?.value === 'Available' ? "success" : "secondary"} 
                            pill className="ms-2"
                        >
                          {inst.status?.status_display || inst.status?.value || 'N/A'}
                        </Badge>
                    </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
                </Dropdown>
            )}

            <div className="rounded-3 overflow-hidden shadow-sm mb-4 image-section-maquette">
              {resolvedMainImageUrl ? ( <Image src={resolvedMainImageUrl} alt={title || 'Vehicle'} className="main-image-maquette" fluid onError={(e) => { console.error("Image failed to load:", resolvedMainImageUrl, e); e.target.style.display='none'; const placeholder = e.target.parentNode.querySelector('.no-image-placeholder-maquette-alt'); if (placeholder) placeholder.style.display = 'flex'; }} /> ) : null }
              {!resolvedMainImageUrl && ( <div className="no-image-placeholder-maquette d-flex align-items-center justify-content-center">No Image Available</div> )}
              <div className="no-image-placeholder-maquette-alt d-none align-items-center justify-content-center" style={{height: '100%', minHeight: '200px'}}>Image loading error.</div>
            </div>
            <div className="specifications-section-maquette mb-4">
               <Row className="g-3"> {specifications.map((spec) => ( <Col key={spec.label}> <div className="spec-item-maquette p-3 bg-light-subtle rounded"> <div className="d-flex align-items-center"> <SpecIcon type={spec.icon} /> <div className="w-100"> <p className="spec-label-maquette small text-muted mb-0">{spec.label}</p> <p className="spec-value-maquette fw-medium mb-0">{String(spec.view_value)}</p> </div> </div> </div> </Col> ))} </Row> </div>
            <div className="description-section-maquette card-alt-bg p-3 p-md-4 rounded"> <h3 className="description-title-maquette fw-semibold mb-2"><LuInfo size={20} className="me-2" /> Description</h3> <p className="description-text-maquette text-muted lh-lg mb-0">{description || 'No description available.'}</p> </div>
          </Col>
          <Col lg={4} className="right-column-maquette">
            <div className="mb-4 p-3 rounded feature-extras-card view-mode-card"> <div className="d-flex justify-content-between align-items-center mb-3 features-header-maquette"> <h5 className="fw-semibold mb-0 section-title-maquette">Features</h5> <Dropdown onSelect={(eventKey) => setSelectedFeatureCategoryView(eventKey || 'All Features')} className="feature-category-dropdown-maquette"> <Dropdown.Toggle variant="light" size="sm" className="dropdown-toggle-maquette small feature-category-button w-100 text-start" id="feature-category-dropdown-btn"> <span style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}> <span>{selectedFeatureCategoryView}</span> <LuChevronDown size={16} className="ms-2" /> </span> </Dropdown.Toggle> <Dropdown.Menu className="dropdown-menu-maquette"> <Dropdown.Item eventKey="All Features">All Features</Dropdown.Item> {safeFeaturesGrouped.map(g => ( <Dropdown.Item key={g.category_name} eventKey={g.category_name}>{g.category_name}</Dropdown.Item> ))} </Dropdown.Menu> </Dropdown> </div> <div className="list-items-scrollable view-mode-scrollable-list"> {Array.isArray(displayedFeaturesListForView) && displayedFeaturesListForView.length > 0 ? displayedFeaturesListForView.map((feature, index) => ( <div key={feature.id || index} className="p-3 mb-2 rounded list-item-card view-mode-item-card"> <p className="small text-muted mb-0 feature-label-maquette">{feature.name}</p> <p className="fw-medium mb-0 feature-value-maquette">{feature.pivot?.notes || feature.description || 'Standard'}</p> </div> )) : <p className="text-muted small">No features for this category.</p>} </div> </div>
            <div className="mb-4 p-3 rounded feature-extras-card view-mode-card"> <h5 className="fw-semibold mb-3 section-title-maquette">Possible Extras</h5> <div className="list-items-scrollable view-mode-scrollable-list"> {safeExtrasAvailable.length > 0 ? safeExtrasAvailable.map((extra) => ( <div key={extra.id} className="d-flex align-items-start p-3 mb-2 rounded list-item-card view-mode-item-card"> <div className="me-2 pt-1 extra-icon-wrapper-maquette"><ExtraIconComponent identifier={extra.icon_identifier || 'default'} /></div> <div className="flex-grow-1 extra-details-maquette"> <p className="fw-medium mb-0 extra-name-maquette">{extra.name}</p> <p className="small text-muted mb-0 extra-price-maquette">Price: <span className="fw-semibold text-primary">{formatPrice(extra.default_price_per_day)}</span></p> </div> </div> )) : <p className="text-muted small">No extras available for this model.</p>} </div> </div>
            <div className="p-3 rounded feature-extras-card view-mode-card"> <h5 className="fw-semibold mb-3 section-title-maquette">Insurance Plans</h5> <div className="list-items-scrollable view-mode-scrollable-list"> {safeInsurancePlans.length > 0 ? safeInsurancePlans.map((plan) => ( <div key={plan.id} className="d-flex align-items-start p-3 mb-2 rounded list-item-card view-mode-item-card"> <div className="me-2 pt-1 insurance-icon-wrapper-maquette"><InsurancePlanIcon /></div> <div className="flex-grow-1 insurance-details-maquette"> <p className="fw-medium mb-0 insurance-name-maquette">{plan.name}</p> <p className="small text-muted mb-0 insurance-price-maquette">Provider: {plan.provider || 'N/A'} - Price: <span className="fw-semibold text-primary">{formatPrice(plan.price_per_day)}</span></p> </div> </div> )) : <p className="text-muted small">No insurance plans associated.</p>} </div> </div>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <div className="vehicle-model-detail-view  py-md-4">
      <div className="container-xl">
        <div className=" rounded-3 p-3 p-md-4 p-lg-5 position-relative detail-card">
          <div className="position-absolute top-0 end-0 p-3 p-md-4 z-1 maquette-fabs-container">
            {currentViewMode === 'editForm' && (
              <Button variant="outline-secondary" className="rounded-circle p-0 fab-button mb-2" onClick={() => handleSetViewMode('details')} title="Back to Details View">
                <LuArrowLeft size={18} />
              </Button>
            )}
            {currentViewMode === 'details' && (
              <>
                <Button variant="dark" className="rounded-circle p-0 fab-button mb-2" onClick={() => handleSetViewMode('editForm')} title="Edit Model Details">
                  <Edit2 size={18} />
                </Button>
                <Button 
                  variant="light" 
                  className="rounded-circle p-0 border fab-button" 
                  onClick={handleNavigateToGallery}
                  title="View Media Gallery"
                  disabled={!viewModel?.id} 
                >
                  <LuCamera size={18} />
                </Button>
              </>
            )}
          </div>
          {contentToRender}
        </div>
      </div>
      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
        <Modal.Header closeButton> <Modal.Title className="text-danger"><AlertTriangle size={24} className="me-2" style={{ verticalAlign: 'bottom' }} /> Confirm Deletion</Modal.Title> </Modal.Header>
        <Modal.Body>Are you sure you want to delete "<strong>{viewModel?.title}</strong>"? This cannot be undone.</Modal.Body>
        <Modal.Footer> <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>Cancel</Button> <Button variant="danger" onClick={confirmDelete} disabled={isSavingInProgress}>Delete</Button> </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VehicleModelDetailView;