// src/pages/CarDetailPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchVehicleModelById } from '../../services/api'; // Adjust path as needed
import {
  ArrowLeft, X, Camera, Orbit, CarFront, FileText, CalendarDays,
  Fuel, Settings2, Tag, DoorOpen, Armchair, Route, Shapes, Disc3, Feather,
  ChevronDown, ChevronUp, Loader2, AlertTriangle, Users // Users was in 9fe but not used, kept for potential future use
} from 'lucide-react';

const DEFAULT_FALLBACK_IMAGE_URL = '/images/Cars/BentlyNobgc.png';

// SpecItem Component (Merged: using tw- prefix consistently)
const SpecItem = ({ icon: Icon, label, value }) => {
    if (value === null || typeof value === 'undefined' || String(value).trim() === '') return null;
    return (
      <div className="tw-bg-white tw-text-neutral-800 tw-px-3 tw-py-2.5 tw-rounded-lg tw-flex tw-items-center tw-shadow-sm tw-border tw-border-neutral-200/80">
        <Icon size={18} className="tw-mr-2.5 tw-text-neutral-500 tw-flex-shrink-0" />
        <div>
          <span className="tw-block tw-text-[11px] tw-text-neutral-500 tw-uppercase tw-tracking-wider">{label}</span>
          <span className="tw-block tw-font-semibold tw-text-sm tw-leading-tight">{String(value)}</span>
        </div>
      </div>
    );
};


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
          // Standardize response data access: try response.data.data (Laravel Resource), then response.data (direct object)
          const modelData = response.data?.data || response.data;

          if (modelData && typeof modelData === 'object' && !Array.isArray(modelData)) {
            setVehicleModel(modelData);
            if (modelData.features_grouped?.length > 0) {
              setSelectedFeatureCategory(modelData.features_grouped[0]?.category_name || '');
            } else {
              setSelectedFeatureCategory('');
            }
          } else {
            throw new Error("Vehicle model data not found or in unexpected format in API response.");
          }
        } catch (err) {
          console.error("Error fetching vehicle model details:", err);
          let errorMessage = "Failed to load vehicle details. Please try again.";
          if (err.response) {
            errorMessage = `Request failed with status code ${err.response.status}: ${err.response.data?.message || err.message}`;
          } else if (err.request) {
            errorMessage = "No response from server. Check network connection.";
          } else {
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
    if (vehicleModel.main_image_url) return vehicleModel.main_image_url;
    if (vehicleModel.all_media?.length > 0) {
      const coverImage = vehicleModel.all_media.find(media => media.is_cover);
      return coverImage ? coverImage.url : (vehicleModel.all_media[0]?.url || DEFAULT_FALLBACK_IMAGE_URL);
    }
    return DEFAULT_FALLBACK_IMAGE_URL;
  }, [vehicleModel]);

  const featureCategories = useMemo(() => {
    if (!vehicleModel || !vehicleModel.features_grouped) return [];
    return vehicleModel.features_grouped.map(group => group?.category_name).filter(Boolean);
  }, [vehicleModel]);

  const displayedFeatures = useMemo(() => {
    if (!vehicleModel || !vehicleModel.features_grouped || !selectedFeatureCategory) return [];
    const category = vehicleModel.features_grouped.find(group => group?.category_name === selectedFeatureCategory);
    return category ? (category.items || []) : [];
  }, [vehicleModel, selectedFeatureCategory]);

  const handleClose = () => navigate('/fleet'); // Standardized to navigate to /fleet

  const scrollbarStyles = `
    .custom-detail-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-detail-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 3px; }
    .custom-detail-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 3px; }
    .custom-detail-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.4); }
    .custom-detail-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.2) rgba(0,0,0,0.05); }
  `;

  const activeViewClasses = "tw-p-2 tw-bg-white tw-text-black tw-border-0 tw-rounded-full tw-w-8 tw-h-8 sm:tw-w-9 sm:tw-h-9 tw-flex tw-items-center tw-justify-center";
  const inactiveViewClasses = "tw-p-1.5 sm:tw-p-2 tw-text-white tw-border-0 hover:tw-bg-neutral-500/50 tw-rounded-full tw-w-8 tw-h-8 sm:tw-w-9 sm:tw-h-9 tw-flex tw-items-center tw-justify-center";

  if (loading) {
    return (
      <div className="tw-fixed tw-inset-0 tw-bg-white/[0.5] tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[999] tw-p-2 sm:tw-p-4">
        <div className="tw-bg-[#FFFFFFCC] tw-backdrop-blur-md tw-text-neutral-800 tw-rounded-xl sm:tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-md tw-p-10 tw-flex tw-flex-col tw-items-center">
          <Loader2 size={48} className="tw-animate-spin tw-text-blue-600 tw-mb-4" />
          <p className="tw-text-lg tw-font-semibold">Loading Vehicle Details...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="tw-fixed tw-inset-0 tw-bg-white/[0.5] tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[999] tw-p-2 sm:tw-p-4">
        <div className="tw-bg-red-50 tw-text-red-700 tw-rounded-xl sm:tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-md tw-p-10 tw-flex tw-flex-col tw-items-center">
          <AlertTriangle size={48} className="tw-text-red-500 tw-mb-4" />
          <p className="tw-text-lg tw-font-semibold tw-mb-2">Error Loading Details</p>
          <p className="tw-text-sm tw-text-center tw-mb-6">{error}</p>
          <button onClick={handleClose} className="tw-bg-red-600 hover:tw-bg-red-700 tw-text-white tw-font-semibold tw-py-2 tw-px-6 tw-rounded-lg tw-transition-colors">Return to Fleet</button>
        </div>
      </div>
    );
  }
  if (!vehicleModel) { // This case should ideally be caught by error state if API fails
    return (
        <div className="tw-fixed tw-inset-0 tw-bg-white/[0.5] tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[999] tw-p-2 sm:tw-p-4">
          <p className="tw-text-lg tw-text-neutral-700">Vehicle not found or data is unavailable.</p>
          <button onClick={handleClose} className="tw-ml-4 tw-text-blue-600 hover:tw-underline">Go Back</button>
        </div>
    );
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="tw-fixed tw-h-full tw-inset-0 tw-bg-white/[0.9] tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[999] tw-p-2 sm:tw-p-4 tw-font-sans">
        <div className="tw-bg-[#FFFFFF] tw-text-neutral-800 tw-rounded-xl sm:tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-5xl xl:tw-max-w-7xl tw-max-h-[95vh] tw-flex tw-flex-col tw-relative">

          {/* Top Navigation */}
          <div className="tw-absolute tw-top-3 sm:tw-top-4 tw-left-1/2 -tw-translate-x-1/2 tw-z-10">
            <div className="tw-flex tw-items-center tw-gap-1.5 sm:tw-gap-2 tw-bg-neutral-700/60 tw-backdrop-blur-sm tw-p-1 sm:tw-p-1.5 tw-rounded-full tw-shadow">
              <button onClick={() => setActiveView('details')} className={activeView === 'details' ? activeViewClasses : inactiveViewClasses} title="Details"><CarFront size={18} /></button>
              <Link to={`/fleet/details/${vehicleId}/3d`} onClick={() => setActiveView('3d')}><button className={activeView === '3d' ? activeViewClasses : inactiveViewClasses} title="3D View"><Orbit size={18} /></button></Link>
              <Link to={`/fleet/details/${vehicleId}/ar`} onClick={() => setActiveView('ar')}><button className={activeView === 'ar' ? activeViewClasses : inactiveViewClasses} title="Gallery / AR View"><Camera size={18} /></button></Link>
            </div>
          </div>
          <button onClick={handleClose} className="tw-absolute tw-border-0 tw-top-3 tw-right-3 sm:tw-top-4 sm:tw-right-4 tw-z-20 tw-text-neutral-600 hover:tw-text-neutral-800 tw-bg-white/70 hover:tw-bg-white tw-p-1.5 tw-rounded-full" aria-label="Close details"><X size={20} /></button>
          <button onClick={() => navigate(-1)} className="tw-absolute tw-border-0 tw-top-3 tw-left-3 sm:tw-top-4 sm:tw-left-4 tw-z-20 tw-text-neutral-800 tw-bg-white tw-shadow-md tw-p-1.5 tw-rounded-lg tw-items-center tw-justify-center tw-flex" aria-label="Back"><ArrowLeft size={20} /></button>

          <div className="tw-flex-grow tw-overflow-y-auto custom-detail-scrollbar tw-pt-16 sm:tw-pt-20 tw-pb-6 tw-px-4 sm:tw-px-6 md:tw-px-8">
            <div className="md:tw-flex md:tw-gap-6 lg:tw-gap-8">
              {/* Left Column */}
              <div className="md:tw-w-[60%] lg:tw-w-[62%] tw-flex tw-flex-col">
                <div className="md:tw-flex md:tw-gap-4 lg:tw-gap-6 tw-mb-5 sm:tw-mb-6">
                  <div className="md:tw-w-1/2 lg:tw-w-[45%]">
                    <h1 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-neutral-900 tw-leading-tight">{vehicleModel.title || 'Vehicle Name'}</h1>
                    <p className="tw-text-md tw-text-neutral-700 tw-mb-3 sm:tw-mb-4">{vehicleModel.vehicle_type?.name || 'Type N/A'}</p>
                    <div className="tw-mb-4 sm:tw-mb-5">
                      <h2 className="tw-flex tw-items-center tw-text-lg tw-font-semibold tw-text-neutral-900 tw-mb-1.5 sm:tw-mb-2">
                        <FileText size={20} className="tw-mr-2 tw-text-neutral-700" />Description
                      </h2>
                      <p className="tw-text-sm tw-text-neutral-700 tw-leading-relaxed tw-break-words">{vehicleModel.description || 'No description available.'}</p>
                    </div>
                    <div className="tw-flex tw-gap-2 sm:tw-gap-3">
                      <Link to={`/booking/${vehicleId}`} className="tw-flex-1">
                        <button className="tw-w-full tw-bg-blue-600 tw-text-white hover:tw-bg-blue-700 tw-font-semibold tw-py-2.5 tw-px-4 sm:tw-px-6 tw-border-0 tw-rounded-lg tw-text-sm tw-transition-colors">Rent Now</button>
                      </Link>
                    </div>
                  </div>
                  <div className="md:tw-w-1/2 lg:tw-w-[calc(55%+2rem)] xl:tw-w-[calc(55%+4rem)] tw-mt-4 md:tw-mt-0 tw-flex tw-items-center tw-justify-center md:-tw-ml-8 lg:-tw-ml-12 xl:-tw-ml-16">
                    <div className="tw-w-full tw-max-w-lg md:tw-max-w-xl lg:tw-max-w-2xl">
                      <img
                        src={mainImage}
                        alt={`${vehicleModel.title || 'Vehicle'} main view`}
                        className="tw-w-full tw-h-auto tw-max-h-[280px] sm:tw-max-h-[340px] md:tw-max-h-[400px] lg:tw-max-h-[460px] tw-object-contain tw-transform tw-scale-105 md:tw-scale-110 lg:tw-scale-125"
                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL; }}
                      />
                    </div>
                  </div>
                </div>
                {/* Specs Grid */}
                <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 md:tw-grid-cols-4 lg:tw-grid-cols-5 tw-gap-2 sm:tw-gap-2.5 tw-text-sm">
                    <SpecItem icon={Shapes} label="Type" value={vehicleModel.vehicle_type?.name} />
                    <SpecItem icon={Disc3} label="Brand" value={vehicleModel.brand} />
                    <SpecItem icon={Feather} label="Model" value={vehicleModel.model_name || vehicleModel.model} /> {/* Fallback to 'model' if 'model_name' not present */}
                    <SpecItem icon={CalendarDays} label="Year" value={vehicleModel.year?.toString()} />
                    <SpecItem icon={Tag} label="Price/Day" value={vehicleModel.base_price_per_day != null ? `$${parseFloat(vehicleModel.base_price_per_day).toFixed(2)}` : 'N/A'} />
                    <SpecItem icon={Fuel} label="Fuel Type" value={vehicleModel.fuel_type} />
                    <SpecItem icon={DoorOpen} label="Doors" value={vehicleModel.number_of_doors?.toString()} />
                    <SpecItem icon={Armchair} label="Seats" value={vehicleModel.number_of_seats?.toString()} />
                    <SpecItem icon={Settings2} label="Transmission" value={vehicleModel.transmission} />
                    <SpecItem icon={Route} label="Mileage" value={vehicleModel.mileage ? `${vehicleModel.mileage.toLocaleString()} km` : undefined} />
                </div>
              </div>

              {/* Right Column: Features & Extras */}
              <div className="md:tw-w-[40%] lg:tw-w-[38%] tw-mt-8 md:tw-mt-0">
                <div className="tw-bg-white/90 tw-p-4 sm:tw-p-5 tw-rounded-lg tw-shadow-lg tw-text-neutral-800 tw-sticky tw-top-4 tw-max-h-[calc(90vh-5rem)] tw-overflow-y-auto custom-detail-scrollbar">
                  {/* Features Section */}
                  {(vehicleModel.features_grouped?.length > 0) ? (
                    <div className="tw-mb-6">
                      <div className="tw-flex tw-justify-between tw-items-center tw-mb-2 tw-cursor-pointer" onClick={() => setFeaturesOpen(!featuresOpen)}>
                        <h2 className="tw-text-xl tw-font-semibold tw-text-neutral-900">Features</h2>
                        <div className="tw-flex tw-items-center">
                          {featureCategories.length > 1 && (
                            <select
                              value={selectedFeatureCategory}
                              onChange={(e) => setSelectedFeatureCategory(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="tw-text-xs tw-bg-neutral-200 tw-text-neutral-700 tw-border tw-border-neutral-300 tw-px-3 tw-py-1.5 tw-rounded-full tw-shadow-sm hover:tw-bg-neutral-300 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 tw-cursor-pointer tw-appearance-none tw-mr-2"
                            >
                              {featureCategories.map(cat => ( <option key={cat} value={cat}>{cat || "General"}</option> ))}
                            </select>
                          )}
                          {featuresOpen ? <ChevronUp size={20} className="tw-text-neutral-500" /> : <ChevronDown size={20} className="tw-text-neutral-500" />}
                        </div>
                      </div>
                      <p className='tw-border-b tw-border-neutral-300 tw-w-full tw-mt-2 tw-mb-3'></p>
                      {featuresOpen && (
                        <div className="tw-space-y-2 sm:tw-space-y-2.5 tw-mt-2 tw-max-h-60 tw-overflow-y-auto custom-detail-scrollbar tw-pr-1">
                          {displayedFeatures.length > 0 ? (
                            displayedFeatures.map(feature => (
                              <div key={feature.id} className="tw-bg-neutral-100 tw-p-2.5 sm:tw-p-3 tw-rounded-md tw-shadow-sm">
                                <p className="tw-text-sm tw-text-neutral-800 tw-font-medium">{feature.name}</p>
                                {feature.description && <p className="tw-text-xs tw-text-neutral-600 tw-mt-0.5 tw-break-words">{feature.description}</p>}
                                {feature.pivot?.notes && <p className="tw-text-xs tw-text-blue-600 tw-italic tw-mt-0.5 tw-break-words">Note: {feature.pivot.notes}</p>}
                              </div>
                            ))
                          ) : (
                            <p className="tw-text-xs tw-text-neutral-500 tw-pl-1">No features listed for this category or selection.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : <p className="tw-text-sm tw-text-neutral-500 tw-mb-6">No features listed for this model.</p>}

                  {/* Possible Extras Section */}
                  {(vehicleModel.extras_available?.length > 0) ? (
                    <div>
                      <div className="tw-flex tw-justify-between tw-items-center tw-mb-2 tw-cursor-pointer" onClick={() => setExtrasOpen(!extrasOpen)}>
                        <h2 className="tw-text-xl tw-font-semibold tw-text-neutral-900">Possible Extras</h2>
                        {extrasOpen ? <ChevronUp size={20} className="tw-text-neutral-500" /> : <ChevronDown size={20} className="tw-text-neutral-500" />}
                      </div>
                      <p className='tw-border-b tw-border-neutral-300 tw-w-full tw-mt-2 tw-mb-3'></p>
                      {extrasOpen && (
                        <div className="tw-space-y-2 sm:tw-space-y-2.5 tw-mt-2 tw-max-h-60 tw-overflow-y-auto custom-detail-scrollbar tw-pr-1">
                          {vehicleModel.extras_available.map(extra => (
                            <div key={extra.id} className="tw-bg-neutral-100 tw-p-2.5 sm:tw-p-3 tw-rounded-md tw-flex tw-justify-between tw-items-start tw-shadow-sm">
                              <div className="tw-flex-grow tw-mr-2">
                                <p className="tw-text-sm tw-text-neutral-800 tw-font-medium">{extra.name}</p>
                                {extra.description && <p className="tw-text-xs tw-text-neutral-600 tw-mt-0.5 tw-break-words">{extra.description}</p>}
                              </div>
                              <p className="tw-text-xs tw-text-neutral-600 tw-flex-shrink-0 tw-pt-0.5">
                                {extra.default_price_per_day != null ? `$${parseFloat(extra.default_price_per_day).toFixed(2)}/day` : 'Price N/A'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : <p className="tw-text-sm tw-text-neutral-500">No optional extras available for this model.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};

export default CarDetailPage;