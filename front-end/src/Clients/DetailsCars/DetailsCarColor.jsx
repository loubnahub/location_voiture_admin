// src/pages/CarProductPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  DocumentTextIcon as DocumentTextOutlineIcon, 
  ChevronLeftIcon as ChevronLeftHeroIcon,
  ChevronRightIcon as ChevronRightHeroIcon,
} from '@heroicons/react/24/outline'; 
import { 
   Camera, Orbit, CarFront, X, ArrowLeft, Loader2, AlertTriangle // Added Loader2, AlertTriangle
} from 'lucide-react';
import { fetchVehicleModelById } from '../../services/api'; // Adjust path

const DEFAULT_FALLBACK_IMAGE_URL = '/images/Cars/placeholder_gallery.png'; // Specific placeholder for gallery/AR

export default function CarColorPage() {
  const { vehicleId } = useParams(); // This is vehicle_model_id
  const navigate = useNavigate();

  const [vehicleModel, setVehicleModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeView, setActiveView] = useState('ar'); // Set 'ar' as active for this page
  const [selectedColorHex, setSelectedColorHex] = useState(null);
  
  // Media (images) to display in the gallery, filtered by color
  const [currentMediaForGallery, setCurrentMediaForGallery] = useState([]);
  const [mainDisplayImage, setMainDisplayImage] = useState(DEFAULT_FALLBACK_IMAGE_URL);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

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
            // Set initial color if available
            if (modelData.available_colors && modelData.available_colors.length > 0) {
              setSelectedColorHex(modelData.available_colors[0].hex);
            } else {
              setSelectedColorHex(null); // No specific colors to pre-select
            }
            // currentMediaForGallery & mainDisplayImage will be set by subsequent useEffects
          } else {
            throw new Error("Vehicle model data not found in API response.");
          }
        } catch (err) {
          console.error("Error fetching AR/Gallery page details:", err);
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
    return vehicleModel?.available_colors || []; // Use the fetched colors
  }, [vehicleModel]);

  // Update currentMediaForGallery when vehicleModel or selectedColorHex changes
  useEffect(() => {
    if (!vehicleModel || !vehicleModel.all_media) {
      setCurrentMediaForGallery([]);
      return;
    }
    let mediaToDisplay = [];
    if (selectedColorHex) {
      mediaToDisplay = vehicleModel.all_media.filter(
        m => m.color_hex && m.color_hex.toLowerCase() === selectedColorHex.toLowerCase()
      );
    }
    if (mediaToDisplay.length === 0) { // Fallback if no color-specific images or no color selected
      mediaToDisplay = vehicleModel.all_media.filter(m => m.is_cover || !m.color_hex); // Prioritize cover or non-colored
      if(mediaToDisplay.length === 0 && vehicleModel.all_media.length > 0) { // If still empty, take the first general image
          mediaToDisplay = [vehicleModel.all_media[0]];
      }
    }
    mediaToDisplay.sort((a, b) => (a.order || 0) - (b.order || 0));
    setCurrentMediaForGallery(mediaToDisplay);
    setCurrentGalleryIndex(0); // Reset index for the new set
  }, [vehicleModel, selectedColorHex]);

  // Update mainDisplayImage when currentMediaForGallery or currentGalleryIndex changes
  useEffect(() => {
    if (currentMediaForGallery.length > 0 && currentMediaForGallery[currentGalleryIndex]) {
      setMainDisplayImage(currentMediaForGallery[currentGalleryIndex].url);
    } else if (currentMediaForGallery.length > 0) {
      setMainDisplayImage(currentMediaForGallery[0].url);
      setCurrentGalleryIndex(0);
    } else {
      // Fallback if absolutely no media is available for the current context
      setMainDisplayImage(DEFAULT_FALLBACK_IMAGE_URL); 
    }
  }, [currentMediaForGallery, currentGalleryIndex]);


  // --- HANDLERS ---
  const handleColorSelect = useCallback((colorHex) => {
    setSelectedColorHex(colorHex);
    // useEffect for currentMediaForGallery will update the displayed images
  }, []);

  const handleGalleryNavigation = useCallback((direction) => {
    if (!currentMediaForGallery || currentMediaForGallery.length === 0) return;
    setCurrentGalleryIndex(prevIndex => {
      const newIndex = direction === 'next'
        ? (prevIndex + 1) % currentMediaForGallery.length
        : (prevIndex - 1 + currentMediaForGallery.length) % currentMediaForGallery.length;
      return newIndex;
    });
    // useEffect for mainDisplayImage will update it
  }, [currentMediaForGallery]);

  const handleThumbnailClick = useCallback((index) => {
    setCurrentGalleryIndex(index);
    // useEffect for mainDisplayImage will update it
  }, []);
  
  const handleCloseAndNavigate = useCallback((path) => navigate(path), [navigate]);

  // --- STYLES ---
  const commonTopButtonClasses = "p-1.5 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-colors shadow";
  const activeViewClasses = `${commonTopButtonClasses} bg-white text-black`;
  const inactiveViewClasses = `${commonTopButtonClasses} text-white hover:bg-neutral-500/50`;

  // --- RENDER LOGIC ---
  if (loading) { /* ... (Loading JSX from your previous correct version) ... */ 
    return (
      <div className="flex justify-center items-center min-h-screen bg-white/[0.5] p-4 backdrop-blur-sm z-[998]">
        <div className="bg-[#FFFFFFCC] p-10 rounded-xl shadow-2xl flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
          <p className="text-lg font-semibold">Loading Gallery...</p>
        </div>
      </div>
    );
  }
  if (error || !vehicleModel) { /* ... (Error/No Model JSX from your previous correct version) ... */ 
    return (
      <div className="flex justify-center items-center min-h-screen bg-white/[0.5] p-4 backdrop-blur-sm z-[998]">
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
    <div className="flex justify-center items-center min-h-screen bg-white/[0.5] p-4 backdrop-blur-sm z-[998]">
      <div className="bg-[#FFFFFFCC] backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-7xl max-h-[95vh] font-sans relative overflow-hidden flex flex-col">
        {/* Top Bar & Navigation */}
        <button
          onClick={() => handleCloseAndNavigate(`/fleet/details/${vehicleId}`)}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 text-neutral-800 bg-white hover:bg-gray-100 shadow-md p-1.5 rounded-lg items-center justify-center flex"
          aria-label="Back to Details"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-1.5 sm:gap-2 bg-neutral-700/60 backdrop-blur-sm p-1 sm:p-1.5 rounded-full shadow">
            <Link to={`/fleet/details/${vehicleId}`}>
              <button onClick={() => setActiveView('details')} className={activeView === 'details' ? activeViewClasses : inactiveViewClasses} title="Details View"><CarFront size={18} /></button>
            </Link>
            <Link to={`/fleet/details/${vehicleId}/3d`}>
              <button onClick={() => setActiveView('3d')} className={activeView === '3d' ? activeViewClasses : inactiveViewClasses} title="3D View"><Orbit size={18} /></button>
            </Link>
            <button onClick={() => setActiveView('ar')} className={activeView === 'ar' ? activeViewClasses : inactiveViewClasses} title="Gallery / AR View"><Camera size={18} /></button>
        </div>
        <button onClick={() => navigate('/fleet')} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 text-neutral-600 hover:text-neutral-800 bg-white/70 hover:bg-white p-1.5 rounded-full" aria-label="Close and return to fleet"> <X size={20} /> </button>

        {/* Main Content Grid */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-16 lg:mt-20 overflow-y-auto pr-2 custom-detail-scrollbar"> {/* Added scrollbar class */}
            {/* Left Panel: Info */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4 self-start"> {/* Make left panel sticky */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {vehicleModel.title || "Vehicle Name"}
                </h1>
                <p className="text-gray-500">{vehicleModel.vehicle_type?.name || "Vehicle Type"}</p>
                <div className="flex items-start space-x-2 text-gray-700">
                    <DocumentTextOutlineIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-500" />
                    <span className="text-sm font-medium">Description</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed max-h-48 overflow-y-auto custom-detail-scrollbar pr-1">
                    {vehicleModel.description || "No description available for this model."}
                </p>
                <div className="flex space-x-3 pt-2">
                    <Link to={`/booking/${vehicleId}`}> {/* vehicleId is model_id */}
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">Rent Now</button>
                    </Link>
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">Review</button>
                </div>
            </div>

            {/* Center Panel: Main Image and Thumbnails */}
            <div className="lg:col-span-7 flex flex-col items-center relative">
                <div className="w-full aspect-[16/10] mb-4 flex items-center justify-center bg-gray-100/70 rounded-lg shadow-inner">
                    {/* This would be replaced by an AR viewer component if implementing actual AR */}
                    <img
                        src={mainDisplayImage}
                        alt={`${vehicleModel.title} - ${selectedColorHex ? availableColorsFromAPI.find(c=>c.hex === selectedColorHex)?.name : 'Gallery view'}`}
                        className="w-full h-full max-h-[60vh] object-contain rounded-lg transition-opacity duration-300"
                        key={mainDisplayImage} // Helps React detect image change for transitions
                        onError={(e) => {e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL;}}
                    />
                </div>
                {/* Thumbnails Gallery */}
                {currentMediaForGallery.length > 0 && (
                    <div className="flex items-center space-x-1 sm:space-x-3 p-2 -mt-2 z-10 bg-white/80 backdrop-blur-sm rounded-lg shadow-md max-w-full">
                        <button
                            onClick={() => handleGalleryNavigation('prev')}
                            className="p-2 rounded-full hover:bg-gray-200/70 transition-colors shadow-sm border border-gray-200/50 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Previous image"
                            disabled={currentMediaForGallery.length <= 1}
                        >
                            <ChevronLeftHeroIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                        
                        <div className="flex space-x-1.5 sm:space-x-2 overflow-x-auto p-1 max-w-[240px] sm:max-w-[320px] md:max-w-[400px] custom-detail-scrollbar"> {/* Added scrollbar class */}
                            {currentMediaForGallery.map((media, index) => (
                                <button
                                    key={media.id || index} // Use media.id if available
                                    onClick={() => handleThumbnailClick(index)}
                                    className={`flex-shrink-0 w-12 h-10 sm:w-16 sm:h-12 md:w-20 md:h-14 rounded-md border-2 transition-all duration-150 overflow-hidden hover:opacity-80
                                                ${index === currentGalleryIndex ? 'border-blue-500 ring-1 ring-blue-500 ring-offset-1 scale-105' : 'border-gray-300 hover:border-gray-400'}`}
                                >
                                    <img
                                        src={media.url || DEFAULT_FALLBACK_IMAGE_URL}
                                        alt={media.caption || `Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE_URL;}}
                                    />
                                </button>
                            ))}
                        </div>
                      
                        <button
                            onClick={() => handleGalleryNavigation('next')}
                            className="p-2 rounded-full hover:bg-gray-200/70 transition-colors shadow-sm border border-gray-200/50 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Next image"
                            disabled={currentMediaForGallery.length <= 1}
                        >
                            <ChevronRightHeroIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                    </div>
                )}
                 {currentMediaForGallery.length === 0 && !loading && (
                    <p className="text-sm text-gray-500 mt-4">No images available for this selection.</p>
                 )}
            </div>

            {/* Right Panel: Color Selection */}
            {availableColorsFromAPI.length > 0 && (
                <div className="lg:col-span-1 flex lg:flex-col justify-center lg:justify-start items-center space-x-2 lg:space-x-0 lg:space-y-3 pt-4 lg:pt-0 lg:mt-20"> {/* Adjusted margin */}
                    {availableColorsFromAPI.map((color) => (
                    <button
                        key={color.hex}
                        onClick={() => handleColorSelect(color.hex)}
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 transition-all transform hover:scale-110 focus:outline-none
                        ${selectedColorHex === color.hex ? 'ring-2 ring-offset-1 ring-blue-500 shadow-md scale-110' : 'border-gray-300 hover:border-gray-400'}
                        ${color.hex.toLowerCase() === '#ffffff' ? 'border-gray-400' : 'border-transparent'} 
                        `}
                        aria-label={`Select ${color.name} color`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                    >
                        {selectedColorHex === color.hex && color.hex.toLowerCase() === '#ffffff' && (
                        <svg className="w-4 h-4 text-blue-600 m-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        )}
                        {selectedColorHex === color.hex && color.hex.toLowerCase() !== '#ffffff' && (
                             <div className="w-2.5 h-2.5 rounded-full bg-white/60 m-auto shadow-inner"></div>
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