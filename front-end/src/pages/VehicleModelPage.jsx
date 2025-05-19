import React, { useState, useEffect, useCallback } from 'react';
import VehicleModelTable from '../components/VehicleModelTable';
import { fetchAllVehicleModels } from '../services/api';
import { Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { LuSearch, LuPanelLeft, LuFilter, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import './VehicleModelPage.css'; // Ensure this CSS file has all the styles we discussed

const ITEMS_PER_PAGE = 6; // As per your mockup's visible rows before pagination

const VehicleModelPage = () => {
  const [allModels, setAllModels] = useState([]);
  const [displayedModels, setDisplayedModels] = useState([]); // Models for the current page view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [filteredModelsCount, setFilteredModelsCount] = useState(0);

  const loadAllModels = useCallback(async (backendSearch = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllVehicleModels(backendSearch);
      setAllModels(response.data.data || []);
      setCurrentPage(1); // Reset to page 1 on new data load
      setClientSearchTerm(''); // Reset client search as well
    } catch (err) {
      setError('Failed to fetch vehicle models. Please try again later.');
      console.error("API Error:", err.response ? err.response.data : err.message);
      setAllModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllModels();
  }, [loadAllModels]);

  useEffect(() => {
    let filtered = allModels;
    if (clientSearchTerm) {
      const lowercasedFilter = clientSearchTerm.toLowerCase();
      filtered = allModels.filter(model =>
        model.title.toLowerCase().includes(lowercasedFilter) ||
        (model.id && model.id.toLowerCase().startsWith(lowercasedFilter))
      );
    }
    setFilteredModelsCount(filtered.length);

    const newTotalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const finalTotalPages = newTotalPages > 0 ? newTotalPages : 1; // Ensure totalPages is at least 1
    setTotalPages(finalTotalPages);

    // Adjust currentPage if it's out of bounds after filtering or totalPages change
    let newCurrentPage = currentPage;
    if (newCurrentPage > finalTotalPages) {
      newCurrentPage = finalTotalPages;
    }
    if (newCurrentPage < 1) {
        newCurrentPage = 1;
    }
    // Only update if the calculated newCurrentPage is different from the existing currentPage
    // or if totalPages was 0 and now we have pages (so currentPage should be 1)
    if (currentPage !== newCurrentPage || (totalPages === 0 && finalTotalPages > 0 && newCurrentPage !== 1) ) {
        setCurrentPage(newCurrentPage);
    }

    const startIndex = (newCurrentPage - 1) * ITEMS_PER_PAGE;
    setDisplayedModels(filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE));

  }, [allModels, clientSearchTerm, currentPage, totalPages]); // Added totalPages dependency

  const handleClientSearchChange = (event) => {
    setClientSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new client search
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationItems = () => {
    if (totalPages <= 1 || filteredModelsCount === 0) return null; // Don't render if 1 or no pages, or no filtered items

    const pageNumbers = [];
    const siblingCount = 1; // Number of pages to show on each side of the current page
                            // For: < ... 3 [4] 5 ... >  (siblingCount = 1)
                            // For: < ... 2 3 [4] 5 6 ... > (siblingCount = 2)
                            // Figma seems to show 1 sibling, then ellipses.
    const totalSlots = siblingCount * 2 + 5; // first + last + current + 2*siblings + 2*ellipsis

    // Previous Button
    pageNumbers.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-arrow"
        aria-label="Previous Page"
      >
        <LuChevronLeft size={18} />
      </button>
    );

    // Case 1: Total pages is less than the number of slots we want to display for numbers & ellipses
    if (totalPages <= totalSlots - 2) { // -2 for prev/next arrows already added
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button key={i} onClick={() => handlePageChange(i)} className={`pagination-item ${currentPage === i ? 'active' : ''}`}>
            {i}
          </button>
        );
      }
    }
    // Case 2: Total pages is greater, need to calculate with ellipses
    else {
      const shouldShowLeftEllipsis = currentPage > siblingCount + 2; // Needs at least 1, ..., current-1
      const shouldShowRightEllipsis = currentPage < totalPages - (siblingCount + 1) ; // Needs current+1, ..., last

      // First page
      pageNumbers.push(
        <button key={1} onClick={() => handlePageChange(1)} className={`pagination-item ${currentPage === 1 ? 'active' : ''}`}>1</button>
      );

      // Left Ellipsis
      if (shouldShowLeftEllipsis) {
        pageNumbers.push(<span key="left-ellipsis" className="pagination-ellipsis">...</span>);
      }

      // Page numbers around current page
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button key={i} onClick={() => handlePageChange(i)} className={`pagination-item ${currentPage === i ? 'active' : ''}`}>
            {i}
          </button>
        );
      }

      // Right Ellipsis
      if (shouldShowRightEllipsis) {
        pageNumbers.push(<span key="right-ellipsis" className="pagination-ellipsis">...</span>);
      }

      // Last page (always show if different from first, and if totalPages > 1)
      if (totalPages > 1) {
         pageNumbers.push(
            <button key={totalPages} onClick={() => handlePageChange(totalPages)} className={`pagination-item ${currentPage === totalPages ? 'active' : ''}`}>{totalPages}</button>
         );
      }
    }

    // Next Button
    pageNumbers.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-arrow"
        aria-label="Next Page"
      >
        <LuChevronRight size={18} />
      </button>
    );
    return pageNumbers;
  };

  return (
    <div className="vehicle-model-page-content p-4 md:p-5">
      <Row className="mb-4 align-items-center page-header-custom">
        <Col>
          <h1 className="page-title-custom">VEHICLE MODELS</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" className="create-button-custom">
            <span className="me-2 fw-bold fs-5">+</span> Create Model
          </Button>
        </Col>
      </Row>

      <div className="controls-bar-figma">
        <div className="search-container-figma">
          <InputGroup className="search-input-group-figma">
            <span className="search-icon-wrapper-figma">
              <LuSearch className="search-icon-actual-figma" />
            </span>
            <Form.Control
              type="text"
              placeholder="Search by Title, Brand, Model, ID..."
              value={clientSearchTerm}
              onChange={handleClientSearchChange}
              className="search-input-field-figma"
              aria-label="Search vehicle models"
            />
          </InputGroup>
        </div>
        <div className="action-icons-figma">
          <Button variant="icon" className="icon-button-figma" aria-label="View Options">
            <LuPanelLeft size={20} />
          </Button>
          <Button variant="icon" className="icon-button-figma" aria-label="Filter">
            <LuFilter size={18} />
          </Button>
        </div>
      </div>

      {loading && <div className="loading-message-card">Loading vehicle models...</div>}
      {error && <div className="error-message-card">{error}</div>}

      {!loading && !error && (
        <VehicleModelTable models={displayedModels} loading={loading} />
      )}

      {/* Custom Pagination Rendering */}
      {!loading && totalPages > 0 && filteredModelsCount > 0 && ( // Only show if there are items after filtering
         <div className="d-flex justify-content-center align-items-center mt-4 pagination-custom-figma">
           {renderPaginationItems()}
         </div>
       )}

      {/* Informative messages for no data scenarios */}
      {!loading && !error && allModels.length === 0 && (
        <div className="no-data-card">No vehicle models available from the backend.</div>
      )}
      {!loading && !error && clientSearchTerm && filteredModelsCount === 0 && allModels.length > 0 && (
        <div className="no-data-card">No vehicle models match your search criteria.</div>
      )}
    </div>
  );
};

export default VehicleModelPage;