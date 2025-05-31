import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Badge, Dropdown, Form, Alert, Modal, Image } from 'react-bootstrap';
import {
  LuArrowLeft, LuListTree, LuTag, LuCalendarDays, LuDollarSign,
  LuFuel, LuDoorOpen, LuUsers, LuSettings2, LuInfo, LuChevronDown,
  LuGripVertical, LuShieldCheck, LuTrash2, LuCamera, LuGalleryThumbnails
} from 'react-icons/lu';
import { Edit2, CheckCircle, AlertTriangle } from 'lucide-react';

import './VehicleModelDetailView.css';
import VehicleModelEditForm from './VehicleModelEditForm';
import VehicleDisplayGallery from './VehicleDisplayGallery';

import { updateVehicleModel, fetchVehicleModelById } from '../services/api';

// --- Helper Functions ---
const formatPrice = (amount, currency = 'MAD') => {
  if (amount === null || amount === undefined) return 'N/A';
  const n = Number(amount); if (isNaN(n)) return 'Invalid Price';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
};
const SpecIcon = ({ type }) => {
  const s = 18, c = "me-2 text-muted spec-icon";
  const m = {
    type: <LuTag size={s} className={c} />,
    brand: <LuGripVertical size={s} className={c} />,
    year: <LuCalendarDays size={s} className={c} />,
    model: <LuTag size={s} className={c} />,
    price: <LuDollarSign size={s} className={c} />,
    fuel: <LuFuel size={s} className={c} />,
    doors: <LuDoorOpen size={s} className={c} />,
    seats: <LuUsers size={s} className={c} />,
    transmission: <LuSettings2 size={s} className={c} />,
    quantity: <span className={`fw-bold ${c}`}>#</span>
  };
  return m[type] || <LuInfo size={s} className={c} />;
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

const VehicleModelDetailView = ({
  modelData: initialModelData,
  onBackToList,
  onModelUpdate,
  onDeleteRequest,
  vehicleTypeOptions = [],
}) => {
  const [currentViewMode, setCurrentViewMode] = useState('details');
  const [selectedFeatureCategoryView, setSelectedFeatureCategoryView] = useState('All Features');
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);
  const [formSaveError, setFormSaveError] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const [viewModel, setViewModel] = useState(initialModelData);

  useEffect(() => {
    setViewModel(initialModelData);
    if (initialModelData?.features_grouped?.length > 0 &&
        (!selectedFeatureCategoryView || !initialModelData.features_grouped.some(g => g.category_name === selectedFeatureCategoryView))) {
      setSelectedFeatureCategoryView('All Features');
    } else if (!initialModelData && selectedFeatureCategoryView !== 'All Features') {
        setSelectedFeatureCategoryView('All Features');
    }
  }, [initialModelData, selectedFeatureCategoryView]);

  if (!viewModel) {
    return <div className="p-5 text-center text-muted">Loading model details or model not found...</div>;
  }

  const {
    id, title = '', header_subtitle = 'N/A', brand = 'N/A', model_name = '', year = '',
    fuel_type = '', transmission = '', number_of_seats = 0, number_of_doors = 0,
    base_price_per_day = 0, description = '', is_generally_available = false,
    main_image_url,
    all_media = [],
    available_colors_from_model = [],
    vehicle_type, features_grouped = [], extras_available = [],
    insurance_plans_associated = [], vehicle_instances = [],
    quantity_placeholder = viewModel?.quantity_placeholder || 25,
  } = viewModel;

  const handleSetViewMode = (mode) => {
    setFormSaveError(null);
    setCurrentViewMode(mode);
  };

  // Called after EditForm or Gallery triggers a data update
  const handleDataRefreshNeeded = async () => {
    if (!id) return;
    setIsSavingInProgress(true);
    try {
      const response = await fetchVehicleModelById(id);
      const freshModelData = response.data.data;
      if (onModelUpdate) {
        onModelUpdate(freshModelData);
      }
      setViewModel(freshModelData);
    } catch (error) {
      console.error("Error refreshing model data after update:", error);
      setFormSaveError("Could not refresh model data. You might be seeing stale information.");
    } finally {
      setIsSavingInProgress(false);
    }
  };

  const handleDeleteClick = () => setShowDeleteConfirmModal(true);
  const confirmDelete = () => { if (onDeleteRequest && id) onDeleteRequest(id); setShowDeleteConfirmModal(false); };

  const displayedFeaturesListForView = features_grouped.find(g => g.category_name === selectedFeatureCategoryView)?.items ||
    (selectedFeatureCategoryView === 'All Features' ? features_grouped.flatMap(g => g.items) : []);
  
  const specifications = [
    { label: 'Type', view_value: vehicle_type?.name || 'N/A', icon: 'type' },
    { label: 'Brand', view_value: brand, icon: 'brand' },
    { label: 'Year', view_value: year, icon: 'year' },
    { label: 'Model', view_value: model_name, icon: 'model' },
    { label: 'Price/Day', view_value: formatPrice(base_price_per_day, 'MAD'), icon: 'price' },
    { label: 'Fuel type', view_value: fuel_type, icon: 'fuel' },
    { label: 'Doors', view_value: number_of_doors, icon: 'doors' },
    { label: 'Seats', view_value: number_of_seats, icon: 'seats' },
    { label: 'Transmission', view_value: transmission, icon: 'transmission' },
    { label: 'Quantity', view_value: quantity_placeholder, icon: 'quantity' },
  ];

  let contentToRender;

  if (currentViewMode === 'editForm') {
    contentToRender = (
      <VehicleModelEditForm
        modelId={id}
        initialFormData={{
          title, brand, model_name, year, fuel_type, transmission, number_of_seats,
          number_of_doors, base_price_per_day, description, is_generally_available,
          vehicle_type_id: vehicle_type?.id || '',
          available_colors: available_colors_from_model || [],
        }}
        initialFeatures={features_grouped.flatMap(group => group.items.map(item => ({
            id: item.id, name: item.name, category_name: group.category_name,
            notes: item.pivot?.notes || item.description || ''
        })))}
        initialExtras={extras_available}
        initialInsurancePlans={insurance_plans_associated}
        vehicleTypeOptions={vehicleTypeOptions}
        onSave={async (payloadFromEditForm) => {
            setIsSavingInProgress(true); setFormSaveError(null);
            try {
                await updateVehicleModel(id, payloadFromEditForm);
                await handleDataRefreshNeeded();
                handleSetViewMode('details');
            } catch (error) {
                const message = error.response?.data?.message || error.response?.data?.error || "An error occurred saving the model.";
                if (error.response?.data?.errors) { const validationErrors = Object.values(error.response.data.errors).flat().join(' '); setFormSaveError(`Save failed: ${validationErrors}`);
                } else { setFormSaveError(message); }
                setIsSavingInProgress(false);
            }
        }}
        onCancel={() => handleSetViewMode('details')}
        isSavingParent={isSavingInProgress}
        saveErrorParent={formSaveError}
      />
    );
  } else if (currentViewMode === 'displayGallery') {
    contentToRender = (
      <VehicleDisplayGallery
        allMedia={viewModel.all_media || []}
        availableColors={viewModel.available_colors_from_model || []}
        defaultImageUrl={viewModel.main_image_url}
        vehicleTitle={viewModel.title}
        vehicleModelId={viewModel.id}
        onExitGallery={() => handleSetViewMode('details')}
        onMediaManaged={(updatedMediaList) => {
            handleDataRefreshNeeded();
        }}
      />
    );
  } else {
    contentToRender = (
      <>
        <div className="maquette-action-buttons-bar">
          <Button variant="danger" className="action-button me-2 delete-button" onClick={handleDeleteClick}>
            <LuTrash2 size={16} /> Delete
          </Button>
          <Button variant="primary" className="action-button edit-button" onClick={() => handleSetViewMode('editForm')}>
            <Edit2 size={16} /> Edit
          </Button>
        </div>

        {formSaveError && !isSavingInProgress && <Alert variant="warning" dismissible onClose={() => setFormSaveError(null)}>{formSaveError}</Alert>}
        
        <Row>
          <Col lg={8} className="mb-4 mb-lg-0">
            <Button variant="link" onClick={onBackToList} className="text-muted p-0 mb-3 d-flex align-items-center back-button"><LuArrowLeft size={20} className="me-1"/> Back to List</Button>
            <div className="mb-3"> <h1 className="display-5 fw-bold mb-1 title-maquette">{title}</h1> <p className="text-muted fs-5 mb-2 subtitle-maquette">{header_subtitle}</p> </div>
            {is_generally_available ? <Badge bg="success-subtle" text="success-emphasis" className="p-2 mb-3 fs-6 status-badge-maquette"><CheckCircle size={16} className="me-1"/> Available</Badge> : <Badge bg="secondary-subtle" text="secondary-emphasis" className="p-2 mb-3 fs-6 status-badge-maquette">Not Available</Badge> }
            {vehicle_instances?.length > 0 && ( <Dropdown className="d-inline-block mb-3 ms-md-2 license-plate-dropdown-maquette"> <Dropdown.Toggle variant="outline-secondary" size="sm" id="license-plate-dropdown-btn" className="dropdown-toggle-maquette license-plate-button"> <LuListTree size={16} className="me-1"/> License Plate List <LuChevronDown size={14} className="ms-auto"/> </Dropdown.Toggle> <Dropdown.Menu className="dropdown-menu-maquette">{vehicle_instances.map(inst => (<Dropdown.Item key={inst.id} disabled={inst.status !== 'Available'}>{inst.license_plate} <Badge bg={inst.status === 'Available' ? "success-subtle" : "secondary-subtle"} pill>{inst.status}</Badge></Dropdown.Item>))}</Dropdown.Menu> </Dropdown> )}
            <div className="rounded-3 overflow-hidden shadow-sm mb-4 image-section-maquette">
{main_image_url ? (
                <Image
                  src={
                    main_image_url.startsWith('http')
                      ? main_image_url
                      : `http://localhost:8000/storage/${main_image_url.replace(/^\/?storage\//, '')}`
                  }
                  alt={title || 'Vehicle'}
                  className="main-image-maquette"
                  fluid
                />
              ) : (
                <div className="no-image-placeholder-maquette">No Image Available</div>
              )}
                          </div>
            <div className="text-center mb-3">
                <Button variant="outline-info" size="sm" className="view-gallery-button" onClick={() => handleSetViewMode('displayGallery')}>
                    <LuGalleryThumbnails size={16} className="me-1-5" /> View Full Gallery & 3D Model
                </Button>
            </div>
            <div className="specifications-section-maquette mb-4"> <Row xs={1} sm={2} md={3} className="g-3"> {specifications.map((spec) => ( <Col key={spec.label}> <div className="spec-item-maquette p-3 bg-light-subtle rounded"> <div className="d-flex align-items-center"> <SpecIcon type={spec.icon} /> <div className="w-100"> <p className="spec-label-maquette small text-muted">{spec.label}</p> <p className="spec-value-maquette fw-medium mb-0">{String(spec.view_value)}</p> </div> </div> </div> </Col> ))} </Row> </div>
            <div className="description-section-maquette card-alt-bg p-3 p-md-4 rounded"> <h3 className="description-title-maquette fw-semibold mb-2"><LuInfo size={20} className="me-2"/> Description</h3> <p className="description-text-maquette text-muted lh-lg mb-0">{description || 'No description available.'}</p> </div>
          </Col>

          <Col lg={4} className="right-column-maquette">
            <div className="mb-4 p-3 rounded feature-extras-card view-mode-card"> <div className="d-flex justify-content-between align-items-center mb-3 features-header-maquette"> <h5 className="fw-semibold mb-0 section-title-maquette">Features</h5> {features_grouped?.length > 1 && ( <Dropdown onSelect={(eventKey) => setSelectedFeatureCategoryView(eventKey || 'All Features')} className="feature-category-dropdown-maquette"> <Dropdown.Toggle variant="light" size="sm" className="dropdown-toggle-maquette small feature-category-button w-100 text-start" id="feature-category-dropdown-btn"><span style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}><span>{selectedFeatureCategoryView}</span><LuChevronDown size={16} className="ms-2" /></span></Dropdown.Toggle> <Dropdown.Menu className="dropdown-menu-maquette"><Dropdown.Item eventKey="All Features">All Features</Dropdown.Item>{features_grouped?.map(g => ( <Dropdown.Item key={g.category_name} eventKey={g.category_name}>{g.category_name}</Dropdown.Item> ))}</Dropdown.Menu> </Dropdown> )} </div> <div className="list-items-scrollable view-mode-scrollable-list"> {displayedFeaturesListForView.length > 0 ? displayedFeaturesListForView.map((feature, index) => ( <div key={feature.id || index} className="p-3 mb-2 rounded list-item-card view-mode-item-card"> <p className="small text-muted mb-0 feature-label-maquette">{feature.name}</p> <p className="fw-medium mb-0 feature-value-maquette">{feature.pivot?.notes || feature.description || 'Standard'}</p> </div> )) : <p className="text-muted small">No features.</p>} </div> </div>
            <div className="mb-4 p-3 rounded feature-extras-card view-mode-card"> <h5 className="fw-semibold mb-3 section-title-maquette">Possible Extras</h5> <div className="list-items-scrollable view-mode-scrollable-list"> {extras_available?.length > 0 ? extras_available.map((extra) => ( <div key={extra.id} className="d-flex align-items-start p-3 mb-2 rounded list-item-card view-mode-item-card"> <div className="me-2 pt-1 extra-icon-wrapper-maquette"><ExtraIconComponent identifier={extra.icon_identifier || 'default'} /></div> <div className="flex-grow-1 extra-details-maquette"> <p className="fw-medium mb-0 extra-name-maquette">{extra.name}</p> <p className="small text-muted mb-0 extra-price-maquette">Price: <span className="fw-semibold text-primary">{formatPrice(extra.default_price_per_day)}</span></p> </div> <Button variant="link" className="p-0 text-muted extra-chevron-maquette"><LuChevronDown size={20} /></Button> </div> )) : <p className="text-muted small">No extras.</p>} </div> </div>
            <div className="p-3 rounded feature-extras-card view-mode-card"> <h5 className="fw-semibold mb-3 section-title-maquette">Insurance Plans</h5> <div className="list-items-scrollable view-mode-scrollable-list"> {insurance_plans_associated?.length > 0 ? insurance_plans_associated.map((plan) => ( <div key={plan.id} className="d-flex align-items-start p-3 mb-2 rounded list-item-card view-mode-item-card"> <div className="me-2 pt-1 insurance-icon-wrapper-maquette"><InsurancePlanIcon /></div> <div className="flex-grow-1 insurance-details-maquette"> <p className="fw-medium mb-0 insurance-name-maquette">{plan.name}</p> <p className="small text-muted mb-0 insurance-price-maquette">Provider: {plan.provider || 'N/A'} - Price: <span className="fw-semibold text-primary">{formatPrice(plan.price_per_day)}</span></p> </div> <Button variant="link" className="p-0 text-muted extra-chevron-maquette"><LuChevronDown size={20} /></Button> </div> )) : <p className="text-muted small">No insurance plans.</p>} </div> </div>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <div className="vehicle-model-detail-view bg-light py-md-4">
      <div className="container-xl">
        <div className="bg-white shadow-lg rounded-3 p-3 p-md-4 p-lg-5 position-relative detail-card">
          {/* FABs - Now only one set of FABs, shown contextually */}
          <div className="position-absolute top-0 end-0 p-3 p-md-4 z-1 maquette-fabs-container">
            {/* Show Back button if not in 'details' mode */}
            {currentViewMode !== 'details' && (
                 <Button variant="outline-secondary" className="rounded-circle p-0 fab-button mb-2" onClick={() => handleSetViewMode('details')} title="Back to Details View">
                    <LuArrowLeft size={18} />
                </Button>
            )}
            {/* Show Edit and Camera FABs only when in 'details' mode */}
            {currentViewMode === 'details' && (
              <>
                <Button variant="dark" className="rounded-circle p-0 fab-button mb-2" onClick={() => handleSetViewMode('editForm')} title="Edit Model Details">
                  <Edit2 size={18} />
                </Button>
                <Button variant="light" className="rounded-circle p-0 border fab-button" onClick={() => handleSetViewMode('displayGallery')} title="View Media Gallery">
                  <LuCamera size={18}/>
                </Button>
              </>
            )}
          </div>
          {contentToRender}
        </div>
      </div>
      {/* Delete Confirmation Modal (always available at this component's level) */}
      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
        <Modal.Header closeButton> <Modal.Title className="text-danger"><AlertTriangle size={24} className="me-2" style={{ verticalAlign: 'bottom' }} /> Confirm Deletion</Modal.Title> </Modal.Header>
        <Modal.Body>Are you sure you want to delete "<strong>{viewModel?.title}</strong>"? This cannot be undone.</Modal.Body>
        <Modal.Footer> <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>Cancel</Button> <Button variant="danger" onClick={confirmDelete}>Delete</Button> </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VehicleModelDetailView;