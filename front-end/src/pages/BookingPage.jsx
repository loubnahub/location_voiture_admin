import React, { useState, useEffect, useCallback } from 'react';
import {
    fetchAllBookings, createBooking, updateBooking, deleteBooking, confirmBookingApi, completeBookingApi
} from '../services/api'; // Booking API
import {
    Button, Modal, Form as BootstrapForm, InputGroup, Alert, Pagination as BSPagination, Row, Col, Spinner
} from 'react-bootstrap';
import { LuFileText, LuPlus, LuEdit, LuTrash2, LuCheck, LuSearch } from 'react-icons/lu';
import DynamicTable from '../components/DynamicTable'; // Adjust path as needed
import BookingModalForm from '../components/bookings/BookingModalForm'; // Adjust path as needed
import { BookingStatus as BookingStatusEnum } from '../Enums'; // Adjust path as needed
import { CheckCircle } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

const ITEMS_PER_PAGE = 8;

const initialBookingData = {
    id: null,
    renter_user_id: '',
    vehicle_id: '',
    insurance_plan_id: '',
    promotion_code_id: '',
    start_date: '',
    end_date: '',
    status: BookingStatusEnum?.PENDING_CONFIRMATION || 'pending_confirmation',
    booking_extras: [], // Will be populated with an array of Extra IDs for the child form
    calculated_base_price: '0.00',
    calculated_extras_price: '0.00',
    calculated_insurance_price: '0.00',
    discount_percentage: '', // For percentage input by user
    discount_amount_applied: '0.00', // Will be calculated by child form based on percentage
    final_price: '0.00', // Will be calculated by child form
};

