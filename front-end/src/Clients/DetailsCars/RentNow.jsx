// src/pages/Client/BookingPageClient.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, X, CalendarDays, Users, CreditCard, ShieldCheck, PlusCircle,
    AlertCircle, Loader2, ShoppingBag, CheckCircle, Wallet, LogIn ,Tag// Wallet icon is good for cash
} from 'lucide-react';
import {
    fetchPublicVehicleModelById,
   validatePromotionCode,
 createClientBooking,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const DEFAULT_FALLBACK_IMAGE_URL = '/images/Cars/BentlyNobgc.png';
const scrollbarStyles = `
  .booking-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
  .booking-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
  .booking-scrollbar::-webkit-scrollbar-thumb { background: #c7c7c7; border-radius: 10px; }
  .booking-scrollbar::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }
`;

const BookingPageClient = () => {
  // ... (other state variables: vehicleModel, extras, insurance, loading, error, etc. remain the same) ...
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading: authIsLoading } = useAuth();
const [promoCodeInput, setPromoCodeInput] = useState('');
const [appliedPromo, setAppliedPromo] = useState(null); // Will hold the validated promo details
const [promoError, setPromoError] = useState('');
const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [vehicleModel, setVehicleModel] = useState(null);
  const [availableExtras, setAvailableExtras] = useState([]);
  const [availableInsurancePlans, setAvailableInsurancePlans] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedInsuranceId, setSelectedInsuranceId] = useState('');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [renterName, setRenterName] = useState('');
  const [renterEmail, setRenterEmail] = useState('');
  const [renterPhone, setRenterPhone] = useState('');
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [numberOfDays, setNumberOfDays] = useState(0);
  // --- MODIFIED: Default paymentMethod state ---
  const [paymentMethod, setPaymentMethod] = useState('online_card'); // Default to online, user can switch to cash

  // ... (useEffect for pre-filling user info, today, minEndDate, data fetching, calculate days, calculate prices, input handlers, extra handlers, validation remain the same) ...
  // Pre-fill renter info if user is authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setRenterName(currentUser.name || '');
      setRenterEmail(currentUser.email || '');
      setRenterPhone(currentUser.phone_number || currentUser.phone || '');
    } else {
      setRenterName('');
      setRenterEmail('');
      setRenterPhone('');
    }
  }, [currentUser, isAuthenticated]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const minEndDate = useMemo(() => {
    if (!startDate) return today;
    try {
        const start = new Date(startDate);
        return isNaN(start.getTime()) ? today : startDate;
    } catch (e) { return today; }
  }, [startDate, today]);

  useEffect(() => {
    if (vehicleId && isAuthenticated) {
      const loadInitialData = async () => {
        setDataLoading(true); setError(null); setVehicleModel(null);
        setAvailableExtras([]); setAvailableInsurancePlans([]);
        try {
  // We only need to make ONE API call to get all the data for the model.
  const response = await fetchPublicVehicleModelById(vehicleId);
  const modelData = response.data?.data || response.data;

  if (modelData) {
    setVehicleModel(modelData);
    // The data we need is now nested inside the modelData object.
    setAvailableExtras(modelData.extras_available || []);
    setAvailableInsurancePlans(modelData.insurance_plans_associated || []);
  } else {
    throw new Error("Vehicle details could not be loaded.");
  }
} catch (err) {
  setError(err.message || "Failed to load necessary data.");
} finally {
  setDataLoading(false);
}
        
      };
      loadInitialData();
    } else if (!isAuthenticated && !authIsLoading) {
        setDataLoading(false);
    }
  }, [vehicleId, isAuthenticated, authIsLoading]);

  useEffect(() => {
    let newNumberOfDaysValue = 0;
    if (startDate && endDate) {
      try {
        const startDt = new Date(startDate); const endDt = new Date(endDate);
        if (!isNaN(startDt.getTime()) && !isNaN(endDt.getTime()) && endDt >= startDt) {
          const utcStart = Date.UTC(startDt.getFullYear(), startDt.getMonth(), startDt.getDate());
          const utcEnd = Date.UTC(endDt.getFullYear(), endDt.getMonth(), endDt.getDate());
          newNumberOfDaysValue = Math.max(1, Math.ceil((utcEnd - utcStart) / (1000 * 60 * 60 * 24)) + 1);
        }
      } catch (e) { console.error("Error calculating days:", e) }
    }
    if (newNumberOfDaysValue !== numberOfDays) {
      setNumberOfDays(newNumberOfDaysValue);
    }
  }, [startDate, endDate, numberOfDays]);

  const bookingPrices = useMemo(() => {
    if (!vehicleModel || numberOfDays <= 0) {
      return { base: 0, extras: 0, insurance: 0, final: 0 };
    }
    const basePrice = typeof vehicleModel.base_price_per_day === 'number' ? vehicleModel.base_price_per_day : 0;
    const base = basePrice * numberOfDays;
    const insurancePlan = availableInsurancePlans.find(p => String(p.id) === String(selectedInsuranceId));
    const insurancePrice = insurancePlan && typeof insurancePlan.price_per_day === 'number' ? insurancePlan.price_per_day : 0;
    const insurance = insurancePrice * numberOfDays;
    const extrasTotal = selectedExtras.reduce((acc, extra) => {
        const price = typeof extra.price_at_booking === 'number' ? extra.price_at_booking : 0;
        const qty = typeof extra.quantity === 'number' ? extra.quantity : 0;
        return acc + (price * qty);
    }, 0);
   const subtotal = base + insurance + extrasTotal;
    
    // --- THIS IS THE FIX ---
    // Get the discount directly from the appliedPromo state object.
    const discount = appliedPromo?.discount_amount || 0; 
    
    const finalTotal = Math.max(0, subtotal - discount);

    return {
        base: parseFloat(base.toFixed(2)),
        extras: parseFloat(extrasTotal.toFixed(2)),
        insurance: parseFloat(insurance.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        final: parseFloat(finalTotal.toFixed(2))
    };
}, [vehicleModel, numberOfDays, selectedInsuranceId, selectedExtras, availableInsurancePlans, appliedPromo]);
const handlePromoCodeChange = (e) => {
    setPromoCodeInput(e.target.value.toUpperCase());
    setPromoError('');
};

const handleApplyPromoCode = async () => {
    if (!promoCodeInput) {
        setPromoError("Please enter a promotion code.");
        return;
    }
    setIsPromoLoading(true);
    setPromoError('');
 // Inside handleApplyPromoCode...
try {
    
    // Now we pass a single, correct object to the API call.
    // This is now guaranteed to be the request body.
    const response = await validatePromotionCode(promoCodeInput.trim(), {
        booking_subtotal: bookingPrices.subtotal,
        user_id: currentUser?.id || null,
    });
    
    setAppliedPromo(response.data.data);
    // Also update the discount based on the validated response

} catch (err) {
    const message = err.response?.data?.message || "Invalid or inapplicable promotion code.";
    setPromoError(message);
    setAppliedPromo(null);
} finally {
    setIsPromoLoading(false);
}
};

const handleClearPromoCode = () => {
    setPromoCodeInput('');
    setAppliedPromo(null);
    setPromoError('');
};
  const handleInputChange = useCallback((setter) => (e) => {
    setter(e.target.value); if (formError) setFormError('');
  }, [formError]);

  const handleDateChange = useCallback((setter) => (e) => {
    setter(e.target.value);
    setFormError(prevError => {
        const dateErrors = ["Please select pick-up and return dates.", "Return date must be on or after pick-up date.", "Rental period must be at least 1 day."];
        return dateErrors.includes(prevError) ? "" : prevError;
    });
  }, []);

  const handleInsuranceChange = useCallback((e) => {
    setSelectedInsuranceId(e.target.value); if (formError) setFormError('');
  }, [formError]);

  const handleExtraChange = useCallback((extraItem, add) => {
    setSelectedExtras(prev => {
        const existingExtraIndex = prev.findIndex(se => se.id === extraItem.id);
        if (add) {
            if (existingExtraIndex > -1) {
                return prev.map((se, index) => index === existingExtraIndex ? { ...se, quantity: (se.quantity || 0) + 1 } : se );
            } else {
                const priceAtBooking = parseFloat(extraItem.price || extraItem.default_price_per_day || 0);
                return [...prev, { id: extraItem.id, name: extraItem.name, price_at_booking: priceAtBooking, quantity: 1 }];
            }
        } else {
            if (existingExtraIndex > -1) {
                const currentQuantity = prev[existingExtraIndex].quantity;
                if (currentQuantity > 1) {
                    return prev.map((se, index) => index === existingExtraIndex ? { ...se, quantity: currentQuantity - 1 } : se );
                } else {
                    return prev.filter((_, index) => index !== existingExtraIndex);
                }
            }
            return prev;
        }
    });
    if (formError) setFormError('');
  }, [formError]);

  const isExtraSelected = useCallback((extraId) => selectedExtras.some(se => se.id === extraId), [selectedExtras]);
  const getExtraQuantity = useCallback((extraId) => selectedExtras.find(se => se.id === extraId)?.quantity || 0, [selectedExtras]);

  const validateAllFields = useCallback(() => {
    if (!startDate || !endDate) { setFormError("Please select pick-up and return dates."); return false; }
    const startDt = new Date(startDate); const endDt = new Date(endDate);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime()) || endDt < startDt) { setFormError("Return date must be on or after pick-up date."); return false; }
    if (numberOfDays <= 0) { setFormError("Rental period must be at least 1 day."); return false; }
    if (!renterName.trim()) { setFormError("Please enter your full name."); return false; }
    if (!renterEmail.trim() || !/\S+@\S+\.\S+/.test(renterEmail)) { setFormError("Please enter a valid email address."); return false;}
    if (!renterPhone.trim()) { setFormError("Please enter your phone number."); return false;}
    setFormError(''); return true;
  }, [startDate, endDate, numberOfDays, renterName, renterEmail, renterPhone]);


  // --- MODIFIED: handleSubmitAndPay to handle 'cash' payment status ---
  const handleSubmitAndPay = useCallback(async () => {
    if (!isAuthenticated || !currentUser?.id) {
        setFormError("You must be logged in to make a booking. Please log in or create an account.");
        return;
    }
    if (!validateAllFields()) return;
    if (!vehicleModel) { setFormError("Vehicle details are missing."); return; }
    setIsSubmitting(true); setFormError(''); setBookingSuccess(false);

   const finalStartDateISO = new Date(`${startDate}T00:00:00Z`).toISOString();
const finalEndDateISO = new Date(`${endDate}T23:59:59Z`).toISOString();

const bookingPayload = {
  // The backend now gets the user ID from the session, so we don't send it.
  // We send vehicle_model_id instead of vehicle_id.
  vehicle_model_id: vehicleId,
  insurance_plan_id: selectedInsuranceId || null,
  start_date: finalStartDateISO,
  end_date: finalEndDateISO,
    promotion_code_id: appliedPromo?.promotion_code_id || null,
     discount_amount_applied: bookingPrices.discount,

  // These are calculated on the frontend, but the backend will use them.
  // Your controller has defaults, so we don't strictly need them all, but it's good practice.
  calculated_base_price: bookingPrices.base,
  calculated_extras_price: bookingPrices.extras,
  calculated_insurance_price: bookingPrices.insurance,
  final_price: bookingPrices.final,

  booking_extras: selectedExtras.map(ex => ({
    extra_id: ex.id,
    quantity: ex.quantity,
    price_at_booking: ex.price_at_booking
  })),
  
  // This tells the backend how to set the initial status.
  payment_method_preference: paymentMethod,
};

    try {
      console.log("Submitting Booking Payload:", bookingPayload); // Log payload
      const bookingResponse = await createClientBooking(bookingPayload);
      const newBooking = bookingResponse.data.data;
      setCreatedBookingId(newBooking.id);

      if (paymentMethod === 'cash') {
        console.log("Cash payment selected. Booking confirmed (ID:", newBooking.id,"), payment due on pickup.");
        // No further payment processing step on the frontend for cash.
        // Backend should have already set the status appropriately (e.g., 'confirmed', 'pending_pickup_payment').
      } else if (paymentMethod.startsWith('online_')) { // Example 'online_card', 'online_paypal'
        console.log("Mock Online Payment Process: Would initiate online payment for booking ID:", newBooking.id);
        // Simulate online payment gateway interaction
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        console.log("Mock Online Payment Completed for booking:", newBooking.id);
        // Potentially update booking status on backend via another API call if gateway doesn't do it directly
        // e.g., await apiClient.post(`/bookings/${newBooking.id}/payment-success`);
      }
      setBookingSuccess(true);
    } catch (submissionError) {
      console.error('Booking/Payment Submission Error:', submissionError.response?.data || submissionError);
      const apiErrors = submissionError.response?.data?.errors;
      let errorMessage = 'Failed to complete booking.';
      if (apiErrors) {
        errorMessage = `Submission failed: ${Object.values(apiErrors).flat().join(' ')}`;
      } else if (submissionError.response?.data?.message || submissionError.message) {
        errorMessage = submissionError.response.data.message || submissionError.message;
      }
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
      isAuthenticated, currentUser, validateAllFields, vehicleModel, vehicleId, selectedInsuranceId, startDate, endDate,
      bookingPrices, selectedExtras, paymentMethod, navigate, renterName, renterEmail, renterPhone // navigate was in deps, kept it.
  ]);

  const inputBaseClass = "tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-sm focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-blue-500 tw-transition-all tw-text-sm";
  const labelBaseClass = "tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1.5";
  const sectionTitleClass = "tw-text-xl tw-font-semibold tw-text-gray-800 tw-mb-6 tw-flex tw-items-center tw-border-b tw-pb-3 tw-border-gray-200";
  const optionLabelClass = "tw-flex tw-items-start tw-p-4 tw-border tw-rounded-xl hover:tw-border-blue-500 tw-cursor-pointer tw-transition-all tw-duration-200 tw-ease-in-out";
  const selectedOptionClass = "tw-border-blue-600 tw-bg-blue-50 tw-ring-2 tw-ring-blue-400 tw-shadow-lg";
  const unselectedOptionClass = "tw-border-gray-300 hover:tw-shadow-md";

  // --- RENDER LOGIC for loading, error, not authenticated, success (remains largely the same) ---
  if (authIsLoading) { /* ... Auth loading JSX ... */ 
    return (
      <div className="tw-fixed tw-inset-0 tw-bg-black/40 tw-backdrop-blur-md tw-flex tw-items-center tw-justify-center tw-z-[999] tw-p-4">
        <div className="tw-bg-gradient-to-br tw-from-gray-50 tw-to-gray-100 tw-p-10 tw-rounded-xl tw-shadow-2xl tw-flex tw-flex-col tw-items-center">
          <Loader2 size={48} className="tw-animate-spin tw-text-blue-600 tw-mb-4" />
          <p className="tw-text-lg tw-font-semibold tw-text-neutral-700">Checking authentication...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated && !authIsLoading) { /* ... Not authenticated JSX (Login/Signup prompt) ... */ 
    return (
      <div className="tw-fixed tw-inset-0 tw-bg-black/40 tw-backdrop-blur-md tw-flex tw-items-center tw-justify-center tw-z-[999] tw-p-4">
        <div className="tw-bg-gradient-to-br tw-from-gray-50 tw-to-gray-100 tw-p-10 tw-rounded-xl tw-shadow-2xl tw-flex tw-flex-col tw-items-center tw-text-center">
          <LogIn size={64} className="tw-text-blue-600 tw-mb-6" />
          <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-800 tw-mb-3">Login Required</h2>
          <p className="tw-text-gray-600 tw-mb-8">
            Please log in or create an account to proceed with your booking.
          </p>
          <div className="tw-flex tw-space-x-4">
            <Link to="/Login" state={{ from: `/booking/${vehicleId}` }} className="tw-px-6 tw-py-3 tw-bg-blue-600 tw-text-white tw-font-semibold tw-rounded-lg hover:tw-bg-blue-700 tw-transition-colors tw-no-underline">Log In</Link>
            <Link to="/Signup" state={{ from: `/booking/${vehicleId}` }} className="tw-px-6 tw-py-3 tw-bg-gray-200 tw-text-gray-700 tw-font-semibold tw-rounded-lg hover:tw-bg-gray-300 tw-transition-colors tw-no-underline">Sign Up</Link>
          </div>
           <button onClick={() => navigate(-1)} className="tw-mt-8 tw-text-sm tw-text-gray-500 hover:tw-text-gray-700 tw-no-underline tw-bg-transparent tw-border-0">Or go back</button>
        </div>
      </div>
    );
  }
  if (dataLoading) { /* ... Data loading JSX ... */ 
    return (
      <div className="tw-fixed tw-inset-0 tw-bg-black/40 tw-backdrop-blur-md tw-flex tw-items-center tw-justify-center tw-z-[998] tw-p-4">
        <div className="tw-bg-gradient-to-br tw-from-gray-50 tw-to-gray-100 tw-p-10 tw-rounded-xl tw-shadow-2xl tw-flex tw-flex-col tw-items-center">
          <Loader2 size={48} className="tw-animate-spin tw-text-blue-600 tw-mb-4" />
          <p className="tw-text-lg tw-font-semibold tw-text-neutral-700">Loading Booking Options...</p>
        </div>
      </div>
    );
  }
  if (error) { /* ... Error loading data JSX ... */ 
    return (
      <div className="tw-fixed tw-inset-0 tw-bg-black/40 tw-backdrop-blur-md tw-flex tw-items-center tw-justify-center tw-z-[998] tw-p-4">
        <div className="tw-bg-red-50 tw-p-10 tw-rounded-xl tw-shadow-2xl tw-flex tw-flex-col tw-items-center tw-text-red-700">
          <AlertCircle size={48} className="tw-text-red-500 tw-mb-4" />
          <p className="tw-text-lg tw-font-semibold tw-mb-2">Error</p>
          <p className="tw-text-sm tw-text-center tw-mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="tw-bg-red-600 hover:tw-bg-red-700 tw-text-white tw-font-semibold tw-py-2 tw-px-6 tw-rounded-lg">Go Back</button>
        </div>
      </div>
    );
  }
  if (!vehicleModel && !dataLoading) { /* ... No vehicle model JSX ... */ 
    return (
        <div className="tw-fixed tw-inset-0 tw-bg-black/40 tw-backdrop-blur-md tw-flex tw-items-center tw-justify-center tw-z-[998] tw-p-4">
          <div className="tw-bg-yellow-50 tw-p-10 tw-rounded-xl tw-shadow-2xl tw-flex tw-flex-col tw-items-center tw-text-yellow-700">
             <AlertCircle size={48} className="tw-text-yellow-500 tw-mb-4" />
            <p className="tw-text-lg tw-font-semibold">Vehicle not found.</p>
            <p className="tw-text-sm tw-text-center tw-mb-6">The vehicle details could not be loaded. It might be unavailable.</p>
            <button onClick={() => navigate('/fleet')} className="tw-mt-4 tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-font-semibold tw-py-2 tw-px-6 tw-rounded-lg">Back to Fleet</button>
          </div>
        </div>
      );
  }

  // --- MODIFIED: Booking Success Screen to better reflect cash payment ---
  if (bookingSuccess) { 
    return (
        <div className="tw-fixed tw-inset-0 tw-bg-black/40 tw-backdrop-blur-md tw-flex tw-items-center tw-justify-center tw-z-[998] tw-p-4">
            <div className="tw-bg-gradient-to-br tw-from-gray-50 tw-to-gray-100 tw-p-10 tw-rounded-xl tw-shadow-2xl tw-flex tw-flex-col tw-items-center tw-text-center">
                <CheckCircle size={64} className="tw-text-green-500 tw-mb-6" />
                <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-800 tw-mb-3">Booking Confirmed!</h2>
                <p className="tw-text-gray-600 tw-mb-6">
                    Your booking for the {vehicleModel?.title} from {new Date(startDate + 'T00:00:00Z').toLocaleDateString()} to {new Date(endDate + 'T00:00:00Z').toLocaleDateString()} has been successfully processed.
                    {paymentMethod === 'cash' 
                        ? " You have selected to pay with cash. Payment will be due upon vehicle pickup." 
                        : " A confirmation email has been sent."}
                    <br/>
                    Booking ID: <span className="tw-font-semibold">{createdBookingId}</span>
                </p>
                <button onClick={() => navigate('/my-bookings')} className="tw-px-6 tw-py-3 tw-bg-blue-600 tw-text-white tw-font-semibold tw-rounded-lg hover:tw-bg-blue-700 tw-transition-colors"> View My Bookings </button>
            </div>
        </div>
    );
  }

  // Main Booking Form for Authenticated Users
  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black/40 tw-backdrop-blur-md tw-flex tw-items-center tw-justify-center tw-z-[998] tw-p-2 sm:tw-p-4 tw-font-sans">
      <style>{scrollbarStyles}</style>
      <div className="tw-bg-gradient-to-br tw-from-gray-50 tw-to-gray-100 tw-text-neutral-800 tw-rounded-xl sm:tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-4xl xl:tw-max-w-5xl tw-max-h-[95vh] tw-flex tw-flex-col tw-relative">
        <div className="tw-flex tw-items-center tw-justify-between tw-p-4 sm:tw-p-5 tw-border-b tw-border-gray-200 tw-sticky tw-top-0 tw-bg-white/90 tw-backdrop-blur-sm tw-z-10 tw-rounded-t-xl sm:tw-rounded-t-2xl">
          <button onClick={() => navigate(vehicleModel ? `/fleet/details/${vehicleId}` : '/fleet')} className="tw-flex tw-items-center tw-text-blue-600 hover:tw-text-blue-700 tw-transition-colors group tw-text-sm tw-font-medium"><ArrowLeft size={18} className="tw-mr-1.5 tw-transform group-hover:tw--translate-x-0.5 tw-transition-transform" />Back</button>
          <h1 className="tw-text-lg sm:tw-text-xl tw-font-semibold tw-text-gray-800">Complete Your Booking</h1>
          <button onClick={() => navigate(vehicleModel ? `/fleet/details/${vehicleId}` : '/fleet')} className="tw-text-gray-500 hover:tw-text-red-600 tw-transition-colors"><X size={22} /></button>
        </div>

        <div className="tw-flex-grow tw-overflow-y-auto booking-scrollbar tw-p-4 sm:tw-p-6 md:tw-p-8">
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-6 md:tw-gap-8">
            <div className="lg:tw-col-span-5 lg:tw-sticky lg:tw-top-[calc(4rem+1.5rem)] tw-self-start"> {/* Vehicle Summary Panel */}
              <div className="tw-bg-white tw-p-4 tw-rounded-xl tw-shadow-lg tw-border tw-border-gray-200">
                <img src={vehicleModel?.thumbnail_url || vehicleModel?.main_image_url || vehicleModel?.all_media?.[0]?.url || DEFAULT_FALLBACK_IMAGE_URL} alt={vehicleModel?.title || "Vehicle"} className="tw-w-full tw-rounded-lg tw-shadow-md tw-object-cover tw-aspect-[16/10] tw-mb-4" onError={(e) => {e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL;}} />
                <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800">{vehicleModel?.title || "Loading..."}</h2>
                <p className="tw-text-md tw-text-gray-600">{vehicleModel?.vehicle_type?.name || vehicleModel?.vehicle_type_name || "..."}</p>
                <p className="tw-text-xl tw-font-semibold tw-text-blue-600 tw-mt-1">${(typeof vehicleModel?.base_price_per_day === 'number' ? vehicleModel.base_price_per_day : 0).toFixed(2)}<span className="tw-text-xs tw-text-gray-500">/day</span></p>
                <div className="tw-mt-6 tw-border-t tw-border-gray-200 tw-pt-4">
                  <h3 className="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-3">Booking Summary</h3>
                  <div className="tw-space-y-1.5 tw-text-sm tw-text-gray-600">
                    <div className="tw-flex tw-justify-between"><span>Base ({numberOfDays > 0 ? `${numberOfDays} day${numberOfDays !== 1 ? 's' : ''}` : `_ day(s)`})</span> <span className="tw-font-medium">${bookingPrices.base.toFixed(2)}</span></div>
                    <div className="tw-flex tw-justify-between"><span>Extras:</span> <span className="tw-font-medium">${bookingPrices.extras.toFixed(2)}</span></div>
                    <div className="tw-flex tw-justify-between"><span>Insurance:</span> <span className="tw-font-medium">${bookingPrices.insurance.toFixed(2)}</span></div>
                     {bookingPrices.discount > 0 && (
        <div className="tw-flex tw-justify-between tw-text-green-600">
            <span>Discount ({appliedPromo?.code_string}):</span>
            <span className="tw-font-medium">-${bookingPrices.discount.toFixed(2)}</span>
        </div>
    )}
                    <div className="tw-flex tw-justify-between tw-font-bold tw-text-gray-800 tw-text-lg tw-pt-2 tw-mt-2 tw-border-t"><span>Estimated Total:</span><span>${bookingPrices.final.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:tw-col-span-7"> {/* Form Sections Panel */}
              {formError && (<div className="tw-mb-6 tw-p-3 tw-bg-red-100 tw-border tw-border-red-300 tw-text-red-700 tw-rounded-lg tw-flex tw-items-center tw-shadow-sm"><AlertCircle size={20} className="tw-mr-2 tw-flex-shrink-0" /> {formError}</div>)}
              <div className="tw-space-y-8">
                <section> {/* Rental Period */}
                  <h2 className={sectionTitleClass}><CalendarDays size={24} className="tw-mr-3 tw-text-blue-600" /> Rental Period</h2>
                  <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-x-4 tw-gap-y-5">
                    <div> <label htmlFor="startDate" className={labelBaseClass}>Pick-up Date</label> <input type="date" id="startDate" name="startDate" value={startDate} min={today} onChange={handleDateChange(setStartDate)} className={inputBaseClass} required /> </div>
                    <div> <label htmlFor="endDate" className={labelBaseClass}>Return Date</label> <input type="date" id="endDate" name="endDate" value={endDate} min={minEndDate} onChange={handleDateChange(setEndDate)} disabled={!startDate} className={`${inputBaseClass} ${!startDate ? 'disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed' : ''}`} required /> </div>
                  </div>
                  {numberOfDays > 0 && (<p className="tw-text-sm tw-text-gray-700 tw-mt-3">Duration: <span className="tw-font-semibold">{numberOfDays} day{numberOfDays !== 1 ? 's' : ''}</span></p>)}
                </section>
                <section> {/* Your Information */}
                  <h2 className={sectionTitleClass}><Users size={24} className="tw-mr-3 tw-text-blue-600" /> Your Information</h2>
                  <div className="tw-space-y-5">
                    <div> <label htmlFor="renterName" className={labelBaseClass}>Full Name</label> <input type="text" id="renterName" value={renterName} onChange={handleInputChange(setRenterName)} className={inputBaseClass} required placeholder="e.g., John Doe" disabled={isAuthenticated && !!currentUser?.name} /> </div>
                    <div> <label htmlFor="renterEmail" className={labelBaseClass}>Email Address</label> <input type="email" id="renterEmail" value={renterEmail} onChange={handleInputChange(setRenterEmail)} className={inputBaseClass} required placeholder="e.g., john.doe@example.com" disabled={isAuthenticated && !!currentUser?.email} /> </div>
                    <div> <label htmlFor="renterPhone" className={labelBaseClass}>Phone Number</label> <input type="tel" id="renterPhone" value={renterPhone} onChange={handleInputChange(setRenterPhone)} className={inputBaseClass} required placeholder="e.g., (555) 123-4567" disabled={isAuthenticated && !!(currentUser?.phone_number || currentUser?.phone)} /> </div>
                  </div>
                </section>
                {availableInsurancePlans.length > 0 && (<section> {/* Insurance */}
                    <h2 className={sectionTitleClass}><ShieldCheck size={24} className="tw-mr-3 tw-text-blue-600" /> Add Insurance (Optional)</h2>
                    <div className="tw-space-y-4">
                        {availableInsurancePlans.map(plan => (<label key={plan.id} htmlFor={`insurance_${plan.id}`} className={`${optionLabelClass} ${String(selectedInsuranceId) === String(plan.id) ? selectedOptionClass : unselectedOptionClass}`}><input type="radio" id={`insurance_${plan.id}`} name="insurancePlan" value={plan.id} checked={String(selectedInsuranceId) === String(plan.id)} onChange={handleInsuranceChange} className="tw-h-5 tw-w-5 tw-text-blue-600 tw-border-gray-300 focus:tw-ring-blue-500 tw-mt-1 tw-mr-3 tw-flex-shrink-0" /><div><span className="tw-font-semibold tw-text-gray-800">{plan.name}</span><span className="tw-text-sm tw-text-gray-600 tw-ml-1">(+${(typeof plan.price_per_day === 'number' ? plan.price_per_day : 0).toFixed(2)}/day)</span>{plan.description && <p className="tw-text-xs tw-text-gray-500 tw-mt-0.5">{plan.description}</p>}</div></label>))}
                        <label htmlFor="insurance_none" className={`${optionLabelClass} ${!selectedInsuranceId ? selectedOptionClass : unselectedOptionClass}`}><input type="radio" id="insurance_none" name="insurancePlan" value="" checked={!selectedInsuranceId} onChange={handleInsuranceChange} className="tw-h-5 tw-w-5 tw-text-blue-600 tw-border-gray-300 focus:tw-ring-blue-500 tw-mt-1 tw-mr-3 tw-flex-shrink-0" /><span className="tw-font-semibold tw-text-gray-800">No Insurance Selected</span></label>
                    </div>
                </section>)}
                {availableExtras.length > 0 && (<section> {/* Optional Extras */}
                    <h2 className={sectionTitleClass}><ShoppingBag size={24} className="tw-mr-3 tw-text-blue-600" /> Optional Extras</h2>
                    <div className="tw-space-y-4">
                        {availableExtras.map((extraItem) => (<div key={extraItem.id} className={`${optionLabelClass} ${isExtraSelected(extraItem.id) ? selectedOptionClass : unselectedOptionClass} tw-justify-between tw-items-center`}><div><span className="tw-font-semibold tw-text-gray-800">{extraItem.name}</span><span className="tw-text-sm tw-text-gray-600 tw-ml-1">(+${(typeof extraItem.price === 'number' ? extraItem.price : (typeof extraItem.default_price_per_day === 'number' ? extraItem.default_price_per_day : 0)).toFixed(2)})</span>{extraItem.description && <p className="tw-text-xs tw-text-gray-500 tw-mt-0.5">{extraItem.description}</p>}</div><div className="tw-flex tw-items-center tw-space-x-2">{isExtraSelected(extraItem.id) && (<button type="button" onClick={() => handleExtraChange(extraItem, false)} className="tw-p-1.5 tw-text-red-500 hover:tw-text-red-700 tw-bg-red-100 hover:tw-bg-red-200 tw-rounded-full tw-transition-colors"> <X size={16}/> </button> )}<button type="button" onClick={() => handleExtraChange(extraItem, true)} className={`tw-p-1.5 tw-rounded-full tw-transition-colors ${isExtraSelected(extraItem.id) ? 'tw-bg-blue-500 tw-text-white hover:tw-bg-blue-600' : 'tw-bg-gray-200 tw-text-gray-700 hover:tw-bg-gray-300'}`}> <PlusCircle size={18}/> </button>{isExtraSelected(extraItem.id) && <span className="tw-text-sm tw-w-6 tw-text-center tw-font-medium">{getExtraQuantity(extraItem.id)}</span>}</div></div>))}
                    </div>
                </section>)}
                <section>
    <h2 className={sectionTitleClass}>
        <Tag size={24} className="tw-mr-3 tw-text-blue-600" /> Promotion Code
    </h2>
    <div className="tw-bg-white tw-p-4 sm:tw-p-5 tw-rounded-xl tw-border tw-border-gray-200 tw-shadow-sm">
        {!appliedPromo ? (
            <div className="tw-flex tw-items-start tw-gap-2">
                <div className="tw-flex-grow">
                    <label htmlFor="promoCode" className="tw-sr-only">Promotion Code</label>
                    <input
                        type="text"
                        id="promoCode"
                        value={promoCodeInput}
                        onChange={handlePromoCodeChange}
                        placeholder="Enter code here"
                        className={`${inputBaseClass} tw-uppercase`}
                        disabled={isPromoLoading}
                    />
                </div>
                <button
                    onClick={handleApplyPromoCode}
                    disabled={isPromoLoading || !promoCodeInput}
                    className="tw-flex-shrink-0 tw-px-4 tw-py-3 tw-bg-gray-700 tw-text-white tw-font-semibold tw-rounded-lg hover:tw-bg-gray-800 disabled:tw-bg-gray-400 tw-transition-colors tw-flex tw-items-center"
                >
                    {isPromoLoading ? <Loader2 size={18} className="tw-animate-spin" /> : 'Apply'}
                </button>
            </div>
        ) : (
            <div className="tw-p-3 tw-bg-green-50 tw-border tw-border-green-300 tw-rounded-lg tw-flex tw-items-center tw-justify-between">
                <div>
                    <p className="tw-font-semibold tw-text-green-800">
                        <CheckCircle size={16} className="tw-inline tw-mr-2" /> Code Applied: {appliedPromo.code_string}
                    </p>
                    <p className="tw-text-sm tw-text-green-700 tw-pl-7">
                        You saved ${bookingPrices.discount.toFixed(2)}!
                    </p>
                </div>
                <button onClick={handleClearPromoCode} className="tw-p-1.5 tw-rounded-full tw-text-red-500 hover:tw-bg-red-100 tw-transition-colors">
                    <X size={18} />
                </button>
            </div>
        )}
        {promoError && (
            <p className="tw-text-xs tw-text-red-600 tw-mt-2">{promoError}</p>
        )}
    </div>
</section>
                {/* --- MODIFIED: Payment Details Section with "Pay with Cash" option --- */}
                <section>
                    <h2 className={sectionTitleClass}>
                        {paymentMethod === 'cash' ? <Wallet size={24} className="tw-mr-3 tw-text-blue-600" /> : <CreditCard size={24} className="tw-mr-3 tw-text-blue-600" /> }
                        Payment Details
                    </h2>
                    <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-space-y-4 tw-border tw-border-gray-200 tw-shadow-sm">
                        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-2">Select Payment Method</h3>
                        <div>
                            <label className={`${optionLabelClass} ${paymentMethod === 'online_card' ? selectedOptionClass : unselectedOptionClass} tw-mb-3`}>
                                <input type="radio" name="paymentMethod" value="online_card" checked={paymentMethod === 'online_card'} onChange={(e) => setPaymentMethod(e.target.value)} className="tw-h-5 tw-w-5 tw-text-blue-600 tw-border-gray-300 focus:tw-ring-blue-500 tw-mt-1 tw-mr-3"/>
                                <div className="tw-flex tw-items-center"> <CreditCard size={20} className="tw-mr-2 tw-text-gray-600" /> <span>Pay Online (Credit/Debit Card)</span> </div>
                            </label>
                            <label className={`${optionLabelClass} ${paymentMethod === 'cash' ? selectedOptionClass : unselectedOptionClass}`}>
                                <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="tw-h-5 tw-w-5 tw-text-blue-600 tw-border-gray-300 focus:tw-ring-blue-500 tw-mt-1 tw-mr-3"/>
                                <div className="tw-flex tw-items-center"> <Wallet size={20} className="tw-mr-2 tw-text-gray-600" /> <span>Pay with Cash (at Pickup)</span> </div>
                            </label>
                        </div>
                        <div className="tw-pt-4 tw-border-t tw-border-gray-200 tw-mt-4">
                            <p className="tw-text-gray-600">You will be charged: <span className="tw-font-bold tw-text-lg tw-text-blue-700">${bookingPrices.final.toFixed(2)}</span></p>
                            {paymentMethod.startsWith('online_') && ( <p className="tw-text-xs tw-text-gray-500 tw-mt-1"> Click "Confirm & Proceed to Payment" to continue to our secure payment gateway. </p> )}
                            {paymentMethod === 'cash' && ( <p className="tw-text-xs tw-text-gray-500 tw-mt-1"> Click "Confirm Booking" to reserve your vehicle. Payment will be due upon pickup. </p> )}
                        </div>
                    </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div className="tw-p-4 sm:tw-p-5 tw-border-t tw-border-gray-200 tw-sticky tw-bottom-0 tw-bg-white/90 tw-backdrop-blur-sm tw-z-10 tw-rounded-b-xl sm:tw-rounded-b-2xl">
          <div className="tw-flex tw-justify-end tw-items-center">
            {/* --- MODIFIED: Submit button text now reflects payment method --- */}
            <button
                type="button"
                onClick={handleSubmitAndPay}
                disabled={!vehicleModel || dataLoading || isSubmitting || !startDate || !endDate || numberOfDays <= 0 || !renterName || !renterEmail || !renterPhone}
                className="tw-px-6 tw-py-3 tw-bg-green-600 tw-border tw-border-transparent tw-text-base tw-font-medium tw-rounded-lg tw-shadow-sm tw-text-white hover:tw-bg-green-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-green-500 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed tw-flex tw-items-center tw-justify-center tw-min-w-[220px]">
                {isSubmitting ? <Loader2 size={20} className="tw-animate-spin tw-mr-2"/> : null}
                {isSubmitting ? 'Processing...' : (paymentMethod === 'cash' ? 'Confirm Booking (Pay at Pickup)' : 'Confirm & Proceed to Payment')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPageClient;