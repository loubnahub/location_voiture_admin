// VehicleModelDetailView.js

import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Badge, Dropdown, Alert, Modal, Image, Spinner } from 'react-bootstrap';
import {
  LuArrowLeft, LuListTree, LuTag, LuCalendarDays, LuDollarSign,
  LuFuel, LuDoorOpen, LuUsers, LuSettings2, LuInfo, LuChevronDown,
  LuGripVertical, LuShieldCheck, LuTrash2
} from 'react-icons/lu';
import { Edit2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
    LuCamera as LuModelImagesIcon, 
    LuFeather as LuModelDetailsIcon 
} from 'react-icons/lu'; 
import VehicleModelEditForm from './VehicleModelEditForm'; 
import VehicleModelMediaManager from './VehicleModelMediaManager'; // <<<< IMPORTED
import { updateVehicleModel, fetchVehicleModelById, deleteVehicleModel } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first
import './VehicleModelDetailView.css'; 

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// --- Helper Functions (Keep as provided before) ---
const formatPrice = (amount, currency = 'MAD') => {
  if (amount === null || amount === undefined) return 'N/A';
  const n = Number(amount); if (isNaN(n)) return 'Invalid Price';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
};
const SpecIcon = ({ type }) => {
  const s = 18, c = "me-2 text-muted spec-icon";
  const m = { type: <LuTag size={s} className={c} />, brand: <LuGripVertical size={s} className={c} />, year: <LuCalendarDays size={s} className={c} />, model: <LuTag size={s} className={c} />,doors: <LuDoorOpen size={s} className={c} />, seats: <LuUsers size={s} className={c} />, price: <LuDollarSign size={s} className={c} />, fuel: <LuFuel size={s} className={c} />,  transmission: <LuSettings2 size={s} className={c} />, quantity: <span className={`fw-bold ${c}`}>#</span> };
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
  const [activeInstanceId, setActiveInstanceId] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showMediaManagerModal, setShowMediaManagerModal] = useState(false); // <<<< STATE FOR MEDIA MANAGER MODAL

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

  useEffect(() => {
    const currentInstances = viewModel?.vehicle_instances;
    if (!Array.isArray(currentInstances) || currentInstances.length === 0) {
      if (activeInstanceId !== null) {
        setActiveInstanceId(null);
      }
    }
  }, [viewModel, activeInstanceId]);


  const handleSetViewMode = (mode) => { setFormSaveError(null); setCurrentViewMode(mode); };
  const handleDataRefreshNeeded = async () => {
    if (!viewModel?.id) return;
    setIsSavingInProgress(true);
    try {
      const response = await fetchVehicleModelById(viewModel.id);
      setViewModel(response.data.data);
    } catch (errDt) { 
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
        navigate('/admin/fleet/vehicle-models', { 
            state: { successMessage: `Model "${viewModel.title}" deleted successfully.` } 
        });
      } catch (deleteErr) {
        console.error("Error deleting model:", deleteErr);
        setFormSaveError(deleteErr.response?.data?.message || "Failed to delete model. It might have associated vehicles.");
        setIsSavingInProgress(false); 
      }
    }
    setShowDeleteConfirmModal(false); 
  };

  // Handlers for Media Manager
  const handleOpenMediaManager = () => {
    if (viewModel?.id) {
      setShowMediaManagerModal(true);
    }
  };
  const handleMediaManagerHide = () => {
    setShowMediaManagerModal(false);
  };
  const handleMediaUpdated = () => {
    handleDataRefreshNeeded(); 
    handleMediaManagerHide();
  };

  // This condition is for the main page loader before any data (viewModel) is available
  if (isLoading && !viewModel) { 
    return <div className="p-5 text-center"><Spinner animation="border" variant="primary" /> <p className="mt-2">Loading model details...</p></div>; 
  }
  if (error) { return <div className="p-5 text-center"><Alert variant="danger">{error}</Alert><Button variant="link" onClick={() => navigate('/admin/fleet/vehicle-models')} className="back-link-maquette bg-light text-dark p-2 shadow-sm">Back to Models List</Button></div>;
 }
  // This condition is for when fetching failed but isLoading is false (e.g. 404 or network error after initial load attempt)
  if (!viewModel && !isLoading) { 
    return <div className="p-5 text-center text-muted">Vehicle model not found or could not be loaded.</div>; 
  }

  const {
    id, title = '', header_subtitle = 'N/A', brand = 'N/A', model_name = '', year = '',
    fuel_type = '', transmission = '', number_of_seats = 0, number_of_doors = 0,
    base_price_per_day = 0, description = '', is_generally_available = false,
    main_image_url, 
    available_colors_from_model = [],
    vehicle_type, features_grouped = [], extras_available = [],
    insurance_plans_associated = [], vehicle_instances = [],
  } = viewModel || {}; // Fallback to empty object if viewModel is briefly null during a fast refresh
  
  const quantity_display = Array.isArray(vehicle_instances) ? vehicle_instances.length : (viewModel?.quantity_placeholder || 0);
  const safeFeaturesGrouped = Array.isArray(features_grouped) ? features_grouped : [];
  const displayedFeaturesListForView = safeFeaturesGrouped.find(g => g.category_name === selectedFeatureCategoryView)?.items || (selectedFeatureCategoryView === 'All Features' ? safeFeaturesGrouped.flatMap(g => Array.isArray(g.items) ? g.items : []) : []);
  const safeExtrasAvailable = Array.isArray(extras_available) ? extras_available : [];
  const safeInsurancePlans = Array.isArray(insurance_plans_associated) ? insurance_plans_associated : [];
  const safeVehicleInstances = Array.isArray(vehicle_instances) ? vehicle_instances : [];
  
  const specifications = [
    { label: 'Type', view_value: vehicle_type?.name || 'N/A', icon: 'type' },
    { label: 'Brand', view_value: brand, icon: 'brand' },
    { label: 'Year', view_value: year, icon: 'year' }, 
    { label: 'Model', view_value: model_name, icon: 'model' },
    { label: 'Doors', view_value: number_of_doors, icon: 'doors' }, 
    { label: 'Seats', view_value: number_of_seats, icon: 'seats' },
    { label: 'Price/Day', view_value: formatPrice(base_price_per_day, 'MAD'), icon: 'price' }, 
    { label: 'Fuel type', view_value: fuel_type, icon: 'fuel' },  
    { label: 'Transmission', view_value: transmission, icon: 'transmission' },
    { label: 'Instances', view_value: quantity_display, icon: 'quantity' },
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
    contentToRender = ( 
        <VehicleModelEditForm 
            modelId={id} 
            initialFormData={{ 
                title, brand, model_name, year, fuel_type, transmission, 
                number_of_seats, number_of_doors, base_price_per_day, description, 
                is_generally_available, vehicle_type_id: vehicle_type?.id || '', 
                available_colors: Array.isArray(available_colors_from_model) ? available_colors_from_model : [], 
            }} 
            initialFeatures={safeFeaturesGrouped.flatMap(group => Array.isArray(group.items) ? group.items.map(item => ({ id: item.id, name: item.name, category_name: group.category_name, notes: item.pivot?.notes || item.description || '' })) : [])} 
            initialExtras={safeExtrasAvailable} 
            initialInsurancePlans={safeInsurancePlans} 
            vehicleTypeOptions={vehicleTypeOptions}
            onOpenMediaManager={handleOpenMediaManager} // <<<< PASSING THE HANDLER
            onSave={async (payloadFromEditForm) => { 
                setIsSavingInProgress(true); 
                setFormSaveError(null); 
                try { 
                    await updateVehicleModel(id, payloadFromEditForm); 
                    await handleDataRefreshNeeded(); 
                    handleSetViewMode('details'); 
                } catch (errFormSave) { 
                    const message = errFormSave.response?.data?.message || errFormSave.response?.data?.error || "An error occurred saving the model."; 
                    if (errFormSave.response?.data?.errors) { 
                        const validationErrors = Object.values(errFormSave.response.data.errors).flat().join(' '); 
                        setFormSaveError(`Save failed: ${validationErrors}`); 
                    } else { 
                        setFormSaveError(message); 
                    } 
                } finally { 
                    setIsSavingInProgress(false); 
                } 
            }} 
            onCancel={() => handleSetViewMode('details')} 
            isSavingParent={isSavingInProgress} 
            saveErrorParent={formSaveError} 
        /> 
    );
  } else { 
    contentToRender = (
      <>
        {/* Alerts and Spinners - Only show spinner if actively refreshing *existing* data */}
        {formSaveError && !isSavingInProgress && (
          <Alert variant="warning" dismissible onClose={() => setFormSaveError(null)} className="mb-3">
            {formSaveError}
          </Alert>
        )}
        {isSavingInProgress && viewModel && ( // Spinner for refresh if data exists
          <div className="text-center my-3">
            <Spinner animation="border" size="sm" /> Refreshing data...
          </div>
        )}

        <div className="mb-2">
          <Button variant="link" onClick={() => navigate('/admin/fleet/vehicle-models')} className="back-link-maquette bg-light text-dark p-2 shadow-sm">
            <LuArrowLeft size={22} className="me-1"/> 
          </Button>
        </div>

        <Row className="mb-1 align-items-center">
          <Col>
            <h1 className="display-5 fw-bold mb-0 title-maquette">{title}</h1>
          </Col>
          <Col xs="auto" className="ms-auto">
            <div className="d-flex align-items-center">
              <Button variant="danger" className="action-button me-2 delete-button" onClick={handleDeleteClick} disabled={isSavingInProgress}>
                <LuTrash2 size={16} /> Delete
              </Button>
              <Button variant="primary" className="action-button edit-button" onClick={() => handleSetViewMode('editForm')} disabled={isSavingInProgress}>
                <Edit2 size={16} /> Edit
              </Button>
            </div>
          </Col>
        </Row>

        <div className="mb-3">
          <p className="text-muted fs-5 mb-0 subtitle-maquette">{header_subtitle}</p>
        </div>
        
        <Row>
          <Col lg={8} className="mb-4 mb-lg-0">
            <div> 
              {is_generally_available ? (
                <Badge bg="transparent" text="success" className="p-2 mb-3 status-badge-maquette ">
                  <CheckCircle size={20} className="me-1" /> <span className='fs-5'>Available</span>
                </Badge>
              ) : (
                <Badge bg="secondary-subtle" text="secondary-emphasis" className="p-2 mb-3 fs-6 status-badge-maquette border">
                  <AlertTriangle size={16} className="me-1" /> Not Available
                </Badge>
              )}
            </div>
            
            {safeVehicleInstances.length > 0 && (
                <Dropdown className="d-inline-block mb-3 ms-md-2 license-plate-dropdown-maquette ">
                <Dropdown.Toggle variant="light" size="sm" id="license-plate-dropdown-btn" className="  rounded-2 px-4 py-1 text-dark dropdown-toggle-maquette license-plate-button">
                    <LuListTree size={16} className="me-1 d-inline" /> 
                    {activeInstanceId && safeVehicleInstances.find(inst => inst.id === activeInstanceId)?.license_plate 
                        ? `Instance: ${safeVehicleInstances.find(inst => inst.id === activeInstanceId).license_plate}` 
                        : "Select an Instance"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-maquette">
                    {safeVehicleInstances.map(inst => (
                    <Dropdown.Item
                        key={inst.id}
                        active={activeInstanceId === inst.id}
                        onClick={() => {
                          navigate(`/admin/vehicle-instance/${inst.id}`); 
                        }}
                    >
                        {inst.license_plate}
                    </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
                </Dropdown>
            )}

            <div className="rounded-3 overflow-hidden mb-4 image-section-maquette ">
              {resolvedMainImageUrl ? (
                <Image 
                    src={resolvedMainImageUrl} 
                    alt={title || 'Vehicle'} 
                    className="main-image-maquette" 
                    fluid 
                    onError={(e) => { 
                        console.error("Image failed to load:", resolvedMainImageUrl, e); 
                        e.target.style.display='none'; 
                        const placeholder = e.target.closest('.image-section-maquette').querySelector('.no-image-placeholder-maquette-alt'); 
                        if (placeholder) placeholder.style.display = 'flex'; 
                    }} 
                />
              ) : null}
              {!resolvedMainImageUrl && (
                <div className="no-image-placeholder-maquette d-flex align-items-center justify-content-center text-muted" style={{ minHeight: '250px' }}>
                  No Image Available
                </div>
              )}
              <div 
                className="no-image-placeholder-maquette-alt d-none align-items-center justify-content-center text-muted" 
                style={{minHeight: '250px'}}
              >
                Image loading error or not found.
              </div>
            </div>
            
            <div className="specifications-section-maquette mb-4">
               <Row className="g-3">
                 {specifications.map((spec) => (
                   <Col key={spec.label}> 
                     <div className="spec-item-maquette p-3 border-0  h-100">
                       <div className="d-flex align-items-center">
                         <SpecIcon type={spec.icon} />
                         <div className="w-100">
                           <p className="spec-label-maquette py-1 small text-muted mb-0">{spec.label}</p>
                           <p className="spec-value-maquette fw-medium mb-0">{String(spec.view_value)}</p>
                         </div>
                       </div>
                     </div>
                   </Col>
                 ))}
               </Row>
            </div>
            
            <div className="description-section-maquette   p-3 p-md-4 "  style={{ minHeight: '200px' }}>
              <h3 className="description-title-maquette fw-semibold mb-2">
                <LuInfo size={20} className="me-2" /> Description
              </h3>
              <p className="description-text-maquette text-muted lh-lg mb-0">
                {description || 'No description available.'}
              </p>
            </div>
          </Col>
          
          <Col lg={4} className="right-column-maquette">
            <div className="mb-4 p-3  border-0 feature-extras-card view-mode-card ">
              <div className="d-flex justify-content-between align-items-center mb-3 features-header-maquette mx-3">
                <h5 className="fw-semibold mb-0 section-title-maquette">Features</h5>
                <Dropdown onSelect={(eventKey) => setSelectedFeatureCategoryView(eventKey || 'All Features')} className="feature-category-dropdown-maquette rounded-3">
                  <Dropdown.Toggle variant="outline-secondary" size="sm" className="dropdown-toggle-maquette small feature-category-button w-100 rounded-3 text-start" id="feature-category-dropdown-btn">
                    <span style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>{selectedFeatureCategoryView}</span>
                      <LuChevronDown size={16} className="ms-2" />
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-maquette">
                    <Dropdown.Item eventKey="All Features">All Features</Dropdown.Item>
                    {safeFeaturesGrouped.map(g => (
                      <Dropdown.Item key={g.category_name} eventKey={g.category_name}>{g.category_name}</Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="list-items-scrollable p-1 view-mode-scrollable-list ">
                {Array.isArray(displayedFeaturesListForView) && displayedFeaturesListForView.length > 0 ? displayedFeaturesListForView.map((feature, index) => (
                  <div key={feature.id || index} className="p-3 mb-2 rounded list-item-card view-mode-item-card bg-light  border-0 shadow-sm my-3  mx-4 ">
                    <p className="small text-muted mb-0 feature-label-maquette">{feature.name}</p>
                    <p className="fw-medium mb-0 feature-value-maquette">{feature.pivot?.notes || feature.description || 'Standard'}</p>
                  </div>
                )) : <p className="text-muted small p-3 text-center">No features for this category.</p>}
              </div>
            </div>
            
            <div className="mb-4 p-3  feature-extras-card view-mode-card ">
              <h5 className="fw-semibold mb-3 section-title-maquette">Possible Extras</h5>
              <div className="list-items-scrollable view-mode-scrollable-list">
                {safeExtrasAvailable.length > 0 ? safeExtrasAvailable.map((extra) => (
                  <div key={extra.id} className="d-flex align-items-start p-3 mb-2 rounded list-item-card view-mode-item-card  bg-light  border-0 shadow-sm my-3  mx-4 ">
                    <div className="me-2 pt-1 extra-icon-wrapper-maquette"><ExtraIconComponent identifier={extra.icon_identifier || 'default'} /></div>
                    <div className="flex-grow-1 extra-details-maquette">
                      <p className="fw-medium mb-0 extra-name-maquette">{extra.name}</p>
                      <p className="small text-muted mb-0 extra-price-maquette">Price: <span className="fw-semibold text-primary">{formatPrice(extra.default_price_per_day)}</span></p>
                    </div>
                  </div>
                )) : <p className="text-muted small p-3 text-center">No extras available for this model.</p>}
              </div>
            </div>
            
            <div className="p-3  feature-extras-card view-mode-card ">
              <h5 className="fw-semibold mb-3 section-title-maquette">Insurance Plans</h5>
              <div className="list-items-scrollable view-mode-scrollable-list">
                {safeInsurancePlans.length > 0 ? safeInsurancePlans.map((plan) => (
                  <div key={plan.id} className="d-flex align-items-start p-3 mb-2 rounded list-item-card view-mode-item-card  bg-light  border-0 shadow-sm my-3  mx-4 ">
                    <div className="me-2 pt-1 insurance-icon-wrapper-maquette"><InsurancePlanIcon /></div>
                    <div className="flex-grow-1 insurance-details-maquette">
                      <p className="fw-medium mb-0 insurance-name-maquette">{plan.name}</p>
                      <p className="small text-muted mb-0 insurance-price-maquette">Provider: {plan.provider || 'N/A'} - Price: <span className="fw-semibold text-primary">{formatPrice(plan.price_per_day)}</span></p>
                    </div>
                  </div>
                )) : <p className="text-muted small p-3 text-center">No insurance plans associated.</p>}
              </div>
            </div>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <div className="vehicle-model-detail-view ">
      <div className="container-xl">
        <div className=" p-3 ">
        {/* Conditional rendering for the main content area based on initial load */}
        {isLoading && !viewModel ? ( 
             <div className="p-5 text-center"><Spinner animation="border" variant="primary" /> <p className="mt-2">Loading model details...</p></div>
          ) : !viewModel && !isLoading && error ? ( // Error already handled globally, this is for clarity if needed
             <div className="p-5 text-center text-muted">Could not load model details. {error}</div>
          ) : !viewModel && !isLoading ? ( // Should be caught by global error or !viewModel check earlier
             <div className="p-5 text-center text-muted">Vehicle model data is unavailable.</div>
          ) : (
            // Only render Row/Col structure if viewModel is available
            <Row className="g-3 g-lg-4">
                <Col xs={12} md>
                {contentToRender}
                </Col>

                <Col xs={12} md="auto" className="d-flex flex-column align-items-center justify-content-center mt-3 mt-md-0">
                

                {currentViewMode === 'details' && (
                    <>
                    {id && (
                        <Button 
                        variant="light" 
                        className="rounded-3 p-2 shadow text-light bg-black mb-3"
                        style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="View Vehicle Model Details"
                        disabled
                        >
                        <LuModelDetailsIcon size={22} />
                        </Button>
                    )}
                    
                    {id && (
                        <Button 
                        variant="light" 
                        className="rounded-3 p-2 shadow text-dark"
                        style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="View Vehicle Model Images & Gallery"
                        onClick={() => {
                            navigate(`/admin/fleet/vehicle-models/${id}/gallery`);
                        }}
                        >
                        <LuModelImagesIcon size={22} />
                        </Button>
                    )}
                    </>
                )}
                </Col>
            </Row>
          )}
        </div>
      </div>

      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <AlertTriangle size={24} className="me-2" style={{ verticalAlign: 'bottom' }} /> Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "<strong>{viewModel?.title || 'this model'}</strong>"? This cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)} disabled={isSavingInProgress}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isSavingInProgress}>
            {isSavingInProgress ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1"/>
                  Deleting...
                </>
            ) : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Media Manager Modal */}
      {viewModel?.id && ( // Only render if we have a model ID to prevent issues
        <Modal 
            show={showMediaManagerModal} 
            onHide={handleMediaManagerHide} 
            size="xl"
            fullscreen="lg-down"
            dialogClassName="media-manager-modal-dialog"
            contentClassName="media-manager-modal-content"
            scrollable
        >
           
            <Modal.Body className="p-0 media-manager-modal-body"> 
                {/* Conditionally render VehicleModelMediaManager to ensure it fetches fresh data when shown */}
                {showMediaManagerModal && (
                    <VehicleModelMediaManager
                        vehicleModelId={viewModel.id}
                        vehicleModelTitle={viewModel.title}
                        onHide={handleMediaManagerHide}
                        onMediaUpdate={handleMediaUpdated}
                    />
                )}
            </Modal.Body>
            {/* Footer can be part of VehicleModelMediaManager if it has its own global save/close */}
        </Modal>
      )}
    </div>
  );
};

export default VehicleModelDetailView;