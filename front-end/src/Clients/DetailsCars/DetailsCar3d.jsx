// src/pages/CarDetails3d.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    CarFront, Orbit, Camera, X, ArrowLeft,
    Box, RefreshCw, Aperture, Loader2, AlertTriangle
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeftIcon as ChevronLeftHero,
  ChevronRightIcon as ChevronRightHero,
} from '@heroicons/react/24/outline';
import { fetchVehicleModelById } from '../../services/api'; // Adjust path if necessary

const DEFAULT_FALLBACK_IMAGE_URL = '/images/Cars/placeholder_3d.png'; // Specific placeholder for 3D view if needed

export default function CarDetails3d() { 
  const { vehicleId } = useParams(); // This is vehicle_model_id
  const navigate = useNavigate();

  const [vehicleModel, setVehicleModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeView, setActiveView] = useState('3d');
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
        setVehicleModel(null); // Reset
        try {
          const response = await fetchVehicleModelById(vehicleId);
          if (response.data && response.data.data) {
            const modelData = response.data.data;
            setVehicleModel(modelData);
            // Set initial color if available, otherwise null
            if (modelData.available_colors && modelData.available_colors.length > 0) {
              setSelectedColorHex(modelData.available_colors[0].hex);
            } else {
              setSelectedColorHex(null); // No specific colors to pre-select
            }
          } else {
            throw new Error("Vehicle model data not found in API response.");
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

  // Determine the set of media (thumbnails) to display based on selected color
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
    // If no images for selected color, or no color selected, show general/cover images
    if (mediaForCurrentColor.length === 0) {
        mediaForCurrentColor = vehicleModel.all_media.filter(m => m.is_cover || !m.color_hex); // Prioritize cover or non-colored
        if (mediaForCurrentColor.length === 0 && vehicleModel.all_media.length > 0) { // Fallback to any image if above is empty
            mediaForCurrentColor = [vehicleModel.all_media[0]];
        }
    }
    // Sort media by order property if it exists
    mediaForCurrentColor.sort((a, b) => (a.order || 0) - (b.order || 0));
    setCurrentMediaSet(mediaForCurrentColor);
    setCurrentThumbnailIndex(0); // Reset to first thumbnail of the new set
  }, [vehicleModel, selectedColorHex]);

  // Update the main display image when the currentMediaSet or thumbnailIndex changes
  useEffect(() => {
    if (currentMediaSet.length > 0 && currentMediaSet[currentThumbnailIndex]) {
      setMainDisplayImage(currentMediaSet[currentThumbnailIndex].url);
    } else if (currentMediaSet.length > 0) { // Fallback if index is bad but media exists
      setMainDisplayImage(currentMediaSet[0].url);
      setCurrentThumbnailIndex(0);
    } else {
      setMainDisplayImage(DEFAULT_FALLBACK_IMAGE_URL);
    }
  }, [currentMediaSet, currentThumbnailIndex]);

  // --- HANDLERS ---
  const handleColorSelect = useCallback((colorHex) => {
    setSelectedColorHex(colorHex);
    // The useEffect for currentMediaSet will handle updating thumbnails and main image
  }, []);

  const handleThumbnailClick = useCallback((index) => {
    setCurrentThumbnailIndex(index);
    // The useEffect for mainDisplayImage will update it
  }, []);

  const handleNavigateThumbnails = useCallback((direction) => {
    if (!currentMediaSet || currentMediaSet.length === 0) return;
    setCurrentThumbnailIndex(prevIndex => {
      const newIndex = direction === 'next' 
        ? (prevIndex + 1) % currentMediaSet.length
        : (prevIndex - 1 + currentMediaSet.length) % currentMediaSet.length;
      return newIndex;
    });
    // Main image updates via useEffect watching currentThumbnailIndex
  }, [currentMediaSet]);
  
  const handleClose = useCallback(() => navigate(`/fleet/details/${vehicleId}`), [navigate, vehicleId]);
  const handleExitToFleet = useCallback(() => navigate('/fleet'), [navigate]);

  // --- STYLES ---
  const commonTopButtonClasses = "p-1.5 sm:p-2 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-colors shadow-sm";
  const activeViewClasses = `${commonTopButtonClasses} bg-white text-black`;
  const inactiveViewClasses = `${commonTopButtonClasses} text-white hover:bg-neutral-500/50`;

  // --- RENDER LOGIC ---
  if (loading) { /* ... (Loading JSX from your previous correct version) ... */ 
    return (
      <div className="fixed inset-0 bg-white/[0.5] backdrop-blur-sm flex items-center justify-center z-[997] p-4">
        <div className="bg-[#FFFFFFCC] p-10 rounded-xl shadow-2xl flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
          <p className="text-lg font-semibold">Loading 3D View...</p>
        </div>
      </div>
    );
  }
  if (error || !vehicleModel) { /* ... (Error/No Model JSX from your previous correct version) ... */ 
    return (
      <div className="fixed inset-0 bg-white/[0.5] backdrop-blur-sm flex items-center justify-center z-[997] p-4">
        <div className="bg-red-50 p-10 rounded-xl shadow-2xl flex flex-col items-center text-red-700">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <p className="text-lg font-semibold mb-2">Error</p>
          <p className="text-sm text-center mb-6">{error || "Vehicle data could not be loaded."}</p>
          <button onClick={() => navigate('/fleet')} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg">Return to Fleet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white/[0.5]  backdrop-blur-sm flex items-center justify-center z-[997] p-2 sm:p-4 font-sans">
      <div className="bg-[#FFFFFFCC] backdrop-blur-md text-neutral-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl xl:max-w-7xl max-h-[95vh] flex flex-col relative overflow-hidden">
        {/* Top Bar */}
        <button
          onClick={handleClose} // Back to regular details page
          className="absolute top-4 left-4 z-20 text-neutral-800 bg-white hover:bg-gray-200/90 p-2.5 rounded-lg items-center justify-center flex shadow"
          aria-label="Back to Details"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-1.5 sm:gap-2 bg-neutral-700/60 backdrop-blur-sm p-1 sm:p-1.5 rounded-full shadow-lg">
            <Link to={`/fleet/details/${vehicleId}`}>  <button  onClick={() => setActiveView('details')} className={activeView === 'details' ? activeViewClasses : inactiveViewClasses} title="Details"><CarFront size={16} /></button></Link>
            <button onClick={() => setActiveView('3d')} className={activeView === '3d' ? activeViewClasses : inactiveViewClasses} title="3D View"><Orbit size={16}  /></button>
            <Link to={`/fleet/details/${vehicleId}/ar`}> <button onClick={() => setActiveView('ar')} className={activeView === 'ar' ? activeViewClasses : inactiveViewClasses} title="Gallery / AR"><Camera size={16}  /></button></Link>
        </div>
        
        <button
            onClick={handleExitToFleet} // Exit entirely
            className="absolute top-4 right-4 z-20 text-neutral-500 hover:text-neutral-700 bg-white/70 hover:bg-white p-1.5 rounded-full"
            aria-label="Close"
        > <X size={22} />
        </button>

        <div className="flex-grow grid grid-cols-12 gap-4 sm:gap-6 items-stretch pt-20 pb-6 px-4 sm:px-8">
            {/* Left Panel */}
            <div className="col-span-12 lg:col-span-4 flex flex-col justify-between">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-semibold text-gray-800 tracking-tight">
                        {vehicleModel.title || "Vehicle Name"}
                    </h1>
                    <p className="text-md lg:text-lg text-gray-500 mt-1">
                        {vehicleModel.vehicle_type?.name || "Vehicle Type"}
                    </p>
                </div>
                {/* Small image preview in left panel */}
                <div className="bg-gray-100 rounded-xl shadow-md mt-4 sm:mt-6 mb-4 sm:mb-6 flex flex-col items-center justify-center p-2">
                    <div className="p-3 sm:p-4 w-full max-w-xs aspect-[4/3] flex flex-col items-center justify-center">
                        <img 
                            src={mainDisplayImage} 
                            alt={`${vehicleModel.title} preview`}
                            className="max-w-full max-h-[70%] object-contain"
                            onError={(e) => {e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL;}}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                        {selectedColorHex ? availableColorsFromAPI.find(c => c.hex === selectedColorHex)?.name : ""} 3D View
                    </p>
                </div>
                <div className="flex justify-center space-x-5 sm:space-x-6 pt-2 sm:pt-4">
                    <button className="text-gray-500 hover:text-blue-600 transition-colors" title="3D Model View Options"><Box size={20} /></button>
                    <button className="text-gray-500 hover:text-blue-600 transition-colors" title="Toggle 360 Spin"><RefreshCw size={20} /></button>
                    <button className="text-gray-500 hover:text-blue-600 transition-colors" title="More Views/Hotspots"><Aperture size={20} /></button>
                </div>
            </div>

            {/* Center Panel: Main "3D" View (Image) & Thumbnails */}
            <div className="col-span-12 lg:col-span-7 flex flex-col items-center justify-center relative -mt-4 lg:mt-0">
                <div className="w-full aspect-[16/9] sm:aspect-[16/10] mb-3 sm:mb-2 flex items-center justify-center bg-gray-100/50 rounded-lg">
                {/* This is where your actual 3D model viewer component would go */}
                <img
                    src={mainDisplayImage}
                    alt={`${vehicleModel.title} - ${selectedColorHex ? availableColorsFromAPI.find(c=>c.hex === selectedColorHex)?.name : 'Interactive View'}`}
                    className="max-w-full max-h-full object-contain transition-all duration-300 ease-in-out"
                    key={mainDisplayImage} // Key to help React re-render on src change for transitions
                    onError={(e) => {e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL;}}
                />
                </div>
                {/* Thumbnails */}
                {currentMediaSet.length > 0 && ( // Show nav only if there are thumbnails
                    <div className="flex items-center space-x-1 sm:space-x-2 px-2 py-1.5 backdrop-blur-sm bg-white/70 rounded-lg shadow-md mt-1 max-w-full">
                        <button 
                            onClick={() => handleNavigateThumbnails('prev')}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200/70 transition-colors text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed" 
                            aria-label="Previous Image"
                            disabled={currentMediaSet.length <= 1}
                        >
                            <ChevronLeftHero className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        {/* Thumbnails Container - Make it scrollable if too many */}
                        <div className="flex space-x-1.5 sm:space-x-2 overflow-x-auto p-1 max-w-[240px] sm:max-w-[320px] md:max-w-[400px] custom-detail-scrollbar">
                            {currentMediaSet.map((media, index) => (
                            <button  
                                key={media.id || index} // Use media.id if available
                                onClick={() => handleThumbnailClick(index)}
                                className={`flex-shrink-0 w-12 h-10 sm:w-16 sm:h-12 md:w-20 md:h-14 rounded-md border-2 transition-all duration-150 overflow-hidden hover:border-blue-400
                                            ${index === currentThumbnailIndex ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-1 scale-105' : 'border-gray-300 hover:border-gray-400'}`} 
                            >
                                <img src={media.url || DEFAULT_FALLBACK_IMAGE_URL} alt={media.caption || `View ${index+1}`} className="w-full h-full object-cover" 
                                onError={(e) => {e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL;}}/>
                            </button> 
                            ))}
                        </div>
                        <button 
                            onClick={() => handleNavigateThumbnails('next')}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200/70 transition-colors text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed" 
                            aria-label="Next Image"
                            disabled={currentMediaSet.length <= 1}
                        >
                            <ChevronRightHero className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                )}
                 {currentMediaSet.length === 0 && !loading && (
                    <p className="text-sm text-gray-500 mt-4">No preview images available for this selection.</p>
                 )}
            </div>

            {/* Right Panel: Color Selection */}
            {availableColorsFromAPI.length > 0 && (
                <div className="lg:col-span-1 flex lg:flex-col justify-center lg:justify-start items-center space-x-2 lg:space-x-0 lg:space-y-3 pt-4 lg:pt-20">
                    {availableColorsFromAPI.map((color) => (
                    <button
                        key={color.hex}
                        onClick={() => handleColorSelect(color.hex)}
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-lg border-2 transition-all transform hover:scale-110 focus:outline-none
                        ${selectedColorHex === color.hex ? 'ring-2 ring-offset-2 ring-blue-500 shadow-md scale-110' : 'border-gray-300 hover:border-gray-400'}
                        ${color.hex.toLowerCase() === '#ffffff' ? 'border-gray-400' : 'border-transparent'} 
                        `}
                        aria-label={`Select ${color.name} color`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                    >
                        {/* Visual indicator for selected white color */}
                        {selectedColorHex === color.hex && color.hex.toLowerCase() === '#ffffff' && (
                        <svg className="w-4 h-4 text-blue-600 m-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        )}
                        {/* Visual indicator for other selected colors (optional inner dot) */}
                        {selectedColorHex === color.hex && color.hex.toLowerCase() !== '#ffffff' && (
                             <div className="w-3 h-3 rounded-full bg-white/60 m-auto shadow-inner"></div>
                        )}
                    </button>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  ); 
}