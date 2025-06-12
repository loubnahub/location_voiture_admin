// src/pages/CarGalleryPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CarFront, Orbit, Camera, X, ArrowLeft,
  Loader2, AlertTriangle
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeftIcon as ChevronLeftHero,
  ChevronRightIcon as ChevronRightHero,
  DocumentTextIcon as DocumentTextOutlineIcon, // From CarProductPage
} from '@heroicons/react/24/outline';
import { fetchPublicVehicleModelById  } from '../../services/api'; // Adjust path if necessary

const DEFAULT_FALLBACK_IMAGE_URL = '/images/Cars/1.jpg'; // Unified placeholder

const scrollbarStyles = `
  .custom-detail-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px; /* Added height for horizontal scrollbars */
  }
  .custom-detail-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }
  .custom-detail-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  .custom-detail-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.4);
  }
  .custom-detail-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
  }
`;

export default function CarGalleryPage() {
  const { vehicleId } = useParams(); // This is vehicle_model_id
  const navigate = useNavigate();

  const [vehicleModel, setVehicleModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeView, setActiveView] = useState('ar'); // 'ar' for gallery/AR page
  const [selectedColorHex, setSelectedColorHex] = useState(null);

  const [currentGalleryMedia, setCurrentGalleryMedia] = useState([]);
  const [mainDisplayImage, setMainDisplayImage] = useState(DEFAULT_FALLBACK_IMAGE_URL);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (vehicleId) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        setVehicleModel(null);
        try {
          const response = await fetchPublicVehicleModelById(vehicleId);
          if (response.data && response.data.data) {
            const modelData = response.data.data;
            setVehicleModel(modelData);
            if (modelData.available_colors_from_model && modelData.available_colors_from_model.length > 0) {
              setSelectedColorHex(modelData.available_colors_from_model[0].hex);
            } else {
              setSelectedColorHex(null);
            }
          } else {
            throw new Error("Vehicle model data not found in API response.");
          }
        } catch (err) {
          console.error("Error fetching gallery page details:", err);
          let errMsg = "Failed to load vehicle details.";
          if (err.response?.data?.message) errMsg = err.response.data.message;
          else if (err.message) errMsg = err.message;
          setError(errMsg);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [vehicleId]);

  // --- DERIVED DATA & IMAGE LOGIC ---
  const availableColorsFromAPI = useMemo(() => {
    return vehicleModel?.available_colors_from_model || [];
  }, [vehicleModel]);

  useEffect(() => {
    if (!vehicleModel || !vehicleModel.all_media) {
      setCurrentGalleryMedia([]);
      return;
    }
    let mediaForCurrentColor = [];
    if (selectedColorHex) {
      mediaForCurrentColor = vehicleModel.all_media.filter(
        m => m.color_hex && m.color_hex.toLowerCase() === selectedColorHex.toLowerCase()
      );
    }
    if (mediaForCurrentColor.length === 0) {
        mediaForCurrentColor = vehicleModel.all_media.filter(m => m.is_cover || !m.color_hex);
        if (mediaForCurrentColor.length === 0 && vehicleModel.all_media.length > 0) {
            mediaForCurrentColor = [vehicleModel.all_media[0]];
        }
    }
    mediaForCurrentColor.sort((a, b) => (a.order || 0) - (b.order || 0));
    setCurrentGalleryMedia(mediaForCurrentColor);
    setCurrentGalleryIndex(0);
  }, [vehicleModel, selectedColorHex]);

  useEffect(() => {
    if (currentGalleryMedia.length > 0 && currentGalleryMedia[currentGalleryIndex]) {
      setMainDisplayImage(currentGalleryMedia[currentGalleryIndex].url);
    } else if (currentGalleryMedia.length > 0) {
      setMainDisplayImage(currentGalleryMedia[0].url);
      setCurrentGalleryIndex(0);
    } else {
      setMainDisplayImage(DEFAULT_FALLBACK_IMAGE_URL);
    }
  }, [currentGalleryMedia, currentGalleryIndex]);

  // --- HANDLERS ---
  const handleColorSelect = useCallback((colorHex) => {
    setSelectedColorHex(colorHex);
  }, []);

  const handleThumbnailClick = useCallback((index) => {
    setCurrentGalleryIndex(index);
  }, []);

  const handleNavigateThumbnails = useCallback((direction) => {
    if (!currentGalleryMedia || currentGalleryMedia.length === 0) return;
    setCurrentGalleryIndex(prevIndex => {
      const newIndex = direction === 'next'
        ? (prevIndex + 1) % currentGalleryMedia.length
        : (prevIndex - 1 + currentGalleryMedia.length) % currentGalleryMedia.length;
      return newIndex;
    });
  }, [currentGalleryMedia]);

  const handleCloseToDetails = useCallback(() => navigate(`/fleet/details/${vehicleId}`), [navigate, vehicleId]);
  const handleExitToFleet = useCallback(() => navigate('/fleet'), [navigate]);

  // --- STYLES (Merging and standardizing) ---
  const commonTopButtonClasses = "tw-p-1.5 sm:tw-p-2 tw-rounded-full tw-w-8 tw-h-8 sm:tw-w-9 sm:tw-h-9 tw-flex tw-items-center tw-justify-center tw-transition-colors tw-shadow-sm";
  const activeViewClasses = `${commonTopButtonClasses} tw-bg-white tw-text-black`;
  const inactiveViewClasses = `${commonTopButtonClasses} tw-text-white hover:tw-bg-neutral-500/50`;


  // --- RENDER LOGIC ---
  if (loading) {
    return (
      <div className="tw-fixed tw-inset-0 tw-bg-white/50 tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[997] tw-p-4">
        <div className="tw-bg-white/80 tw-p-8 sm:tw-p-10 tw-rounded-xl tw-shadow-2xl tw-flex tw-flex-col tw-items-center">
          <Loader2 size={48} className="tw-animate-spin tw-text-blue-600 tw-mb-4" />
          <p className="tw-text-lg tw-font-semibold tw-text-neutral-700">Loading Gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicleModel) {
    return (
      <div className="tw-fixed tw-inset-0 tw-bg-white/50 tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[997] tw-p-4">
        <div className="tw-bg-red-50/80 tw-p-8 sm:tw-p-10 tw-rounded-xl tw-shadow-2xl tw-flex tw-flex-col tw-items-center tw-text-red-700">
          <AlertTriangle size={48} className="tw-text-red-500 tw-mb-4" />
          <p className="tw-text-lg tw-font-semibold tw-mb-2">Error</p>
          <p className="tw-text-sm tw-text-center tw-mb-6">{error || "Vehicle data could not be loaded."}</p>
          <button
            onClick={handleExitToFleet}
            className="tw-bg-red-600 hover:tw-bg-red-700 tw-text-white tw-font-semibold tw-py-2.5 tw-px-6 tw-rounded-lg tw-transition-colors"
          >
            Return to Fleet
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="tw-fixed tw-inset-0 tw-bg-white/[0.9] tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[999] tw-p-2 sm:tw-p-4 tw-font-sans">
        <div className="tw-bg-white tw-text-neutral-800 tw-rounded-xl sm:tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-6xl xl:tw-max-w-7xl tw-max-h-[95vh] tw-flex tw-flex-col tw-relative overflow-hidden">
          {/* Top Bar */}
          <button
            onClick={handleCloseToDetails}
            className="tw-absolute tw-top-3 sm:tw-top-4 tw-left-3 sm:tw-left-4 tw-z-20 tw-text-neutral-700 tw-bg-white/80 hover:tw-bg-gray-200/90 tw-p-2 sm:tw-p-2.5 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-shadow-md tw-transition-colors"
            aria-label="Back to Details"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="tw-absolute tw-top-3 sm:tw-top-4 tw-left-1/2 tw-transform -tw-translate-x-1/2 tw-z-10 tw-flex tw-items-center tw-gap-1.5 sm:tw-gap-2 tw-bg-neutral-700/70 tw-backdrop-blur-sm tw-p-1 sm:tw-p-1.5 tw-rounded-full tw-shadow-lg">
            <Link to={`/fleet/details/${vehicleId}`}>
              <button onClick={() => setActiveView('details')} className={activeView === 'details' ? activeViewClasses : inactiveViewClasses} title="Details">
                <CarFront size={16} />
              </button>
            </Link>
            <Link to={`/fleet/details/${vehicleId}/3d`}>
              <button onClick={() => setActiveView('3d')} className={activeView === '3d' ? activeViewClasses : inactiveViewClasses} title="3D View">
                <Orbit size={16} />
              </button>
            </Link>
            {/* Current page button */}
             <button onClick={() => setActiveView('ar')} className={activeView === 'ar' ? activeViewClasses : inactiveViewClasses} title="Gallery / AR">
                <Camera size={16} />
            </button>
          </div>

          <button
            onClick={handleExitToFleet}
            className="tw-absolute tw-top-3 sm:tw-top-4 tw-right-3 sm:tw-right-4 tw-z-20 tw-text-neutral-600 hover:tw-text-neutral-800 tw-bg-white/70 hover:tw-bg-white p-1.5 tw-rounded-full tw-shadow-md tw-transition-colors"
            aria-label="Close and return to fleet"
          >
            <X size={20} />
          </button>

          {/* Main Content Grid */}
          <div className="tw-flex-grow tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-4 sm:tw-gap-6 tw-items-start tw-pt-16 sm:tw-pt-20 tw-pb-6 tw-px-4 sm:tw-px-6 md:tw-px-8 overflow-y-auto custom-detail-scrollbar">
            {/* Left Panel: Info */}
            <div className="lg:tw-col-span-4 xl:tw-col-span-3 tw-space-y-4 lg:tw-sticky lg:tw-top-4 self-start">
              <h1 className="tw-text-2xl sm:tw-text-3xl font-bold tw-text-gray-800">
                  {vehicleModel.title || "Vehicle Name"}
              </h1>
              <p className="tw-text-gray-500 tw-text-sm sm:tw-text-base">{vehicleModel.vehicle_type?.name || "Vehicle Type"}</p>
              
              <div className="tw-flex tw-items-start tw-space-x-2 tw-text-gray-700 tw-pt-2">
                  <DocumentTextOutlineIcon className="tw-w-5 tw-h-5 tw-mt-0.5 tw-flex-shrink-0 tw-text-gray-500" />
                  <span className="tw-text-sm sm:tw-text-base tw-font-medium">Description</span>
              </div>
              <p className="tw-text-gray-600 tw-text-xs sm:tw-text-sm tw-leading-relaxed tw-max-h-40 sm:tw-max-h-48 tw-overflow-y-auto custom-detail-scrollbar tw-pr-1">
                  {vehicleModel.description || "No description available for this model."}
              </p>
              
              <div className="tw-flex tw-space-x-3 tw-pt-3">
                  <Link to={`/booking/${vehicleId}`}> {/* vehicleId is model_id */}
                      <button className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-px-4 sm:tw-px-5 tw-py-2 sm:tw-py-2.5 tw-rounded-lg tw-text-xs sm:tw-text-sm tw-font-medium tw-transition-colors">Rent Now</button>
                  </Link>
                  <button className="tw-bg-gray-200 hover:tw-bg-gray-300 tw-text-gray-700 tw-px-4 sm:tw-px-5 tw-py-2 sm:tw-py-2.5 tw-rounded-lg tw-text-xs sm:tw-text-sm tw-font-medium tw-transition-colors">Review</button>
              </div>
            </div>

            {/* Center Panel: Main Image and Thumbnails */}
            <div className="lg:tw-col-span-7 xl:tw-col-span-8 tw-flex tw-flex-col tw-items-center tw-relative">
                <div className="tw-w-full tw-aspect-[16/10] sm:tw-aspect-[16/9] tw-mb-3 sm:tw-mb-4 tw-flex tw-items-center tw-justify-center tw-bg-gray-100/70 tw-rounded-lg tw-shadow-inner tw-overflow-hidden">
                    <img
                        src={mainDisplayImage}
                        alt={`${vehicleModel.title} - ${selectedColorHex ? availableColorsFromAPI.find(c=>c.hex === selectedColorHex)?.name : 'Gallery view'}`}
                        className="tw-w-full tw-h-full tw-max-h-[65vh] lg:tw-max-h-[70vh] tw-object-contain tw-transition-opacity tw-duration-300"
                        key={mainDisplayImage}
                        onError={(e) => {e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL;}}
                    />
                </div>
                {/* Thumbnails Gallery */}
                {currentGalleryMedia.length > 0 && (
                    <div className="tw-flex tw-items-center tw-space-x-1 sm:tw-space-x-3 tw-p-2 -tw-mt-1 tw-z-10 tw-bg-white/80 tw-backdrop-blur-sm tw-rounded-lg tw-shadow-md tw-max-w-full">
                        <button
                            onClick={() => handleNavigateThumbnails('prev')}
                            className="tw-p-1.5 sm:tw-p-2 tw-rounded-full hover:tw-bg-gray-200/70 tw-transition-colors tw-shadow-sm tw-border tw-border-gray-200/50 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed"
                            aria-label="Previous image"
                            disabled={currentGalleryMedia.length <= 1}
                        >
                            <ChevronLeftHero className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5 tw-text-gray-600" />
                        </button>
                        
                        <div className="tw-flex tw-space-x-1.5 sm:tw-space-x-2 tw-overflow-x-auto tw-p-1 tw-max-w-[calc(100vw-180px)] sm:tw-max-w-[320px] md:tw-max-w-[400px] lg:tw-max-w-[500px] custom-detail-scrollbar">
                            {currentGalleryMedia.map((media, index) => (
                                <button
                                    key={media.id || index}
                                    onClick={() => handleThumbnailClick(index)}
                                    className={`tw-flex-shrink-0 tw-w-12 tw-h-10 sm:tw-w-16 sm:tw-h-12 md:tw-w-20 md:tw-h-14 tw-rounded-md tw-border-2 tw-transition-all tw-duration-150 tw-overflow-hidden hover:tw-opacity-80
                                                ${index === currentGalleryIndex ? 'tw-border-blue-500 tw-ring-1 tw-ring-blue-500 tw-ring-offset-1 tw-scale-105' : 'tw-border-gray-300 hover:tw-border-gray-400'}`}
                                >
                                    <img
                                        src={media.url || DEFAULT_FALLBACK_IMAGE_URL}
                                        alt={media.caption || `Thumbnail ${index + 1}`}
                                        className="tw-w-full tw-h-full tw-object-cover"
                                        onError={(e) => {e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL;}}
                                    />
                                </button>
                            ))}
                        </div>
                      
                        <button
                            onClick={() => handleNavigateThumbnails('next')}
                            className="tw-p-1.5 sm:tw-p-2 tw-rounded-full hover:tw-bg-gray-200/70 tw-transition-colors tw-shadow-sm tw-border tw-border-gray-200/50 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed"
                            aria-label="Next image"
                            disabled={currentGalleryMedia.length <= 1}
                        >
                            <ChevronRightHero className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5 tw-text-gray-600" />
                        </button>
                    </div>
                )}
                 {currentGalleryMedia.length === 0 && !loading && (
                    <p className="tw-text-sm tw-text-gray-500 tw-mt-4">No images available for this selection.</p>
                 )}
            </div>

            {/* Right Panel: Color Selection */}
            {availableColorsFromAPI.length > 0 && (
                <div className="lg:tw-col-span-1 xl:tw-col-span-1 tw-flex lg:tw-flex-col tw-justify-center lg:tw-justify-start tw-items-center tw-space-x-2 lg:tw-space-x-0 lg:tw-space-y-3 tw-pt-4 lg:tw-pt-8"> {/* Adjusted lg:pt */}
                    {availableColorsFromAPI.map((color) => (
                    <button
                        key={color.hex}
                        onClick={() => handleColorSelect(color.hex)}
                        className={`tw-w-7 tw-h-7 sm:tw-w-8 sm:tw-h-8 md:tw-w-9 md:tw-h-9 tw-rounded-lg tw-border-2 tw-transition-all tw-transform hover:tw-scale-110 focus:tw-outline-none
                        ${selectedColorHex === color.hex ? 'tw-ring-2 tw-ring-offset-2 tw-ring-blue-500 tw-shadow-md tw-scale-110' : 'tw-border-gray-300 hover:tw-border-gray-400'}
                        ${color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#fff' ? 'tw-border-gray-400' : 'tw-border-transparent'} 
                        `}
                        aria-label={`Select ${color.name} color`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                    >
                        {selectedColorHex === color.hex && (color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#fff') && (
                        <svg className="tw-w-3 tw-h-3 sm:tw-w-4 sm:tw-h-4 tw-text-blue-600 tw-m-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        )}
                        {selectedColorHex === color.hex && color.hex.toLowerCase() !== '#ffffff' && color.hex.toLowerCase() !== '#fff' && (
                             <div className="tw-w-2 tw-h-2 sm:tw-w-2.5 sm:tw-h-2.5 tw-rounded-full tw-bg-white/70 tw-m-auto tw-shadow-inner"></div>
                        )}
                    </button>
                    ))}
                </div>
            )}
            {/* If no colors, this column might be empty or you could add a placeholder */}
            {availableColorsFromAPI.length === 0 && (
                <div className="lg:tw-col-span-1"></div> // Placeholder to maintain grid structure
            )}
          </div>
        </div>
      </div>
    </>
  );
}