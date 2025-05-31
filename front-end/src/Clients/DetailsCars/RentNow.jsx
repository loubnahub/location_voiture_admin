// src/pages/BookingPage.jsx
import React, { useState, useEffect, useMemo } from 'react';



import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Users, CreditCard, ShieldCheck, PlusCircle, X, ChevronRight, ChevronLeft as ChevronLeftLucide, AlertCircle } from 'lucide-react';

// Define outside component: scrollbar styles, sample data
const scrollbarStyles = `
  .booking-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .booking-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .booking-scrollbar::-webkit-scrollbar-thumb {
    background: #c7c7c7;
    border-radius: 10px;
  }
  .booking-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a3a3a3;
  }
`;

const sampleVehicles = {
  '1': { id: '1', name: 'Toyota Camry', type: 'Sedan', price: 50, imageUrl: '/images/Cars/Toyota.png' },
  '2': { id: '2', name: 'Honda CR-V', type: 'SUV', price: 70, imageUrl: '/images/Cars/Honda.png' },
  'bently-gt': { id: 'bently-gt', name: 'Bentley Continental GT', type: 'Luxury Coupe', price: 200, imageUrl: '/images/Cars/Toyota.png' } // Using Toyota img as placeholder
};

const sampleInsurancePlans = [
  { id: 'basic', name: 'Basic Coverage', pricePerDay: 10, description: 'Covers basic damages and theft protection.' },
  { id: 'premium', name: 'Premium Coverage', pricePerDay: 20, description: 'Comprehensive coverage including roadside assistance.' },
];

const availableCarExtras = [
  { name: 'GPS Navigation', price: 15, type: 'one-time' },
  { name: 'Child Seat', price: 10, type: 'one-time' },
  { name: 'Additional Driver', price: 25, type: 'one-time' },
];


