import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Modal, Form, InputGroup, Alert, Pagination as BSPagination,
  Row, Col, Spinner
} from 'react-bootstrap';
import DynamicTable from '../components/DynamicTable'; // Adjust path if needed
import { LuSearch, LuPlus, LuCar, LuEye, LuFilter } from 'react-icons/lu';
import { VehicleStatus } from '../Enums'; // Adjust path if needed
import {
  fetchAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  fetchAllVehicleModels,
  fetchAllAddresses,
  createAddress
} from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

// ===================================================================================
// ResourcePage COMPONENT (with ESLint props fix)
// ===================================================================================

const ResourcePage = ({
  resourceName,
  resourceNamePlural,
  IconComponent,
  columns,
  initialFormData,
  fetchAllItems,
  createItem,
  updateItem,
  deleteItem,
  renderModalForm,
  searchPlaceholder,
  tableActionsConfig,
  additionalControls,
  onNewAddressCreated,
  dropdownData,
  // --- PROPS ADDED BACK TO FIX ESLINT ERROR ---
  canCreate = true,
  showSearch = true,
  customHeaderButton,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
const navigate=useNavigate();
  useEffect(() => {
    const timerId = setTimeout(() => { setDebouncedSearchTerm(searchTerm); }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItemData, setCurrentItemData] = useState({ ...initialFormData });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalFormErrors, setModalFormErrors] = useState({});
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [modelColorOptions, setModelColorOptions] = useState([]);

  useEffect(() => {
    if (currentItemData.vehicle_model_id && dropdownData?.vehicleModels) {
      const selectedModel = dropdownData.vehicleModels.find(m => m.id === currentItemData.vehicle_model_id);
      const colors = selectedModel ? (selectedModel.available_colors || []) : [];
      setModelColorOptions(colors);
    } else {
      setModelColorOptions([]);
    }
  }, [currentItemData.vehicle_model_id, dropdownData]);
  
  const loadItems = useCallback(async (page = 1) => {
    setLoading(true); setError(null);
    const params = { page, per_page: perPage, search: debouncedSearchTerm, ...filters };
    try {
      const response = await fetchAllItems(params);
      const paginatedData = response.data;
      setItems(paginatedData.data || []);
      setCurrentPage(paginatedData.current_page || 1);
      setTotalPages(paginatedData.last_page || 1);
      setPerPage(paginatedData.per_page || 15);
    } catch (err) { setError(`Failed to fetch ${resourceNamePlural.toLowerCase()}.`);
    } finally { setLoading(false); }
  }, [fetchAllItems, resourceNamePlural, perPage, debouncedSearchTerm, filters]);

  useEffect(() => {
    if (currentPage === 1) { loadItems(1); }
    else { setCurrentPage(1); }
  }, [debouncedSearchTerm, filters]);

  useEffect(() => {
    loadItems(currentPage);
  }, [currentPage, loadItems]);


  const handlePageChange = (page) => { if (page > 0 && page <= totalPages && page !== currentPage) setCurrentPage(page); };
  
  const handleShowModal = (item = null) => {
    setModalError(''); setModalFormErrors({});
    if (item?.id) { setIsEditMode(true); setCurrentItemData({ ...initialFormData, ...item, isCreatingNewAddress: false }); }
    else { setIsEditMode(false); setCurrentItemData({ ...initialFormData, isCreatingNewAddress: false }); }
    setShowModal(true);
  };
  
  const handleCloseModal = () => setShowModal(false);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newFormData = { ...currentItemData };
    if (name === 'vehicle_model_id') { newFormData.color = ''; newFormData.hexa_color_code = ''; }
    if (name === 'current_location_address_id' && value === 'CREATE_NEW') { newFormData.isCreatingNewAddress = true; }
    else if (name === 'current_location_address_id') { newFormData.isCreatingNewAddress = false; newFormData[name] = value; }
    else { newFormData[name] = type === 'checkbox' ? checked : value; }
    setCurrentItemData(newFormData);
    if (modalFormErrors[name]) setModalFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleColorSelectChange = (e) => {
    const selectedHex = e.target.value;
    const selectedColorObject = modelColorOptions.find(c => c.hex === selectedHex);
    if (selectedColorObject) { setCurrentItemData(prev => ({ ...prev, hexa_color_code: selectedColorObject.hex, color: selectedColorObject.name })); }
    else { setCurrentItemData(prev => ({ ...prev, hexa_color_code: '' })); }
  };
  
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError(''); setModalFormErrors({}); setModalSubmitting(true);
    let dataToSubmit = { ...currentItemData }; let finalAddressId = dataToSubmit.current_location_address_id;
    try {
      if (dataToSubmit.isCreatingNewAddress) {
        const newAddressPayload = { street_line_1: dataToSubmit.new_address_street_1, street_line_2: dataToSubmit.new_address_street_2, city: dataToSubmit.new_address_city, postal_code: dataToSubmit.new_address_postal_code, country: dataToSubmit.new_address_country, notes: dataToSubmit.new_address_notes };
        if (!newAddressPayload.street_line_1 || !newAddressPayload.city) { setModalError("Street Line 1 and City are required for a new address."); setModalSubmitting(false); return; }
        const newAddressResponse = await createAddress(newAddressPayload);
        const newAddress = newAddressResponse.data.data;
        finalAddressId = newAddress.id;
        if (onNewAddressCreated) onNewAddressCreated(newAddress);
      }
      dataToSubmit.current_location_address_id = finalAddressId;
      let response;
      if (isEditMode) { response = await updateItem(dataToSubmit.id, dataToSubmit); }
      else { const { id, ...createData } = dataToSubmit; response = await createItem(createData); }
      setSuccessMessage(response.data.message || 'Saved successfully!');
      loadItems(isEditMode ? currentPage : 1);
      handleCloseModal();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      if (err.response?.status === 422) { setModalFormErrors(err.response.data.errors); setModalError(err.response.data.message || 'Please correct errors.'); }
      else { setModalError(err.response?.data?.message || 'An error occurred.'); }
    } finally { setModalSubmitting(false); }
  };
  
  const handleDeleteRequest = (item) => { setItemToDelete(item); setShowDeleteConfirmModal(true); };
  
  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      const response = await deleteItem(itemToDelete.id);
      setSuccessMessage(response.data.message || 'Deleted successfully!');
      const newPage = items.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      if (newPage !== currentPage) setCurrentPage(newPage); else loadItems(newPage);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setShowDeleteConfirmModal(false);
      setItemToDelete(null);
    }
  };
  
  const renderPaginationItems = () => {
    if (totalPages <= 1) return null;
    const pageItems = [];
    const SIBLING_COUNT = 1; const totalPageNumbersToDisplay = SIBLING_COUNT * 2 + 5;
    if (totalPages <= totalPageNumbersToDisplay) { for (let i = 1; i <= totalPages; i++) pageItems.push(<BSPagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>{i}</BSPagination.Item>);
    } else {
      const shouldShowLeftEllipsis = currentPage > SIBLING_COUNT + 2; const shouldShowRightEllipsis = currentPage < totalPages - (SIBLING_COUNT + 1);
      pageItems.push(<BSPagination.Item key={1} active={1 === currentPage} onClick={() => handlePageChange(1)}>1</BSPagination.Item>);
      if (shouldShowLeftEllipsis) pageItems.push(<BSPagination.Ellipsis key="left-ellipsis" disabled />);
      const startPage = Math.max(2, currentPage - SIBLING_COUNT); const endPage = Math.min(totalPages - 1, currentPage + SIBLING_COUNT);
      for (let i = startPage; i <= endPage; i++) pageItems.push(<BSPagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>{i}</BSPagination.Item>);
      if (shouldShowRightEllipsis) pageItems.push(<BSPagination.Ellipsis key="right-ellipsis" disabled />);
      pageItems.push(<BSPagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>{totalPages}</BSPagination.Item>);
    }
    return <div className="d-flex justify-content-center mt-4 pagination-custom"><BSPagination><BSPagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />{pageItems}<BSPagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} /></BSPagination></div>;
  };

  return (
    <div className="resource-page-container p-4">
      <Row className="mb-4 align-items-center page-header-custom">
        <Col><h1 className="page-title-custom">{IconComponent && <IconComponent className="me-2" size={24} />} {resourceNamePlural}</h1></Col>
        <Col xs="auto" className="d-flex align-items-center">
          {customHeaderButton && <div className="ms-2">{customHeaderButton}</div>}
          {canCreate && createItem && renderModalForm && !customHeaderButton && (<Button variant="primary" onClick={() => navigate('/admin/vehicles/create')}  className="create-button-custom"><LuPlus className="me-1" /> Create {resourceName}</Button>)}
        </Col>
      </Row>
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {showSearch && (
        <div className={`controls-bar-figma ${additionalControls ? '' : 'search-only'}`}>
          <div className="search-container-figma">
            <InputGroup className="search-input-group-figma">
              <span className="search-icon-wrapper-figma"><LuSearch className="search-icon-actual-figma" /></span>
              <Form.Control type="text" placeholder={searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input-field-figma" />
            </InputGroup>
          </div>
          {additionalControls && <div className="additional-controls-figma">{additionalControls({ filters, setFilters })}</div>}
        </div>
      )}
      <DynamicTable columns={columns} items={items} loading={loading} actions={{ onEdit: handleShowModal, onDelete: handleDeleteRequest, custom: tableActionsConfig }} />
      {!loading && totalPages > 1 && renderPaginationItems()}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" backdrop="static">
        <Form onSubmit={handleModalSubmit}>
          <Modal.Header closeButton><Modal.Title>{isEditMode ? `Edit ${resourceName}` : `Create New ${resourceName}`}</Modal.Title></Modal.Header>
          <Modal.Body>
            {modalError && <Alert variant="danger">{modalError}</Alert>}
            {renderModalForm({ formData: currentItemData, handleInputChange, modalFormErrors, modelColorOptions, handleColorSelectChange })}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseModal} disabled={modalSubmitting}>Cancel</Button>
            <Button variant="primary" type="submit" className="submit-button-figma" disabled={modalSubmitting}>{modalSubmitting ? <Spinner as="span" size="sm" /> : (isEditMode ? 'Save Changes' : `Create ${resourceName}`)}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Deletion</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this {resourceName.toLowerCase()}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDeleteItem}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// ===================================================================================
