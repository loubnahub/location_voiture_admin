// ./components/VehicleDisplayGallery.js (or wherever it's located)

import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Button, Alert, Image, Modal, Spinner } from 'react-bootstrap';
import { LuChevronLeft, LuChevronRight, LuArrowLeft, LuCamera, 
    LuFeather as LuModelDetailsIcon } from 'react-icons/lu';
import { useParams, useNavigate } from 'react-router-dom'; // Import hooks
import {Edit, Trash2 as DeleteIcon,} from 'lucide-react'
import ThreeDModelViewer from './ThreeDModelViewer'; // Adjust path if needed
import VehicleModelMediaManager from './VehicleModelMediaManager'; // Adjust path if needed
import { 
    fetchVehicleModelById, // To get model title and potentially initial cover image
    fetchVehicleModelMediaList, 
    fetchVehicleModelColors,
    deleteVehicleModel // <-- Import the delete function
} from '../services/api'; // Adjust path
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first
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

const VehicleDisplayGallery = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();

  const [vehicleTitle, setVehicleTitle] = useState("Vehicle Gallery");
  const [mediaItems, setMediaItems] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  
  const [imagesForGallery, setImagesForGallery] = useState([]);
  const [selectedColorHex, setSelectedColorHex] = useState(null);
  const [activeMainImageUrl, setActiveMainImageUrl] = useState('');
  const [activeMainImageCaption, setActiveMainImageCaption] = useState('');
  const [currentThumbnailStartIndex, setCurrentThumbnailStartIndex] = useState(0);

  const [showMediaManagerModal, setShowMediaManagerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for delete confirmation
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (!modelId) {
      setIsLoading(false);
      setError("Vehicle Model ID is missing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setDeleteError(null); // Clear delete error on modelId change
    const fetchData = async () => {
      try {
        const modelDetailsRes = await fetchVehicleModelById(modelId);
        setVehicleTitle(modelDetailsRes.data.data?.title || "Vehicle Gallery");
        if (modelDetailsRes.data.data?.main_image_url) {
            setActiveMainImageUrl(modelDetailsRes.data.data.main_image_url);
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
        if (typeof colorData === 'string') {
          try { colorData = JSON.parse(colorData); } catch { console.error("Failed to parse color data string"); colorData = []; }
        }
        setAvailableColors(Array.isArray(colorData) ? colorData : []);
        
        if (Array.isArray(colorData) && colorData.length > 0 && colorData[0]?.hex) {
            if(!selectedColorHex) setSelectedColorHex(colorData[0].hex);
        }

      } catch (err) {
        if (err.response?.status === 404) {
             setError(`Vehicle Model with ID ${modelId} not found.`);
        } else {
            setError(err.response?.data?.message || "Could not load gallery data.");
        }
        console.error("Error fetching gallery data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [modelId]);

  useEffect(() => {
    const imageMedia = (mediaItems || [])
      .filter(item => item.media_type === 'image' || !item.media_type)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    setImagesForGallery(imageMedia);

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
        setActiveMainImageUrl('');
        setActiveMainImageCaption('');
    }
  }, [mediaItems, activeMainImageUrl]);

  const filteredImagesByColor = useMemo(() => {
    if (!selectedColorHex) return imagesForGallery;
    const colorFiltered = imagesForGallery.filter(img => img.color_hex && img.color_hex.toLowerCase() === selectedColorHex.toLowerCase());
    return colorFiltered.length > 0 ? colorFiltered : imagesForGallery; 
  }, [imagesForGallery, selectedColorHex]);

   useEffect(() => {
    if (filteredImagesByColor.length > 0) {
        if (!filteredImagesByColor.some(img => resolveStorageUrl(img.url) === resolveStorageUrl(activeMainImageUrl))) {
            setActiveMainImageUrl(filteredImagesByColor[0].url);
            setActiveMainImageCaption(filteredImagesByColor[0].caption || '');
            setCurrentThumbnailStartIndex(0);
        }
    } else if (imagesForGallery.length === 0) {
        setActiveMainImageUrl('');
        setActiveMainImageCaption('');
        setCurrentThumbnailStartIndex(0);
    }
  }, [filteredImagesByColor, imagesForGallery, activeMainImageUrl]);

  const handleColorSwatchClick = (hexColor) => {
    setSelectedColorHex(hexColor);
    setCurrentThumbnailStartIndex(0); 
  };

  const handleThumbnailClick = (imageUrl, caption) => {
    setActiveMainImageUrl(imageUrl);
    setActiveMainImageCaption(caption || '');
  };

  const sourceForThumbnails = filteredImagesByColor;
  const maxThumbnailStart = Math.max(0, sourceForThumbnails.length - THUMBNAILS_PER_VIEW);

  const navigateThumbnails = (direction) => {
    setCurrentThumbnailStartIndex((prev) => {
      let next = prev + (direction * THUMBNAILS_PER_VIEW);
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
    navigate(-1);
  };

  const handleOpenMediaManager = () => setShowMediaManagerModal(true);
  const handleMediaManagerDidUpdate = () => {
    setShowMediaManagerModal(false);
    if (modelId) {
      setIsLoading(true);
      Promise.all([
        fetchVehicleModelMediaList(modelId),
        fetchVehicleModelColors(modelId),
        fetchVehicleModelById(modelId)
      ]).then(([mediaRes, colorsRes, modelRes]) => {
        setMediaItems(mediaRes.data.data || []);
        let cData = colorsRes.data.data;
        if (typeof cData === 'string') try { cData = JSON.parse(cData) } catch { cData = [] }
        setAvailableColors(Array.isArray(cData) ? cData : []);
        setVehicleTitle(modelRes.data.data?.title || "Vehicle Gallery");
         if (modelRes.data.data?.main_image_url && !activeMainImageUrl) {
            setActiveMainImageUrl(modelRes.data.data.main_image_url);
        }
      }).catch((err) => {
        console.error("Error refreshing gallery data after media management:", err);
        setError("Could not refresh media. Please try again or leave and re-enter the gallery.");
      }).finally(() => setIsLoading(false));
    }
  };

  const handleDeleteModelClick = () => {
    setDeleteError(null); // Clear previous delete errors
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeleteModel = async () => {
    if (!modelId) {
      setDeleteError("Cannot delete: Model ID is missing.");
      setShowDeleteConfirmModal(false); // Close modal as this is a critical pre-condition fail
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteVehicleModel(modelId);
      setShowDeleteConfirmModal(false);
      // Navigate to the list of vehicle models or a suitable parent page
      navigate('/admin/fleet/vehicle-models', { 
        replace: true, // Replace current history entry
        state: { message: `Vehicle model "${vehicleTitle}" deleted successfully.` } 
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete vehicle model. It might be associated with other records (e.g., vehicles, bookings) that prevent deletion.";
      console.error("Error deleting vehicle model:", err);
      setDeleteError(errorMessage);
      // Keep the modal open to show the error
    } finally {
      setIsDeleting(false);
    }
  };

  const threeDModelForColor = (mediaItems || []).find(
    item => item.media_type === '3d_model_glb' && item.color_hex === selectedColorHex
  );
  const defaultThreeDModel = (mediaItems || []).find(
    item => item.media_type === '3d_model_glb' && !item.color_hex
  );
  const threeDModelToShow = threeDModelForColor || defaultThreeDModel;
  const colorForThreeDModelViewer = threeDModelForColor ? null : selectedColorHex;

  if (isLoading && !mediaItems.length && !availableColors.length && !error) {
    return (
      <div className="vehicle-display-gallery-container my-3 my-md-4 text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading Gallery...</p>
      </div>
    );
  }
  if (error && !isLoading) {
    return (
      <div className="vehicle-display-gallery-container my-3 my-md-4 p-3">
        <Alert variant="danger">{error}</Alert>
        <Button variant="outline-secondary" size="sm" onClick={handleExitGallery}>
          <LuArrowLeft size={18} className="me-1-5" /> Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="vehicle-display-gallery-container container my-3 my-md-4 p-3">
         <div >
            <Button onClick={handleExitGallery} className="back-link-maquette bg-light text-dark p-2 mb-2 shadow-sm btn btn-link">
                <LuArrowLeft size={22} className="me-1"/> 
            </Button>
            <h2 className="text-start mb-3 gallery-vehicle-title">{vehicleTitle}</h2>
        </div>
 
        <Row className="g-3 g-lg-4 align-items-center">
          <Col lg={3} className="three-d-column">
            <div className="three-d-spin-card">
              {isLoading && !threeDModelToShow?.url ? <Spinner animation="border" size="sm" /> : threeDModelToShow?.url ? (
                <ThreeDModelViewer
                  src={resolveStorageUrl(threeDModelToShow.url)}
                  alt={threeDModelToShow.caption || `${vehicleTitle} 3D Model`}
                  style={{ width: '100%', height: '100%', minHeight: '300px' }}
                  color={colorForThreeDModelViewer}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center text-muted three-d-placeholder" style={{ width: '100%', height: '100%', minHeight: '300px' }}>
                  3D Model not available.
                </div>
              )}
            </div>
            <p className="text-center text-muted small mt-2 mb-0 three-d-caption">
              {threeDModelToShow?.caption || "3D car presentation"}
            </p>
          </Col>

          <Col md={8} className="main-display-column">
          <div className="d-flex justify-content-end align-items-center mb-3 gallery-header">
            <Button 
                variant="danger" 
                className="footer-action-button delete-button me-2 px-4 rounded-2" 
                size="sm" 
                onClick={handleDeleteModelClick} // <-- Updated onClick handler
                disabled={isDeleting} // Disable if a delete operation is in progress
            >
                <DeleteIcon size={16} className="me-1 d-inline" />
                Delete
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenMediaManager} className="gallery-manage-media-button px-4 rounded-2">
                <Edit size={16} className="me-1-5" /> Edit
            </Button>
          </div>
            {availableColors && availableColors.length > 0 && (
              <div className="color-swatches-container d-flex justify-content-end align-items-center mb-3 py-2 flex-wrap">
                {availableColors.map((colorObj, index) => (
                  <Button key={`color-${index}-${colorObj.hex}`} variant="outline-light"
                    className={`color-swatch m-1 ${selectedColorHex === colorObj.hex ? 'active' : ''}`}
                    style={{ backgroundColor: colorObj.hex, width: '30px', height: '30px', border: selectedColorHex === colorObj.hex ? '2px solid #007bff' : '1px solid #ccc' }}
                    onClick={() => handleColorSwatchClick(colorObj.hex)} title={`${colorObj.name || 'Color'} (${colorObj.hex})`}
                  />
                ))}
              </div>
            )}
            <div className="main-image-display-area mb-3 rounded-3 overflow-hidden ">
              {isLoading && !activeMainImageUrl ? <div className="main-gallery-image-placeholder d-flex align-items-center justify-content-center" style={{minHeight: 250}}><Spinner animation="border" /></div> : activeMainImageUrl ? (
                <Image
                  src={resolveStorageUrl(activeMainImageUrl)}
                  alt={activeMainImageCaption || `${vehicleTitle} Image`}
                  fluid
                  className="main-gallery-image"
                />
              ) : (
                <div className="main-gallery-image-placeholder d-flex flex-column align-items-center justify-content-center text-muted" style={{ minHeight: 250 }}>
                   <LuCamera size={48} className="mb-2 opacity-50" />
                  <div>No image available</div>
                  {filteredImagesByColor.length === 0 && selectedColorHex && <div>for this color.</div>}
                </div>
              )}
            </div>
            {sourceForThumbnails && sourceForThumbnails.length > 0 && (
              <div className="thumbnail-gallery-strip d-flex align-items-center justify-content-center">
                <Button
                  variant="light" size="sm" onClick={() => navigateThumbnails(-1)}
                  disabled={currentThumbnailStartIndex === 0} className="thumbnail-nav-arrow rounded-circle"
                > <LuChevronLeft /> </Button>
                <div className="thumbnails-container d-flex mx-2">
                  {visibleThumbnails.map((thumb) => (
                    <div
                      key={thumb.id || thumb.url}
                      className={`thumbnail-item mx-1 rounded ${resolveStorageUrl(activeMainImageUrl) === resolveStorageUrl(thumb.url) ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(thumb.url, thumb.caption)}
                      role="button" tabIndex={0}
                    >
                      <Image src={resolveStorageUrl(thumb.url)} alt={thumb.caption || `Thumbnail`} className="thumbnail-image" />
                    </div>
                  ))}
                </div>
                <Button
                  variant="light" size="sm" onClick={() => navigateThumbnails(1)}
                  disabled={currentThumbnailStartIndex >= maxThumbnailStart} className="thumbnail-nav-arrow rounded-circle"
                > <LuChevronRight /> </Button>
              </div>
            )}
          </Col>
           <Col xs={1} className="d-flex flex-column align-items-center justify-content-center ps-2 ps-md-3">
                {modelId && (
                  <Button 
                    variant="light" 
                    className="rounded-3 p-2 shadow text-dark mb-3"
                    style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="View Vehicle Model Details"
                    onClick={() => {
                      navigate(`/admin/fleet/vehicle-models/${modelId}`);
                    }}
                  >
                    <LuModelDetailsIcon size={22} /> 
                  </Button>
                )}
  
                {modelId && (
                  <Button 
                    className="rounded-3 p-2 shadow bg-black text-light"
                    style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="View Vehicle Model Images & Gallery"
                    disabled
                    onClick={() => {
                      navigate(`/admin/fleet/vehicle-models/${modelId}/gallery`);
                    }}
                  >
                    <LuCamera size={22} />
                  </Button>)}
            </Col>
        </Row>
      </div>

      {/* Delete Confirmation Modal */}
      {modelId && (
        <Modal 
            show={showDeleteConfirmModal} 
            onHide={() => { if (!isDeleting) setShowDeleteConfirmModal(false); }} 
            centered 
            backdrop="static" // Prevents closing on backdrop click during delete
            keyboard={false} // Prevents closing with Esc key during delete
        >
          <Modal.Header closeButton={!isDeleting}>
            <Modal.Title>Confirm Delete Vehicle Model</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {deleteError && (
              <Alert variant="danger" onClose={() => setDeleteError(null)} dismissible>
                {deleteError}
              </Alert>
            )}
            <p>Are you sure you want to permanently delete the vehicle model "<strong>{vehicleTitle}</strong>"?</p>
            <p className="text-muted small">This action cannot be undone. Depending on backend setup, this might also affect associated vehicles, bookings, or other related data, or be prevented if dependencies exist.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDeleteModel} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                  Deleting...
                </>
              ) : "Delete Model"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Media Manager Modal */}
      {modelId && (
        <Modal show={showMediaManagerModal} onHide={() => setShowMediaManagerModal(false)} size="xl" centered backdrop="static" keyboard={false} dialogClassName="media-manager-modal">
          <Modal.Body className="media-manager-modal-body" style={{ padding: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <VehicleModelMediaManager
              onHide={handleMediaManagerDidUpdate}
              vehicleModelId={modelId}
              vehicleModelTitle={vehicleTitle}
              onMediaUpdate={handleMediaManagerDidUpdate}
              currentModelColors={availableColors}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default VehicleDisplayGallery;