import React, { useState, useEffect, useCallback } from 'react';
import ResourcePage from '../components/ResourcePage'; // Adjust path as needed
import {
  fetchAllOperationalHolds,
  createOperationalHold,
  updateOperationalHold,
  deleteOperationalHold,
  fetchAllVehicles
} from '../services/api'; // Adjust path as needed
import { Form, InputGroup, Row, Col, Spinner, FormCheck } from 'react-bootstrap';
import { FaTools } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

// --- NEW: Predefined reasons for the dropdown ---
const HOLD_REASONS = [
  'Maintenance',
  'Inspection',
  'Cleaning', // Added Cleaning
  'Temporary Unavailability',
  'Inspection',
  'Relocation',
  'Other',
];

// 1. Define Columns
const operationalHoldColumns = [
  { header: 'Vehicle', key: 'vehicle_display', render: (item) => item.vehicle_display || <span className="text-muted-custom">N/A</span> },
  { header: 'Reason', key: 'reason', render: (item) => item.reason || <span className="text-muted-custom">N/A</span> },
  { header: 'Start Date', key: 'start_date', render: (item) => item.start_date ? new Date(item.start_date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A' },
  { header: 'End Date', key: 'end_date', render: (item) => item.end_date ? new Date(item.end_date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A' },
  { header: 'Created By', key: 'creator_name', render: (item) => item.creator_name || <span className="text-muted-custom">N/A</span> },
  { header: 'Related Booking', key: 'booking_identifier', render: (item) => item.booking_identifier || <span className="text-muted-custom">None</span> },
  { header: 'Notes', key: 'notes', render: (item) => item.notes ? (item.notes.substring(0, 50) + (item.notes.length > 50 ? '...' : '')) : <span className="text-muted-custom">N/A</span> }
];

// 2. Define the initial (empty) state for the form data
const initialOperationalHoldData = {
  id: null,
  vehicle_id: '',
  booking_id: '',
  start_date: '',
  end_date: '',
  reason: HOLD_REASONS[0], // Use the first reason as the default
  notes: '',
  requires_maintenance: false,
  maintenance_record_attributes: null,
  existing_maintenance_record_id: null,
};

// Helper to format date for datetime-local input
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().slice(0, 16);
    } catch (e) {
        console.error("Error formatting date for input:", dateString, e);
        return '';
    }
};

// Initial state for the maintenance part of the form IF creating new
const initialMaintenanceRecordFormData = {
    description: '',
    cost: '',
    notes: '',
};

// 3. Define the component that renders the actual form fields
const OperationalHoldModalFormFields = ({ formData, handleInputChange, modalFormErrors, isEditMode, setCurrentItemData }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(true);
    const [maintenanceData, setMaintenanceData] = useState(initialMaintenanceRecordFormData);
    const [currentExistingMRId, setCurrentExistingMRId] = useState(null);

    const handleMaintenanceInputChange = (e) => {
        const { name, value } = e.target;
        setMaintenanceData(prev => ({ ...prev, [name]: value }));
    };

    // Effect to fetch vehicles
    useEffect(() => {
        const loadVehicles = async () => {
            setLoadingVehicles(true);
            try {
                const response = await fetchAllVehicles({ all: true });
                const vehicleData = response.data.data || response.data || [];
                setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
            } catch (error) {
                console.error("OHMFF: Error fetching vehicles:", error);
                setVehicles([]);
            } finally {
                setLoadingVehicles(false);
            }
        };
        loadVehicles();
    }, []);

    // Effect to initialize/reset local maintenanceData based on formData from parent
    useEffect(() => {
        if (formData?.requires_maintenance) {
            if (isEditMode && formData.maintenance_record && typeof formData.maintenance_record === 'object') {
                setMaintenanceData({
                    description: formData.maintenance_record.description || '',
                    cost: formData.maintenance_record.cost !== null && formData.maintenance_record.cost !== undefined ? String(formData.maintenance_record.cost) : '',
                    notes: formData.maintenance_record.notes || '',
                });
                setCurrentExistingMRId(formData.maintenance_record.id || formData.existing_maintenance_record_id || null);
            } else {
                setMaintenanceData(initialMaintenanceRecordFormData);
                setCurrentExistingMRId(null);
            }
        } else {
            setMaintenanceData(initialMaintenanceRecordFormData);
            setCurrentExistingMRId(null);
        }
    }, [isEditMode, formData?.id, formData?.requires_maintenance, formData?.maintenance_record, formData?.existing_maintenance_record_id]);


    // Effect to update parent (ResourcePage's currentItemData) with current maintenance attributes
    useEffect(() => {
        if (!setCurrentItemData) return;

        if (formData?.requires_maintenance) {
            setCurrentItemData(prev => ({
                ...prev,
                maintenance_record_attributes: { ...maintenanceData },
                existing_maintenance_record_id: currentExistingMRId,
            }));
        } else {
            setCurrentItemData(prev => ({
                ...prev,
                maintenance_record_attributes: null,
                existing_maintenance_record_id: null,
            }));
        }
    }, [maintenanceData, currentExistingMRId, formData?.requires_maintenance, setCurrentItemData]);


    if (loadingVehicles && vehicles.length === 0 && !isEditMode) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" size="sm" className="me-2" /> Loading vehicle options...
            </div>
        );
    }

    return (
        <>
            <Form.Group className="mb-3" controlId="holdVehicleId"><Form.Label>Vehicle <span className="text-danger">*</span></Form.Label><Form.Select name="vehicle_id" value={formData.vehicle_id || ''} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.vehicle_id} disabled={loadingVehicles && vehicles.length === 0}><option value="">{loadingVehicles && vehicles.length === 0 ? "Loading..." : "Select Vehicle..."}</option>{vehicles.map(vehicle => (<option key={vehicle.id} value={vehicle.id}>{`${vehicle.vehicle_model?.title || vehicle.make || vehicle.license_plate || 'Vehicle'} (${vehicle.license_plate || 'N/A'})`}</option>))}</Form.Select><Form.Control.Feedback type="invalid">{modalFormErrors?.vehicle_id?.join(', ')}</Form.Control.Feedback></Form.Group>
            <Row><Col md={6}><Form.Group className="mb-3" controlId="holdStartDate"><Form.Label>Start Date & Time <span className="text-danger">*</span></Form.Label><Form.Control type="datetime-local" name="start_date" value={formatDateForInput(formData.start_date)} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.start_date} /><Form.Control.Feedback type="invalid">{modalFormErrors?.start_date?.join(', ')}</Form.Control.Feedback></Form.Group></Col><Col md={6}><Form.Group className="mb-3" controlId="holdEndDate"><Form.Label>End Date & Time <span className="text-danger">*</span></Form.Label><Form.Control type="datetime-local" name="end_date" value={formatDateForInput(formData.end_date)} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.end_date} /><Form.Control.Feedback type="invalid">{modalFormErrors?.end_date?.join(', ')}</Form.Control.Feedback></Form.Group></Col></Row>
            
            {/* --- MODIFIED REASON FIELD --- */}
            <Form.Group className="mb-3" controlId="holdReason">
                <Form.Label>Reason <span className="text-danger">*</span></Form.Label>
                <Form.Select
                    name="reason"
                    value={formData.reason || ''}
                    onChange={handleInputChange}
                    required
                    isInvalid={!!modalFormErrors?.reason}
                >
                    {/* Handle legacy values that might not be in the list */}
                    {!HOLD_REASONS.includes(formData.reason) && formData.reason && (
                        <option value={formData.reason} disabled>{formData.reason} (Legacy Value)</option>
                    )}
                    
                    {/* Map over predefined reasons */}
                    {HOLD_REASONS.map(reasonOption => (
                        <option key={reasonOption} value={reasonOption}>
                            {reasonOption}
                        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    {modalFormErrors?.reason?.join(', ')}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="holdRequiresMaintenance">
                <Form.Check
                    type="checkbox"
                    label="This hold requires maintenance actions"
                    name="requires_maintenance"
                    checked={!!formData.requires_maintenance}
                    onChange={handleInputChange}
                />
            </Form.Group>

            {!!formData.requires_maintenance && (
                <div className="maintenance-fields-section border p-3 mt-3 mb-3 bg-light">
                    <h5>Maintenance Record Details {currentExistingMRId && `(Editing ID: ${currentExistingMRId.substring(0,8)}...)`}</h5>
                    <Form.Group className="mb-3" controlId="maintenanceDescription">
                        <Form.Label>Maintenance Description <span className="text-danger">*</span></Form.Label>
                        <Form.Control as="textarea" rows={2} name="description" value={maintenanceData.description} onChange={handleMaintenanceInputChange} required={!!formData.requires_maintenance} placeholder="Describe the maintenance" isInvalid={!!formData.requires_maintenance && !!modalFormErrors?.maintenance_record_attributes?.description} />
                        {!!formData.requires_maintenance && modalFormErrors?.maintenance_record_attributes?.description && <Form.Control.Feedback type="invalid">{modalFormErrors.maintenance_record_attributes.description.join(', ')}</Form.Control.Feedback>}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="maintenanceCost">
                        <Form.Label>Cost (MAD)</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>MAD</InputGroup.Text>
                            <Form.Control type="number" name="cost" value={maintenanceData.cost} onChange={handleMaintenanceInputChange} min="0" step="0.01" placeholder="0.00" isInvalid={!!formData.requires_maintenance && !!modalFormErrors?.maintenance_record_attributes?.cost} />
                        </InputGroup>
                        {!!formData.requires_maintenance && modalFormErrors?.maintenance_record_attributes?.cost && <div className="invalid-feedback d-block">{modalFormErrors.maintenance_record_attributes.cost.join(', ')}</div>}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="maintenanceNotes">
                        <Form.Label>Maintenance Notes (Optional)</Form.Label>
                        <Form.Control as="textarea" rows={2} name="notes" value={maintenanceData.notes} onChange={handleMaintenanceInputChange} placeholder="Additional notes" isInvalid={!!formData.requires_maintenance && !!modalFormErrors?.maintenance_record_attributes?.notes} />
                        {!!formData.requires_maintenance && modalFormErrors?.maintenance_record_attributes?.notes && <Form.Control.Feedback type="invalid">{modalFormErrors.maintenance_record_attributes.notes.join(', ')}</Form.Control.Feedback>}
                    </Form.Group>
                </div>
            )}

            <Form.Group className="mb-3" controlId="holdBookingId"><Form.Label>Related Booking ID (Optional)</Form.Label><Form.Control type="text" name="booking_id" value={formData.booking_id || ''} onChange={handleInputChange} placeholder="Enter Booking ID if applicable" isInvalid={!!modalFormErrors?.booking_id} /><Form.Text className="text-muted">If this hold is a direct result of a specific booking, enter its ID.</Form.Text><Form.Control.Feedback type="invalid">{modalFormErrors?.booking_id?.join(', ')}</Form.Control.Feedback></Form.Group>
            <Form.Group className="mb-3" controlId="holdNotes"><Form.Label>Notes (Optional)</Form.Label><Form.Control as="textarea" rows={3} name="notes" value={formData.notes || ''} onChange={handleInputChange} maxLength={1000} placeholder="Additional details or comments about the hold." isInvalid={!!modalFormErrors?.notes} /><Form.Control.Feedback type="invalid">{modalFormErrors?.notes?.join(', ')}</Form.Control.Feedback></Form.Group>
        </>
    );
};

// Main Page Component
const OperationalHoldPage = () => {
  const processFormDataForAPI = useCallback((dataFromResourcePage) => {
    const processed = { ...dataFromResourcePage };
    if (processed.start_date && typeof processed.start_date === 'string' && processed.start_date.includes('T')) {
        processed.start_date = processed.start_date.replace('T', ' ') + ':00';
    }
    if (processed.end_date && typeof processed.end_date === 'string' && processed.end_date.includes('T')) {
        processed.end_date = processed.end_date.replace('T', ' ') + ':00';
    }
    if (processed.booking_id === '') {
        processed.booking_id = null;
    }

    if (processed.maintenance_record_attributes) {
        if (processed.maintenance_record_attributes.cost === '' ||
            processed.maintenance_record_attributes.cost === null ||
            processed.maintenance_record_attributes.cost === undefined) {
            processed.maintenance_record_attributes.cost = null;
        } else {
            const cost = parseFloat(processed.maintenance_record_attributes.cost);
            processed.maintenance_record_attributes.cost = isNaN(cost) ? null : cost;
        }
    }
    delete processed.requires_maintenance;
    delete processed.maintenance_record;

    return processed;
  }, []);

  const renderModalFormWithLogic = useCallback((formData, handleInputChange, modalFormErrors, isEditMode, setCurrentItemData) => {
    return (
        <OperationalHoldModalFormFields
            formData={formData}
            handleInputChange={handleInputChange}
            modalFormErrors={modalFormErrors}
            isEditMode={isEditMode}
            setCurrentItemData={setCurrentItemData}
        />
    );
  }, []);

  return (
    <ResourcePage
      resourceName="Operational Hold"
      resourceNamePlural="Operational Holds"
      IconComponent={FaTools}
      columns={operationalHoldColumns}
      initialFormData={initialOperationalHoldData}
      renderModalForm={renderModalFormWithLogic}
      fetchAllItems={fetchAllOperationalHolds}
      createItem={(data) => createOperationalHold(processFormDataForAPI(data))}
      updateItem={(id, data) => updateOperationalHold(id, processFormDataForAPI(data))}
      deleteItem={deleteOperationalHold}
      searchPlaceholder="Search by reason, vehicle, creator..."
    />
  );
};

export default OperationalHoldPage;