// VEHICLE PAGE SPECIFIC CONFIGURATIONS
// ===================================================================================

const renderStatusBadge = (status, statusDisplay) => {
  let config = { bg: 'secondary' };
  switch (status?.toLowerCase()) { case 'available': config = { bg: 'success' }; break; case 'rented': config = { bg: 'warning', text: 'dark' }; break; case 'maintenance': config = { bg: 'info', text: 'dark' }; break; case 'unavailable': case 'damaged': config = { bg: 'danger' }; break; default: config = { bg: 'light', text: 'dark' }; break; }
  return <span className={`badge rounded-pill text-bg-${config.bg}`}>{statusDisplay}</span>;
};
const vehicleColumns = [ { header: 'License Plate', key: 'license_plate', className: 'fw-bold' }, { header: 'Model', key: 'vehicle_model_title', render: item => item.vehicle_model_title || <span className="text-muted">N/A</span> }, { header: 'Color', key: 'color', render: item => item.color || <span className="text-muted">N/A</span> }, { header: 'Mileage', key: 'mileage', textAlign: 'right', render: item => item.mileage?.toLocaleString() || <span className="text-muted">N/A</span> }, { header: 'Status', key: 'status_display', textAlign: 'center', render: item => renderStatusBadge(item.status, item.status_display) }, { header: 'Location', key: 'current_location_display', render: item => item.current_location_display || <span className="text-muted">N/A</span> }, ];
const initialVehicleData = { id: null, vehicle_model_id: '', current_location_address_id: '', license_plate: '', vin: '', color: '', hexa_color_code: '', mileage: '', status: 'available', acquisition_date: '', isCreatingNewAddress: false, new_address_street_1: '', new_address_street_2: '', new_address_city: '', new_address_postal_code: '', new_address_country: '', new_address_notes: '' };
const processVehicleDataForApi = (data) => {
    const processed = { ...data };
    processed.mileage = processed.mileage === '' || isNaN(parseInt(processed.mileage, 10)) ? 0 : parseInt(processed.mileage, 10);
    if (processed.acquisition_date === '') processed.acquisition_date = null;
    if (processed.current_location_address_id === '') processed.current_location_address_id = null;
    delete processed.isCreatingNewAddress; delete processed.new_address_street_1; delete processed.new_address_street_2; delete processed.new_address_city;
    delete processed.new_address_postal_code; delete processed.new_address_country; delete processed.new_address_notes;
    return processed;
};
const vehicleStatusOptions = Object.values(VehicleStatus || {}).map(status => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
}));

