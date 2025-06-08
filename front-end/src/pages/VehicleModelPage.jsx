// src/pages/VehicleModelPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleModelTable from '../components/VehicleModelTable';
import { 
    fetchAllVehicleModels, 
    deleteVehicleModel,
    fetchAllVehicleTypes // <<<< USE THIS EXISTING FUNCTION
} from '../services/api'; // Assuming fetchAllVehicleTypes is in this file
import { Button, Form, InputGroup, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { LuSearch, LuFilter, LuChevronLeft, LuChevronRight, LuX, LuRotateCcw, LuPlus } from 'react-icons/lu';
import './VehicleModelPage.css'; 

const ITEMS_PER_PAGE_DEFAULT = 10;

const VehicleModelPage = () => {
  const navigate = useNavigate();

  const [models, setModels] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_DEFAULT);

  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const initialFiltersState = useMemo(() => ({
    filter_brand: '',
    filter_vehicle_type_id: '',
    filter_year_from: '',
    filter_year_to: '',
    filter_status: '',
    filter_fuel_type: '',
    filter_transmission: '',
  }), []);
  const [filters, setFilters] = useState(initialFiltersState);
  const [appliedFilters, setAppliedFilters] = useState({});

  const [vehicleTypes, setVehicleTypes] = useState([]); 
  const [loadingOptions, setLoadingOptions] = useState(false); 

  // Fetch vehicle type options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        // Use your existing fetchAllVehicleTypes with the 'all' parameter
        const response = await fetchAllVehicleTypes({ all: true }); 
        setVehicleTypes(response.data.data || []); 
      } catch (error) {
        console.error("Failed to fetch vehicle type options:", error);
        setVehicleTypes([]); 
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []); // Empty dependency array to run once on mount


  const loadModels = useCallback(async (resetPage = false) => {
    setListLoading(true);
    setListError(null);
    const pageToFetch = resetPage ? 1 : currentPage;

    try {
      const params = {
        page: pageToFetch,
        per_page: itemsPerPage,
        search: appliedSearchTerm,
        sort_by: sortBy,
        sort_direction: sortDirection,
        ...appliedFilters,
      };
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await fetchAllVehicleModels(params);
      setModels(response.data.data || []);
      setTotalPages(response.data.last_page || 0);
      setTotalItems(response.data.total || 0);
      setCurrentPage(response.data.current_page || 1);
      setItemsPerPage(response.data.per_page || ITEMS_PER_PAGE_DEFAULT);
    } catch (err) {
      setListError('Failed to fetch vehicle models. Please try again later.');
      console.error("List API Error:", err.response ? err.response.data : err.message);
      setModels([]); setTotalPages(0); setTotalItems(0);
    } finally {
      setListLoading(false);
    }
  }, [currentPage, itemsPerPage, appliedSearchTerm, sortBy, sortDirection, appliedFilters]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);


  const handleSearchInputChange = (event) => setSearchTerm(event.target.value);
  const handleApplySearch = () => { setAppliedSearchTerm(searchTerm); setCurrentPage(1);};
  const handleClearSearch = () => { setSearchTerm(''); setAppliedSearchTerm(''); setCurrentPage(1);};
  const handlePageChange = (pageNumber) => { if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) { setCurrentPage(pageNumber); }};
  
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleFilterInputChange = (e) => { const { name, value } = e.target; setFilters(prev => ({ ...prev, [name]: value })); };
  const handleApplyFilters = () => { setAppliedFilters(filters); setCurrentPage(1); setShowFilterPanel(false); };
  const handleResetFilters = () => { setFilters(initialFiltersState); setAppliedFilters({}); setCurrentPage(1); };
  const activeFilterCount = useMemo(() => Object.values(appliedFilters).filter(v => v && String(v).trim() !== '').length, [appliedFilters]);
  const handleViewModelDetails = (modelIdFromTable) => { if (modelIdFromTable) { navigate(`/admin/fleet/vehicle-models/${modelIdFromTable}`); } else { console.error("handleViewModelDetails: modelIdFromTable is undefined!"); }};
  const handleEditAction = (modelIdFromTable) => { if (modelIdFromTable) { navigate(`/admin/fleet/vehicle-models/${modelIdFromTable}?mode=edit`); } else { console.error("handleEditAction: modelIdFromTable is undefined!"); }};
  
  const handleDeleteAction = async (modelId) => {
    // Added a local 'isDeleting' flag if you have a spinner on the table's delete button
    // For now, using window.confirm as per your original code
      // setListLoading(true); // Or a specific isDeletingModelId state
         setListError(null); 
      try {
        await deleteVehicleModel(modelId);
        // Consider showing a success toast/message
        loadModels(models.length === 1 && currentPage > 1); 
      } catch (error) {
        console.error("Failed to delete vehicle model:", error);
        setListError(error.response?.data?.message || "Failed to delete. It might be in use.");
      } finally {
        // setListLoading(false);
      }
    
  };
  const handleCreateModel = () => { navigate('/admin/fleet/vehicle-models/create') };
  
  const renderPaginationItems = () => { 
    if (totalPages <= 1 || totalItems === 0) return null;
    const pageNumbers = [];
    const siblingCount = 1;
    const totalSlots = siblingCount * 2 + 5;
    pageNumbers.push( <Button key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline-secondary" size="sm" className="pagination-arrow me-1" aria-label="Previous Page"> <LuChevronLeft size={18} /> </Button> );
    if (totalPages <= totalSlots - 2) { for (let i = 1; i <= totalPages; i++) { pageNumbers.push(<Button key={i} onClick={() => handlePageChange(i)} variant={currentPage === i ? 'primary' : 'outline-secondary'} size="sm" className="pagination-item me-1">{i}</Button>); }
    } else {
      const showLeftEllipsis = currentPage > siblingCount + 2; const showRightEllipsis = currentPage < totalPages - (siblingCount + 1);
      pageNumbers.push(<Button key={1} onClick={() => handlePageChange(1)} variant={currentPage === 1 ? 'primary' : 'outline-secondary'} size="sm" className="pagination-item me-1">1</Button>);
      if (showLeftEllipsis) { pageNumbers.push(<span key="left-ellipsis" className="pagination-ellipsis mx-1">...</span>); }
      const startPage = Math.max(2, currentPage - siblingCount); const endPage = Math.min(totalPages - 1, currentPage + siblingCount);
      for (let i = startPage; i <= endPage; i++) { pageNumbers.push(<Button key={i} onClick={() => handlePageChange(i)} variant={currentPage === i ? 'primary' : 'outline-secondary'} size="sm" className="pagination-item me-1">{i}</Button>); }
      if (showRightEllipsis) { pageNumbers.push(<span key="right-ellipsis" className="pagination-ellipsis mx-1">...</span>); }
      if (totalPages > 1) { pageNumbers.push(<Button key={totalPages} onClick={() => handlePageChange(totalPages)} variant={currentPage === totalPages ? 'primary' : 'outline-secondary'} size="sm" className="pagination-item me-1">{totalPages}</Button>); }
    }
    pageNumbers.push( <Button key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} variant="outline-secondary" size="sm" className="pagination-arrow ms-1" aria-label="Next Page"> <LuChevronRight size={18} /> </Button> );
    return pageNumbers;
  };

  // Placeholder for fuel types and transmission (can also be fetched if they are dynamic)
  const fuelTypesPlaceholder = useMemo(() => ['Petrol', 'Diesel', 'Electric', 'Hybrid'], []);
  const transmissionTypesPlaceholder = useMemo(() => ['Automatic', 'Manual'], []);


  return (
    <div className="resource-page-container p-3 p-md-4 p-lg-5">
      <Row className="mb-4 align-items-center page-header-custom">
        <Col><h1 className="page-title-custom">VEHICLE MODELS</h1></Col>
        <Col xs="auto">
          <Button variant="primary" className="create-button-custom" onClick={handleCreateModel}>
            <LuPlus className="me-1" /> Create Model
          </Button>
        </Col>
      </Row>

      {listError && <Alert variant="danger" onClose={() => setListError(null)} dismissible className="mb-3">{listError}</Alert>}

      <div className="controls-bar-figma mb-4 p-3 bg-light rounded shadow-sm">
        <Row className="g-2 align-items-center ">
          <Col md={10} >
            <Form.Label htmlFor="searchModelsInput" className="visually-hidden">Search Models</Form.Label>
            <InputGroup className="search-input-group-figma">
              <span className="search-icon-wrapper-figma"><LuSearch className="search-icon-actual-figma" /></span>
              <Form.Control
                id="searchModelsInput"
                type="text"
                placeholder="Search by Title, Brand, Model, ID..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleApplySearch()}
                className="search-input-field-figma"
              />
              {searchTerm && (
                <Button variant="outline-secondary" onClick={handleClearSearch} className="clear-search-btn" aria-label="Clear search" style={{ zIndex: 3 }} > <LuX size={16}/> </Button>
              )}
              <Button variant="outline-secondary" onClick={handleApplySearch} aria-label="Apply search" className="input-group-text" > <LuSearch size={18} /> </Button>
            </InputGroup></Col>
           <Col md={2}> <Button variant="dark" className="icon-button-figma me-2" onClick={() => setShowFilterPanel(!showFilterPanel)} aria-expanded={showFilterPanel} aria-controls="filter-panel-content" aria-label="Toggle Filters" >
              <LuFilter size={18} />
              {activeFilterCount > 0 && <span className="badge bg-primary ms-2 rounded-pill">{activeFilterCount}</span>}
            </Button>
        </Col>
        </Row>

        {showFilterPanel && (
          <div id="filter-panel-content" className="filter-panel p-3 mt-3 border rounded bg-white shadow-sm">
            <Row className="g-3">
              <Col md={4} sm={6}>
                <Form.Group controlId="filterBrand">
                  <Form.Label size="sm">Brand</Form.Label>
                  <Form.Control size="sm" type="text" name="filter_brand" value={filters.filter_brand} onChange={handleFilterInputChange} placeholder="e.g., Toyota"/>
                </Form.Group>
              </Col>
              <Col md={4} sm={6}>
                <Form.Group controlId="filterVehicleType">
                  <Form.Label size="sm">Vehicle Type</Form.Label>
                  <Form.Select 
                    size="sm" 
                    name="filter_vehicle_type_id" 
                    value={filters.filter_vehicle_type_id} 
                    onChange={handleFilterInputChange}
                    disabled={loadingOptions || vehicleTypes.length === 0}
                  >
                    <option value="">All Types</option>
                    {loadingOptions ? (
                      <option value="" disabled>Loading types...</option>
                    ) : (
                      vehicleTypes.map(vt => <option key={vt.id} value={vt.id}>{vt.name}</option>)
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} sm={6}>
                <Form.Group controlId="filterStatus">
                  <Form.Label size="sm">Status</Form.Label>
                  <Form.Select size="sm" name="filter_status" value={filters.filter_status} onChange={handleFilterInputChange}>
                    <option value="">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group controlId="filterYearFrom">
                  <Form.Label size="sm">Year From</Form.Label>
                  <Form.Control size="sm" type="number" name="filter_year_from" value={filters.filter_year_from} onChange={handleFilterInputChange} placeholder="e.g., 2020"/>
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group controlId="filterYearTo">
                  <Form.Label size="sm">Year To</Form.Label>
                  <Form.Control size="sm" type="number" name="filter_year_to" value={filters.filter_year_to} onChange={handleFilterInputChange} placeholder="e.g., 2023"/>
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group controlId="filterFuelType">
                  <Form.Label size="sm">Fuel Type</Form.Label>
                   <Form.Select size="sm" name="filter_fuel_type" value={filters.filter_fuel_type} onChange={handleFilterInputChange}>
                        <option value="">All Fuels</option>
                        {fuelTypesPlaceholder.map(fuel => <option key={fuel} value={fuel.toLowerCase()}>{fuel}</option>)}
                    </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group controlId="filterTransmission">
                  <Form.Label size="sm">Transmission</Form.Label>
                  <Form.Select size="sm" name="filter_transmission" value={filters.filter_transmission} onChange={handleFilterInputChange}>
                    <option value="">All Transmissions</option>
                    {transmissionTypesPlaceholder.map(type => <option key={type} value={type.toLowerCase()}>{type}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-4 d-flex justify-content-end">
              <Button variant="link" size="sm" onClick={handleResetFilters} className="me-2 text-secondary text-decoration-none">
                <LuRotateCcw size={14} className="me-1"/> Reset Filters
              </Button>
              <Button variant="primary" size="sm" onClick={handleApplyFilters} className="submit-button-figma">
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      <VehicleModelTable
        models={models} // Prop name expected by VehicleModelTable
        loading={listLoading}
        // Pass your specific action handlers
        onViewDetails={handleViewModelDetails}
        onEditModel={handleEditAction} // This is the prop VehicleModelTable expects
        onDeleteModel={handleDeleteAction} // This is the prop VehicleModelTable expects
        // isDeleting={aDeletingFlag} // If you add a specific deleting flag for table button
      />

      {!listLoading && !listError && models.length === 0 && appliedSearchTerm && (
        <div className="text-center p-5 bg-light rounded mt-4">No vehicle models match your current search or filters.</div>
      )}
      {!listLoading && !listError && models.length === 0 && !appliedSearchTerm && !Object.keys(appliedFilters).length && (
         <div className="text-center p-5 bg-light rounded mt-4">No vehicle models available.</div>
      )}

      {totalItems > 0 && !listLoading && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pagination-summary-custom">
          <div className="text-muted small mb-2 mb-md-0">
            Showing {models.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0}-
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} models
          </div>
          <div className="d-flex justify-content-center align-items-center pagination-custom-figma">
            {renderPaginationItems()}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleModelPage;