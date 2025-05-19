import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom'; // Use RouterLink to avoid conflict
import { Container, Row, Col, Button, Badge, Accordion, ListGroup, Dropdown, Image } from 'react-bootstrap';
import apiClient from '../services/api';
import {
  LuArrowLeft, LuPlus, LuTrash2, LuCar, LuPalette, 
  LuCalendarDays, LuFileText, LuListTree, LuSettings2, LuDollarSign, LuChevronDown
} from 'react-icons/lu'; // Added LuChevronDown for dropdown
// At the top of src/pages/VehicleModelDetailPage.jsx
import {
  // ... your existing Lu icons ...
  LuAward,          // For Brand (or LuShieldCheck, LuCopyright)
  LuFuel,           // For Fuel Type
  LuDoorOpen,       // For Number of Doors
           // For Number of Seats (or LuArmchair)
  LuWarehouse,      // For Instances/Quantity (or LuPackage, LuBoxes)
  // ... other icons you use ...
} from 'react-icons/lu'; // Or import directly from 'lucide-react' if some are missing

// OR if importing directly from lucide-react for better coverage:
// import { ListTree, Award, CalendarDays, Car, DollarSign, Fuel, DoorOpen, Users2, Settings2, Warehouse, FileText } from 'lucide-react';
import './VehicleModelDetailPage.css'; // We'll create this
import { Edit,CheckCircle,Users2,XCircle } from 'lucide-react'; // Using Edit from lucide-react as before


const TypeIcon = () => <LuListTree size={16} className="spec-icon-figma" />;
    // Alternative: LuSplitSquareHorizontal for categories/types

const BrandIcon = () => <LuAward size={16} className="spec-icon-figma" />;
    // Alternatives: LuShieldCheck (badge of quality), LuCopyright (for brand mark)

const YearIcon = () => <LuCalendarDays size={16} className="spec-icon-figma" />;

const ModelNameIcon = () => <LuCar size={16} className="spec-icon-figma" />;
    // Alternatives: LuCarTaxiFront, LuCarFront (more specific car views)

const PriceIcon = () => <LuDollarSign size={16} className="spec-icon-figma" />;

const FuelIcon = () => <LuFuel size={16} className="spec-icon-figma" />;

const DoorIcon = () => <LuDoorOpen size={16} className="spec-icon-figma" />;

const SeatIcon = () => <Users2 size={16} className="spec-icon-figma" />;
    // Alternative: LuArmchair (if you want to represent a single seat)

const TransmissionIcon = () => <LuSettings2 size={16} className="spec-icon-figma" />;
    // Alternatives: LuCog (cogwheel), LuGitFork (representing gear shift pattern)

const QuantityPlaceholderIcon = () => <LuWarehouse size={16} className="spec-icon-figma" />;
    // Represents "stock" or "inventory"
    // Alternatives: LuPackage, LuBoxes, or even just "#" as text if an icon feels forced.

const DescriptionIcon = () => <LuFileText size={18} className="spec-icon-figma" />;
    // This one is for the title of the Description card, so size 18 might be okay.
