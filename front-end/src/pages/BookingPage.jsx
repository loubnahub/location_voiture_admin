// src/pages/Bookings/BookingPage.jsx

import React, { useState, useCallback } from 'react';
import ResourcePage from '../components/ResourcePage';
import BookingModalForm from '../components/bookings/BookingModalForm';
import BookingDetailModal from '../components/bookings/BookingDetailModal';
import {
  fetchAllBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  confirmBookingApi,
  completeBookingApi
} from '../services/api';
import { BookingStatus as BookingStatusEnum } from '../Enums';
import { LuFileText, LuCheck, LuEye } from 'react-icons/lu';
import { CheckCircle } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- Columns for the DynamicTable ---
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
                case BookingStatusEnum.CANCELLED_BY_RENTER: case BookingStatusEnum.CANCELLED_BY_ADMIN: case BookingStatusEnum.CANCELLED_BY_USER: badgeBg = 'danger'; break;
                case BookingStatusEnum.NO_SHOW: badgeBg = 'dark'; break;
                default: badgeBg = 'light'; break;
            }
            const textClass = ['light', 'warning', 'info'].includes(badgeBg) ? 'text-dark' : 'text-white';
            return item.status_display ? <span className={`badge bg-${badgeBg} ${textClass}`}>{item.status_display}</span> : <span className="text-muted-custom">N/A</span>;
        }
    },
    { header: 'Total Price', key: 'final_price', textAlign: 'right', render: (item) => item.final_price != null ? `${parseFloat(item.final_price).toFixed(2)} MAD` : <span className="text-muted-custom">N/A</span> },
];

// --- Initial state for the booking form ---
const initialBookingData = {
    id: null, renter_user_id: '', vehicle_id: '', insurance_plan_id: '',
    promotion_code_id: '', promotion_code_string: '', start_date: '', end_date: '',
    status: BookingStatusEnum?.PENDING_CONFIRMATION || 'pending_confirmation',
    booking_extras: [], calculated_base_price: '0.00', calculated_extras_price: '0.00',
    calculated_insurance_price: '0.00', discount_amount_applied: '0.00', final_price: '0.00',
};

const BookingPage = () => {
  // State and handlers for the Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleShowDetailModal = (item) => {
    setSelectedBooking(item);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  // Logic to process form data before sending to the API
  const processBookingDataForAPI = useCallback((data) => {
    const processed = { ...data };
    ['calculated_base_price', 'calculated_extras_price', 'calculated_insurance_price', 'discount_amount_applied', 'final_price'].forEach(key => {
        processed[key] = (processed[key] === '' || isNaN(parseFloat(processed[key]))) ? 0.00 : parseFloat(processed[key]);
    });
    ['insurance_plan_id', 'promotion_code_id'].forEach(key => {
        if (processed[key] === '') processed[key] = null;
    });
    if (Array.isArray(processed.booking_extras)) {
        processed.booking_extras = processed.booking_extras.map(extra => ({
            extra_id: String(extra.extra_id || extra.id),
            quantity: parseInt(extra.quantity, 10) || 1,
            price_at_booking: parseFloat(extra.price_at_booking || 0).toFixed(2)
        }));
    } else {
        processed.booking_extras = [];
    }
    // Remove the temporary discount_percentage field if it exists
    delete processed.discount_percentage;
    return processed;
  }, []);

  // A function that tells ResourcePage how to render the form inside its modal
  const renderModalFormWithLogic = useCallback((formData, handleInputChange, modalFormErrors, isEditMode, setCurrentItemData) => (
    <BookingModalForm
      key={isEditMode && formData.id ? formData.id : 'new-booking-form'}
      formData={formData}
      handleInputChange={handleInputChange}
      onFormDataChange={handleInputChange}
      modalFormErrors={modalFormErrors}
      isEditMode={isEditMode}
      // Submission error is handled by ResourcePage
      clearSubmissionError={() => {}} 
    />
  ), []);

  // Configuration for ALL custom table action buttons
  const tableActionsConfig = useCallback((reloadData) => [
    {
      icon: <LuEye size={18} />,
      handler: handleShowDetailModal,
      title: "View Details",
      className: "text-info",
    },
    {
      icon: <LuCheck size={18} />,
      handler: async (item) => {
        await confirmBookingApi(item.id);
        if (reloadData) reloadData();
      },
      title: "Confirm Booking",
      className: "text-success",
      shouldShow: (item) => item.status === BookingStatusEnum.PENDING_CONFIRMATION,
    },
    {
      icon: <CheckCircle size={18} />,
      handler: async (item) => {
        await completeBookingApi(item.id);
        if (reloadData) reloadData();
      },
      title: "Complete Booking",
      className: "text-primary",
      shouldShow: (item) => item.status === BookingStatusEnum.ACTIVE,
    },
  ], []);

  // --- Final Render using ResourcePage ---
  return (
    <>
      <ResourcePage
        resourceName="Booking"
        resourceNamePlural="Bookings"
        IconComponent={LuFileText}
        columns={bookingColumns}
        initialFormData={initialBookingData}
        searchPlaceholder="Search by Renter, Vehicle, ID..."
        
        // Let ResourcePage handle pagination by fetching all items
        fetchAllItems={() => fetchAllBookings({ all: true })}
        createItem={(data) => createBooking(processBookingDataForAPI(data))}
        updateItem={(id, data) => updateBooking(id, processBookingDataForAPI(data))}
        deleteItem={deleteBooking}

        // Pass the form renderer and the custom actions config
        renderModalForm={renderModalFormWithLogic}
        tableActionsConfig={tableActionsConfig}
      />
      
      {/* The Detail Modal is managed here, in the page component */}
      <BookingDetailModal
        show={showDetailModal}
        onHide={handleCloseDetailModal}
        booking={selectedBooking}
      />
    </>
  );
};

export default BookingPage;