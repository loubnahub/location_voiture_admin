import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Modal,
  Form,
  InputGroup,
  Alert,
  Pagination as BSPagination,
  Row,
  Col,
  Spinner
} from 'react-bootstrap';
import DynamicTable from './DynamicTable'; // Ensure this path is correct
import { LuSearch, LuPlus } from 'react-icons/lu';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first
import './ResourcePage.css'; // Ensure this path is correct

const ITEMS_PER_PAGE_DEFAULT = 8;

const ResourcePage = ({
  resourceName,
  resourceNamePlural,
  IconComponent,
  columns,
  initialFormData,
  validationSchema,
  fetchAllItems,
  createItem,
  updateItem,
  deleteItem,
  renderModalForm,
  itemsPerPage = ITEMS_PER_PAGE_DEFAULT,
  searchPlaceholder,
  canCreate = true,
  showSearch = true,
  tableActionsConfig, // Expected to be a function returning an array of custom actions, or an array itself
  additionalControls,
  onModalOpen, // Callback when modal opens
  onModalClose, // Callback when modal closes
  reloadDataTrigger,
  customHeaderButton,
}) => {
  const safeInitialFormData = initialFormData && typeof initialFormData === 'object'
    ? { ...initialFormData }
    : {};

  const [allItems, setAllItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentItemDataInternal, setCurrentItemDataInternal] = useState(safeInitialFormData);
  const setCurrentItemData = useCallback((updater) => {
    setCurrentItemDataInternal(prevData => {
      const newData = typeof updater === 'function' ? updater(prevData) : updater;
      if (newData === undefined) {
        console.error(`ResourcePage (${resourceName}): ATTEMPTING TO SET currentItemData TO UNDEFINED! Fallback to initial. Stack:`, new Error().stack);
        return { ...safeInitialFormData };
      }
      return newData;
    });
  }, [resourceName, safeInitialFormData]);
  const currentItemData = currentItemDataInternal;

  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalFormErrors, setModalFormErrors] = useState({});

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);

  const loadItems = useCallback(async (currentSearch = clientSearchTerm) => {
    setLoading(true); setError(null);
    try {
      const response = await fetchAllItems({ search: currentSearch /* you might add page, per_page here if API supports */ });
      // Adjust based on your API response structure for paginated data or all data
      const data = response.data.data || response.data || []; // Assuming data is in response.data.data or response.data
      const totalItems = response.data.total || data.length; // If API provides total for pagination
      const itemsPerPageFromAPI = response.data.per_page || itemsPerPage;

      setAllItems(Array.isArray(data) ? data : []);
      // If API handles pagination, use its values. If not, calculate based on all items.
      // This ResourcePage currently does client-side filtering/pagination on allItems.
      // If your fetchAllItems already handles pagination and search server-side,
      // then allItems would be the current page's items, and pagination logic would need adjustment.

      // For client-side pagination (current model):
      // setCurrentPage(1); // Reset to page 1 on new data load or search
    } catch (err) {
      setError(`Failed to fetch ${resourceNamePlural.toLowerCase()}.`);
      console.error(`API Error fetching ${resourceNamePlural}:`, err.response ? err.response.data : err.message, err);
      setAllItems([]);
    } finally { setLoading(false); }
  }, [fetchAllItems, resourceNamePlural, clientSearchTerm, itemsPerPage]); // Added itemsPerPage

  useEffect(() => {
    // Call loadItems with the current clientSearchTerm to initiate loading or on search term change
    // This might be simplified if pagination is server-side.
    loadItems(clientSearchTerm);
  }, [loadItems, reloadDataTrigger, clientSearchTerm]); // Added clientSearchTerm to reload if it changes via prop

  // Client-side filtering and pagination effect
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

    // Adjust currentPage if it becomes out of bounds
    setCurrentPage(prevCurrentPage => {
        if (prevCurrentPage > finalTotalPages) return finalTotalPages;
        if (prevCurrentPage < 1 && finalTotalPages > 0) return 1;
        if (finalTotalPages === 0) return 1; // Or 0, but 1 is safer for array slicing
        return prevCurrentPage;
    });

  }, [allItems, clientSearchTerm, itemsPerPage, showSearch]);

  useEffect(() => {
    // This effect is purely for slicing the items for the current page display
    const startIndex = (currentPage > 0 ? currentPage - 1 : 0) * itemsPerPage;
    let itemsToDisplay = allItems;
    if (clientSearchTerm && showSearch) {
        const lowerSearch = clientSearchTerm.toLowerCase();
        itemsToDisplay = allItems.filter(item =>
          Object.values(item).some(value =>
            String(value).toLowerCase().includes(lowerSearch)
          )
        );
    }
    setDisplayedItems(itemsToDisplay.slice(startIndex, startIndex + itemsPerPage));
  }, [allItems, clientSearchTerm, currentPage, itemsPerPage, showSearch]);


  const handleShowModal = (item = null) => {
    setModalError(''); setModalFormErrors({}); setSuccessMessage('');
    const baseData = safeInitialFormData;
    if (item && item.id) {
      setIsEditMode(true);
      const mergedData = { ...baseData, ...item };
      // console.log(`ResourcePage (${resourceName}): handleShowModal (EDIT) - Setting currentItemData to:`, JSON.stringify(mergedData, null, 2));
      setCurrentItemData(mergedData);
    } else {
      setIsEditMode(false);
      // console.log(`ResourcePage (${resourceName}): handleShowModal (CREATE) - Setting currentItemData to:`, JSON.stringify(baseData, null, 2));
      setCurrentItemData({ ...baseData });
    }
    setShowModal(true);
    if (onModalOpen) onModalOpen(item); // Call onModalOpen callback
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // console.log(`ResourcePage (${resourceName}): handleCloseModal - Resetting currentItemData.`);
    setCurrentItemData(safeInitialFormData); // Reset form data
    setIsEditMode(false);
    if (onModalClose) onModalClose(); // Call onModalClose callback
  };

  const handleModalInputChange = (e) => {
    const target = e.target || e; // In case e is not a standard event object
    const { name, value, type, checked } = target;
    setCurrentItemData(prev => {
      const currentPrev = (typeof prev === 'object' && prev !== null) ? prev : {};
      return { ...currentPrev, [name]: type === 'checkbox' ? checked : value };
    });
    // Clear validation error for the field being changed
    if (modalFormErrors[name]) {
      setModalFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Clear general modal error if all specific errors are cleared or the last one is being addressed
    if (modalError && Object.keys(modalFormErrors).length <= 1 && modalFormErrors[name]) {
         setModalError('');
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
          if (error.path && !yupErrors[error.path]) {
            yupErrors[error.path] = [error.message]; // Ensure it's an array for consistency
          }
        });
        setModalFormErrors(yupErrors);
        setModalError('Please correct the errors below.');
        setModalSubmitting(false);
        return;
      }
    }

    const dataToSubmit = { ...currentItemData };
    // For create operations, ensure 'id' is not sent if it's null or empty from initialFormData
    if (!isEditMode && dataToSubmit.hasOwnProperty('id') && (dataToSubmit.id === null || dataToSubmit.id === '')) {
      delete dataToSubmit.id;
    }

    try {
      let response;
      if (isEditMode && currentItemData.id) {
        response = await updateItem(currentItemData.id, dataToSubmit);
        setSuccessMessage(response.data.message || `${resourceName} updated successfully!`);
      } else {
        response = await createItem(dataToSubmit);
        setSuccessMessage(response.data.message || `${resourceName} created successfully!`);
      }
      await loadItems(clientSearchTerm); // Reload items with current search term
      handleCloseModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      if (err.response && err.response.status === 422 && err.response.data && err.response.data.errors) {
        setModalFormErrors(err.response.data.errors);
        setModalError(err.response.data.message || 'Please correct the errors highlighted below.');
      } else {
        setModalError(err.response?.data?.message || `An error occurred while saving the ${resourceName.toLowerCase()}.`);
      }
      console.error("Modal Submit error:", err.response || err);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteRequest = (item) => {
    const id = item.id;
    // Try to get a displayable name, fallback to ID
    const name = item.name || item.title || (item.id ? `ID: ${String(item.id).substring(0,8)}...` : 'this item');
    setItemToDelete({ id, name });
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete || !itemToDelete.id) return;
    setSuccessMessage(''); setError(null);
    try {
      const response = await deleteItem(itemToDelete.id);
      setSuccessMessage(response.data.message || `${resourceName} deleted successfully!`);
      await loadItems(clientSearchTerm); // Reload items with current search term
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete ${resourceName.toLowerCase()}. It might be in use.`);
      console.error("Delete error:", err.response || err);
      setTimeout(() => setError(null), 5000); // Auto-clear error after 5s
    } finally {
      setShowDeleteConfirmModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationItems = () => {
    if (totalPages <= 1 || filteredCount === 0) return null;
    const pageItems = [];
    const SIBLING_COUNT = 1;
    const totalPageNumbersToDisplay = SIBLING_COUNT * 2 + 3 + 2; // 1(first) + SIBLING_COUNT + 1(current) + SIBLING_COUNT + 1(last) + 2(ellipses)
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
        <BSPagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || totalPages === 0} />
        {pageItems}
        <BSPagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} />
      </>
    );
  };

  // --- Constructing table actions ---
  const defaultTableActions = {};
  if (updateItem && renderModalForm) { // Ensure renderModalForm is present for edit to make sense
    defaultTableActions.onEdit = (item) => handleShowModal(item);
  }
  if (deleteItem) {
    defaultTableActions.onDelete = (itemOrId) => handleDeleteRequest(typeof itemOrId === 'object' ? itemOrId : {id: itemOrId});
  }

  // Get the array of custom actions from the tableActionsConfig prop
  const customActionsArray = typeof tableActionsConfig === 'function'
    ? tableActionsConfig(loadItems) // Calls the function passed from parent page (e.g., RentalAgreementPage)
    : (Array.isArray(tableActionsConfig) ? tableActionsConfig : []); // Fallback if prop is already an array

  const finalTableActions = { ...defaultTableActions };

  // If there are custom actions, add them under a 'custom' key as an array
  if (customActionsArray && customActionsArray.length > 0) {
    finalTableActions.custom = customActionsArray;
  }
  // `finalTableActions` will now be e.g., { onEdit: fn, onDelete: fn, custom: [action1, action2] }
  // or just { onEdit: fn, onDelete: fn } if no custom actions.

  return (
    <div className="resource-page-container p-4">
      <Row className="mb-4 align-items-center page-header-custom">
        <Col>
          <h1 className="page-title-custom">
            {IconComponent && React.createElement(IconComponent, { className: "me-2", size: 24 })} {resourceNamePlural}
          </h1>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          {customHeaderButton && <div className="ms-2">{customHeaderButton}</div>}
          {/* Show create button only if createItem and renderModalForm are provided */}
          {canCreate && createItem && renderModalForm && !customHeaderButton && (
            <Button variant="primary" onClick={() => handleShowModal()} className="create-button-custom">
              <LuPlus className="me-1" /> Create {resourceName}
            </Button>
          )}
        </Col>
      </Row>

      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible className="mb-3">{successMessage}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">{error}</Alert>}

      {showSearch && (
        <div className={`controls-bar-figma ${additionalControls ? '' : 'search-only'}`}>
          <div className="search-container-figma">
            <InputGroup className="search-input-group-figma">
              <span className="search-icon-wrapper-figma"><LuSearch className="search-icon-actual-figma" /></span>
              <Form.Control
                type="text"
                placeholder={searchPlaceholder || `Search ${resourceNamePlural.toLowerCase()}...`}
                value={clientSearchTerm}
                onChange={(e) => {setClientSearchTerm(e.target.value); setCurrentPage(1);}} // Reset page to 1 on search
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
        actions={Object.keys(finalTableActions).length > 0 ? finalTableActions : undefined}
        noDataMessage={clientSearchTerm ? `No ${resourceNamePlural.toLowerCase()} match your search.` : `No ${resourceNamePlural.toLowerCase()} found.`}
        getKey={(item) => item.id}
        _resourceNameForDebug={resourceName} // Pass resourceName for better debug logs in DynamicTable
      />

      {!loading && totalPages > 1 && displayedItems.length > 0 && (
        <div className="d-flex justify-content-center mt-4 pagination-custom">
          <BSPagination>{renderPaginationItems()}</BSPagination>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {renderModalForm && ( // Only render Modal if renderModalForm is provided
        <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{isEditMode ? `Edit ${resourceName}` : `Create New ${resourceName}`}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleModalSubmit}>
            <Modal.Body>
              {modalError && Object.keys(modalFormErrors).length === 0 && <Alert variant="danger" className="mb-3">{modalError}</Alert>}
              {/* This is the old way of calling renderModalForm, compatible with RentalAgreementPage */}
              {showModal && renderModalForm(
                  currentItemData,
                  handleModalInputChange,
                  modalFormErrors,
                  isEditMode,
                  setCurrentItemData // Crucial for OLD pattern
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={handleCloseModal} disabled={modalSubmitting}>Cancel</Button>
              <Button variant="primary" type="submit" className="submit-button-figma" disabled={modalSubmitting}>
                {modalSubmitting ? (<><Spinner as="span" animation="border" size="sm" className="me-1"/>{isEditMode ? 'Saving...' : 'Creating...'}</>) : (isEditMode ? 'Save Changes' : `Create ${resourceName}`)}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}

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
          <Button variant="outline-secondary" onClick={cancelDelete}>Cancel</Button>
          <Button variant="danger" onClick={confirmDeleteItem}>Delete {resourceName}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ResourcePage;