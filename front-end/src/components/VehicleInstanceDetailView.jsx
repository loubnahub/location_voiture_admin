// VehicleInstanceDetailView.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert as BootstrapAlert } from 'react-bootstrap';
import { 
    LuArrowLeft, 
    LuCamera as LuModelImagesIcon, 
    LuFeather as LuModelDetailsIcon 
} from 'react-icons/lu'; 
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

import { fetchVehicle, fetchAllVehicles } from '../services/api'; 
import './VehicleInstanceDetailView.css';

import InstanceHeader from './InstanceHeader'; 
import AlertsVehicleHealthCard from './AlertsVehicleHealthCard'; 
import ScheduleOverviewCard from './ScheduleOverviewCard'; 
import StatusLocationCard from './StatusLocationCard';     
import InstanceSpecificationsCard from './InstanceSpecificationsCard'; 

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'; 

const VehicleInstanceDetailView = () => {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const [vehicleInstanceData, setVehicleInstanceData] = useState(null);
  const [otherInstances, setOtherInstances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeInstanceId, setActiveInstanceId] = useState(instanceId);

  const loadVehicleInstance = useCallback(async (idToLoad) => { setIsLoading(true); setError(null); try { const response = await fetchVehicle(idToLoad); setVehicleInstanceData(response.data.data); if (response.data.data?.model_details?.id) { const otherInstancesResponse = await fetchAllVehicles({ vehicle_model_id: response.data.data.model_details.id, all: true }); setOtherInstances(Array.isArray(otherInstancesResponse.data.data) ? otherInstancesResponse.data.data : []); } else { console.warn("No model_details.id found, cannot fetch other instances."); setOtherInstances([]); } } catch (err) { setError(err.response?.data?.message || err.message || 'Failed to load data.'); console.error("Error loading instance:", err); } finally { setIsLoading(false); } }, [fetchVehicle, fetchAllVehicles]);
  useEffect(() => { if (activeInstanceId) { loadVehicleInstance(activeInstanceId); } }, [activeInstanceId, loadVehicleInstance]);
  const handleInstanceChange = (newInstanceId) => { if (newInstanceId && newInstanceId !== activeInstanceId) { setActiveInstanceId(newInstanceId); const targetPath = `/admin/vehicle-instance/${newInstanceId}`; navigate(targetPath, { replace: true }); }};
  const handleBack = () => navigate(-1);
  const handleDataChange = useCallback(() => { if (activeInstanceId) { loadVehicleInstance(activeInstanceId); } }, [activeInstanceId, loadVehicleInstance]);
  const handleUpdateVehicleInstance = async (instanceIdToUpdate, data) => {};
  const handleDeleteVehicleInstance = async (instanceIdToDelete) => { alert("Instance deletion initiated."); handleDataChange(); };
  const mainImageUrl = useMemo(() => { if (!vehicleInstanceData) return null; const modelData = vehicleInstanceData.model_details; const instanceHexaColorCode = vehicleInstanceData.hexa_color_code; if (!modelData) return `https://via.placeholder.com/800x500.png?text=No+Model+Info`; let imagePath = null; if (instanceHexaColorCode && Array.isArray(modelData.all_media) && modelData.all_media.length > 0) { const colorSpecificImage = modelData.all_media.find( media => media.url && media.color_hex && media.color_hex.toLowerCase() === instanceHexaColorCode.toLowerCase() && (media.media_type ? media.media_type === 'image' : true) ); if (colorSpecificImage?.url) { imagePath = colorSpecificImage.url; } } if (!imagePath && modelData.main_image_url) { imagePath = modelData.main_image_url; } if (!imagePath && Array.isArray(modelData.all_media) && modelData.all_media.length > 0) { const firstImageWithUrl = modelData.all_media.find(media => media.url); if (firstImageWithUrl?.url) { imagePath = firstImageWithUrl.url; } } if (imagePath) { if (imagePath.startsWith('/') && !imagePath.startsWith('//') && !imagePath.toLowerCase().startsWith('http')) { let fullUrl = `${API_BASE_URL}${imagePath.startsWith('/storage/') ? '' : '/storage'}${imagePath}`; fullUrl = fullUrl.replace(/([^:]\/)\/+/g, "$1"); return fullUrl; } return imagePath; } return `https://via.placeholder.com/800x500.png?text=Image+Not+Found`; }, [vehicleInstanceData]);
  const dropdownInstances = otherInstances.map(inst => ({ id: inst.id, license_plate: inst.license_plate, vin: inst.vin, status: inst.status })).sort((a, b) => (a.license_plate || '').localeCompare(b.license_plate || ''));
  if (isLoading && !vehicleInstanceData) return <Container className="py-5 text-center"><Spinner animation="border" /><p className="mt-2">Loading...</p></Container>;
  if (error && !vehicleInstanceData) return <Container className="py-5"><BootstrapAlert variant="danger"><BootstrapAlert.Heading>Error Loading Vehicle</BootstrapAlert.Heading><p>{error}</p><Button onClick={() => loadVehicleInstance(activeInstanceId)} variant="outline-danger">Try Again</Button></BootstrapAlert></Container>;
  if (!vehicleInstanceData && !isLoading) { return <Container className="py-5 text-center"><p>No vehicle data available.</p><Button onClick={() => navigate(-1)} variant="primary">Back</Button></Container>; }
  const { model_details, alerts_and_health, schedule_events, vin } = vehicleInstanceData || {};
  const processedScheduleEventsForCalendar = schedule_events || [];
  const processedAlertsAndHealth = alerts_and_health || [];
  // --- End of unchanged parts ---

  return (
    <div className="vehicle-instance-detail-view">
      <Container className='container-xl'>
        {/* The main card's relative positioning is no longer needed for these specific FABs */}
        <div className="detail-card-instance"> 

          <div className="mb-4">
            <Button variant="link" onClick={handleBack} className="back-link-maquette bg-light text-dark p-2 shadow-sm">
              <LuArrowLeft size={22} className="me-1"/> 
            </Button>
          </div>

          <Row >
            {/* --- Main Content Column (Left Side) --- */}
            <Col lg={7} md={7} className="mb-4 mb-md-0">
              {vehicleInstanceData && model_details && (
                <InstanceHeader 
                  modelTitle={model_details.title} 
                  modelSubtitle={model_details.header_subtitle} 
                  mainImageUrl={mainImageUrl} 
                  allInstancesForDropdown={dropdownInstances} 
                  activeInstanceId={activeInstanceId} 
                  onInstanceChange={handleInstanceChange} 
                  vehicleVin={vin}
                />
              )}
              <Row className="mt-4"> 
                <Col md={6} className="mb-4 mb-md-0 d-flex flex-column"> 
                  <AlertsVehicleHealthCard alertsAndHealth={processedAlertsAndHealth} />
                </Col>
                <Col md={6} className="d-flex flex-column">
                  <ScheduleOverviewCard scheduleEvents={processedScheduleEventsForCalendar} />
                </Col>
              </Row>
            </Col>

            {/* --- Sidebar Column (Right Side) --- NOW CONTAINS A NESTED ROW */}
            <Col lg={5} md={5}>
              <Row className="h-100"> {/* Make nested row take full height of parent Col if needed for centering */}
                {/* Column for StatusLocationCard & Specs */}
                <Col xs={10}  className="d-flex flex-column"> 
                  {vehicleInstanceData && (
                    <StatusLocationCard 
                      instance={vehicleInstanceData} 
                      onUpdate={handleUpdateVehicleInstance}
                      onDelete={handleDeleteVehicleInstance}
                      onDataChange={handleDataChange}      
                    /> 
                  )}
                  <div className="mt-4  d-flex flex-column"> 
                    {model_details && vehicleInstanceData && (
                      <InstanceSpecificationsCard 
                        model={model_details} 
                        instanceStatus={model_details?.is_available} 
                      />
                    )}
                  </div>
                </Col>

                {/* NEW Column for the FAB-like buttons */}
                <Col xs={2}  className="d-flex flex-column align-items-center justify-content-center ps-2 ps-md-3">
                  {/* Button to view the VEHICLE MODEL'S details page */}
                  {model_details && model_details.id && (
                    <Button 
                      variant="light" 
                      className="rounded-3 p-2 shadow text-dark mb-3" // Added mb-3 for spacing
                      style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} // Slightly larger
                      title="View Vehicle Model Details"
                      onClick={() => {
                        navigate(`/admin/fleet/vehicle-models/${model_details.id}`);
                      }}
                    >
                      <LuModelDetailsIcon size={22} /> 
                    </Button>
                  )}

                  {/* Button to view the VEHICLE MODEL'S images/gallery */}
                  {model_details && model_details.id && (
                    <Button 
                      variant="light" 
                      className="rounded-3 p-2 shadow text-dark"
                      style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} // Slightly larger
                      title="View Vehicle Model Images & Gallery"
                      onClick={() => {
                        navigate(`/admin/fleet/vehicle-models/${model_details.id}/gallery`);
                      }}
                    >
                      <LuModelImagesIcon size={22} />
                    </Button>
                  )}
                </Col>
                
              </Row>
            </Col>

          </Row>
        </div>
      </Container>
    </div>
  );
};

export default VehicleInstanceDetailView;