// ./components/VehicleDisplayGallery.js (or wherever it's located)

import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Button, Alert, Image, Modal, Spinner } from 'react-bootstrap';
import { LuChevronLeft, LuChevronRight, LuArrowLeft, LuCamera } from 'react-icons/lu';
import { useParams, useNavigate } from 'react-router-dom'; // Import hooks

import ThreeDModelViewer from './ThreeDModelViewer'; // Adjust path if needed
import VehicleModelMediaManager from './VehicleModelMediaManager'; // Adjust path if needed
import { 
    fetchVehicleModelById, // To get model title and potentially initial cover image
    fetchVehicleModelMediaList, 
    fetchVehicleModelColors 
} from '../services/api'; // Adjust path
import './VehicleDisplayGallery.css'; // Your CSS for this component

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function to resolve storage URLs (keep this or import if shared)
const resolveStorageUrl = (relativePath) => {
  if (!relativePath) return '';
  // Make it more robust for various existing prefixes
  let cleanedPath = relativePath
    .replace(/^http:\/\/localhost:8000\/storage\//i, '')
    .replace(/^http:\/\/localhost:8000\/api\/stream-glb\//i, '')
    .replace(/^public\//i, '')
    .replace(/^storage\//i, '')
    .replace(/^\//, '');

  if (relativePath.toLowerCase().includes('.glb')) { // Check if original path contains .glb
    return `${API_BASE_URL}/api/stream-glb/${cleanedPath}`;
  }
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  return `${API_BASE_URL}/storage/${cleanedPath}`;
};
export { resolveStorageUrl }; // Export if used elsewhere

const THUMBNAILS_PER_VIEW = 5;

const VehicleDisplayGallery = () => { // Removed props that are now fetched or handled internally
  const { modelId } = useParams(); // Get modelId from URL parameter
  const navigate = useNavigate();    // For navigation actions like "back"

  const [vehicleTitle, setVehicleTitle] = useState("Vehicle Gallery");
  const [mediaItems, setMediaItems] = useState([]); // All media for the model
  const [availableColors, setAvailableColors] = useState([]); // Colors defined for the model
  
  // Derived state from mediaItems and availableColors
  const [imagesForGallery, setImagesForGallery] = useState([]); // Image-type media, sorted
  const [selectedColorHex, setSelectedColorHex] = useState(null);
  const [activeMainImageUrl, setActiveMainImageUrl] = useState('');
  const [activeMainImageCaption, setActiveMainImageCaption] = useState('');
  const [currentThumbnailStartIndex, setCurrentThumbnailStartIndex] = useState(0);

  const [showMediaManagerModal, setShowMediaManagerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all necessary data when modelId changes
  useEffect(() => {
    if (!modelId) {
      setIsLoading(false);
      setError("Vehicle Model ID is missing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        const modelDetailsRes = await fetchVehicleModelById(modelId);
        setVehicleTitle(modelDetailsRes.data.data?.title || "Vehicle Gallery");
        // Set initial active image from model's main_image_url if available
        if (modelDetailsRes.data.data?.main_image_url) {
            setActiveMainImageUrl(modelDetailsRes.data.data.main_image_url);
            // Attempt to find caption for this main image if it's in all_media
            const mainMediaItem = (modelDetailsRes.data.data.all_media || []).find(
                m => resolveStorageUrl(m.url) === resolveStorageUrl(modelDetailsRes.data.data.main_image_url)
            );
            setActiveMainImageCaption(mainMediaItem?.caption || '');
        }


        const [mediaRes, colorsRes] = await Promise.all([
          fetchVehicleModelMediaList(modelId),
          fetchVehicleModelColors(modelId)
        ]);
        
        setMediaItems(mediaRes.data.data || []);
        
        let colorData = colorsRes.data.data;
        if (typeof colorData === 'string') { // Handle if backend sends JSON string
          try { colorData = JSON.parse(colorData); } catch { console.error("Failed to parse color data string"); colorData = []; }
        }
        setAvailableColors(Array.isArray(colorData) ? colorData : []);
        
        // Set initial selected color if colors are available
        if (Array.isArray(colorData) && colorData.length > 0 && colorData[0]?.hex) {
            if(!selectedColorHex) setSelectedColorHex(colorData[0].hex); // Only if not already set
        }

      } catch (err) {
        setError(err.response?.data?.message || "Could not load gallery data.");
        console.error("Error fetching gallery data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [modelId]); // Re-fetch if modelId changes

  // Process mediaItems into sorted imagesForGallery
  useEffect(() => {
    const imageMedia = (mediaItems || [])
      .filter(item => item.media_type === 'image' || !item.media_type) // Assume image if no type
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    setImagesForGallery(imageMedia);

    // If activeMainImageUrl is not set yet, or if it's not in the new imagesForGallery, set it.
    if (imageMedia.length > 0) {
        if (!activeMainImageUrl || !imageMedia.some(img => resolveStorageUrl(img.url) === resolveStorageUrl(activeMainImageUrl))) {
            const coverImage = imageMedia.find(img => img.is_cover);
            const firstImage = imageMedia[0];
            const initialImageToDisplay = coverImage || firstImage;
            if (initialImageToDisplay) {
                setActiveMainImageUrl(initialImageToDisplay.url);
                setActiveMainImageCaption(initialImageToDisplay.caption || '');
            }
        }
    } else {
        setActiveMainImageUrl(''); // No images, clear active image
        setActiveMainImageCaption('');
    }
  }, [mediaItems, activeMainImageUrl]); // Re-process when mediaItems change

  // Filter images based on selected color
  const filteredImagesByColor = useMemo(() => {
    if (!selectedColorHex) return imagesForGallery; // Show all if no color selected
    const colorFiltered = imagesForGallery.filter(img => img.color_hex && img.color_hex.toLowerCase() === selectedColorHex.toLowerCase());
    // If no images for selected color, should we show all images or none?
    // Showing all images might be less confusing than an empty gallery if color has no specific images.
    // Or, show a message "No images for this color". For now, let's default to all if no specific color match.
    return colorFiltered.length > 0 ? colorFiltered : imagesForGallery; 
  }, [imagesForGallery, selectedColorHex]);

  // Update active image if the filtered list changes and current active image is not in it
   useEffect(() => {
    if (filteredImagesByColor.length > 0) {
        if (!filteredImagesByColor.some(img => resolveStorageUrl(img.url) === resolveStorageUrl(activeMainImageUrl))) {
            setActiveMainImageUrl(filteredImagesByColor[0].url);
            setActiveMainImageCaption(filteredImagesByColor[0].caption || '');
            setCurrentThumbnailStartIndex(0); // Reset thumbnails when active image changes due to color filter
        }
    } else if (imagesForGallery.length === 0) { // If there are no images at all
        setActiveMainImageUrl('');
        setActiveMainImageCaption('');
        setCurrentThumbnailStartIndex(0);
    }
    // This effect should primarily react to filteredImagesByColor changing
  }, [filteredImagesByColor, imagesForGallery, activeMainImageUrl]); // Added imagesForGallery

  const handleColorSwatchClick = (hexColor) => {
    setSelectedColorHex(hexColor);
    // Thumbnail index will be reset by the effect watching selectedColorHex (if you add one)
    // or when filteredImagesByColor updates activeMainImageUrl
    setCurrentThumbnailStartIndex(0); 
  };

  const handleThumbnailClick = (imageUrl, caption) => {
    setActiveMainImageUrl(imageUrl);
    setActiveMainImageCaption(caption || '');
  };

  const sourceForThumbnails = filteredImagesByColor; // Always use the color-filtered (or all if no color) list for thumbnails
  const maxThumbnailStart = Math.max(0, sourceForThumbnails.length - THUMBNAILS_PER_VIEW);

  const navigateThumbnails = (direction) => {
    setCurrentThumbnailStartIndex((prev) => {
      let next = prev + (direction * THUMBNAILS_PER_VIEW); // Jump by a full view
      if (next < 0) next = 0;
      if (next > maxThumbnailStart) next = maxThumbnailStart;
      return next;
    });
  };

  const visibleThumbnails = useMemo(() => {
    if (!sourceForThumbnails || sourceForThumbnails.length === 0) return [];
    return sourceForThumbnails.slice(currentThumbnailStartIndex, currentThumbnailStartIndex + THUMBNAILS_PER_VIEW);
  }, [sourceForThumbnails, currentThumbnailStartIndex]);

  const handleExitGallery = () => {
    // Navigate back to the model detail page as a sensible default
    navigate(`/admin/fleet/vehicle-models/${modelId}`);
    // Or, if you want a more generic back: navigate(-1);
  };

  const handleOpenMediaManager = () => setShowMediaManagerModal(true);
  const handleMediaManagerDidUpdate = () => { // Renamed for clarity
    setShowMediaManagerModal(false);
    // Re-fetch data after media manager closes
    if (modelId) {
      setIsLoading(true); // Show loading indicator during refresh
      Promise.all([
        fetchVehicleModelMediaList(modelId),
        fetchVehicleModelColors(modelId),
        fetchVehicleModelById(modelId) // Also re-fetch model details for title/main image
      ]).then(([mediaRes, colorsRes, modelRes]) => {
        setMediaItems(mediaRes.data.data || []);
        let cData = colorsRes.data.data;
        if (typeof cData === 'string') try { cData = JSON.parse(cData) } catch { cData = [] }
        setAvailableColors(Array.isArray(cData) ? cData : []);
        setVehicleTitle(modelRes.data.data?.title || "Vehicle Gallery");
         if (modelRes.data.data?.main_image_url && !activeMainImageUrl) { // Re-set active image if it was empty
            setActiveMainImageUrl(modelRes.data.data.main_image_url);
        }
      }).catch((err) => {
        console.error("Error refreshing gallery data after media management:", err);
        setError("Could not refresh media. Please try again or leave and re-enter the gallery.");
      }).finally(() => setIsLoading(false));
    }
    // if (onMediaManaged) onMediaManaged(); // Prop not used in standalone mode
  };

  const threeDModelForColor = (mediaItems || []).find(
    item => item.media_type === '3d_model_glb' && item.color_hex === selectedColorHex
  );
  const defaultThreeDModel = (mediaItems || []).find(
    item => item.media_type === '3d_model_glb' && !item.color_hex // Default model has no color_hex
  );
  const threeDModelToShow = threeDModelForColor || defaultThreeDModel;
  // If showing the color-specific 3D model, don't pass a color override.
  // If showing the default 3D model, apply the selectedColorHex to it.
  const colorForThreeDModelViewer = threeDModelForColor ? null : selectedColorHex;


  if (isLoading && !mediaItems.length && !availableColors.length) { // Show loading only on initial full load
    return (
      <div className="vehicle-display-gallery-container my-3 my-md-4 text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading Gallery...</p>
      </div>
    );
  }
  if (error && !isLoading) { // Show error only if not loading
    return (
      <div className="vehicle-display-gallery-container my-3 my-md-4 p-3">
        <Alert variant="danger">{error}</Alert>
        <Button variant="outline-secondary" size="sm" onClick={handleExitGallery}>
          <LuArrowLeft size={18} className="me-1-5" /> Back to Model Details
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="vehicle-display-gallery-container my-3 my-md-4 p-3"> {/* Added padding */}
        <div className="d-flex justify-content-between align-items-center mb-3 gallery-header">
          <Button variant="outline-secondary" size="sm" onClick={handleExitGallery} className="gallery-back-button">
            <LuArrowLeft size={18} className="me-1-5" /> Back to Model Details
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenMediaManager} className="gallery-manage-media-button">
            <LuCamera size={16} className="me-1-5" /> Manage Media Files
          </Button>
        </div>

        <h2 className="text-center mb-3 gallery-vehicle-title">{vehicleTitle}</h2>

        <Row className="g-3 g-lg-4">
          <Col lg={5} md={5} className="three-d-column">
            <div className="three-d-spin-card">
              {isLoading && !threeDModelToShow?.url ? <Spinner animation="border" size="sm" /> : threeDModelToShow?.url ? (
                <ThreeDModelViewer
                  src={resolveStorageUrl(threeDModelToShow.url)}
                  alt={threeDModelToShow.caption || `${vehicleTitle} 3D Model`}
                  style={{ width: '100%', height: '100%', minHeight: '300px' }}
                  color={colorForThreeDModelViewer} // Use the determined color
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center text-muted three-d-placeholder" style={{ width: '100%', height: '100%', minHeight: '300px' }}>
                  3D Model not available.
                </div>
              )}
            </div>
            <p className="text-center text-muted small mt-2 mb-0 three-d-caption">
              {threeDModelToShow?.caption || "3D car presentation"} {/* Simpler caption */}
            </p>
          </Col>

          <Col lg={7} md={7} className="main-display-column">
            {availableColors && availableColors.length > 0 && (
              <div className="color-swatches-container d-flex justify-content-center align-items-center mb-3 py-2 flex-wrap"> {/* Added flex-wrap */}
                {availableColors.map((colorObj, index) => (
                  <Button key={`color-${index}-${colorObj.hex}`} variant="outline-light"
                    className={`color-swatch m-1 ${selectedColorHex === colorObj.hex ? 'active' : ''}`} // Added m-1 for spacing
                    style={{ backgroundColor: colorObj.hex, width: '30px', height: '30px', border: selectedColorHex === colorObj.hex ? '2px solid #007bff' : '1px solid #ccc' }} // Enhanced styling
                    onClick={() => handleColorSwatchClick(colorObj.hex)} title={`${colorObj.name || 'Color'} (${colorObj.hex})`}
                  />
                ))}
              </div>
            )}
            <div className="main-image-display-area mb-3 shadow-sm rounded-3 overflow-hidden bg-light"> {/* Added bg-light */}
              {isLoading && !activeMainImageUrl ? <div className="main-gallery-image-placeholder d-flex align-items-center justify-content-center" style={{minHeight: 250}}><Spinner animation="border" /></div> : activeMainImageUrl ? (
                <Image
                  src={resolveStorageUrl(activeMainImageUrl)}
                  alt={activeMainImageCaption || `${vehicleTitle} Image`}
                  fluid
                  className="main-gallery-image"
                />
              ) : (
                <div className="main-gallery-image-placeholder d-flex flex-column align-items-center justify-content-center text-muted" style={{ minHeight: 250 }}>
                   <LuCamera size={48} className="mb-2 opacity-50" /> {/* Placeholder icon */}
                  <div>No image available</div>
                  {filteredImagesByColor.length === 0 && selectedColorHex && <div>for this color.</div>}
                </div>
              )}
            </div>
            {sourceForThumbnails && sourceForThumbnails.length > 0 && (
              <div className="thumbnail-gallery-strip d-flex align-items-center justify-content-center">
                <Button
                  variant="light" size="sm" onClick={() => navigateThumbnails(-1)}
                  disabled={currentThumbnailStartIndex === 0} className="thumbnail-nav-arrow"
                > <LuChevronLeft /> </Button>
                <div className="thumbnails-container d-flex mx-2">
                  {visibleThumbnails.map((thumb) => (
                    <div
                      key={thumb.id || thumb.url}
                      className={`thumbnail-item mx-1 ${resolveStorageUrl(activeMainImageUrl) === resolveStorageUrl(thumb.url) ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(thumb.url, thumb.caption)}
                      role="button" tabIndex={0}
                    >
                      <Image src={resolveStorageUrl(thumb.url)} alt={thumb.caption || `Thumbnail`} className="thumbnail-image" />
                    </div>
                  ))}
                </div>
                <Button
                  variant="light" size="sm" onClick={() => navigateThumbnails(1)}
                  disabled={currentThumbnailStartIndex >= maxThumbnailStart} className="thumbnail-nav-arrow"
                > <LuChevronRight /> </Button>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {modelId && (
        <Modal show={showMediaManagerModal} onHide={() => setShowMediaManagerModal(false)} size="xl" centered backdrop="static" keyboard={false} dialogClassName="media-manager-modal">
          <Modal.Body className="media-manager-modal-body" style={{ padding: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <VehicleModelMediaManager
              onHideRequest={handleMediaManagerDidUpdate} // Changed prop name to be more descriptive
              vehicleModelId={modelId}
              vehicleModelTitle={vehicleTitle} // Pass the fetched title
              onMediaUpdate={handleMediaManagerDidUpdate} // This can be the same function
              currentModelColors={availableColors}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default VehicleDisplayGallery;