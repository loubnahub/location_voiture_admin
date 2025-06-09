// src/pages/BookingPageClient.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, X, CalendarDays, Users, CreditCard, ShieldCheck, PlusCircle, 
    AlertCircle, Loader2, ShoppingBag, CheckCircle 
} from 'lucide-react';
import { 
    fetchVehicleModelById, 
    fetchAllExtras, 
    fetchAllInsurancePlans, 
    createBooking,
    createPayment // Assuming you have this API function
} from '../../services/api'; // ADJUST PATH AS NEEDED

const DEFAULT_FALLBACK_IMAGE_URL = '/images/Cars/BentlyNobgc.png'; // Your placeholder
const scrollbarStyles = `
  .booking-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
  .booking-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
  .booking-scrollbar::-webkit-scrollbar-thumb { background: #c7c7c7; border-radius: 10px; }
  .booking-scrollbar::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }
`;

// const RENTAL_TYPE_DAILY = 'daily'; // Uncomment if using rentalType toggle
// const RENTAL_TYPE_HOURLY = 'hourly';

const BookingPageClient = () => {
  const { vehicleId } = useParams(); // This is vehicle_model_id from the URL
  const navigate = useNavigate();
  // const { user } = useAuth(); // For actual renter_user_id

  // Data States
  const [vehicleModel, setVehicleModel] = useState(null);
  const [availableExtras, setAvailableExtras] = useState([]);
  const [availableInsurancePlans, setAvailableInsurancePlans] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Form Input States
  // const [rentalType, setRentalType] = useState(RENTAL_TYPE_DAILY); 
  const [startDate, setStartDate] = useState('');
  // const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  // const [endTime, setEndTime] = useState('17:00');
  const [selectedInsuranceId, setSelectedInsuranceId] = useState('');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [renterName, setRenterName] = useState('');
  const [renterEmail, setRenterEmail] = useState('');
  const [renterPhone, setRenterPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [createdBookingId, setCreatedBookingId] = useState(null);

  // Derived State
  const [numberOfDays, setNumberOfDays] = useState(0);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const minEndDate = useMemo(() => {
    if (!startDate) return today;
    try {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) return today;
        // For daily rental, end date can be the same as start date for a 1-day rental
        return startDate; 
    } catch (e) { return today; }
  }, [startDate, today]);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (vehicleId) {
      const loadInitialData = async () => {
        setLoading(true); setError(null); setVehicleModel(null); 
        setAvailableExtras([]); setAvailableInsurancePlans([]);
        try {
          const [vehicleRes, extrasRes, insuranceRes] = await Promise.all([
            fetchVehicleModelById(vehicleId), 
            fetchAllExtras({all: true}), 
            fetchAllInsurancePlans({all: true})
          ]);
          if (vehicleRes.data?.data) setVehicleModel(vehicleRes.data.data);
          else throw new Error("Vehicle details could not be loaded.");
          setAvailableExtras(Array.isArray(extrasRes.data?.data) ? extrasRes.data.data : (Array.isArray(extrasRes.data) ? extrasRes.data : []));
          setAvailableInsurancePlans(Array.isArray(insuranceRes.data?.data) ? insuranceRes.data.data : (Array.isArray(insuranceRes.data) ? insuranceRes.data : []));
        } catch (err) { setError(err.message || "Failed to load necessary data.");
        } finally { setLoading(false); }
      };
      loadInitialData();
    }
  }, [vehicleId]);

  // --- CALCULATE NUMBER OF DAYS ---
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


  // --- CALCULATE PRICES (using useMemo) ---
  const bookingPrices = useMemo(() => {
    if (!vehicleModel || numberOfDays <= 0) {
      return { base: 0, extras: 0, insurance: 0, final: 0 };
    }
    const base = (vehicleModel.base_price_per_day || 0) * numberOfDays;
    const insurancePlan = availableInsurancePlans.find(p => p.id === selectedInsuranceId);
    const insurance = insurancePlan ? (insurancePlan.price_per_day || 0) * numberOfDays : 0;
    const extras = selectedExtras.reduce((acc, extra) => acc + (extra.price_at_booking * extra.quantity), 0);
    const finalTotal = base + insurance + extras;
    return { 
        base: parseFloat(base.toFixed(2)), 
        extras: parseFloat(extras.toFixed(2)), 
        insurance: parseFloat(insurance.toFixed(2)), 
        final: parseFloat(Math.max(0, finalTotal).toFixed(2))
    };
  }, [vehicleModel, numberOfDays, selectedInsuranceId, selectedExtras, availableInsurancePlans]);


  // --- INPUT HANDLERS ---
  const handleInputChange = useCallback((setter) => (e) => {
    setter(e.target.value); if (formError) setFormError('');
  }, [formError]); // formError dependency ensures a new handler if formError changes, which is fine

  const handleDateChange = useCallback((setter) => (e) => {
    setter(e.target.value); 
    setFormError(prevError => { // Clear only specific date errors
        const dateErrors = ["Please select pick-up and return dates.", "Return date must be on or after pick-up date.", "Rental period must be at least 1 day."];
        return dateErrors.includes(prevError) ? "" : prevError;
    });
  }, []); // No need for formError in deps here, error clearing is based on action

  const handleInsuranceChange = useCallback((e) => {
    setSelectedInsuranceId(e.target.value); if (formError) setFormError('');
  }, [formError]);

  const handleExtraChange = useCallback((extraItem, add) => { 
    setSelectedExtras(prev => { 
        const existingExtraIndex = prev.findIndex(se => se.id === extraItem.id);
        if (add) {
            if (existingExtraIndex > -1) { return prev.map((se, index) => index === existingExtraIndex ? { ...se, quantity: (se.quantity || 0) + 1 } : se ); } 
            else { const priceAtBooking = parseFloat(extraItem.default_price_per_day || 0); return [...prev, { id: extraItem.id, name: extraItem.name, price_at_booking: priceAtBooking, quantity: 1 }]; }
        } else { 
            if (existingExtraIndex > -1) {
            const currentQuantity = prev[existingExtraIndex].quantity;
            if (currentQuantity > 1) { return prev.map((se, index) => index === existingExtraIndex ? { ...se, quantity: currentQuantity - 1 } : se ); } 
            else { return prev.filter((_, index) => index !== existingExtraIndex); }
            } return prev;
        }
    });
    if (formError) setFormError('');
  }, [formError]); 
  const isExtraSelected = useCallback((extraId) => selectedExtras.some(se => se.id === extraId), [selectedExtras]);
  const getExtraQuantity = useCallback((extraId) => selectedExtras.find(se => se.id === extraId)?.quantity || 0, [selectedExtras]);

  // --- VALIDATION ---
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

  // --- SUBMIT BOOKING & PAYMENT ---
  const handleSubmitAndPay = useCallback(async () => { 
    if (!validateAllFields()) return;
    if (!vehicleModel) { setFormError("Vehicle details are missing."); return; }
    setIsSubmitting(true); setFormError(''); setBookingSuccess(false);
    
    // CRITICAL TODO: Replace with actual logged-in user ID
    const RENTER_USER_ID_PLACEHOLDER = '023e6b1d-d952-45b8-a774-d6d7d314c321'; 
    // CRITICAL TODO: This `vehicleId` is a MODEL ID from useParams.
    // Your backend `bookings.vehicle_id` likely expects an INSTANCE ID.
    // This needs resolution (e.g., fetch available instances of this model for dates, let user pick, or backend handles it).
    // For this example, we pass the model ID, assuming backend might be adapted or this will be changed.
    const actualVehicleIdForBooking = vehicleId; 

    const finalStartDateISO = new Date(`${startDate}T00:00:00`).toISOString(); // Assuming daily
    const finalEndDateISO = new Date(`${endDate}T23:59:59`).toISOString();   // Assuming daily

    const bookingPayload = {
      renter_user_id: RENTER_USER_ID_PLACEHOLDER, 
      vehicle_id: actualVehicleIdForBooking, 
      insurance_plan_id: selectedInsuranceId || null,
      start_date: finalStartDateISO, 
      end_date: finalEndDateISO,
      calculated_base_price: bookingPrices.base, 
      calculated_extras_price: bookingPrices.extras,
      calculated_insurance_price: bookingPrices.insurance, 
      final_price: bookingPrices.final,
      booking_extras: selectedExtras.map(ex => ({ 
        extra_id: ex.id, 
        quantity: ex.quantity, 
        price_at_booking: ex.price_at_booking 
      })),
    };
    try {
      const bookingResponse = await createBooking(bookingPayload);
      const newBooking = bookingResponse.data.data; 
      setCreatedBookingId(newBooking.id);
      
      const paymentPayload = { 
        booking_id: newBooking.id, 
        amount: newBooking.final_price, 
        method: paymentMethod, 
        status: 'succeeded', // Mocked: Real status comes from payment gateway
      };
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate payment processing
      
      // UNCOMMENT if you have createPayment API function implemented
      // const paymentResponse = await createPayment(paymentPayload);
      // console.log("Payment Record Created:", paymentResponse.data);
      console.log("Mock Payment Processed for booking:", newBooking.id);

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
      validateAllFields, vehicleModel, vehicleId, selectedInsuranceId, startDate, endDate, 
      bookingPrices, selectedExtras, paymentMethod, navigate, renterName, renterEmail, renterPhone
  ]);

  // --- UI STYLES (Constants for Tailwind classes) ---
  const inputBaseClass = "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm";
  const labelBaseClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const sectionTitleClass = "text-xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3 border-gray-200";
  const optionLabelClass = "flex items-start p-4 border rounded-xl hover:border-blue-500 cursor-pointer transition-all duration-200 ease-in-out";
  const selectedOptionClass = "border-blue-600 bg-blue-50 ring-2 ring-blue-400 shadow-lg";
  const unselectedOptionClass = "border-gray-300 hover:shadow-md";

  // --- RENDER LOGIC ---
  if (loading) { 
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[998] p-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-xl shadow-2xl flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
          <p className="text-lg font-semibold text-neutral-700">Loading Booking Options...</p>
        </div>
      </div>
    );
  }
  if (error) { 
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[998] p-4">
        <div className="bg-red-50 p-10 rounded-xl shadow-2xl flex flex-col items-center text-red-700">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <p className="text-lg font-semibold mb-2">Error</p>
          <p className="text-sm text-center mb-6">{error}</p>
          <button onClick={() => navigate('/fleet')} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg">Back to Fleet</button>
        </div>
      </div>
    );
  }
  if (!vehicleModel && !loading) { 
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[998] p-4">
          <div className="bg-red-50 p-10 rounded-xl shadow-2xl flex flex-col items-center text-red-700">
             <AlertCircle size={48} className="text-red-500 mb-4" />
            <p className="text-lg font-semibold text-neutral-700">Vehicle not found or error loading details.</p>
            <button onClick={() => navigate('/fleet')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">Back to Fleet</button>
          </div>
        </div>
      );
  }
  if (bookingSuccess) { 
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[998] p-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-xl shadow-2xl flex flex-col items-center text-center">
                <CheckCircle size={64} className="text-green-500 mb-6" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                    Your booking for the {vehicleModel?.title} from {startDate} to {endDate} has been successfully processed.
                    A confirmation email has been sent to {renterEmail}. Booking ID: {createdBookingId}
                </p>
                <button onClick={() => navigate('/my-bookings')} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"> View My Bookings </button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[998] p-2 sm:p-4 font-sans">
      <style>{scrollbarStyles}</style>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-neutral-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl xl:max-w-5xl max-h-[95vh] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-sm z-10 rounded-t-xl sm:rounded-t-2xl">
          <button 
            onClick={() => navigate(vehicleModel ? `/fleet/details/${vehicleId}` : '/fleet')}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors group text-sm font-medium">
            <ArrowLeft size={18} className="mr-1.5 transform group-hover:-translate-x-0.5 transition-transform" /> 
            Back to Vehicle Details
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Complete Your Booking</h1>
          <button onClick={() => navigate(vehicleModel ? `/fleet/details/${vehicleId}` : '/fleet')} className="text-gray-500 hover:text-red-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow overflow-y-auto booking-scrollbar p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* Left Panel (Summary) */}
            <div className="lg:col-span-5 lg:sticky lg:top-[calc(4rem+1.5rem)] self-start"> {/* Adjust top based on header height */}
              <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <img 
                  src={vehicleModel?.main_image_url || vehicleModel?.all_media?.[0]?.url || DEFAULT_FALLBACK_IMAGE_URL} 
                  alt={vehicleModel?.title || "Vehicle"} 
                  className="w-full rounded-lg shadow-md object-cover aspect-[16/10] mb-4" 
                  onError={(e) => {e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL;}}
                />
                <h2 className="text-2xl font-bold text-gray-800">{vehicleModel?.title || "Loading..."}</h2>
                <p className="text-md text-gray-600">{vehicleModel?.vehicle_type?.name || "..."}</p>
                <p className="text-xl font-semibold text-blue-600 mt-1">
                  ${(vehicleModel?.base_price_per_day || 0).toFixed(2)}
                  <span className="text-xs text-gray-500">/day</span>
                </p>
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Booking Summary</h3>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex justify-between"><span>Base ({numberOfDays > 0 ? `${numberOfDays} day${numberOfDays !== 1 ? 's' : ''}` : `_ day(s)`})</span> <span className="font-medium">${bookingPrices.base.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Extras:</span> <span className="font-medium">${bookingPrices.extras.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Insurance:</span> <span className="font-medium">${bookingPrices.insurance.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-gray-800 text-lg pt-2 mt-2 border-t"><span>Estimated Total:</span> 
                        <span>${bookingPrices.final.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - All Form Sections */}
            <div className="lg:col-span-7">
              {formError && (<div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center shadow-sm"><AlertCircle size={20} className="mr-2 flex-shrink-0" /> {formError}</div>)}
              <div className="space-y-8">
                {/* Section 1: Rental Period */}
                <section>
                  <h2 className={sectionTitleClass}><CalendarDays size={24} className="mr-3 text-blue-600" /> Rental Period</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                    <div> <label htmlFor="startDate" className={labelBaseClass}>Pick-up Date</label> <input type="date" id="startDate" name="startDate" value={startDate} min={today} onChange={handleDateChange(setStartDate)} className={inputBaseClass} required /> </div>
                    <div> <label htmlFor="endDate" className={labelBaseClass}>Return Date</label> <input type="date" id="endDate" name="endDate" value={endDate} min={minEndDate} onChange={handleDateChange(setEndDate)} disabled={!startDate} className={`${inputBaseClass} ${!startDate ? 'disabled:bg-gray-100 disabled:cursor-not-allowed' : ''}`} required /> </div>
                  </div>
                  {numberOfDays > 0 && (<p className="text-sm text-gray-700 mt-3">Duration: <span className="font-semibold">{numberOfDays} day{numberOfDays !== 1 ? 's' : ''}</span></p>)}
                </section>

                {/* Section 2: Your Information */}
                <section>
                  <h2 className={sectionTitleClass}><Users size={24} className="mr-3 text-blue-600" /> Your Information</h2>
                  <div className="space-y-5">
                    <div> <label htmlFor="renterName" className={labelBaseClass}>Full Name</label> <input type="text" id="renterName" value={renterName} onChange={handleInputChange(setRenterName)} className={inputBaseClass} required placeholder="e.g., Lahyane Oussama" /> </div>
                    <div> <label htmlFor="renterEmail" className={labelBaseClass}>Email Address</label> <input type="email" id="renterEmail" value={renterEmail} onChange={handleInputChange(setRenterEmail)} className={inputBaseClass} required placeholder="e.g., Lahyaneoussama2011@gmail.com" /> </div>
                    <div> <label htmlFor="renterPhone" className={labelBaseClass}>Phone Number</label> <input type="tel" id="renterPhone" value={renterPhone} onChange={handleInputChange(setRenterPhone)} className={inputBaseClass} required placeholder="e.g., (+212) 0674811990 " /> </div>
                  </div>
                </section>

                {/* Section 3: Insurance (Optional) */}
                {availableInsurancePlans.length > 0 && ( <section> <h2 className={sectionTitleClass}><ShieldCheck size={24} className="mr-3 text-blue-600" /> Add Insurance (Optional)</h2> <div className="space-y-4"> {availableInsurancePlans.map(plan => ( <label key={plan.id} htmlFor={`insurance_${plan.id}`} className={`${optionLabelClass} ${selectedInsuranceId === plan.id ? selectedOptionClass : unselectedOptionClass}`}> <input type="radio" id={`insurance_${plan.id}`} name="insurancePlan" value={plan.id} checked={selectedInsuranceId === plan.id} onChange={handleInsuranceChange} className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1 mr-3 flex-shrink-0" /> <div> <span className="font-semibold text-gray-800">{plan.name}</span> <span className="text-sm text-gray-600 ml-1">(+${(plan.price_per_day || 0).toFixed(2)}/day)</span> {plan.description && <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>} </div> </label> ))} <label htmlFor="insurance_none" className={`${optionLabelClass} ${!selectedInsuranceId ? selectedOptionClass : unselectedOptionClass}`}> <input type="radio" id="insurance_none" name="insurancePlan" value="" checked={!selectedInsuranceId} onChange={handleInsuranceChange} className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1 mr-3 flex-shrink-0" /> <span className="font-semibold text-gray-800">No Insurance Selected</span> </label> </div> </section> )}
                
                {/* Section 4: Optional Extras */}
                {availableExtras.length > 0 && ( <section> <h2 className={sectionTitleClass}><ShoppingBag size={24} className="mr-3 text-blue-600" /> Optional Extras</h2> <div className="space-y-4"> {availableExtras.map((extraItem) => ( <div key={extraItem.id} className={`${optionLabelClass} ${isExtraSelected(extraItem.id) ? selectedOptionClass : unselectedOptionClass} justify-between items-center`}> <div> <span className="font-semibold text-gray-800">{extraItem.name}</span> <span className="text-sm text-gray-600 ml-1">(+${(extraItem.default_price_per_day || 0).toFixed(2)})</span> {extraItem.description && <p className="text-xs text-gray-500 mt-0.5">{extraItem.description}</p>} </div> <div className="flex items-center space-x-2"> {isExtraSelected(extraItem.id) && ( <button onClick={() => handleExtraChange(extraItem, false)} className="p-1.5 text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 rounded-full transition-colors"> <X size={16}/> </button> )} <button onClick={() => handleExtraChange(extraItem, true)} className={`p-1.5 rounded-full transition-colors ${isExtraSelected(extraItem.id) ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}> <PlusCircle size={18}/> </button> {isExtraSelected(extraItem.id) && <span className="text-sm w-6 text-center font-medium">{getExtraQuantity(extraItem.id)}</span>} </div> </div> ))} </div> </section> )}
                
                {/* Section 5: Payment Details (Mocked) */}
                <section> <h2 className={sectionTitleClass}><CreditCard size={24} className="mr-3 text-blue-600" /> Payment Details</h2> <div className="p-6 bg-white rounded-xl space-y-4 border border-gray-200 shadow-sm"> <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Payment Method</h3> <div> <label className={`${optionLabelClass} ${paymentMethod === 'credit_card' ? selectedOptionClass : unselectedOptionClass} mb-3`}> <input type="radio" name="paymentMethod" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1 mr-3"/> <span>Credit / Debit Card</span> </label> <label className={`${optionLabelClass} ${paymentMethod === 'paypal' ? selectedOptionClass : unselectedOptionClass}`}> <input type="radio" name="paymentMethod" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1 mr-3"/> <span>PayPal</span> </label> </div> <div className="pt-4 border-t border-gray-200 mt-4"> <p className="text-gray-600">You will be charged: <span className="font-bold text-lg text-blue-700">${bookingPrices.final.toFixed(2)}</span></p> <p className="text-xs text-gray-500 mt-1">Click "Confirm & Book" to proceed. This is a mock payment step.</p> </div> </div> </section>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Single Submit Button */}
        <div className="p-4 sm:p-5 border-t border-gray-200 sticky bottom-0 bg-white/90 backdrop-blur-sm z-10 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex justify-end items-center">
            <button 
                type="button" 
                onClick={handleSubmitAndPay} // Changed from processBookingAndPayment
                disabled={!vehicleModel || loading || isSubmitting || !startDate || !endDate || numberOfDays <= 0 || !renterName || !renterEmail || !renterPhone}
                className="px-6 py-3 bg-green-600 border border-transparent text-base font-medium rounded-lg shadow-sm text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[220px]"> 
                {isSubmitting ? <Loader2 size={20} className="animate-spin mr-2"/> : null} 
                {isSubmitting ? 'Processing...' : 'Confirm & Book Now'} 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default BookingPageClient;