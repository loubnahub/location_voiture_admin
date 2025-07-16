// src/pages/CarDetails3d.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    CarFront, Orbit, Camera, X, ArrowLeft,
    Loader2, AlertTriangle, Box, RefreshCw, Aperture, ChevronRight
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeftIcon as ChevronLeftHero,
  ChevronRightIcon as ChevronRightHero,
} from '@heroicons/react/24/outline';
import { fetchPublic3dVehicleModelById } from '../../services/api';
import ThreeDModelViewer from './ThreeDModelCar'; // Make sure this path is correct

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

const environmentPresets = ['city', 'sunset', 'apartment', 'studio', 'warehouse'];

export default function CarDetails3d() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const mainViewerRef = useRef(); 

  const [vehicleModel, setVehicleModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('3d');
  const [selectedColorHex, setSelectedColorHex] = useState(null);

  const [modelSrc, setModelSrc] = useState(null);
  const [currentGalleryMedia, setCurrentGalleryMedia] = useState([]);
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);

  const [isSpinning, setIsSpinning] = useState(true);
  const [environmentIndex, setEnvironmentIndex] = useState(0);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (vehicleId) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetchPublic3dVehicleModelById(vehicleId);
          const modelData = response.data?.data || response.data;
          if (modelData && typeof modelData === 'object') {
            setVehicleModel(modelData);
            if (modelData.available_colors_from_model && modelData.available_colors_from_model.length > 0) {
              setSelectedColorHex(modelData.available_colors_from_model[0].hex);
            } else {
              setSelectedColorHex(null);
            }
          } else { throw new Error("Vehicle model data not found in API response."); }
        } catch (err) {
          console.error("Error fetching 3D details:", err);
          setError(err.message || "Failed to load vehicle details.");
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [vehicleId]);

  // --- DERIVED DATA & MEDIA LOGIC ---
  const availableColorsFromAPI = useMemo(() => {
    return vehicleModel?.available_colors_from_model || [];
  }, [vehicleModel]);

  useEffect(() => {
    if (!vehicleModel?.all_media) { return; }
    let mediaForColor = [];
    if (selectedColorHex) {
      mediaForColor = vehicleModel.all_media.filter(m => m.color_hex && m.color_hex.toLowerCase() === selectedColorHex.toLowerCase());
    }
    if (mediaForColor.length === 0) {
      const coverImage = vehicleModel.all_media.find(m => m.is_cover);
      if (coverImage?.color_hex) {
          mediaForColor = vehicleModel.all_media.filter(m => m.color_hex && m.color_hex.toLowerCase() === coverImage.color_hex.toLowerCase());
      }
    }
    if (mediaForColor.length === 0) { mediaForColor = vehicleModel.all_media; }
    mediaForColor.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const threeDModel = mediaForColor.find(m => m.media_type === '3d_model_glb');
    const imageGallery = mediaForColor.filter(m => m.media_type === 'image');
    
    setModelSrc(threeDModel ? threeDModel.url : null);
    setCurrentGalleryMedia(imageGallery);
    setCurrentThumbnailIndex(0); // Always default to the first position
  }, [vehicleModel, selectedColorHex]);

  // --- HANDLERS ---
  const handleColorSelect = useCallback((colorHex) => { setSelectedColorHex(colorHex); }, []);
  const handleThumbnailClick = useCallback((index) => { setCurrentThumbnailIndex(index); }, []);

  // [THE FIX] Navigation is now only for the image gallery.
  const handleNavigateThumbnails = useCallback((direction) => {
    const totalItems = currentGalleryMedia.length;
    if (totalItems <= 1) return;
    
    let newIndex;
    if (direction === 'next') {
        newIndex = (currentThumbnailIndex + 1) % totalItems;
    } else {
        newIndex = (currentThumbnailIndex - 1 + totalItems) % totalItems;
    }
    setCurrentThumbnailIndex(newIndex);
  }, [currentGalleryMedia.length, currentThumbnailIndex]);

  const handleCloseToDetails = useCallback(() => navigate(`/fleet/details/${vehicleId}`), [navigate, vehicleId]);
  const handleExitToFleet = useCallback(() => navigate('/fleet'), [navigate]);

  const handleToggleSpin = useCallback(() => { setIsSpinning(prev => !prev); }, []);
  const handleResetCamera = useCallback(() => { mainViewerRef.current?.resetCamera(); }, []);
  const handleCycleEnvironment = useCallback(() => { setEnvironmentIndex(prevIndex => (prevIndex + 1) % environmentPresets.length); }, []);

  // --- [THE FIX] Main Display Logic now ONLY handles images ---
  const mainDisplayContent = useMemo(() => {
    const activeImage = currentGalleryMedia[currentThumbnailIndex];
    if (activeImage) {
      return <img src={activeImage.url} key={activeImage.id} alt={activeImage.caption || 'Vehicle view'} className="tw-max-w-full tw-max-h-full tw-object-contain" onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL; }}/>;
    }
    // This now correctly shows when a color has a 3D model but no images.
    return <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-h-full"><p className="tw-text-neutral-500">No photos available for this selection.</p></div>;
  }, [currentGalleryMedia, currentThumbnailIndex]);

  // --- RENDER LOGIC ---
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
            <button onClick={handleCloseToDetails} className="tw-bg-red-600 hover:tw-bg-red-700 tw-text-white tw-font-semibold tw-py-2 tw-px-6 tw-rounded-lg tw-transition-colors">Return to Fleet</button>
          </div>
        </div>
      );
    }
    if (!vehicleModel) { // This case should ideally be caught by error state if API fails
      return (
          <div className="tw-fixed tw-inset-0 tw-bg-white/[0.5] tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[999] tw-p-2 sm:tw-p-4">
            <p className="tw-text-lg tw-text-neutral-700">Vehicle not found or data is unavailable.</p>
            <button onClick={handleCloseToDetails} className="tw-ml-4 tw-text-blue-600 hover:tw-underline">Go Back</button>
          </div>
      );
    }
  const commonTopButtonClasses = "tw-p-1.5 sm:tw-p-2 tw-rounded-full tw-border-0 tw-w-8 tw-h-8 sm:tw-w-9 sm:tw-h-9 tw-flex tw-items-center tw-justify-center tw-transition-colors tw-shadow-sm";
  const activeViewClasses = `${commonTopButtonClasses} tw-bg-white tw-text-black`;
  const inactiveViewClasses = `${commonTopButtonClasses} tw-text-white hover:tw-bg-neutral-500/50`;
  const commonThumbnailClasses = `tw-flex-shrink-0 tw-w-12 tw-bg-white tw-border tw-border-gray-300 tw-h-10 sm:tw-w-14 sm:tw-h-11 md:tw-w-16 md:tw-h-12 tw-rounded-md tw-transition-all tw-duration-150 tw-overflow-hidden hover:tw-border-blue-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-400 focus:tw-ring-offset-1`;
  const activeThumbnailClasses = `tw-border-blue-500 tw-ring-2 tw-ring-blue-500 tw-ring-offset-1 tw-scale-105 tw-shadow-lg`;
  const inactiveThumbnailClasses = `hover:tw-border-gray-400`;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="tw-fixed tw-h-full tw-inset-0 tw-bg-white/[0.9] tw-backdrop-blur-sm tw-flex tw-items-center tw-justify-center tw-z-[999] tw-p-2 sm:tw-p-4 tw-font-sans">
        <div className="tw-bg-[#FFFFFF] tw-text-neutral-800 tw-rounded-xl sm:tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-5xl xl:tw-max-w-7xl tw-max-h-[95vh] tw-flex tw-flex-col tw-relative overflow-hidden">
          {/* Top Bar */}
          <button onClick={handleCloseToDetails} className="tw-absolute tw-top-3 sm:tw-top-4 tw-left-3 sm:tw-left-4 tw-z-20 tw-text-neutral-700 tw-bg-white/80 hover:tw-bg-gray-200/90 tw-p-2 sm:tw-p-2.5 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-shadow-md tw-transition-colors" aria-label="Back to Details"><ArrowLeft size={18} /></button>
          <div className="tw-absolute tw-top-3 sm:tw-top-4 tw-left-1/2 tw-transform -tw-translate-x-1/2 tw-z-10 tw-flex tw-items-center tw-gap-1.5 sm:tw-gap-2 tw-bg-neutral-700/70 tw-backdrop-blur-sm tw-p-1 sm:tw-p-1.5 tw-rounded-full tw-shadow-lg"><Link to={`/fleet/details/${vehicleId}`}><button onClick={() => setActiveView('details')} className={inactiveViewClasses} title="Details"><CarFront size={16} /></button></Link><button onClick={() => setActiveView('3d')} className={activeViewClasses} title="3D View"><Orbit size={16} /></button><Link to={`/fleet/details/${vehicleId}/ar`}><button onClick={() => setActiveView('ar')} className={inactiveViewClasses} title="Gallery / AR"><Camera size={16} /></button></Link></div>
          <button onClick={handleExitToFleet} className="tw-absolute tw-top-3 sm:tw-top-4 tw-right-3 sm:tw-right-4 tw-z-20 tw-text-neutral-500 hover:tw-text-neutral-700 tw-bg-white/70 hover:tw-bg-white tw-p-1.5 tw-rounded-full tw-shadow-md tw-transition-colors" aria-label="Close"><X size={20} /></button>

          <div className="tw-flex-grow tw-grid tw-grid-cols-12 tw-gap-4 sm:tw-gap-6 tw-items-stretch tw-pt-16 sm:tw-pt-20 tw-pb-6 tw-px-4 sm:tw-px-8 tw-overflow-y-auto custom-detail-scrollbar">
            {/* Left Panel */}
            <div className="tw-col-span-12 lg:tw-col-span-4 tw-flex tw-flex-col tw-justify-between">
              <div><h1 className="tw-text-2xl sm:tw-text-3xl lg:tw-text-4xl tw-font-semibold tw-text-gray-800 tw-tracking-tight">{vehicleModel?.title || "Vehicle Name"}</h1><p className="tw-text-base sm:tw-text-md lg:tw-text-lg tw-text-gray-500 tw-mt-1">{vehicleModel?.vehicle_type?.name || "Vehicle Type"}</p></div>
              <div className="tw-bg-gray-100/70 tw-rounded-xl tw-shadow-md tw-mt-4 sm:tw-mt-6 tw-mb-4 sm:tw-mb-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-2">
                <div className="tw-w-full tw-max-w-xs tw-h-64 sm:tw-h-72">
                  <ThreeDModelViewer
                    ref={mainViewerRef} // We still need this ref for the control buttons
                    key={`preview-${modelSrc}`}
                    src={modelSrc}
                    style={{ width: '100%', height: '100%' }}
                    alt={`${vehicleModel?.title} 3D Preview`}
                    isSpinning={isSpinning}
                    environmentPreset={environmentPresets[environmentIndex]}
                  />
                </div>
                <p className="tw-text-xs tw-text-gray-500 tw-mt-1 tw-text-center tw-px-2">{selectedColorHex ? availableColorsFromAPI.find(c => c.hex === selectedColorHex)?.name : ""} 3D View</p>
              </div>
              <div className="tw-flex tw-justify-center tw-space-x-5 sm:tw-space-x-6 tw-pt-2 sm:tw-pt-4">
                  <button onClick={handleToggleSpin} className="tw-text-gray-500 hover:tw-text-blue-600 tw-transition-colors" title="Toggle 360 Spin"><RefreshCw size={20} className={isSpinning ? 'tw-animate-spin-slow' : ''} /></button>
                  <button onClick={handleCycleEnvironment} className="tw-text-gray-500 hover:tw-text-blue-600 tw-transition-colors" title="Cycle Environment"><Aperture size={20} /></button>
              </div>
            </div>

            {/* Center Panel: Main View & Thumbnails */}
            <div className="tw-col-span-12 lg:tw-col-span-7 tw-flex tw-flex-col tw-items-center tw-justify-center tw-relative -tw-mt-4 lg:tw-mt-0">
              <div className="tw-w-full tw-aspect-video sm:tw-aspect-[16/9] tw-max-h-[calc(95vh-220px)] md:tw-max-h-[500px] lg:tw-max-h-[550px] tw-mb-2 sm:tw-mb-3 tw-flex tw-items-center tw-justify-center p-5 tw-rounded-lg tw-overflow-hidden tw-shadow-inner">{mainDisplayContent}</div>
              {/* [THE FIX] Carousel only shows if there are images to display */}
              {currentGalleryMedia.length > 0 && (
                  <div className="tw-flex tw-items-center tw-space-x-1 sm:tw-space-x-2 tw-px-2 tw-py-1.5 tw-backdrop-blur-sm tw-bg-white/80 tw-rounded-lg tw-shadow-md tw-mt-1 tw-max-w-full">
                      <button onClick={() => handleNavigateThumbnails('prev')} className="tw-p-1.5 sm:tw-p-2 tw-rounded-full tw-border-0 hover:tw-bg-gray-200/80 focus:tw-bg-gray-300/80 tw-transition-colors tw-text-gray-600 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed" aria-label="Previous Image" disabled={currentGalleryMedia.length <= 1}><ChevronLeftHero className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5" /></button>
                      <div className="tw-flex tw-space-x-1.5 sm:tw-space-x-2 tw-overflow-x-auto tw-p-1 tw-max-w-[calc(100vw-200px)] xs:tw-max-w-[240px] sm:tw-max-w-[320px] md:tw-max-w-[400px] custom-detail-scrollbar">
                          {currentGalleryMedia.map((media, index) => (
                            <button key={media.id || index} onClick={() => handleThumbnailClick(index)} className={`${commonThumbnailClasses} ${index === currentThumbnailIndex ? activeThumbnailClasses : inactiveThumbnailClasses}`}>
                                <img src={media.url || DEFAULT_FALLBACK_IMAGE_URL} alt={media.caption || `View ${index + 1}`} className="tw-w-full tw-h-full tw-object-cover" onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL; }} />
                            </button>
                          ))}
                      </div>
                      <button onClick={() => handleNavigateThumbnails('next')} className="tw-p-1.5 sm:tw-p-2 tw-border-0 tw-rounded-full hover:tw-bg-gray-200/80 focus:tw-bg-gray-300/80 tw-transition-colors tw-text-gray-600 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed" aria-label="Next Image" disabled={currentGalleryMedia.length <= 1}><ChevronRight className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5" /></button>
                  </div>
              )}
            </div>

            {/* Right Panel: Color Selection */}
            <div className="tw-col-span-12 lg:tw-col-span-1 tw-flex lg:tw-flex-col tw-justify-center lg:tw-justify-start tw-items-center tw-space-x-2 lg:tw-space-x-0 lg:tw-space-y-3 tw-pt-4 lg:tw-pt-20">
              {availableColorsFromAPI.map((color) => (<button key={color.hex} onClick={() => handleColorSelect(color.hex)} className={`tw-w-7 tw-h-7 sm:tw-w-8 sm:tw-h-8 md:tw-w-9 md:tw-h-9 tw-rounded-lg tw-border-2 tw-transition-all tw-transform hover:tw-scale-110 focus:tw-outline-none ${selectedColorHex === color.hex ? 'tw-ring-2 tw-ring-offset-2 tw-ring-blue-500 tw-shadow-md tw-scale-110' : 'tw-border-gray-300 hover:tw-border-gray-400'} ${color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#fff' ? 'tw-border-gray-400' : 'tw-border-transparent'}`} aria-label={`Select ${color.name} color`} style={{ backgroundColor: color.hex }} title={color.name}>{selectedColorHex === color.hex && (color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#fff') && (<svg className="tw-w-3 tw-h-3 sm:tw-w-4 sm:tw-h-4 tw-text-blue-600 tw-m-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>)}{selectedColorHex === color.hex && color.hex.toLowerCase() !== '#ffffff' && color.hex.toLowerCase() !== '#fff' && (<div className="tw-w-2 tw-h-2 sm:tw-w-2.5 sm:tw-h-2.5 tw-rounded-full tw-bg-white/70 tw-m-auto tw-shadow-inner"></div>)}</button>))}
            </div>
            {availableColorsFromAPI.length === 0 && <div className="lg:tw-col-span-1"></div>}
          </div>
        </div>
      </div>
    </>
  );
}