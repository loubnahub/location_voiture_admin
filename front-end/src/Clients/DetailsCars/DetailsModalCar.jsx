// src/pages/CarDetailPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchVehicleModelById } from '../../services/api'; // Adjust path as needed
import {
  ArrowLeft, X, Camera, Orbit, CarFront, FileText, Users, CalendarDays,
  Fuel, Settings2, Tag, DoorOpen, Armchair, Route, Shapes, Disc3, Feather,
  ChevronDown, ChevronUp, Loader2, AlertTriangle,
} from 'lucide-react';

const DEFAULT_FALLBACK_IMAGE_URL = '/images/Cars/BentlyNobgc.png'; // Your updated path

const CarDetailPage = () => {
  const { vehicleId } = useParams(); 
  const navigate = useNavigate();

  const [vehicleModel, setVehicleModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('details');

  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [selectedFeatureCategory, setSelectedFeatureCategory] = useState('');
  const [extrasOpen, setExtrasOpen] = useState(true);

  useEffect(() => {
    if (vehicleId) {
      const loadVehicleModelDetails = async () => {
        setLoading(true);
        setError(null);
        setVehicleModel(null); 
        try {
          const response = await fetchVehicleModelById(vehicleId);
          if (response.data && response.data.data) { // Check for the nested 'data' object from Laravel Resource
            const modelData = response.data.data;
            setVehicleModel(modelData);
            if (modelData.features_grouped && modelData.features_grouped.length > 0) {
              setSelectedFeatureCategory(modelData.features_grouped[0]?.category_name || '');
            } else {
              setSelectedFeatureCategory('');
            }
          } else {
            // Handle cases where response.data is present but response.data.data is not (e.g. direct object)
             if(response.data && typeof response.data === 'object' && !Array.isArray(response.data)){
                const modelData = response.data;
                setVehicleModel(modelData);
                if (modelData.features_grouped && modelData.features_grouped.length > 0) {
                  setSelectedFeatureCategory(modelData.features_grouped[0]?.category_name || '');
                } else {
                  setSelectedFeatureCategory('');
                }
             } else {
                throw new Error("Vehicle model data not found or in unexpected format in API response.");
             }
          }
        } catch (err) {
          console.error("Error fetching vehicle model details:", err);
          // Attempt to get more specific error from Axios if available
          let errorMessage = "Failed to load vehicle details. Please try again.";
          if (err.response) { // Axios error object
            errorMessage = `Request failed with status code ${err.response.status}: ${err.response.data?.message || err.message}`;
          } else if (err.request) { // Request made but no response
            errorMessage = "No response from server. Check network connection.";
          } else { // Something else happened
            errorMessage = err.message || "An unknown error occurred.";
          }
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      loadVehicleModelDetails();
    } else {
      setError("No vehicle ID provided.");
      setLoading(false);
    }
  }, [vehicleId]);

  const mainImage = useMemo(() => {
    if (!vehicleModel) return DEFAULT_FALLBACK_IMAGE_URL;
    if (vehicleModel.main_image_url) return vehicleModel.main_image_url; // Ideal if backend provides this
    if (vehicleModel.all_media && vehicleModel.all_media.length > 0) {
      const coverImage = vehicleModel.all_media.find(media => media.is_cover);
      return coverImage ? coverImage.url : (vehicleModel.all_media[0]?.url || DEFAULT_FALLBACK_IMAGE_URL);
    }
    return DEFAULT_FALLBACK_IMAGE_URL;
  }, [vehicleModel]);

  const featureCategories = useMemo(() => {
    if (!vehicleModel || !vehicleModel.features_grouped) return [];
    return vehicleModel.features_grouped
             .map(group => group?.category_name)
             .filter(Boolean); 
  }, [vehicleModel]);

  const displayedFeatures = useMemo(() => {
    if (!vehicleModel || !vehicleModel.features_grouped || !selectedFeatureCategory) return [];
    const category = vehicleModel.features_grouped.find(group => group?.category_name === selectedFeatureCategory);
    return category ? (category.items || []) : [];
  }, [vehicleModel, selectedFeatureCategory]);

  const handleClose = () => navigate('/fleet');

  const scrollbarStyles = `
    .custom-detail-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-detail-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 3px; }
    .custom-detail-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 3px; }
    .custom-detail-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.4); }
    .custom-detail-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.2) rgba(0,0,0,0.05); }
  `;

  const activeViewClasses = "p-2 bg-white text-black rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center";
  const inactiveViewClasses = "p-1.5 sm:p-2 text-white hover:bg-neutral-500/50 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center";

  if (loading) { /* ... (loading JSX is fine) ... */ 
    return (
      <div className="fixed inset-0 bg-white/[0.5] backdrop-blur-sm flex items-center justify-center z-[999] p-2 sm:p-4">
        <div className="bg-[#FFFFFFCC] backdrop-blur-md text-neutral-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-10 flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
          <p className="text-lg font-semibold">Loading Vehicle Details...</p>
        </div>
      </div>
    );
  }
  if (error) { /* ... (error JSX is fine) ... */ 
    return (
      <div className="fixed inset-0 bg-white/[0.5] backdrop-blur-sm flex items-center justify-center z-[999] p-2 sm:p-4">
        <div className="bg-red-50 text-red-700 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-10 flex flex-col items-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <p className="text-lg font-semibold mb-2">Error Loading Details</p>
          <p className="text-sm text-center mb-6">{error}</p>
          <button onClick={handleClose} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">Return to Fleet</button>
        </div>
      </div>
    );
  }
  if (!vehicleModel) { /* ... (no vehicleModel JSX is fine) ... */ 
    return (
        <div className="fixed inset-0 bg-white/[0.5] backdrop-blur-sm flex items-center justify-center z-[999] p-2 sm:p-4">
          <p className="text-lg">Vehicle not found.</p>
          <button onClick={handleClose} className="ml-4 text-blue-600 hover:underline">Go Back</button>
        </div>
    );
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-white/[0.5] backdrop-blur-sm flex items-center justify-center z-[999] p-2 sm:p-4 font-sans">
        <div className="bg-[#FFFFFFCC] backdrop-blur-md text-neutral-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl xl:max-w-7xl max-h-[95vh] flex flex-col relative">
          {/* Top Navigation and Close Buttons (same as your previous code) */}
          <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-10"> <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-700/60 backdrop-blur-sm p-1 sm:p-1.5 rounded-full shadow"> <button onClick={() => setActiveView('details')} className={activeView === 'details' ? activeViewClasses : inactiveViewClasses} title="Details"> <CarFront size={18} /> </button> <Link to={`/fleet/details/${vehicleId}/3d`} onClick={() => setActiveView('3d')}> <button className={activeView === '3d' ? activeViewClasses : inactiveViewClasses} title="3D View"> <Orbit size={18} /> </button> </Link> <Link to={`/fleet/details/${vehicleId}/ar`} onClick={() => setActiveView('ar')}> <button className={activeView === 'ar' ? activeViewClasses : inactiveViewClasses} title="Gallery / AR View"> <Camera size={18} /> </button> </Link> </div> </div>
          <button onClick={handleClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 text-neutral-600 hover:text-neutral-800 bg-white/70 hover:bg-white p-1.5 rounded-full" aria-label="Close details"> <X size={20} /> </button>
          <button onClick={handleClose} className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 text-neutral-800 bg-white shadow-md p-1.5 rounded-lg items-center justify-center flex" aria-label="Back"> <ArrowLeft size={20} /> </button>

          <div className="flex-grow overflow-y-auto custom-detail-scrollbar pt-16 sm:pt-20 pb-6 px-4 sm:px-6 md:px-8">
            <div className="md:flex md:gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="md:w-[60%] lg:w-[62%] flex flex-col">
                <div className="md:flex md:gap-4 lg:gap-6 mb-5 sm:mb-6">
                  <div className="md:w-1/2 lg:w-[45%]">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">{vehicleModel.title || 'Vehicle Name'}</h1>
                    {/* Changed "Car Type oussama" to dynamic */}
                    <p className="text-md text-neutral-700 mb-3 sm:mb-4">{vehicleModel.vehicle_type?.name || 'Type N/A'}</p>
                    <div className="mb-4 sm:mb-5">
                      <h2 className="flex items-center text-lg font-semibold text-neutral-900 mb-1.5 sm:mb-2">
                        <FileText size={20} className="mr-2 text-neutral-700" />Description
                      </h2>
                      <p className="text-sm text-neutral-700 leading-relaxed break-words">{vehicleModel.description || 'No description available.'}</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <Link to={`/booking/${vehicleId}`}> 
                        <button className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2.5 px-4 sm:px-6 rounded-lg text-sm flex-1 transition-colors"> Rent Now </button>
                      </Link>
                      <button className="bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 font-semibold py-2.5 px-4 sm:px-6 rounded-lg text-sm flex-1 transition-colors"> Review </button>
                    </div>
                  </div>
                  <div className="md:w-1/2 lg:w-[calc(55%+2rem)] xl:w-[calc(55%+4rem)] mt-4 md:mt-0 flex items-center justify-center md:-ml-8 lg:-ml-12 xl:-ml-16">
                    <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl">
                      <img
                        src={mainImage} // DYNAMIC
                        alt={`${vehicleModel.title || 'Vehicle'} main view`}
                        className="w-full h-auto max-h-[280px] sm:max-h-[340px] md:max-h-[400px] lg:max-h-[460px] object-contain transform scale-105 md:scale-110 lg:scale-125"
                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL; }}
                      />
                    </div>
                  </div>
                </div>
                {/* Specs Grid - DYNAMIC */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 text-sm">
                    <SpecItem icon={Shapes} label="Type" value={vehicleModel.vehicle_type?.name} />
                    <SpecItem icon={Disc3} label="Brand" value={vehicleModel.brand} />
                    {/* API sends 'model', frontend expects 'model_name' from controller show method */}
                    <SpecItem icon={Feather} label="Model" value={vehicleModel.model_name} /> 
                    <SpecItem icon={CalendarDays} label="Year" value={vehicleModel.year?.toString()} />
                    <SpecItem icon={Tag} label="Price/Day" value={vehicleModel.base_price_per_day != null ? `$${parseFloat(vehicleModel.base_price_per_day).toFixed(2)}` : 'N/A'} />
                    <SpecItem icon={Fuel} label="Fuel Type" value={vehicleModel.fuel_type} />
                    <SpecItem icon={DoorOpen} label="Doors" value={vehicleModel.number_of_doors?.toString()} />
                    <SpecItem icon={Armchair} label="Seats" value={vehicleModel.number_of_seats?.toString()} />
                    <SpecItem icon={Settings2} label="Transmission" value={vehicleModel.transmission} />
                    <SpecItem icon={Route} label="Mileage" value={vehicleModel.mileage ? `${vehicleModel.mileage.toLocaleString()} km` : undefined} /> 
                </div>
              </div>

              {/* Right Column: Features & Extras - DYNAMIC */}
              <div className="md:w-[40%] lg:w-[38%] mt-8 md:mt-0">
                <div className="bg-white/90 p-4 sm:p-5 rounded-lg shadow-lg text-neutral-800 sticky top-4 max-h-[calc(90vh-5rem)] overflow-y-auto custom-detail-scrollbar">
                  {/* Features Section */}
                  {(vehicleModel.features_grouped && vehicleModel.features_grouped.length > 0) ? (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setFeaturesOpen(!featuresOpen)}>
                        <h2 className="text-xl font-semibold text-neutral-900">Features</h2>
                        <div className="flex items-center">
                          {featureCategories.length > 1 && (
                            <select
                              value={selectedFeatureCategory}
                              onChange={(e) => setSelectedFeatureCategory(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs bg-neutral-200 text-neutral-700 border border-neutral-300 px-3 py-1.5 rounded-full shadow-sm hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none mr-2"
                            >
                              {featureCategories.map(cat => ( <option key={cat} value={cat}>{cat || "General"}</option> ))}
                            </select>
                          )}
                          {featuresOpen ? <ChevronUp size={20} className="text-neutral-500" /> : <ChevronDown size={20} className="text-neutral-500" />}
                        </div>
                      </div>
                      <p className='border-b border-neutral-300 w-full mt-2 mb-3'></p>
                      {featuresOpen && (
                        <div className="space-y-2 sm:space-y-2.5 mt-2 max-h-60 overflow-y-auto custom-detail-scrollbar pr-1">
                          {displayedFeatures.length > 0 ? (
                            displayedFeatures.map(feature => (
                              <div key={feature.id} className="bg-neutral-100 p-2.5 sm:p-3 rounded-md shadow-sm">
                                <p className="text-sm text-neutral-800 font-medium">{feature.name}</p>
                                {feature.description && <p className="text-xs text-neutral-600 mt-0.5 break-words">{feature.description}</p>}
                                {feature.pivot?.notes && <p className="text-xs text-blue-600 italic mt-0.5 break-words">Note: {feature.pivot.notes}</p>}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-neutral-500 pl-1">No features listed for this category or selection.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : <p className="text-sm text-neutral-500 mb-6">No features listed for this model.</p>}

                  {/* Possible Extras Section */}
                  {(vehicleModel.extras_available && vehicleModel.extras_available.length > 0) ? (
                    <div>
                      <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setExtrasOpen(!extrasOpen)}>
                        <h2 className="text-xl font-semibold text-neutral-900">Possible Extras</h2>
                        {extrasOpen ? <ChevronUp size={20} className="text-neutral-500" /> : <ChevronDown size={20} className="text-neutral-500" />}
                      </div>                     
                      <p className='border-b border-neutral-300 w-full mt-2 mb-3'></p>
                      {extrasOpen && (
                        <div className="space-y-2 sm:space-y-2.5 mt-2 max-h-60 overflow-y-auto custom-detail-scrollbar pr-1">
                          {vehicleModel.extras_available.map(extra => (
                            <div key={extra.id} className="bg-neutral-100 p-2.5 sm:p-3 rounded-md flex justify-between items-start shadow-sm">
                              <div className="flex-grow mr-2">
                                <p className="text-sm text-neutral-800 font-medium">{extra.name}</p>
                                {extra.description && <p className="text-xs text-neutral-600 mt-0.5 break-words">{extra.description}</p>}
                              </div>
                              <p className="text-xs text-neutral-600 flex-shrink-0 pt-0.5">
                                {extra.default_price_per_day != null ? `$${parseFloat(extra.default_price_per_day).toFixed(2)}/day` : 'Price N/A'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : <p className="text-sm text-neutral-500">No optional extras available for this model.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};

// Helper component for spec items
const SpecItem = ({ icon: Icon, label, value }) => {
    if (value === null || typeof value === 'undefined' || String(value).trim() === '') return null; // Allow 0, but not empty strings
    return (
      <div className="bg-white text-neutral-800 px-3 py-2.5 rounded-lg flex items-center shadow-sm border border-neutral-200/80">
        <Icon size={18} className="mr-2.5 text-neutral-500 flex-shrink-0" />
        <div>
          <span className="block text-[11px] text-neutral-500 uppercase tracking-wider">{label}</span>
          <span className="block font-semibold text-sm leading-tight">{String(value)}</span>
        </div>
      </div>
    );
};

export default CarDetailPage;