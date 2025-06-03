// src/pages/VehicleModelPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleModelTable from '../components/VehicleModelTable';
import { fetchAllVehicleModels, deleteVehicleModel } from '../services/api';
import { Button, Form, InputGroup, Row, Col, Dropdown, Spinner, Alert } from 'react-bootstrap';
import { LuSearch, LuPanelLeft, LuFilter, LuChevronLeft, LuChevronRight, LuX, LuRotateCcw } from 'react-icons/lu';
// import './VehicleModelPage.css'; // Your custom styles for this page

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
  const initialFiltersState = {
    filter_brand: '',
    filter_vehicle_type_id: '',
    filter_year_from: '',
    filter_year_to: '',
    filter_status: '',
    filter_fuel_type: '',
  };
  const [filters, setFilters] = useState(initialFiltersState);
  const [appliedFilters, setAppliedFilters] = useState({});

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
      // console.log("First model item from API in VehicleModelPage:", response.data.data?.[0]); 
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
  const handleApplySearch = () => { setAppliedSearchTerm(searchTerm); setCurrentPage(1); };
  const handleClearSearch = () => { setSearchTerm(''); setAppliedSearchTerm(''); setCurrentPage(1); };
  const handlePageChange = (pageNumber) => { if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) setCurrentPage(pageNumber);};
  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortBy(newSortBy); setSortDirection('asc'); }
    setCurrentPage(1);
  };
  const handleFilterInputChange = (e) => { const { name, value } = e.target; setFilters(prev => ({ ...prev, [name]: value })); };
  const handleApplyFilters = () => { setAppliedFilters(filters); setCurrentPage(1); setShowFilterPanel(false);};
  const handleResetFilters = () => { setFilters(initialFiltersState); setAppliedFilters({}); setCurrentPage(1);};
  const activeFilterCount = useMemo(() => Object.values(appliedFilters).filter(v => v && String(v).trim() !== '').length, [appliedFilters]);

  const handleViewModelDetails = (modelIdFromTable) => {
    // console.log("VehicleModelPage: View Details for modelId:", modelIdFromTable);
    if (modelIdFromTable) {
      navigate(`/admin/fleet/vehicle-models/${modelIdFromTable}`);
    } else {
      console.error("handleViewModelDetails: modelIdFromTable is undefined!");
      alert("Error: Could not determine the model ID to view details.");
    }
  };

  const handleEditAction = (modelIdFromTable) => {
    // console.log("VehicleModelPage: Edit Action for modelId:", modelIdFromTable);
    if (modelIdFromTable) {
      navigate(`/admin/fleet/vehicle-models/${modelIdFromTable}?mode=edit`);
    } else {
      console.error("handleEditAction: modelIdFromTable is undefined!");
      alert("Error: Could not determine the model ID to edit.");
    }
  };

  const handleDeleteAction = async (modelId) => {
    if (window.confirm(`Are you sure you want to delete vehicle model ${modelId}? This action cannot be undone.`)) {
        // console.log("Proceeding with delete for model:", modelId);
        setListLoading(true); // Indicate loading during delete operation
        try {
            await deleteVehicleModel(modelId); 
            alert('Vehicle model deleted successfully.');
            loadModels(currentPage === 1 ? false : true); // Reload list, reset to page 1 if current page might become empty
        } catch (error) {
            console.error("Failed to delete vehicle model:", error);
            setListError(error.response?.data?.message || "Failed to delete vehicle model. It might be in use or another error occurred.");
            setListLoading(false); // Stop loading indicator on error
        }
    }
  };

  const handleCreateModel = () => {
    // console.log("Navigate to create model page/modal");
    // Example: navigate('/admin/fleet/vehicle-models/new'); 
    alert("Create new model - (Feature placeholder: typically navigate to a form or open a modal)");
  };

  const renderPaginationItems = () => {
    if (totalPages <= 1 || totalItems === 0) return null;
    const pageNumbers = []; const siblingCount = 1; const totalSlots = siblingCount * 2 + 5;
    pageNumbers.push(<Button key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline-secondary" size="sm" className="pagination-arrow me-1" aria-label="Previous Page"><LuChevronLeft size={18} /></Button>);
    if (totalPages <= totalSlots - 2) { for (let i = 1; i <= totalPages; i++) pageNumbers.push(<Button key={i} onClick={() => handlePageChange(i)} variant={currentPage === i ? 'primary' : 'outline-secondary'} size="sm" className="pagination-item me-1">{i}</Button>);}
    else {
      const showLeftEllipsis = currentPage > siblingCount + 2; const showRightEllipsis = currentPage < totalPages - (siblingCount + 1);
      pageNumbers.push(<Button key={1} onClick={() => handlePageChange(1)} variant={currentPage === 1 ? 'primary' : 'outline-secondary'} size="sm" className="pagination-item me-1">1</Button>);
      if (showLeftEllipsis) pageNumbers.push(<span key="left-ellipsis" className="pagination-ellipsis mx-1">...</span>);
      const startPage = Math.max(2, currentPage - siblingCount); const endPage = Math.min(totalPages - 1, currentPage + siblingCount);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(<Button key={i} onClick={() => handlePageChange(i)} variant={currentPage === i ? 'primary' : 'outline-secondary'} size="sm" className="pagination-item me-1">{i}</Button>);
      if (showRightEllipsis) pageNumbers.push(<span key="right-ellipsis" className="pagination-ellipsis mx-1">...</span>);
      if (totalPages > 1) pageNumbers.push(<Button key={totalPages} onClick={() => handlePageChange(totalPages)} variant={currentPage === totalPages ? 'primary' : 'outline-secondary'} size="sm" className="pagination-item me-1">{totalPages}</Button>);
    }
    pageNumbers.push(<Button key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} variant="outline-secondary" size="sm" className="pagination-arrow ms-1" aria-label="Next Page"><LuChevronRight size={18} /></Button>);
    return pageNumbers;
  };

  const vehicleTypesPlaceholder = [ { id: 'uuid-type-sedan', name: 'Sedan' }, { id: 'uuid-type-suv', name: 'SUV' }, ];


  return (
    <div className="vehicle-model-page-content p-3 p-md-4 p-lg-5">
      <Row className="mb-4 align-items-center page-header-custom">
        <Col><h1 className="page-title-custom">VEHICLE MODELS</h1></Col>
        <Col xs="auto"><Button variant="primary" className="create-button-custom" onClick={handleCreateModel}><span className="me-2 fw-bold fs-5">+</span> Create Model</Button></Col>
      </Row>

      <div className="controls-bar-figma mb-4 p-3 bg-light rounded shadow-sm">
        <Row className="g-2 align-items-center">
          <Col md={6} lg={7}>
              <Form.Label htmlFor="searchModelsInput" className="visually-hidden">Search Models</Form.Label>
              <InputGroup>
                  <Form.Control id="searchModelsInput" type="text" placeholder="Search by Title, Brand, Model, ID..." value={searchTerm} onChange={handleSearchInputChange} onKeyPress={(e) => e.key === 'Enter' && handleApplySearch()} className="search-input-field-figma"/>
                  {searchTerm && <Button variant="outline-secondary" onClick={handleClearSearch} className="clear-search-btn" aria-label="Clear search"><LuX size={16}/></Button>}
                  <Button variant="outline-secondary" onClick={handleApplySearch} aria-label="Apply search"><LuSearch className="search-icon-actual-figma" /></Button>
              </InputGroup>
          </Col>
          <Col md={6} lg={5} className="d-flex justify-content-md-end align-items-center mt-2 mt-md-0">
              <Button variant="outline-secondary" className="icon-button-figma me-2" onClick={() => setShowFilterPanel(!showFilterPanel)} aria-label="Toggle Filters">
                  <LuFilter size={18} /> <span className="d-none d-sm-inline ms-1">Filters</span>
                  {activeFilterCount > 0 && <span className="badge bg-primary ms-2">{activeFilterCount}</span>}
              </Button>
              {/* <Button variant="outline-secondary" className="icon-button-figma" aria-label="View Options (Not Implemented)">
                  <LuPanelLeft size={20} />
              </Button> */}
          </Col>
        </Row>
        {showFilterPanel && (
          <div className="filter-panel p-3 mt-3 border rounded bg-white">
              <Row className="g-3">
                  <Col md={4} sm={6}><Form.Group controlId="filterBrand"><Form.Label size="sm">Brand</Form.Label><Form.Control size="sm" type="text" name="filter_brand" value={filters.filter_brand} onChange={handleFilterInputChange} placeholder="e.g., Toyota"/></Form.Group></Col>
                  <Col md={4} sm={6}><Form.Group controlId="filterVehicleType"><Form.Label size="sm">Vehicle Type</Form.Label><Form.Select size="sm" name="filter_vehicle_type_id" value={filters.filter_vehicle_type_id} onChange={handleFilterInputChange}><option value="">All Types</option>{/* TODO: Replace with actual vehicleTypeOptions from API */vehicleTypesPlaceholder.map(vt => <option key={vt.id} value={vt.id}>{vt.name}</option>)}</Form.Select></Form.Group></Col>
                  <Col md={4} sm={6}><Form.Group controlId="filterStatus"><Form.Label size="sm">Status</Form.Label><Form.Select size="sm" name="filter_status" value={filters.filter_status} onChange={handleFilterInputChange}><option value="">All Statuses</option><option value="available">Available</option><option value="unavailable">Unavailable</option></Form.Select></Form.Group></Col>
                  <Col md={3} sm={6}><Form.Group controlId="filterYearFrom"><Form.Label size="sm">Year From</Form.Label><Form.Control size="sm" type="number" name="filter_year_from" value={filters.filter_year_from} onChange={handleFilterInputChange} placeholder="e.g., 2020"/></Form.Group></Col>
                  <Col md={3} sm={6}><Form.Group controlId="filterYearTo"><Form.Label size="sm">Year To</Form.Label><Form.Control size="sm" type="number" name="filter_year_to" value={filters.filter_year_to} onChange={handleFilterInputChange} placeholder="e.g., 2023"/></Form.Group></Col>
                  <Col md={3} sm={6}><Form.Group controlId="filterFuelType"><Form.Label size="sm">Fuel Type</Form.Label><Form.Control size="sm" type="text" name="filter_fuel_type" value={filters.filter_fuel_type} onChange={handleFilterInputChange} placeholder="e.g., Petrol"/></Form.Group></Col>
              </Row>
              <div className="mt-3 d-flex justify-content-end">
                  <Button variant="link" size="sm" onClick={handleResetFilters} className="me-2 text-secondary text-decoration-none"><LuRotateCcw size={14} className="me-1"/> Reset Filters</Button>
                  <Button variant="primary" size="sm" onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
          </div>
        )}
      </div>

      {listLoading && <div className="d-flex justify-content-center align-items-center p-5"><Spinner animation="border" role="status" /><p className="ms-3 mb-0">Loading vehicle models...</p></div>}
      {listError && <Alert variant="danger" className="mt-3">{listError}</Alert>}

      {!listLoading && !listError && (
        <>
          <VehicleModelTable
            models={models}
            onSort={handleSort}
            currentSortBy={sortBy}
            currentSortDirection={sortDirection}
            onViewDetails={handleViewModelDetails}
            onEditModel={handleEditAction}
            onDeleteModel={handleDeleteAction}
          />
          {totalItems > 0 ? (
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 pagination-summary-custom">
              <div className="text-muted small mb-2 mb-md-0">
                Showing {models.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0}-
                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} models
              </div>
              <div className="d-flex justify-content-center align-items-center pagination-custom-figma">
                {renderPaginationItems()}
              </div>
            </div>
          ) : (<div className="text-center p-5 bg-light rounded mt-4">No vehicle models match your current filters or search.</div>)}
        </>
      )}
    </div>
  );
};

export default VehicleModelPage;