const BookingPage = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedInsuranceId, setSelectedInsuranceId] = useState(null); 
  const [selectedCarExtras, setSelectedCarExtras] = useState([]); 
  const [renterName, setRenterName] = useState('');
  const [renterEmail, setRenterEmail] = useState('');
  const [renterPhone, setRenterPhone] = useState('');

  const [calculatedBasePrice, setCalculatedBasePrice] = useState(0);
  const [calculatedExtrasPrice, setCalculatedExtrasPrice] = useState(0);
  const [calculatedInsurancePrice, setCalculatedInsurancePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [formError, setFormError] = useState('');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const minEndDate = useMemo(() => {
    if (!startDate) return '';
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }, [startDate]);

  useEffect(() => {
    // Simulate fetching vehicle data
    const fetchedVehicle = sampleVehicles[vehicleId] || sampleVehicles['bently-gt']; // Fallback for demo
    if (fetchedVehicle) {
      setVehicle(fetchedVehicle);
    } else {
      setVehicle(null);
      console.error("Vehicle not found for ID:", vehicleId);
      setFormError("Vehicle details could not be loaded. Please try a different vehicle or go back.");
    }
  }, [vehicleId]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setNumberOfDays(diffDays);
        setFormError(''); // Clear date error if dates are valid
      } else {
        setNumberOfDays(0);
        setFormError("Return date must be after pick-up date.");
      }
    } else {
      setNumberOfDays(0);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (!vehicle) {
      setCalculatedBasePrice(0);
      setCalculatedExtrasPrice(0);
      setCalculatedInsurancePrice(0);
      return;
    }

    const base = numberOfDays > 0 ? vehicle.price * numberOfDays : 0;
    setCalculatedBasePrice(base);

    const insurancePlan = sampleInsurancePlans.find(p => p.id === selectedInsuranceId);
    const insuranceCost = insurancePlan && numberOfDays > 0 ? insurancePlan.pricePerDay * numberOfDays : 0;
    setCalculatedInsurancePrice(insuranceCost);
    
    // Assuming extras are one-time cost.
    const extrasCost = selectedCarExtras.reduce((acc, extra) => acc + extra.price, 0);
    setCalculatedExtrasPrice(extrasCost);

  }, [vehicle, numberOfDays, selectedInsuranceId, selectedCarExtras]);

  useEffect(() => {
    if (vehicle && numberOfDays > 0) {
        setFinalPrice(calculatedBasePrice + calculatedExtrasPrice + calculatedInsurancePrice);
    } else if (vehicle) { // numberOfDays is 0 or less, but vehicle is loaded
        const oneTimeExtrasCost = selectedCarExtras.reduce((acc, curr) => acc + curr.price, 0);
        setFinalPrice((vehicle.price || 0) + oneTimeExtrasCost); // Show daily rate + one-time extras
    } else { // No vehicle loaded
        setFinalPrice(0);
    }
  }, [calculatedBasePrice, calculatedExtrasPrice, calculatedInsurancePrice, numberOfDays, vehicle, selectedCarExtras]);


  const handleCarExtraChange = (extra) => {
    setSelectedCarExtras(prev => {
      const isSelected = prev.some(se => se.name === extra.name);
      if (isSelected) {
        return prev.filter(se => se.name !== extra.name);
      } else {
        return [...prev, extra];
      }
    });
  };

  const validateStep1 = () => {
    setFormError(''); 
    if (!startDate || !endDate || numberOfDays <= 0) {
      setFormError("Please select valid pick-up and return dates.");
      return false;
    }
    if (!renterName.trim()) {
      setFormError("Please enter your full name.");
      return false;
    }
    if (!renterEmail.trim()) {
        setFormError("Please enter your email address.");
        return false;
    }
    if (!/\S+@\S+\.\S+/.test(renterEmail)) {
        setFormError("Please enter a valid email address.");
        return false;
    }
    if (!renterPhone.trim()) {
        setFormError("Please enter your phone number.");
        return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    setFormError(''); 
    setCurrentStep(prev => Math.min(prev + 1, 3)); 
  };

  const handlePrevStep = () => {
    setFormError(''); 
    setCurrentStep(prev => Math.max(prev - 1, 1)); 
  };
  
  const handleSubmitBooking = () => {
    if (!validateStep1()) { 
        setCurrentStep(1); 
        return;
    }
    if (currentStep !== 3) { 
        console.error("Booking submission attempted from incorrect step.");
        return;
    }

    const bookingDetails = {
      vehicleId,
      vehicleName: vehicle?.name,
      vehicleType: vehicle?.type,
      startDate,
      endDate,
      numberOfDays,
      renterName,
      renterEmail,
      renterPhone,
      selectedInsurance: sampleInsurancePlans.find(p => p.id === selectedInsuranceId) || null,
      selectedExtras: selectedCarExtras,
      totalPrice: finalPrice,
    };
    console.log('Booking Submitted:', bookingDetails);
    alert('Booking request submitted! (See console for details)');
    // Example: navigate('/booking-confirmation', { state: { bookingDetails } }); 
    navigate('/'); // Navigate to home or a confirmation page
  };


  const inputBaseClass = "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm";
  const labelBaseClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const sectionTitleClass = "text-xl font-semibold text-gray-800 mb-4 flex items-center";
  const optionLabelClass = "flex items-start p-4 border rounded-xl hover:border-blue-500 cursor-pointer transition-all duration-200 ease-in-out";
  const selectedOptionClass = "border-blue-600 bg-blue-50 ring-2 ring-blue-400 shadow-lg";
  const unselectedOptionClass = "border-gray-300 hover:shadow-md";


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[998] p-2 sm:p-4 font-sans">
      <style>{scrollbarStyles}</style>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-neutral-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl xl:max-w-5xl max-h-[95vh] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-sm z-10 rounded-t-xl sm:rounded-t-2xl">
          <button 
            onClick={() => currentStep === 1 ? navigate(vehicle ? `/fleet/${vehicleId}` : '/') : handlePrevStep()} // Navigate to home if vehicle not loaded
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors group text-sm font-medium">
            <ArrowLeft size={18} className="mr-1.5 transform group-hover:-translate-x-0.5 transition-transform" /> 
            {currentStep === 1 ? 'Vehicle Details' : 'Previous'}
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
            {currentStep === 1 ? 'Your Details & Dates' : currentStep === 2 ? 'Customize Your Rental' : 'Review & Confirm'}
          </h1>
          <button onClick={() => navigate(vehicle ? `/fleet/${vehicleId}` : '/')} className="text-gray-500 hover:text-red-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-grow overflow-y-auto booking-scrollbar p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* Left Panel - Vehicle Image and Basic Info */}
            <div className="lg:col-span-5 lg:sticky lg:top-[calc(4rem+1.5rem)] self-start">
              <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <img 
                  src={vehicle?.imageUrl || "/images/Cars/placeholder.png"}
                  alt={vehicle?.name || "Vehicle"}
                  className="w-full rounded-lg shadow-md object-cover aspect-[16/10] mb-4" 
                />
                <h2 className="text-2xl font-bold text-gray-800">{vehicle?.name || "Loading..."}</h2>
                <p className="text-md text-gray-600">{vehicle?.type || "..."}</p>
                <p className="text-xl font-semibold text-blue-600 mt-1">
                  ${vehicle?.price?.toFixed(2) || "0.00"}
                  <span className="text-xs text-gray-500">/day</span>
                </p>
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Booking Summary</h3>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Base price ({numberOfDays > 0 ? `${numberOfDays} day${numberOfDays > 1 ? 's' : ''}` : `per day`})</span> 
                        <span className="font-medium">${(numberOfDays > 0 ? calculatedBasePrice : (vehicle?.price || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Extras:</span> 
                        <span className="font-medium">${calculatedExtrasPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Insurance:</span> 
                        <span className="font-medium">${calculatedInsurancePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-800 text-lg pt-2 mt-2 border-t">
                      <span>Estimated Total:</span> 
                      <span>${finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Form Steps */}
            <div className="lg:col-span-7">
              {formError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center">
                  <AlertCircle size={20} className="mr-2" /> {formError}
                </div>
              )}
              {!vehicle && !formError && ( // Show loading message if vehicle is not yet loaded and no other error
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center">
                  Loading vehicle details...
                </div>
              )}
              <div className="space-y-8">
                {/* STEP 1: Renter Info & Dates */}
                {currentStep === 1 && (
                  <>
                    <section>
                      <h2 className={sectionTitleClass}><CalendarDays size={24} className="mr-3 text-blue-600" /> Rental Period</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                        <div>
                          <label htmlFor="startDate" className={labelBaseClass}>Pick-up Date</label>
                          <input type="date" id="startDate" name="startDate" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} className={inputBaseClass} required />
                        </div>
                        <div>
                          <label htmlFor="endDate" className={labelBaseClass}>Return Date</label>
                          <input type="date" id="endDate" name="endDate" value={endDate} min={minEndDate} onChange={(e) => setEndDate(e.target.value)} disabled={!startDate} className={`${inputBaseClass} ${!startDate ? 'disabled:bg-gray-100 disabled:cursor-not-allowed' : ''}`} required />
                        </div>
                      </div>
                      {numberOfDays > 0 && (<p className="text-sm text-gray-700 mt-3">Duration: <span className="font-semibold">{numberOfDays} day{numberOfDays > 1 ? 's' : ''}</span></p>)}
                    </section>

                    <section>
                      <h2 className={sectionTitleClass}><Users size={24} className="mr-3 text-blue-600" /> Your Information</h2>
                      <div className="space-y-5">
                        <div>
                          <label htmlFor="renterName" className={labelBaseClass}>Full Name</label>
                          <input type="text" id="renterName" value={renterName} onChange={(e) => setRenterName(e.target.value)} className={inputBaseClass} required placeholder="e.g., Jane Doe" />
                        </div>
                        <div>
                          <label htmlFor="renterEmail" className={labelBaseClass}>Email Address</label>
                          <input type="email" id="renterEmail" value={renterEmail} onChange={(e) => setRenterEmail(e.target.value)} className={inputBaseClass} required placeholder="e.g., jane.doe@example.com" />
                        </div>
                        <div>
                          <label htmlFor="renterPhone" className={labelBaseClass}>Phone Number</label>
                          <input type="tel" id="renterPhone" value={renterPhone} onChange={(e) => setRenterPhone(e.target.value)} className={inputBaseClass} required placeholder="e.g., (555) 123-4567" />
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {/* STEP 2: Extras & Insurance */}
                {currentStep === 2 && vehicle && ( // Ensure vehicle is loaded before showing step 2
                  <>
                    {sampleInsurancePlans.length > 0 && (
                      <section>
                        <h2 className={sectionTitleClass}><ShieldCheck size={24} className="mr-3 text-blue-600" /> Add Insurance (Optional)</h2>
                        <div className="space-y-4">
                          {sampleInsurancePlans.map(plan => (
                            <label key={plan.id} htmlFor={`insurance_${plan.id}`} className={`${optionLabelClass} ${selectedInsuranceId === plan.id ? selectedOptionClass : unselectedOptionClass}`}>
                              <input type="radio" id={`insurance_${plan.id}`} name="insurancePlan" value={plan.id} checked={selectedInsuranceId === plan.id} onChange={(e) => setSelectedInsuranceId(e.target.value)} className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-gray-800">{plan.name}</span> <span className="text-sm text-gray-600 ml-1">(+${plan.pricePerDay.toFixed(2)}/day)</span>
                                <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                              </div>
                            </label>
                          ))}
                          <label htmlFor="insurance_none" className={`${optionLabelClass} ${!selectedInsuranceId ? selectedOptionClass : unselectedOptionClass}`}>
                            <input type="radio" id="insurance_none" name="insurancePlan" value="" checked={!selectedInsuranceId} onChange={() => setSelectedInsuranceId(null)} className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1 mr-3 flex-shrink-0" />
                            <span className="font-semibold text-gray-800">No Insurance Selected</span>
                          </label>
                        </div>
                      </section>
                    )}

                    {availableCarExtras.length > 0 && (
                      <section>
                        <h2 className={sectionTitleClass}><PlusCircle size={24} className="mr-3 text-blue-600" /> Optional Extras</h2>
                        <div className="space-y-4">
                          {availableCarExtras.map((extra) => (
                            <label key={extra.name} htmlFor={`extra_car_${extra.name}`} className={`${optionLabelClass} ${selectedCarExtras.some(se => se.name === extra.name) ? selectedOptionClass : unselectedOptionClass}`}>
                              <input type="checkbox" id={`extra_car_${extra.name}`} name={extra.name} checked={selectedCarExtras.some(se => se.name === extra.name)} onChange={() => handleCarExtraChange(extra)} className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-gray-800">{extra.name}</span>
                                <span className="text-sm text-gray-600 ml-1">(+${extra.price.toFixed(2)})</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}

                {/* STEP 3: Payment & Confirmation */}
                {currentStep === 3 && vehicle && ( // Ensure vehicle is loaded
                  <>
                    <section>
                      <h2 className={sectionTitleClass}><CreditCard size={24} className="mr-3 text-blue-600" /> Review & Payment</h2>
                      <div className="p-6 bg-gray-50 rounded-xl space-y-3 border border-gray-200 shadow">
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Confirm Your Details:</h3>
                        <p><strong>Vehicle:</strong> {vehicle.name} ({vehicle.type})</p>
                        <p><strong>Rental Period:</strong> {startDate} to {endDate} ({numberOfDays} days)</p>
                        <p><strong>Renter:</strong> {renterName} ({renterEmail}, {renterPhone})</p>
                        {selectedInsuranceId && <p><strong>Insurance:</strong> {sampleInsurancePlans.find(p=>p.id === selectedInsuranceId)?.name}</p>}
                        {selectedCarExtras.length > 0 && <div><strong>Extras:</strong> {selectedCarExtras.map(ex => ex.name).join(', ')}</div>}
                        <p className="text-xl font-bold mt-3 pt-3 border-t text-blue-700">Final Price: ${finalPrice.toFixed(2)}</p>
                      </div>
                    </section>
                    <section className="mt-6">
                      <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 text-center">
                        <p className="text-gray-600 text-md">Payment Gateway Integration</p>
                        <p className="text-sm text-gray-500 mt-1">Secure payment processing would be embedded here.</p>
                      </div>
                    </section>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Navigation Buttons */}
        <div className="p-4 sm:p-5 border-t border-gray-200 sticky bottom-0 bg-white/90 backdrop-blur-sm z-10 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex justify-between items-center">
            {currentStep > 1 ? (
              <button type="button" onClick={handlePrevStep}
                      className="px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center shadow-sm hover:shadow">
                <ChevronLeftLucide size={18} className="mr-1.5"/> Previous
              </button>
            ) : ( <div className="w-[110px]"></div> /* Placeholder to balance layout */)}

            {currentStep < 3 ? (
              <button type="button" onClick={handleNextStep}
                      disabled={!vehicle} // Disable next if vehicle not loaded
                      className="px-5 py-2.5 bg-blue-600 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center disabled:opacity-60 disabled:cursor-not-allowed">
                Next <ChevronRight size={18} className="ml-1.5"/>
              </button>
            ) : (
              <button type="button" onClick={handleSubmitBooking}
                      disabled={!vehicle || numberOfDays <= 0 || !renterName.trim() || !renterEmail.trim() || !renterPhone.trim() || !/\S+@\S+\.\S+/.test(renterEmail)}
                      className="px-5 py-2.5 bg-green-600 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                 disabled:opacity-60 disabled:cursor-not-allowed">
                Confirm & Request Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;