// ===================================================================================
// UPDATED RenderVehicleModalForm (Now a "Dumb" Component)
// ===================================================================================
const RenderVehicleModalForm = ({
  formData,
  handleInputChange,
  modalFormErrors,
  vehicleModels,
  addresses,
  modelColorOptions,
  handleColorSelectChange,
}) => {
  if (!formData) return <Alert variant="danger">Form data is missing.</Alert>;
  const isCreatingNewAddress = formData.isCreatingNewAddress === true;
  return (
    <>
      {Object.keys(modalFormErrors).length > 0 && <Alert variant="danger" className="mb-3">Please correct the highlighted errors.</Alert>}
      <Form.Group className="mb-3"><Form.Label>Vehicle Model <span className="text-danger">*</span></Form.Label><Form.Select name="vehicle_model_id" value={formData.vehicle_model_id || ''} onChange={handleInputChange} required isInvalid={!!modalFormErrors?.vehicle_model_id}><option value="">Select Model...</option>{vehicleModels.map(model => <option key={model.id} value={model.id}>{`${model.title} (${model.brand} ${model.model_name || model.model})`}</option>)}</Form.Select></Form.Group>
      <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>License Plate <span className="text-danger">*</span></Form.Label><Form.Control type="text" name="license_plate" value={formData.license_plate || ''} onChange={handleInputChange} required /></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label>VIN</Form.Label><Form.Control type="text" name="vin" value={formData.vin || ''} onChange={handleInputChange} /></Form.Group></Col></Row>
      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Color from Model</Form.Label><Form.Select name="hexa_color_code_select" value={formData.hexa_color_code || ''} onChange={handleColorSelectChange} disabled={!formData.vehicle_model_id || modelColorOptions.length === 0}><option value="">{formData.vehicle_model_id ? 'Select a pre-defined color...' : 'Select a model first...'}</option>{modelColorOptions.map(colorOpt => (<option key={colorOpt.hex} value={colorOpt.hex}>{colorOpt.name}</option>))}</Form.Select></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Color Name (Custom/Override) <span className="text-danger">*</span></Form.Label><Form.Control name="color" type="text" value={formData.color || ''} onChange={handleInputChange} required /></Form.Group></Col>
      </Row>
       <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Hex Color Code</Form.Label><Form.Control name="hexa_color_code" type="text" value={formData.hexa_color_code || ''} onChange={handleInputChange} /></Form.Group></Col>
        <Col md={6}>{formData.hexa_color_code && (<div className="mt-md-4 pt-md-2 d-flex align-items-center"><span className="me-2" style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: formData.hexa_color_code }}></span><span>Current Color Preview</span></div>)}</Col>
      </Row>
      <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Mileage <span className="text-danger">*</span></Form.Label><InputGroup><Form.Control type="number" name="mileage" value={formData.mileage || ''} onChange={handleInputChange} required min="0" /><InputGroup.Text>km</InputGroup.Text></InputGroup></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label>Status <span className="text-danger">*</span></Form.Label><Form.Select name="status" value={formData.status || ''} onChange={handleInputChange} required><option value="">Select...</option>{vehicleStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Form.Select></Form.Group></Col></Row>
      <Form.Group className="mb-3"><Form.Label>Acquisition Date</Form.Label><Form.Control type="date" name="acquisition_date" value={formData.acquisition_date || ''} onChange={handleInputChange} /></Form.Group>
      <Form.Group className="mb-3"><Form.Label>Location</Form.Label><Form.Select name="current_location_address_id" value={isCreatingNewAddress ? 'CREATE_NEW' : formData.current_location_address_id || ''} onChange={handleInputChange}><option value="">Select Address...</option>{addresses.map(addr => (<option key={addr.id} value={addr.id}>{`${addr.street_line_1}, ${addr.city}`}</option>))}<option value="CREATE_NEW" className="fw-bold text-primary">[+] Add New Address</option></Form.Select></Form.Group>
      {isCreatingNewAddress && ( <div className="p-3 border rounded bg-light mb-3">
          <h5 className="mb-3 small text-muted">NEW ADDRESS DETAILS</h5>
          <Form.Group className="mb-3"><Form.Label>Street Line 1 <span className="text-danger">*</span></Form.Label><Form.Control name="new_address_street_1" type="text" onChange={handleInputChange} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Street Line 2</Form.Label><Form.Control name="new_address_street_2" type="text" onChange={handleInputChange} /></Form.Group>
          <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>City <span className="text-danger">*</span></Form.Label><Form.Control name="new_address_city" type="text" onChange={handleInputChange} /></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label>Postal Code</Form.Label><Form.Control name="new_address_postal_code" type="text" onChange={handleInputChange} /></Form.Group></Col></Row>
          <Form.Group className="mb-3"><Form.Label>Country</Form.Label><Form.Control name="new_address_country" type="text" onChange={handleInputChange} /></Form.Group>
          <Form.Group className="mb-2"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={2} name="new_address_notes" onChange={handleInputChange} /></Form.Group>
      </div> )}
    </>
  );
};