const bookingColumns = [
    { header: 'ID', key: 'id', render: (item) => item.id ? item.id.substring(0, 8) + '...' : 'N/A' },
    { header: 'Renter', key: 'renter_name', render: (item) => item.renter_name || <span className="text-muted-custom">N/A</span> },
    { header: 'Vehicle', key: 'vehicle_display', render: (item) => item.vehicle_display || <span className="text-muted-custom">N/A</span> },
    { header: 'Start Date', key: 'start_date', render: (item) => item.start_date ? new Date(item.start_date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A' },
    { header: 'End Date', key: 'end_date', render: (item) => item.end_date ? new Date(item.end_date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A' },
    {
        header: 'Status', key: 'status_display', textAlign: 'center',
        render: (item) => {
            let badgeBg = 'secondary';
            switch (item.status?.toLowerCase()) {
                case BookingStatusEnum.PENDING_CONFIRMATION: badgeBg = 'warning'; break;
                case BookingStatusEnum.CONFIRMED: badgeBg = 'primary'; break;
                case BookingStatusEnum.ACTIVE: badgeBg = 'success'; break;
                case BookingStatusEnum.COMPLETED: badgeBg = 'info'; break;
                case BookingStatusEnum.CANCELLED_BY_RENTER:
                case BookingStatusEnum.CANCELLED_BY_ADMIN:
                case BookingStatusEnum.CANCELLED_BY_USER:
                    badgeBg = 'danger'; break;
                case BookingStatusEnum.NO_SHOW: badgeBg = 'dark'; break;
                default: badgeBg = 'light'; break;
            }
            const textClass = ['light', 'warning', 'info'].includes(badgeBg) ? 'text-dark' : 'text-white';
            return item.status_display ? <span className={`badge bg-${badgeBg} ${textClass}`}>{item.status_display}</span> : <span className="text-muted-custom">N/A</span>;
        }
    },
    { header: 'Extras Price', key: 'calculated_extras_price', textAlign: 'right', render: (item) => item.calculated_extras_price != null ? `${parseFloat(item.calculated_extras_price).toFixed(2)} MAD` : <span className="text-muted-custom">0.00 MAD</span> },
    { header: 'Total Price', key: 'final_price', textAlign: 'right', render: (item) => item.final_price != null ? `${parseFloat(item.final_price).toFixed(2)} MAD` : <span className="text-muted-custom">N/A</span> },
];


const BookingPage = () => {
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentBooking, setCurrentBooking] = useState({ ...initialBookingData });
    const [modalSubmitting, setModalSubmitting] = useState(false);
    const [modalFormErrors, setModalFormErrors] = useState({});
    const [modalSubmissionError, setModalSubmissionError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [apiPaginationMeta, setApiPaginationMeta] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const loadBookings = useCallback(async (page = 1, currentSearch = searchTerm) => {
        setLoading(true); setError(null);
        console.log(`BookingPage: loadBookings - Page: ${page}, Search: "${currentSearch}"`);
        try {
            const params = { page, per_page: ITEMS_PER_PAGE, search: currentSearch, sort_by: 'created_at', sort_direction: 'desc' };
            const response = await fetchAllBookings(params);
            console.log("BookingPage: loadBookings - API Response:", response);
            const bookingsData = response.data.data || [];
            setAllItems(bookingsData);
            // Log the first booking's extras if available to check structure from API
            if (bookingsData.length > 0 && bookingsData[0].hasOwnProperty('booking_extras')) {
                console.log("BookingPage: loadBookings - Extras of first booking from API list:", JSON.stringify(bookingsData[0].booking_extras, null, 2));
            }
            setApiPaginationMeta(response.data.meta || null);
            if (response.data.meta) {
                setCurrentPage(response.data.meta.current_page);
            } else {
                const totalItems = bookingsData.length;
                const calculatedTotalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
                setApiPaginationMeta(prev => ({ ...prev, current_page: 1, last_page: calculatedTotalPages, total: totalItems, from: 1, to: Math.min(totalItems, ITEMS_PER_PAGE), links: [] }));
            }
        } catch (err) {
            console.error("BookingPage: Failed to fetch bookings:", err.response || err);
            setError('Failed to fetch bookings. Please try again.');
            setAllItems([]); setApiPaginationMeta(null);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]); // ITEMS_PER_PAGE is constant, no need to include

    useEffect(() => {
        loadBookings(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm]); // loadBookings removed as per your comment, assuming its dependencies are stable or covered

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
        } catch (e) { return ''; }
    };

  // In src/pages/Bookings/BookingPage.jsx
const handleShowModal = (bookingToEdit = null) => {
    console.log("BookingPage: handleShowModal triggered. Booking to edit:", bookingToEdit ? `ID: ${bookingToEdit.id}` : "New Booking");
    setModalFormErrors({});
    setModalSubmissionError('');
    setSuccessMessage(''); // Clear previous success messages

    if (bookingToEdit && bookingToEdit.id) { // EDIT mode
        setIsEditMode(true);
        console.log("BookingPage: handleShowModal (Edit) - Raw 'bookingToEdit' object from API/table:", JSON.stringify(bookingToEdit, null, 2));

        // Start with a clean slate based on initialBookingData structure,
        // then overlay with values from bookingToEdit.
        // This ensures all fields expected by the form are present.
        const formDataForModal = {
            ...initialBookingData, // Ensures all keys from initialBookingData are present
            id: bookingToEdit.id, // Keep the ID
            renter_user_id: bookingToEdit.renter_user_id || '',
            vehicle_id: bookingToEdit.vehicle_id || '',
            insurance_plan_id: bookingToEdit.insurance_plan_id || '',

            // Populate promotion_code_string from the booking data
            // The backend transformBooking should provide promotion_code_string
            promotion_code_string: bookingToEdit.promotion_code_string || '',
            promotion_code_id: bookingToEdit.promotion_code_id || null, // Also pass the ID if available

            start_date: formatDateForInput(bookingToEdit.start_date),
            end_date: formatDateForInput(bookingToEdit.end_date),
            status: bookingToEdit.status?.value || bookingToEdit.status || initialBookingData.status, // Handle if status is enum object or value

            // --- KEY CHANGE: Pass the structured booking_extras array directly ---
            // bookingToEdit.booking_extras comes from your API's transformBooking method
            // and should be an array of objects like:
            // [{ extra_id: '...', name: '...', quantity: X, price_at_booking: 'Y.YY', default_price_per_day: 'Z.ZZ' }, ...]
            booking_extras: Array.isArray(bookingToEdit.booking_extras) ? bookingToEdit.booking_extras : [],

            // Calculated fields are usually strings from API, ensure they are strings for form consistency if needed
            calculated_base_price: String(bookingToEdit.calculated_base_price || '0.00'),
            calculated_extras_price: String(bookingToEdit.calculated_extras_price || '0.00'),
            calculated_insurance_price: String(bookingToEdit.calculated_insurance_price || '0.00'),
            discount_amount_applied: String(bookingToEdit.discount_amount_applied || '0.00'),
            final_price: String(bookingToEdit.final_price || '0.00'),

            // Include any other fields from bookingToEdit that are part of initialBookingData
            // If bookingToEdit might have fields not in initialBookingData that you want in the form,
            // you can spread bookingToEdit after initialBookingData, but be careful with overwriting types.
            // For example:
            // notes: bookingToEdit.notes || '', // If you have a notes field
        };

        // Remove discount_percentage if it's definitely not used in the form or submission logic anymore
        // If initialBookingData still has it, but you don't want it from bookingToEdit:
        // delete formDataForModal.discount_percentage; // Or ensure it's set to '' as per initialBookingData

        console.log("BookingPage: handleShowModal (Edit) - Final 'formDataForModal' for currentBooking state:", JSON.stringify(formDataForModal, null, 2));
        setCurrentBooking(formDataForModal);

    } else { // CREATE mode
        setIsEditMode(false);
        // For new booking, ensure booking_extras is an empty array and other fields are from initialBookingData
        const newBookingData = { ...initialBookingData, booking_extras: [] };
        // delete newBookingData.discount_percentage; // If not used
        console.log("BookingPage: handleShowModal (Create) - Initializing currentBooking for new booking:", JSON.stringify(newBookingData, null, 2));
        setCurrentBooking(newBookingData);
    }
    setShowModal(true);
};

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentBooking({ ...initialBookingData, booking_extras: [], discount_percentage: '' }); // Reset to initial, ensure extras is empty array
        setModalFormErrors({});
        setModalSubmissionError('');
    };

    const handleModalInputChange = (e) => {
        // Accommodate both standard event objects and synthetic ones for calculated fields
        const target = e.target || e; // If e is already the target-like object
        const { name, value, type, checked } = target;
if (name === 'booking_extras') {
        console.log(`BOOKING_PAGE_handleModalDataChange: Attempting to update 'booking_extras'. New value:`, JSON.stringify(value, null, 2));
    } else if (name === 'calculated_extras_price') {
        console.log(`BOOKING_PAGE_handleModalDataChange: Attempting to update 'calculated_extras_price'. New value:`, value);
    }
        // console.log("BookingPage: handleModalInputChange received:", { name, value, type, checked });
        setCurrentBooking(prev => {
            const updatedBooking = { ...prev, [name]: type === 'checkbox' ? checked : value };
            // Avoid excessive logging here unless debugging this specific function
            // console.log("BookingPage: currentBooking state updated (stringified):", JSON.stringify(updatedBooking, null, 2));
            return updatedBooking;
        });

        if (modalFormErrors[name]) {
            setModalFormErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
        }
        if (modalSubmissionError) setModalSubmissionError('');
    };

  const processBookingDataForAPI = (dataFromForm) => {
    const processed = { ...dataFromForm }; // dataFromForm.booking_extras IS ALREADY the structured array

    // Process numeric fields (ensure they are numbers or null/0.00)
    const numericKeys = ['calculated_base_price', 'calculated_extras_price', 'calculated_insurance_price', 'discount_amount_applied', 'final_price'];
    numericKeys.forEach(key => {
        processed[key] = (processed[key] === '' || processed[key] === null || isNaN(parseFloat(processed[key])))
            ? 0.00 // Default to 0.00 for these calculated fields if not set
            : parseFloat(processed[key]);
    });

    // Handle optional foreign keys (set to null if empty string)
    ['insurance_plan_id', 'promotion_code_id'].forEach(key => {
        if (processed[key] === '') processed[key] = null;
    });

    // Handle promotion_code_string
    if (processed.promotion_code_string === '') {
        processed.promotion_code_string = null;
    }
    // If you decide to ONLY send promotion_code_id if a code is successfully applied:
    // if (!processed.promotion_code_id) { // If no ID from successful apply
    //     delete processed.promotion_code_string; // Don't send string if not applied
    // }

    // --- CORRECTED LOGIC FOR booking_extras ---
    if (Array.isArray(processed.booking_extras)) {
        // The data should already be structured as [{extra_id, quantity, price_at_booking}, ...]
        // We just ensure the values are of the correct type and clean.
        processed.booking_extras = processed.booking_extras
            .filter(extra =>
                extra &&
                extra.extra_id &&
                extra.hasOwnProperty('quantity') &&
                extra.hasOwnProperty('price_at_booking')
            )
            .map(extra => ({
                extra_id: String(extra.extra_id),
                quantity: parseInt(extra.quantity, 10) || 1,
                price_at_booking: parseFloat(extra.price_at_booking || 0).toFixed(2)
            }));
    } else {
        processed.booking_extras = [];
    }
    // --- END CORRECTION ---

    // Remove discount_percentage if you're not storing it on the backend's Booking model
    delete processed.discount_percentage;

    return processed;
};

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        
        setModalFormErrors({}); setModalSubmissionError(''); setModalSubmitting(true);
        console.log("BookingPage: Submitting currentBooking (before processing):", JSON.stringify(currentBooking, null, 2));
        const dataToSubmit = processBookingDataForAPI(currentBooking);
        console.log("BookingPage: Submitting dataToSubmit (after processing):", JSON.stringify(dataToSubmit, null, 2));
    console.log("BOOKING_PAGE_SUBMIT: FINAL booking_extras being sent to API:", JSON.stringify(dataToSubmit.booking_extras, null, 2));
    console.log("BOOKING_PAGE_SUBMIT: FULL dataToSubmit payload:", JSON.stringify(dataToSubmit, null, 2));
         try {
            if (isEditMode && currentBooking.id) {
                await updateBooking(currentBooking.id, dataToSubmit);
                setSuccessMessage('Booking updated successfully!');
            } else {
                await createBooking(dataToSubmit);
                
                setSuccessMessage('Booking created successfully!');
            }
            loadBookings(isEditMode ? currentPage : 1, isEditMode ? searchTerm : ''); // Reload relevant page
            if (!isEditMode) setSearchTerm(''); // Clear search on create
            handleCloseModal();
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            console.error("BookingPage: Submit error:", err.response || err);
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setModalFormErrors(err.response.data.errors);
            } else {
                setModalSubmissionError(err.response?.data?.message || 'An unexpected error occurred during submission.');
            }
        } finally {
            setModalSubmitting(false);
        }
    };

    const handleDeleteBooking = async (itemId) => { // Changed param name for clarity
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        setActionLoadingId(`${itemId}_delete`);
        setError(null);
        setSuccessMessage('');
        try {
            await deleteBooking(itemId.id);
            setSuccessMessage('Booking deleted successfully!');
            // Smarter page handling after delete
            const newTotalItems = (apiPaginationMeta?.total || 1) - 1;
            let pageToLoad = currentPage;
            if (allItems.length === 1 && currentPage > 1) { // If it was the last item on a page > 1
                pageToLoad = currentPage - 1;
            }
            const newLastPage = Math.max(1, Math.ceil(newTotalItems / ITEMS_PER_PAGE));
            if (pageToLoad > newLastPage) pageToLoad = newLastPage;
            if (pageToLoad < 1) pageToLoad = 1;

            loadBookings(pageToLoad, searchTerm); // Reload with potentially adjusted page
            if (currentPage !== pageToLoad) setCurrentPage(pageToLoad); // Update current page if it changed

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error("BookingPage: Delete error:", err.response || err);
            setError(err.response?.data?.message || 'Failed to delete booking.');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handlePageChange = (pageStr) => {
        const pageNumber = parseInt(pageStr, 10);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= (apiPaginationMeta?.last_page || 1) && pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };

    const renderPaginationItems = () => {
        if (!apiPaginationMeta || apiPaginationMeta.last_page <= 1) return null;

        // Prefer using API's links if they are well-formed
        if (apiPaginationMeta.links && apiPaginationMeta.links.length > 2) {
            return apiPaginationMeta.links.map((link, index) => {
                let pageNumber = null;
                if (link.url) {
                    try {
                        const urlParams = new URLSearchParams(new URL(link.url).search);
                        pageNumber = urlParams.get("page") ? parseInt(urlParams.get("page"), 10) : null;
                    } catch (e) { /* In case URL is malformed or not absolute */ }
                }

                // Determine page number from label if URL parsing fails or for Prev/Next
                if (pageNumber === null) {
                    if (link.label.includes("«") || link.label.toLowerCase().includes("previous")) {
                        pageNumber = Math.max(1, apiPaginationMeta.current_page - 1);
                    } else if (link.label.includes("»") || link.label.toLowerCase().includes("next")) {
                        pageNumber = Math.min(apiPaginationMeta.last_page, apiPaginationMeta.current_page + 1);
                    } else if (!isNaN(parseInt(link.label, 10))) {
                        pageNumber = parseInt(link.label, 10);
                    }
                }

                return (
                    <BSPagination.Item key={`link-${index}-${link.label}`} active={link.active}
                        onClick={() => (link.url && pageNumber !== null) && handlePageChange(String(pageNumber))}
                        disabled={!link.url || link.active || (pageNumber === apiPaginationMeta.current_page && !link.active) }>
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    </BSPagination.Item>
                );
            });
        }

        // Fallback pagination rendering if API links are not suitable
        let items = []; const { current_page, last_page } = apiPaginationMeta;
        items.push(<BSPagination.Prev key="prev" onClick={() => handlePageChange(String(current_page - 1))} disabled={current_page === 1} />);
        const MAX_VISIBLE_PAGES = 5;
        let startPage = Math.max(1, current_page - Math.floor(MAX_VISIBLE_PAGES / 2));
        let endPage = Math.min(last_page, startPage + MAX_VISIBLE_PAGES - 1);
        if (endPage - startPage + 1 < MAX_VISIBLE_PAGES && startPage > 1) { startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1); }

        if (startPage > 1) {
            items.push(<BSPagination.Item key={1} onClick={() => handlePageChange("1")}>1</BSPagination.Item>);
            if (startPage > 2) { items.push(<BSPagination.Ellipsis key="start-ellipsis" />); }
        }
        for (let number = startPage; number <= endPage; number++) { items.push(<BSPagination.Item key={number} active={number === current_page} onClick={() => handlePageChange(String(number))}>{number}</BSPagination.Item>); }
        if (endPage < last_page) {
            if (endPage < last_page - 1) { items.push(<BSPagination.Ellipsis key="end-ellipsis" />); }
            items.push(<BSPagination.Item key={last_page} onClick={() => handlePageChange(String(last_page))}>{last_page}</BSPagination.Item>);
        }
        items.push(<BSPagination.Next key="next" onClick={() => handlePageChange(String(current_page + 1))} disabled={current_page === last_page} />);
        return items;
    };

    const handleGenericTableAction = async (actionApi, bookingId, successMsg, errorMsgPrefix, actionType) => {
        setActionLoadingId(`${bookingId}_${actionType}`);
        setError(null); setSuccessMessage('');
        try {
            await actionApi(bookingId);
            setSuccessMessage(successMsg);
            loadBookings(currentPage, searchTerm); // Reload current page
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(`BookingPage: ${actionType} error for booking ${bookingId}:`, err.response || err);
            setError(err.response?.data?.message || `${errorMsgPrefix} for booking.`);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleConfirmBooking = (booking) => handleGenericTableAction(confirmBookingApi, booking.id, "Booking confirmed!", "Failed to confirm", "confirm");
    const handleCompleteBooking = (booking) => handleGenericTableAction(completeBookingApi, booking.id, "Booking completed!", "Failed to complete", "complete");

    // Ensure `getKey` is passed to DynamicTable to avoid issues if item.id is complex/missing
    const getKeyForRow = useCallback((item) => item.id, []);


    const tableActions = {
        onEdit: (item) => handleShowModal(item),
        // onDelete is now directly used, DynamicTable should pass the item's key (ID)
        onDelete: handleDeleteBooking, // Assumes DynamicTable calls this with item ID
        custom: [
            {
                icon: (item) => actionLoadingId === `${item.id}_confirm` ? <Spinner size="sm" /> : <LuCheck size={18} />,
                handler: handleConfirmBooking,
                title: "Confirm",
                className: "text-success",
                shouldShow: (item) => item.status === BookingStatusEnum.PENDING_CONFIRMATION,
                isLoading: (item) => actionLoadingId === `${item.id}_confirm`
            },
            {
                icon: (item) => actionLoadingId === `${item.id}_complete` ? <Spinner size="sm" /> : <CheckCircle size={18} />,
                handler: handleCompleteBooking,
                title: "Complete",
                className: "text-info",
                shouldShow: (item) => item.status === BookingStatusEnum.ACTIVE,
                isLoading: (item) => actionLoadingId === `${item.id}_complete`
            },
        ],
    };

    return (
        <div className="page-container booking-page p-4">
            <Row className="mb-4 align-items-center page-header-custom">
                <Col><h1 className="page-title-custom"><LuFileText className="me-2" /> Bookings Management</h1></Col>
                <Col xs="auto"><Button variant="primary" onClick={() => handleShowModal()} className="create-button-custom"><LuPlus className="me-1" /> Create Booking</Button></Col>
            </Row>

            {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible className="mb-3">{successMessage}</Alert>}
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">{error}</Alert>}

            <div className="controls-bar-figma mb-3">
                <div className="search-container-figma">
                    <InputGroup className="search-input-group-figma">
                        <span className="search-icon-wrapper-figma"><LuSearch className="search-icon-actual-figma" /></span>
                        <BootstrapForm.Control
                            type="text"
                            placeholder="Search by Renter, Vehicle, ID..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                // Optional: Reset to page 1 on new search, or debounce
                                // if (currentPage !== 1) setCurrentPage(1);
                                // loadBookings(1, e.target.value); // If you want instant search, manage currentPage carefully
                            }}
                            className="search-input-field-figma"
                        />
                    </InputGroup>
                </div>
            </div>

            <DynamicTable
                columns={bookingColumns}
                items={allItems}
                loading={loading}
                actions={tableActions}
                noDataMessage={searchTerm ? 'No bookings match your search.' : 'No bookings found.'}
                getKey={getKeyForRow} // Pass the memoized getKey function
                actionLoadingId={actionLoadingId} // Pass this down if DynamicTable needs it for disabling its own buttons
            />

            {!loading && apiPaginationMeta && apiPaginationMeta.last_page > 1 && (
                <div className="d-flex justify-content-center mt-4 pagination-custom">
                    <BSPagination>{renderPaginationItems()}</BSPagination>
                </div>
            )}

            <Modal show={showModal} onHide={handleCloseModal} centered size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Edit Booking' : 'Create New Booking'}</Modal.Title>
                </Modal.Header>
                <BootstrapForm onSubmit={handleModalSubmit}>
                    <Modal.Body>
                        {/* Key change: Ensure BookingModalForm re-initializes properly when formData or isEditMode changes */}
                        {/* Using a key prop based on currentBooking.id (or a timestamp for new) can help force re-mount */}
                        {showModal && (
                            <BookingModalForm
                                key={isEditMode && currentBooking.id ? currentBooking.id : 'new-booking-form'}
                                formData={currentBooking}
                                handleInputChange={handleModalInputChange} // For direct form inputs within BookingModalForm
                                onFormDataChange={handleModalInputChange} // For calculated fields from BookingModalForm
                                modalFormErrors={modalFormErrors}
                                isEditMode={isEditMode}
                                submissionError={modalSubmissionError}
                                clearSubmissionError={() => setModalSubmissionError('')}
                            />
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={handleCloseModal} disabled={modalSubmitting}>Cancel</Button>
                        <Button variant="primary" type="submit" className="submit-button-figma" disabled={modalSubmitting}>
                            {modalSubmitting ? <Spinner as="span" size="sm" className="me-1" /> : null}
                            {modalSubmitting ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Booking')}
                        </Button>
                    </Modal.Footer>
                </BootstrapForm>
            </Modal>
        </div>
    );
};

export default BookingPage;