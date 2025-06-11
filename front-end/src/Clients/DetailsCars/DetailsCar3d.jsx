// src/pages/CarDetails3d.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    CarFront, Orbit, Camera, X, ArrowLeft,
    Loader2, AlertTriangle, Box, RefreshCw, Aperture, ChevronRight // ChevronRight was missing from HEAD's lucide imports
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeftIcon as ChevronLeftHero,
  ChevronRightIcon as ChevronRightHero, // Keeping this if still used, but noticed HEAD used Lucide's ChevronRight
} from '@heroicons/react/24/outline';
import { fetchVehicleModelById } from '../../services/api'; // Adjust path if necessary

const DEFAULT_FALLBACK_IMAGE_URL = '/images/Cars/placeholder_3d.png';

const scrollbarStyles = `
  .custom-detail-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
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

export default function CarDetails3d() {
  const { vehicleId } = useParams(); // This is vehicle_model_id
  const navigate = useNavigate();

  const [vehicleModel, setVehicleModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeView, setActiveView] = useState('3d'); // Default to '3d' for this page
  const [selectedColorHex, setSelectedColorHex] = useState(null);

  const [currentMediaSet, setCurrentMediaSet] = useState([]); // Thumbnails based on color
  const [mainDisplayImage, setMainDisplayImage] = useState(DEFAULT_FALLBACK_IMAGE_URL);
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (vehicleId) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        setVehicleModel(null);
        try {
          const response = await fetchVehicleModelById(vehicleId);
          // Standardize response data access
          const modelData = response.data?.data || response.data;
          if (modelData && typeof modelData === 'object' && !Array.isArray(modelData)) {
            setVehicleModel(modelData);
            if (modelData.available_colors && modelData.available_colors.length > 0) {
              setSelectedColorHex(modelData.available_colors[0].hex);
            } else {
              setSelectedColorHex(null);
            }
          } else {
            throw new Error("Vehicle model data not found or in unexpected format in API response.");
          }
        } catch (err) {
          console.error("Error fetching 3D details:", err);
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
    return vehicleModel?.available_colors || [];
  }, [vehicleModel]);

  useEffect(() => {
    if (!vehicleModel || !vehicleModel.all_media) {
      setCurrentMediaSet([]);
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
    setCurrentMediaSet(mediaForCurrentColor);
    setCurrentThumbnailIndex(0);
  }, [vehicleModel, selectedColorHex]);

  useEffect(() => {
    if (currentMediaSet.length > 0 && currentMediaSet[currentThumbnailIndex]) {
      setMainDisplayImage(currentMediaSet[currentThumbnailIndex].url);
    } else if (currentMediaSet.length > 0) {
      setMainDisplayImage(currentMediaSet[0].url);
      setCurrentThumbnailIndex(0);
    } else {
      setMainDisplayImage(DEFAULT_FALLBACK_IMAGE_URL);
    }
  }, [currentMediaSet, currentThumbnailIndex]);

  // --- HANDLERS ---
  const handleColorSelect = useCallback((colorHex) => {
    setSelectedColorHex(colorHex);
  }, []);

  const handleThumbnailClick = useCallback((index) => {
    setCurrentThumbnailIndex(index);
  }, []);

  const handleNavigateThumbnails = useCallback((direction) => {
    if (!currentMediaSet || currentMediaSet.length === 0) return;
    setCurrentThumbnailIndex(prevIndex => {
      const newIndex = direction === 'next'
        ? (prevIndex + 1) % currentMediaSet.length
        : (prevIndex - 1 + currentMediaSet.length) % currentMediaSet.length;
      return newIndex;
    });
  }, [currentMediaSet]);

  const handleClose = useCallback(() => navigate(`/fleet/details/${vehicleId}`), [navigate, vehicleId]);
  const handleExitToFleet = useCallback(() => navigate('/fleet'), [navigate]);

  // --- STYLES ---
  // Using HEAD's definition and ensuring 'tw-' prefix
  const commonTopButtonClasses = "tw-p-1.5 sm:tw-p-2 tw-rounded-full tw-border-0 tw-w-8 tw-h-8 sm:tw-w-9 sm:tw-h-9 tw-flex tw-items-center tw-justify-center tw-transition-colors tw-shadow-sm";
  const activeViewClasses = `${commonTopButtonClasses} tw-bg-white tw-text-black`; // Simplified from HEAD
  const inactiveViewClasses = `${commonTopButtonClasses} tw-text-white hover:tw-bg-neutral-500/50`; // Simplified from HEAD


  // --- RENDER LOGIC ---
  if (loading) {
    return (
      <div className="tw-fixed tw-inset-0 tw-bg-white/[0.5] tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[997] tw-p-4">
        <div className="tw-bg-[#FFFFFFCC] tw-p-10 tw-rounded-xl tw-shadow-2xl tw-flex tw-flex-col tw-items-center">
          <Loader2 size={48} className="tw-animate-spin tw-text-blue-600 tw-mb-4" />
          <p className="tw-text-lg tw-font-semibold tw-text-neutral-700">Loading 3D View...</p>
        </div>
      </div>
    );
  }
  if (error || !vehicleModel) {
    return (
      <div className="tw-fixed tw-inset-0 tw-bg-white/[0.5] tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[997] tw-p-4">
        <div className="tw-bg-red-50 tw-p-10 tw-rounded-xl tw-shadow-2xl tw-flex tw-flex-col tw-items-center tw-text-red-700">
          <AlertTriangle size={48} className="tw-text-red-500 tw-mb-4" />
          <p className="tw-text-lg tw-font-semibold tw-mb-2">Error</p>
          <p className="tw-text-sm tw-text-center tw-mb-6">{error || "Vehicle data could not be loaded."}</p>
          <button onClick={() => navigate('/fleet')} className="tw-bg-red-600 hover:tw-bg-red-700 tw-text-white tw-font-semibold tw-py-2 tw-px-6 tw-rounded-lg">Return to Fleet</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      {/* Overall modal structure from HEAD */}
      <div className="tw-fixed tw-h-full tw-inset-0 tw-bg-white/[0.9] tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[999] tw-p-2 sm:tw-p-4 tw-font-sans">
        <div className="tw-bg-[#FFFFFF] tw-text-neutral-800 tw-rounded-xl sm:tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-5xl xl:tw-max-w-7xl tw-max-h-[95vh] tw-flex tw-flex-col tw-relative overflow-hidden">
          {/* Top Bar (merged) */}
          <button
            onClick={handleClose}
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
            {/* Current page's button */}
            <button onClick={() => setActiveView('3d')} className={activeView === '3d' ? activeViewClasses : inactiveViewClasses} title="3D View">
              <Orbit size={16} />
            </button>
            <Link to={`/fleet/details/${vehicleId}/ar`}>
              <button onClick={() => setActiveView('ar')} className={activeView === 'ar' ? activeViewClasses : inactiveViewClasses} title="Gallery / AR">
                <Camera size={16} />
              </button>
            </Link>
          </div>

          <button
            onClick={handleExitToFleet}
            className="tw-absolute tw-top-3 sm:tw-top-4 tw-right-3 sm:tw-right-4 tw-z-20 tw-text-neutral-500 hover:tw-text-neutral-700 tw-bg-white/70 hover:tw-bg-white tw-p-1.5 tw-rounded-full tw-shadow-md tw-transition-colors" // Added rounded-full & shadow
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Main Content Grid (from HEAD, adapted) */}
          <div className="tw-flex-grow tw-grid tw-grid-cols-12 tw-gap-4 sm:tw-gap-6 tw-items-stretch tw-pt-16 sm:tw-pt-20 tw-pb-6 tw-px-4 sm:tw-px-8 tw-overflow-y-auto custom-detail-scrollbar">
            {/* Left Panel */}
            <div className="tw-col-span-12 lg:tw-col-span-4 tw-flex tw-flex-col tw-justify-between">
              <div>
                <h1 className="tw-text-2xl sm:tw-text-3xl lg:tw-text-4xl tw-font-semibold tw-text-gray-800 tw-tracking-tight">
                  {vehicleModel.title || "Vehicle Name"}
                </h1>
                <p className="tw-text-base sm:tw-text-md lg:tw-text-lg tw-text-gray-500 tw-mt-1">
                  {vehicleModel.vehicle_type?.name || "Vehicle Type"}
                </p>
              </div>
              {/* Small image preview in left panel */}
              <div className="tw-bg-gray-100/70 tw-rounded-xl tw-shadow-md tw-mt-4 sm:tw-mt-6 tw-mb-4 sm:tw-mb-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-2">
                <div className="tw-p-3 sm:tw-p-4 tw-w-full tw-max-w-xs tw-aspect-[4/3] tw-flex tw-flex-col tw-items-center tw-justify-center">
                  <img
                    src={mainDisplayImage}
                    alt={`${vehicleModel.title} preview`}
                    className="tw-max-w-full tw-max-h-[120px] sm:tw-max-h-[150px] tw-object-contain"
                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL; }}
                  />
                </div>
                <p className="tw-text-xs tw-text-gray-500 tw-mt-1 tw-text-center tw-px-2">
                  {selectedColorHex ? availableColorsFromAPI.find(c => c.hex === selectedColorHex)?.name : ""} 3D View
                </p>
              </div>
              {/* Optional 3D controls from 9fe version */}
              <div className="tw-flex tw-justify-center tw-space-x-5 sm:tw-space-x-6 tw-pt-2 sm:tw-pt-4">
                  <button className="tw-text-gray-500 hover:tw-text-blue-600 tw-transition-colors" title="3D Model View Options"><Box size={20} /></button>
                  <button className="tw-text-gray-500 hover:tw-text-blue-600 tw-transition-colors" title="Toggle 360 Spin"><RefreshCw size={20} /></button>
                  <button className="tw-text-gray-500 hover:tw-text-blue-600 tw-transition-colors" title="More Views/Hotspots"><Aperture size={20} /></button>
              </div>
            </div>

            {/* Center Panel: Main "3D" View (Image) & Thumbnails */}
            <div className="tw-col-span-12 lg:tw-col-span-7 tw-flex tw-flex-col tw-items-center tw-justify-center tw-relative -tw-mt-4 lg:tw-mt-0">
              <div className="
                  tw-w-full 
                  tw-aspect-video sm:tw-aspect-[16/9] /* Adjusted aspect for more landscape */
                  tw-max-h-[calc(95vh-220px)] /* Adjusted max-height calculation */
                  md:tw-max-h-[500px] 
                  lg:tw-max-h-[550px]
                  tw-mb-2 sm:tw-mb-3 
                  tw-flex tw-items-center tw-justify-center 
                  tw-bg-gray-100/50 tw-rounded-lg tw-overflow-hidden tw-shadow-inner">
                {/* For an actual 3D model, you'd replace this img with a 3D viewer component (e.g., react-three-fiber, model-viewer) */}
                <img
                    src={mainDisplayImage}
                    alt={`${vehicleModel.title} - ${selectedColorHex ? availableColorsFromAPI.find(c=>c.hex === selectedColorHex)?.name : 'Interactive View'}`}
                    className="tw-max-w-full tw-max-h-full tw-object-contain tw-transition-all tw-duration-300 tw-ease-in-out"
                    key={mainDisplayImage}
                    onError={(e) => {e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL;}}
                />
              </div>
              {/* Thumbnails */}
              {currentMediaSet.length > 0 && (
                  <div className="tw-flex tw-items-center tw-space-x-1 sm:tw-space-x-2 tw-px-2 tw-py-1.5 tw-backdrop-blur-sm tw-bg-white/80 tw-rounded-lg tw-shadow-md tw-mt-1 tw-max-w-full">
                      <button
                          onClick={() => handleNavigateThumbnails('prev')}
                          className="tw-p-1.5 sm:tw-p-2 tw-rounded-full tw-border-0 hover:tw-bg-gray-200/80 focus:tw-bg-gray-300/80 tw-transition-colors tw-text-gray-600 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed"
                          aria-label="Previous Image"
                          disabled={currentMediaSet.length <= 1}
                      >
                          <ChevronLeftHero className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5" />
                      </button>
                      <div className="tw-flex tw-space-x-1.5 sm:tw-space-x-2 tw-overflow-x-auto tw-p-1 tw-max-w-[calc(100vw-200px)] xs:tw-max-w-[240px] sm:tw-max-w-[320px] md:tw-max-w-[400px] custom-detail-scrollbar">
                          {currentMediaSet.map((media, index) => (
                          <button
                              key={media.id || index}
                              onClick={() => handleThumbnailClick(index)}
                              className={`tw-flex-shrink-0 tw-w-12 tw-bg-white tw-border tw-border-gray-300 tw-h-10 sm:tw-w-14 sm:tw-h-11 md:tw-w-16 md:tw-h-12 tw-rounded-md tw-transition-all tw-duration-150 tw-overflow-hidden hover:tw-border-blue-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-400 focus:tw-ring-offset-1
                                          ${index === currentThumbnailIndex ? 'tw-border-blue-500 tw-ring-2 tw-ring-blue-500 tw-ring-offset-1 tw-scale-105 tw-shadow-lg' : 'hover:tw-border-gray-400'}`}
                          >
                              <img src={media.url || DEFAULT_FALLBACK_IMAGE_URL} alt={media.caption || `View ${index + 1}`} className="tw-w-full tw-h-full tw-object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL; }} />
                          </button>
                          ))}
                      </div>
                      <button
                          onClick={() => handleNavigateThumbnails('next')}
                          className="tw-p-1.5 sm:tw-p-2 tw-border-0 tw-rounded-full hover:tw-bg-gray-200/80 focus:tw-bg-gray-300/80 tw-transition-colors tw-text-gray-600 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed"
                          aria-label="Next Image"
                          disabled={currentMediaSet.length <= 1}
                      >
                           {/* Using Lucide ChevronRight to match HEAD version's lucide imports */}
                          <ChevronRight className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5" />
                      </button>
                  </div>
              )}
               {currentMediaSet.length === 0 && !loading && (
                  <p className="tw-text-sm tw-text-gray-500 tw-mt-4">No preview images available for this selection.</p>
               )}
            </div>

            {/* Right Panel: Color Selection */}
            {availableColorsFromAPI.length > 0 && (
              <div className="tw-col-span-12 lg:tw-col-span-1 tw-flex lg:tw-flex-col tw-justify-center lg:tw-justify-start tw-items-center tw-space-x-2 lg:tw-space-x-0 lg:tw-space-y-3 tw-pt-4 lg:tw-pt-20">
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
            {/* Placeholder for grid structure if no colors */}
            {availableColorsFromAPI.length === 0 && (
                <div className="lg:col-span-1"></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}