const VehicleModelDetailPage = () => {
  const { modelId } = useParams(); // Get modelId from the route '/admin/fleet/vehicle-models/:modelId'
  const [modelData, setModelData] = useState(null);
  const [selectedVehicleInstance, setSelectedVehicleInstance] = useState(null); // To store selected license plate's data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'appearance', 'operations'

  const fetchModelDetails = useCallback(async () => {
    if (!modelId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/vehicle-models/${modelId}`);
      setModelData(response.data.data);
      // Optionally select the first available vehicle instance by default
      const firstAvailable = response.data.data?.vehicle_instances?.find(v => v.status === 'available');
      if (firstAvailable) {
        setSelectedVehicleInstance(firstAvailable);
      } else if (response.data.data?.vehicle_instances?.length > 0) {
        setSelectedVehicleInstance(response.data.data.vehicle_instances[0]); // Select first one if none available
      }
    } catch (err) {
      setError('Failed to fetch vehicle model details.');
      console.error("API Error:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchModelDetails();
  }, [fetchModelDetails]);

  const handleInstanceSelect = (instanceId) => {
    const selected = modelData?.vehicle_instances?.find(inst => inst.id === instanceId);
    setSelectedVehicleInstance(selected || null);
    // Potentially navigate to a full Vehicle Instance page or update more UI elements here
    // For now, we just update the status badge and displayed license plate
    // If you want to navigate to the vehicle instance page:
    // navigate(`/admin/inventory/vehicles/${instanceId}`);
  };

  // Helper for status badge
  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'success';
      case 'rented': return 'warning';
      case 'maintenance': return 'info';
      case 'unavailable': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) return <div className="page-loading-message">Loading Model Details...</div>;
  if (error) return <div className="page-error-message">{error}</div>;
  if (!modelData) return <div className="page-error-message">Vehicle model data not found.</div>;

  // Specs to display (matches Figma's bottom-left card)
  const specs = [
    { label: 'Type', value: modelData.vehicle_type?.name, icon: <TypeIcon /> },
    { label: 'Brand', value: modelData.brand, icon: <BrandIcon /> },
    { label: 'Year', value: modelData.year, icon: <YearIcon /> },
    { label: 'Model', value: modelData.model_name, icon: <ModelNameIcon /> },
    { label: 'Price per day', value: `${modelData.base_price_per_day?.toFixed(2)} MAD`, icon: <PriceIcon /> }, // Added currency
    { label: 'Fuel type', value: modelData.fuel_type, icon: <FuelIcon /> },
    { label: 'Number of doors', value: modelData.number_of_doors, icon: <DoorIcon /> },
    { label: 'Number of seats', value: modelData.number_of_seats, icon: <SeatIcon /> },
    { label: 'Transmission', value: modelData.transmission, icon: <TransmissionIcon /> },
    // "Quantity 25" from Figma is ambiguous for a model. Could be total instances.
    { label: 'Instances', value: modelData.vehicle_instances?.length || 0, icon: <QuantityPlaceholderIcon /> },
  ];

  const renderDetailsTab = () => (
    <Row >
      {/* Left Column: Specs and Description */}
      <Col lg={7} md={12} className="mb-2 mb-lg-0">
        <div>
          <Row xs={1} sm={2} md={3} lg={2} xl={5} className="g-3 m-1"> {/* Responsive grid for specs */}
            {specs.map(spec => (
              spec.value !== undefined && spec.value !== null && // Only render if value exists
              <Col key={spec.label}>
                <div className="spec-item d-flex bg-white rounded-3 shadow p-2">
                  <div className='text-dark p-1 fs-2'>{spec.icon}</div>
                  <div className='p-1'>
                    <div className="spec-label p-1 fw-bold">{spec.label}</div>
                    <div className="spec-value p-1 fw-bold">{spec.value}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <div className="description-card card-figma-style mt-4">
          <h5 className="card-subtitle-figma"><DescriptionIcon /> Description</h5>
          <p className="text-secondary small">
            {modelData.description || 'No description available.'}
          </p>
        </div>
      </Col>

      {/* Right Column: Features and Extras */}
      <Col lg={5} md={12}>
        {modelData.features_grouped && modelData.features_grouped.length > 0 && (
          <div className="features-card card-figma-style mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="card-subtitle-figma mb-0">Features</h5>
              {/* Placeholder for category dropdown if needed, from Figma */}
              <Dropdown size="sm">
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-features-category" className="category-dropdown-toggle">
                  {modelData.features_grouped[0]?.category_name || 'All Features'} <LuChevronDown />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {modelData.features_grouped.map((group, idx) => (
                    <Dropdown.Item key={idx} href={`#feature-group-${idx}`}>
                      {group.category_name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <Accordion defaultActiveKey={modelData.features_grouped[0]?.category_name || '0'} flush>
              {modelData.features_grouped.map((group, groupIndex) => (
                <Accordion.Item eventKey={group.category_name || groupIndex.toString()} key={group.category_name || groupIndex} className="feature-accordion-item">
                  <Accordion.Header>{group.category_name}</Accordion.Header>
                  <Accordion.Body>
                    <ListGroup variant="flush">
                      {group.items.map(feature => (
                        <ListGroup.Item key={feature.id} className="feature-list-item">
                          {feature.name}
                          {feature.description && <small className="d-block text-muted">{feature.description}</small>}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        )}

        {modelData.extras_available && modelData.extras_available.length > 0 && (
          <div className="extras-card card-figma-style">
            <h5 className="card-subtitle-figma mb-3">Possible Extras</h5>
            <Accordion defaultActiveKey="0" flush>
              {modelData.extras_available.map((extra, index) => (
                <Accordion.Item eventKey={index.toString()} key={extra.id} className="extra-accordion-item">
                  <Accordion.Header>
                    <div className="w-100 d-flex justify-content-between align-items-center">
                      <span><LuSettings2 size={16} className="me-2"/>{extra.name}</span> {/* Example icon */}
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="extra-body">
                    {extra.description && <p className="mb-1 small text-muted">{extra.description}</p>}
                    <p className="mb-0 small">Default price per day: <strong className="text-primary">${extra.default_price_per_day.toFixed(2)}</strong></p>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        )}
      </Col>
    </Row>
  );

  const renderAppearanceTab = () => ( /* ... Placeholder for Screen 3 ... */ <div>Appearance Tab Content Here</div>);


  return (
    <Container fluid className="vehicle-model-detail-page px-5 py-2 ">
      {/* --- Top Navigation (Back button) --- */}
      <div className="d-flex justify-content-between align-items-center mb-2 p-5">
        <RouterLink to="/admin/fleet/vehicle-models" className="back-link-figma">
          <LuArrowLeft size={20} className="me-2" />
          Back to List
        </RouterLink>
        {/* Top right action buttons for the MODEL */}
      
      </div>


      {/* --- Main Header & Image Section --- */}
      <Row className="mb-2">
        <Col md={7}>
          <h1 className="model-title-figma">{modelData.title}</h1>
          <p className="model-subtitle-figma">{modelData.header_subtitle}</p>
          <div className="d-flex align-items-center mt-2 mb-2">
            {selectedVehicleInstance && (
              <Badge pill bg={getStatusBadgeVariant(selectedVehicleInstance.status)} className="status-badge-figma me-3">
                {selectedVehicleInstance.status === 'available' && <CheckCircle className="me-1"/>}
                {selectedVehicleInstance.status !== 'available' && <XCircle className="me-1"/>}
                {selectedVehicleInstance.status ? selectedVehicleInstance.status.charAt(0).toUpperCase() + selectedVehicleInstance.status.slice(1) : 'Unknown'}
              </Badge>
            )}
            {modelData.vehicle_instances && modelData.vehicle_instances.length > 0 ? (
              <Dropdown onSelect={handleInstanceSelect} className="license-plate-dropdown">
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-license-plate" size="sm">
                  {selectedVehicleInstance ? selectedVehicleInstance.license_plate : "Select License Plate"} <LuChevronDown />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {modelData.vehicle_instances.map(inst => (
                    <Dropdown.Item key={inst.id} eventKey={inst.id}>
                      {inst.license_plate} ({inst.status})
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <span className="text-muted small">No specific instances available for this model.</span>
            )}
          </div>
        </Col>
        <Col>  <div className="model-actions-figma">
          <Button variant="dark" className="action-button-figma me-2">
            <LuPlus size={18} className="me-1" /> Add Vehicle Instance
          </Button>
          <Button variant="danger" className="action-button-figma me-2">
            <LuTrash2 size={16} className="me-1" /> Delete Model
          </Button>
          <Button variant="primary" className="action-button-figma">
            <Edit size={16} className="me-1" /> Edit Model
          </Button>
        </div></Col>
      </Row>
      <Row className="mb-2">
        <Col md={11} className="text-center model-image-container">
          {modelData.main_image_url ? (
            <Image src={modelData.main_image_url} alt={modelData.title} fluid rounded className="main-model-image"/>
          ) : (
            <div className="image-placeholder">No Image Available</div>
          )}
        </Col>
        <Col md={1} className="d-none d-md-block"> {/* Right sidebar placeholder for tabs */}
          <div className="tabs-sidebar-placeholder">
             {/* Tab icons from Figma */}
            <Button variant="light" className={`tab-icon-button ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')} title="Details">
                <LuCar size={24} /> {/* Using LuCar for "Details" / "Overview" as a placeholder */}
            </Button>
            <Button variant="light" className={`tab-icon-button ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')} title="Appearance">
                <LuPalette size={24} />
            </Button>
         
          </div>
        </Col>
      </Row>

      {/* --- Tabbed Content Area --- */}
      {activeTab === 'details' && renderDetailsTab()}
      {activeTab === 'appearance' && renderAppearanceTab()}

    </Container>
  );
};

export default VehicleModelDetailPage;