import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Modal,
  Form,
  InputGroup,
  Alert,
  Pagination as BSPagination, // Renamed to avoid conflict
  Row,
  Col,
  Spinner // For loading state on submit button
} from 'react-bootstrap';
import DynamicTable from './DynamicTable'; // Assuming DynamicTable.jsx is in the same components folder
import { LuSearch, LuPlus } from 'react-icons/lu';
import './ResourcePage.css'; // CSS for this specific layout component

const ITEMS_PER_PAGE_DEFAULT = 8;

const ResourcePage = ({
  // --- Configuration Props ---
  resourceName,
  resourceNamePlural,
  IconComponent,
  columns,
  initialFormData,
  validationSchema, // Optional: for client-side validation (e.g., a Yup schema)

  // --- API Function Props ---
  fetchAllItems,
  createItem,
  updateItem,
  deleteItem,

  // --- Modal Form Rendering Prop ---
  renderModalForm, // (formData, handleInputChange, modalFormErrors, isEditMode, setCurrentItemData) => JSX

  // --- Optional Customization ---
  itemsPerPage = ITEMS_PER_PAGE_DEFAULT,
  searchPlaceholder, // Will default based on resourceNamePlural if not provided
  canCreate = true,
  showSearch = true,
  tableActionsConfig, // Optional: To override/extend default table actions { onEdit, onDelete, onView }
  additionalControls, // Optional: (filters) => JSX for extra filter controls
  onModalOpen,
  onModalClose,
}) => {
  const [allItems, setAllItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Modal State for Create/Edit
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItemData, setCurrentItemData] = useState({ ...initialFormData });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(''); // General error for the modal
  const [modalFormErrors, setModalFormErrors] = useState({}); // Field-specific validation errors

  // Modal State for Delete Confirmation
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Client-side Search and Pagination State
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);

  // --- Data Fetching ---
  const loadItems = useCallback(async (currentSearch = '') => {
    setLoading(true); setError(null);
    try {
      const response = await fetchAllItems(currentSearch);
      setAllItems(response.data.data || []);
      setCurrentPage(1);
    } catch (err) {
      setError(`Failed to fetch ${resourceNamePlural.toLowerCase()}.`);
      console.error(`API Error fetching ${resourceNamePlural}:`, err.response ? err.response.data : err.message, err);
      setAllItems([]);
    } finally { setLoading(false); }
  }, [fetchAllItems, resourceNamePlural]);

  useEffect(() => { loadItems(); }, [loadItems]);

  // --- Client-side Filtering & Pagination Effect ---
  useEffect(() => {
    let filtered = [...allItems];
    if (clientSearchTerm && showSearch) {
      const lowerSearch = clientSearchTerm.toLowerCase();
      filtered = allItems.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(lowerSearch)
        )
      );
    }
    setFilteredCount(filtered.length);

    const newTotalPages = Math.ceil(filtered.length / itemsPerPage);
    const finalTotalPages = newTotalPages > 0 ? newTotalPages : 1;
    setTotalPages(finalTotalPages);

    let newCurrentPage = currentPage;
    if (newCurrentPage > finalTotalPages) newCurrentPage = finalTotalPages;
    if (newCurrentPage < 1) newCurrentPage = 1;
    if (currentPage !== newCurrentPage) setCurrentPage(newCurrentPage);

    const startIndex = (newCurrentPage - 1) * itemsPerPage;
    setDisplayedItems(filtered.slice(startIndex, startIndex + itemsPerPage));
  }, [allItems, clientSearchTerm, currentPage, itemsPerPage, showSearch]);


  // --- Modal Handlers (Create/Edit) ---
  const handleShowModal = (item = null) => {
    setModalError(''); setModalFormErrors({}); setSuccessMessage('');
    if (item && item.id) {
      setIsEditMode(true);
      setCurrentItemData({ ...initialFormData, ...item });
    } else {
      setIsEditMode(false);
      setCurrentItemData({ ...initialFormData });
    }
     console.log("ResourcePage: initialFormData prop:", initialFormData); // What is this?
  console.log("ResourcePage: Setting currentItemData for modal:", item); 
    if (onModalOpen) onModalOpen(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (onModalClose) onModalClose();
  };

  const handleModalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentItemData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (modalFormErrors[name]) { // Clear specific field error on change
      setModalFormErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError(''); setModalFormErrors({}); setSuccessMessage('');
    setModalSubmitting(true);

    if (validationSchema) {
        try {
            await validationSchema.validate(currentItemData, { abortEarly: false });
        } catch (validationErrors) {
            const yupErrors = {};
            validationErrors.inner.forEach(error => {
                if (error.path && !yupErrors[error.path]) { // Take the first error for each path
                    yupErrors[error.path] = [error.message];
                }
            });
            setModalFormErrors(yupErrors);
            setModalError('Please correct the errors below.');
            setModalSubmitting(false);
            return;
        }
    }

    const dataToSubmit = { ...currentItemData };
    if (!isEditMode) delete dataToSubmit.id;

    try {
      let response;
      if (isEditMode && currentItemData.id) {
        response = await updateItem(currentItemData.id, dataToSubmit);
        setSuccessMessage(response.data.message || `${resourceName} updated successfully!`);
      } else {
        response = await createItem(dataToSubmit);
        setSuccessMessage(response.data.message || `${resourceName} created successfully!`);
      }
      loadItems(clientSearchTerm && showSearch ? clientSearchTerm : '');
      handleCloseModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      if (err.response && err.response.status === 422 && err.response.data && err.response.data.errors) {
        setModalFormErrors(err.response.data.errors);
        setModalError('Please correct the errors highlighted below.');
      } else {
        setModalError(err.response?.data?.message || `An error occurred while saving the ${resourceName.toLowerCase()}.`);
      }
      console.error("Modal Submit error:", err.response || err);
    } finally {
      setModalSubmitting(false);
    }
  };

  // --- Delete Handlers ---
  const handleDeleteRequest = (item) => { // Expects the full item or an object with id and name/title
    const id = item.id;
    const name = item.name || item.title || `ID: ${id}`;
    setItemToDelete({ id, name });
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete || !itemToDelete.id) return;
    setSuccessMessage(''); setError(null);
    // setModalSubmitting(true); // Could use a specific deleting state
    try {
      const response = await deleteItem(itemToDelete.id);
      setSuccessMessage(response.data.message || `${resourceName} deleted successfully!`);
      loadItems(clientSearchTerm && showSearch ? clientSearchTerm : '');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete ${resourceName.toLowerCase()}. It might be in use.`);
      console.error("Delete error:", err.response || err);
      setTimeout(() => setError(null), 5000);
    } finally {
      // setModalSubmitting(false);
      setShowDeleteConfirmModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  };

  // --- Pagination ---
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };
  const renderPaginationItems = () => {
    if (totalPages <= 1 || filteredCount === 0) return null;
    const pageItems = [];
    const SIBLING_COUNT = 1;
    const totalPageNumbersToDisplay = SIBLING_COUNT * 2 + 3 + 2; // Min slots for 1...x...N pattern
    if (totalPages <= totalPageNumbersToDisplay) {
      for (let i = 1; i <= totalPages; i++) pageItems.push(<BSPagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>{i}</BSPagination.Item>);
    } else {
      const shouldShowLeftEllipsis = currentPage > SIBLING_COUNT + 2;
      const shouldShowRightEllipsis = currentPage < totalPages - (SIBLING_COUNT + 1);
      pageItems.push(<BSPagination.Item key={1} active={1 === currentPage} onClick={() => handlePageChange(1)}>1</BSPagination.Item>);
      if (shouldShowLeftEllipsis) pageItems.push(<BSPagination.Ellipsis key="left-ellipsis" />);
      const startPage = Math.max(2, currentPage - SIBLING_COUNT);
      const endPage = Math.min(totalPages - 1, currentPage + SIBLING_COUNT);
      for (let i = startPage; i <= endPage; i++) pageItems.push(<BSPagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>{i}</BSPagination.Item>);
      if (shouldShowRightEllipsis) pageItems.push(<BSPagination.Ellipsis key="right-ellipsis" />);
      if (totalPages > 1) pageItems.push(<BSPagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>{totalPages}</BSPagination.Item>);
    }
    return (
      <>
        <BSPagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
        {pageItems}
        <BSPagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
      </>
    );
  };

  // --- Table Actions Configuration ---
  const defaultTableActions = {};
  if (updateItem) { // Only add edit if updateItem function is provided
    defaultTableActions.onEdit = (item) => handleShowModal(item);
  }
  if (deleteItem) { // Only add delete if deleteItem function is provided
    defaultTableActions.onDelete = (item) => handleDeleteRequest(item);
  }
  // Add onView if needed and if a onView function is passed via tableActionsConfig
  const finalTableActions = { ...defaultTableActions, ...tableActionsConfig };


  return (
    <div className="resource-page-container p-4">
      <Row className="mb-4 align-items-center page-header-custom">
        <Col>
          <h1 className="page-title-custom">
            {IconComponent && React.createElement(IconComponent, { className: "me-2", size: 24 })} {resourceNamePlural}
          </h1>
        </Col>
        {canCreate && createItem && ( // Only show create button if canCreate is true and createItem func is provided
          <Col xs="auto">
            <Button variant="primary" onClick={() => handleShowModal()} className="create-button-custom">
              <LuPlus className="me-1" /> Create {resourceName}
            </Button>
          </Col>
        )}
      </Row>

      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible className="mb-3">{successMessage}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-3">{error}</Alert>}

      {showSearch && (
        <div className={`controls-bar-figma ${additionalControls ? '' : 'search-only'}`}>
          <div className="search-container-figma">
            <InputGroup className="search-input-group-figma">
              <span className="search-icon-wrapper-figma"><LuSearch className="search-icon-actual-figma" /></span>
              <Form.Control
                type="text"
                placeholder={searchPlaceholder || `Search ${resourceNamePlural.toLowerCase()}...`}
                value={clientSearchTerm}
                onChange={(e) => {setClientSearchTerm(e.target.value); setCurrentPage(1);}}
                className="search-input-field-figma"
                aria-label={`Search ${resourceNamePlural.toLowerCase()}`}
              />
            </InputGroup>
          </div>
          {additionalControls && <div className="additional-controls-figma">{additionalControls}</div>}
        </div>
      )}

      <DynamicTable
        columns={columns}
        items={displayedItems}
        loading={loading}
        actions={Object.keys(finalTableActions).length > 0 ? finalTableActions : undefined} // Pass actions only if any are defined
        noDataMessage={clientSearchTerm ? `No ${resourceNamePlural.toLowerCase()} match your search.` : `No ${resourceNamePlural.toLowerCase()} found.`}
        getKey={(item) => item.id}
      />

      {!loading && totalPages > 0 && filteredCount > itemsPerPage && (
        <div className="d-flex justify-content-center mt-4 pagination-custom">
          <BSPagination>{renderPaginationItems()}</BSPagination>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? `Edit ${resourceName}` : `Create New ${resourceName}`}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleModalSubmit}>
          <Modal.Body>
            {/* General modal error (not field-specific) */}
            {modalError && !Object.keys(modalFormErrors).length > 0 && <Alert variant="danger" className="mb-3">{modalError}</Alert>}
            {/* Field-specific errors will be handled by renderModalForm */}
            {renderModalForm(currentItemData, handleModalInputChange, modalFormErrors, isEditMode, setCurrentItemData)}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseModal} disabled={modalSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="submit-button-figma" disabled={modalSubmitting}>
              {modalSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Save Changes' : `Create ${resourceName}`
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirmModal} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this {resourceName.toLowerCase()}
          {itemToDelete?.name && <strong>: {itemToDelete.name}</strong>}?
          <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteItem}>
            Delete {resourceName}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ResourcePage;