// ===================================================================================
// MAIN VehiclePage COMPONENT (The "Conductor")
// ===================================================================================

const VehiclePage = () => {
  const navigate = useNavigate();
  const [vehicleModels, setVehicleModels] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);
  const [dropdownsError, setDropdownsError] = useState(null);

  const safeParseJson = useCallback((jsonStringOrArray) => {
      if (Array.isArray(jsonStringOrArray)) return jsonStringOrArray;
      if (typeof jsonStringOrArray === 'string') {
        try { return JSON.parse(jsonStringOrArray); } catch (e) { return []; }
      } return [];
  }, []);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [modelsRes, addressesRes] = await Promise.all([ fetchAllVehicleModels({ all: true }), fetchAllAddresses({ all: true }) ]);
        const parsedModels = (modelsRes.data.data || []).map(model => ({ ...model, available_colors: safeParseJson(model.available_colors) }));
        setVehicleModels(parsedModels);
        setAddresses(addressesRes.data.data || []);
      } catch (err) { setDropdownsError('Could not load options for the form.');
      } finally { setDropdownsLoading(false); }
    };
    loadDropdownData();
  }, [safeParseJson]);

  if (dropdownsLoading) return <div className="p-5 text-center"><Spinner animation="border" /></div>;
  if (dropdownsError) return <Alert variant="danger">{dropdownsError}</Alert>;

  const tableActions = [{ icon: <LuEye  size={18} style={{ color: '#10b981'}}/>, title: 'View Vehicle Details', handler: (item) => navigate(`/admin/vehicle-instance/${item.id}`) }];
  
  const StatusFilter = ({ filters, setFilters }) => (
    <InputGroup style={{ maxWidth: '200px' }}>
      <InputGroup.Text><LuFilter /></InputGroup.Text>
      <Form.Select name="status" value={filters.status || ''} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} aria-label="Filter by status">
        <option value="">All Statuses</option>
        {vehicleStatusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
      </Form.Select>
    </InputGroup>
  );

  return (
    <ResourcePage
      resourceName="Vehicle"
      resourceNamePlural="Vehicles"
      IconComponent={LuCar}
      columns={vehicleColumns}
      initialFormData={initialVehicleData}
      fetchAllItems={fetchAllVehicles}
      createItem={(data) => createVehicle(processVehicleDataForApi(data))}
      updateItem={(id, data) => updateVehicle(id, processVehicleDataForApi(data))}
      deleteItem={deleteVehicle}
      renderModalForm={(props) => <RenderVehicleModalForm {...props} vehicleModels={vehicleModels} addresses={addresses} />}
      searchPlaceholder="Search by License Plate, VIN, Model..."
      tableActionsConfig={tableActions}
      additionalControls={StatusFilter}
      onNewAddressCreated={(newAddress) => { setAddresses(currentAddresses => [newAddress, ...currentAddresses]); }}
      dropdownData={{ vehicleModels, addresses }}
    />
  );
};

export default VehiclePage;