// src/pages/BookingConfirmationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import allCarsDataSource from '../VEHICLE/Section/Cars/CarsCardFiltre'; 
import { CheckCircle, ArrowLeft, Home, Car, Mail, Phone } from 'lucide-react'; // Added Mail, Phone



const getVehicleById = (id) => {
  if (!allCarsDataSource || !Array.isArray(allCarsDataSource)) return null;
  return allCarsDataSource.find(vehicle => vehicle.id.toString() === id.toString());
};

const getDisplayImage = (vehicle) => {
    if (!vehicle) return '/images/Cars/default_toyota_camry_nobgc.png';
    const imageSource = (Array.isArray(vehicle.imageNoBgc) && vehicle.imageNoBgc.length > 0 && vehicle.imageNoBgc[0])
                      ? vehicle.imageNoBgc[0]
                      : (typeof vehicle.imageNoBgc === 'string' && vehicle.imageNoBgc)
                          ? vehicle.imageNoBgc
                          : vehicle.imageUrl;
    return imageSource || '/images/Cars/default_toyota_camry_nobgc.png';
}

const BookingConfirmationPage = () => {
  const { vehicleId } = useParams(); 
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);

  

  useEffect(() => {
    if (vehicleId) {
      const foundVehicle = getVehicleById(vehicleId);
      setVehicle(foundVehicle); 
    }
  }, [vehicleId]);


  const scrollbarStyles = `
    .confirmation-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
    .confirmation-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px;}
    .confirmation-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px;}
    .confirmation-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
    .confirmation-scrollbar { scrollbar-width: thin; scrollbar-color: #c1c1c1 #f1f1f1; }
  `;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[997] p-2 sm:p-4 font-sans">
      <style>{scrollbarStyles}</style>
      <div className="bg-white text-neutral-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col relative">
        <div className="p-4 sm:p-6 text-center border-b border-green-200 bg-white/50 rounded-t-xl sm:rounded-t-2xl">
          <CheckCircle className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-green-500 mb-3" strokeWidth={1.5} />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Booking Request Sent!
          </h1>
        </div>

        <div className="flex-grow overflow-y-auto confirmation-scrollbar p-6 sm:p-8 space-y-6 text-center">
          <p className="text-md text-gray-700">
            Thank you, your booking request has been successfully submitted. Our team will review the details and get in touch with you shortly to confirm availability and finalize your reservation.
          </p>

          {vehicle && (
            <div className="mt-2 pt-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Vehicle Requested:</h3>
              <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md border border-gray-200 gap-3">
                  <img 
                      src={getDisplayImage(vehicle)} 
                      alt={vehicle.name}
                      className="w-full max-w-xs h-auto rounded-md object-cover"
                      onError={(e) => {e.target.onerror=null; e.target.src='/images/Cars/default_toyota_camry_nobgc.png'}}
                  />
                  <div className="text-center">
                      <p className="text-lg font-bold text-blue-700">{vehicle.name}</p>
                      <p className="text-sm text-gray-500">{vehicle.type}</p>
                      
                  </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">What Happens Next?</h3>
            <ul className="text-gray-600 text-sm space-y-1.5 text-left mx-auto max-w-md px-4 sm:px-0">
              <li className="flex items-start"><Mail size={16} className="mr-2 mt-0.5 text-green-600 flex-shrink-0"/>You'll receive an email from us within the next 24 hours.</li>
              <li className="flex items-start"><CheckCircle size={16} className="mr-2 mt-0.5 text-green-600 flex-shrink-0"/>We will verify vehicle availability for your chosen dates.</li>
              <li className="flex items-start"><Phone size={16} className="mr-2 mt-0.5 text-green-600 flex-shrink-0"/>Our team will contact you to confirm and discuss payment.</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              For urgent queries, call us at <a href="tel:+1234567890" className="text-blue-600 hover:underline font-medium">+1 (234) 567-890</a>.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 bg-white/50 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all transform hover:scale-105"
            >
              <Home size={18} className="mr-2" />
              Back to Homepage
            </button>
            <Link
              to="/fleet" 
              className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-all transform hover:scale-105"
            >
              <Car size={18} className="mr-2" />
              Explore More Vehicles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;