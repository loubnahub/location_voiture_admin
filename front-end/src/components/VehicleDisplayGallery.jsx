import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Button, Alert, Image, Modal, Spinner } from 'react-bootstrap';
import { LuChevronLeft, LuChevronRight, LuArrowLeft, LuCamera } from 'react-icons/lu';
import ThreeDModelViewer from './ThreeDModelViewer';
import VehicleModelMediaManager from './VehicleModelMediaManager';
import { fetchVehicleModelMediaList, fetchVehicleModelColors } from '../services/api';
import './VehicleDisplayGallery.css';

const THUMBNAILS_PER_VIEW = 5;

const resolveStorageUrl = (relativePath) => {
  if (!relativePath) return '';
  let cleanedPath = relativePath
    .replace(/^http:\/\/localhost:8000\/storage\//, '')
    .replace(/^public\//, '')
    .replace(/^storage\//, '')
    .replace(/^\//, '');
  if (cleanedPath.toLowerCase().endsWith('.glb')) {
    return `http://localhost:8000/api/stream-glb/${cleanedPath}`;
  }
  if (relativePath.toLowerCase().endsWith('.glb')) {
    return `http://localhost:8000/api/stream-glb/${cleanedPath}`;
  }
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  return `http://localhost:8000/storage/${cleanedPath}`;
};

const VehicleDisplayGallery = ({
  vehicleModelId,
  vehicleTitle = "Vehicle",
  onExitGallery,
  onMediaManaged,
}) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedColorHex, setSelectedColorHex] = useState(null);
  const [activeMainImageUrl, setActiveMainImageUrl] = useState('');
  const [activeMainImageCaption, setActiveMainImageCaption] = useState('');
  const [currentThumbnailStartIndex, setCurrentThumbnailStartIndex] = useState(0);

  const [showMediaManagerModal, setShowMediaManagerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vehicleModelId) {
      setIsLoading(false);
      setMediaItems([]);
      setAvailableColors([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const [mediaRes, colorsRes] = await Promise.all([
          fetchVehicleModelMediaList(vehicleModelId),
          fetchVehicleModelColors(vehicleModelId)
        ]);
        setMediaItems(mediaRes.data.data || []);
        let colorData = colorsRes.data.data;
        if (typeof colorData === 'string') {
          try { colorData = JSON.parse(colorData); } catch { colorData = []; }
        }
        setAvailableColors(Array.isArray(colorData) ? colorData : []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load gallery data.");
        setMediaItems([]);
        setAvailableColors([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [vehicleModelId]);

  useEffect(() => {
    const currentImageItems = (mediaItems || []).filter(item => item.media_type === 'image' || !item.media_type);
    const sortedImages = currentImageItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    setImages(sortedImages);

    const coverImage = sortedImages.find(img => img.is_cover);
    const firstImage = sortedImages[0];
    const initialImageToDisplay = coverImage || firstImage;

    if (initialImageToDisplay) {
      setActiveMainImageUrl(initialImageToDisplay.url);
      setActiveMainImageCaption(initialImageToDisplay.caption || '');
      const idx = sortedImages.findIndex(img => img.id === initialImageToDisplay.id);
      setCurrentThumbnailStartIndex(idx >= 0 ? Math.max(0, Math.floor(idx / THUMBNAILS_PER_VIEW) * THUMBNAILS_PER_VIEW) : 0);
    } else {
      setActiveMainImageUrl('');
      setActiveMainImageCaption('');
      setCurrentThumbnailStartIndex(0);
    }

    if (availableColors.length > 0 && availableColors[0]?.hex) {
      if (!selectedColorHex || !availableColors.find(c => c.hex === selectedColorHex)) {
        setSelectedColorHex(availableColors[0].hex);
      }
    } else if (availableColors.length === 0 && selectedColorHex) {
      setSelectedColorHex(null);
    }
  }, [mediaItems, availableColors, selectedColorHex]);

  const filteredImagesByColor = useMemo(() => {
    if (!selectedColorHex) return images;
    const colorFiltered = images.filter(img => img.color_hex === selectedColorHex);
    return colorFiltered.length > 0 ? colorFiltered : [];
  }, [images, selectedColorHex]);

  // Only reset thumbnail index when color or images change, NOT when main image changes
  useEffect(() => {
    setCurrentThumbnailStartIndex(0);
  }, [selectedColorHex, images]);

  useEffect(() => {
    if (filteredImagesByColor.length > 0) {
      if (!filteredImagesByColor.some(img => resolveStorageUrl(img.url) === resolveStorageUrl(activeMainImageUrl))) {
        setActiveMainImageUrl(filteredImagesByColor[0].url);
        setActiveMainImageCaption(filteredImagesByColor[0].caption || '');
      }
      // Do NOT reset currentThumbnailStartIndex here!
    } else if (images.length > 0 && !activeMainImageUrl) {
      setActiveMainImageUrl(images[0].url);
      setActiveMainImageCaption(images[0].caption || '');
      // Do NOT reset currentThumbnailStartIndex here!
    } else if (images.length === 0) {
      setActiveMainImageUrl('');
      setActiveMainImageCaption('');
      setCurrentThumbnailStartIndex(0);
    }
  }, [filteredImagesByColor, images, activeMainImageUrl]);

  const handleColorSwatchClick = (hexColor) => setSelectedColorHex(hexColor);

  const handleThumbnailClick = (imageUrl, caption) => {
    setActiveMainImageUrl(imageUrl);
    setActiveMainImageCaption(caption || '');
    // Do NOT reset currentThumbnailStartIndex here!
  };

  // --- Improved thumbnail navigation logic ---
  const sourceImages = filteredImagesByColor.length > 0 ? filteredImagesByColor : images;
  const maxStart = Math.max(0, sourceImages.length - THUMBNAILS_PER_VIEW);

  const navigateThumbnails = (direction) => {
    setCurrentThumbnailStartIndex((prev) => {
      let next = prev + direction;
      if (next < 0) next = 0;
      if (next > maxStart) next = maxStart;
      return next;
    });
  };

  const visibleThumbnails = useMemo(() => {
    if (!sourceImages || sourceImages.length === 0) return [];
    return sourceImages.slice(currentThumbnailStartIndex, currentThumbnailStartIndex + THUMBNAILS_PER_VIEW);
  }, [sourceImages, currentThumbnailStartIndex]);

  const handleOpenMediaManager = () => setShowMediaManagerModal(true);
  const handleMediaManagerDidUpdate = () => {
    setShowMediaManagerModal(false);
    if (vehicleModelId) {
      setIsLoading(true);
      Promise.all([
        fetchVehicleModelMediaList(vehicleModelId),
        fetchVehicleModelColors(vehicleModelId)
      ]).then(([mediaRes, colorsRes]) => {
        setMediaItems(mediaRes.data.data || []);
        let cData = colorsRes.data.data;
        if (typeof cData === 'string') try { cData = JSON.parse(cData) } catch { cData = [] }
        setAvailableColors(Array.isArray(cData) ? cData : []);
      }).catch(() => {
        setError("Could not refresh media. Please try again.");
      }).finally(() => setIsLoading(false));
    }
    if (onMediaManaged) onMediaManaged();
  };

  // --- 3D Model selection logic ---
  const threeDModelForColor = (mediaItems || []).find(
    item => item.media_type === '3d_model_glb' && item.color_hex === selectedColorHex
  );
  const defaultThreeDModel = (mediaItems || []).find(
    item => item.media_type === '3d_model_glb' && !item.color_hex
  );
  const threeDModelToShow = threeDModelForColor || defaultThreeDModel;
  const threeDModelColor = threeDModelForColor ? null : selectedColorHex;

  if (isLoading && mediaItems.length === 0 && availableColors.length === 0) {
    return (
      <div className="vehicle-display-gallery-container my-3 my-md-4 text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading Gallery...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="vehicle-display-gallery-container my-3 my-md-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="outline-secondary" size="sm" onClick={onExitGallery}>
          <LuArrowLeft size={18} className="me-1-5" /> Back to Details
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="vehicle-display-gallery-container my-3 my-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3 gallery-header">
          <Button variant="outline-secondary" size="sm" onClick={onExitGallery} className="gallery-back-button">
            <LuArrowLeft size={18} className="me-1-5" /> Back to Vehicle Details
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenMediaManager} className="gallery-manage-media-button">
            <LuCamera size={16} className="me-1-5" /> Manage Media Files
          </Button>
        </div>

        <Row className="g-3 g-lg-4">
          <Col lg={5} md={5} className="three-d-column">
            <div className="three-d-spin-card">
              {threeDModelToShow?.url ? (
                <ThreeDModelViewer
                  src={resolveStorageUrl(threeDModelToShow.url)}
                  alt={threeDModelToShow.caption || `${vehicleTitle} 3D Model`}
                  style={{ width: '100%', height: '100%', minHeight: '300px' }}
                  color={threeDModelColor}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center text-muted three-d-placeholder"
                  style={{ width: '100%', height: '100%', minHeight: '300px' }}
                >
                  3D Model not available.
                </div>
              )}
            </div>
            <p className="text-center text-muted small mt-2 mb-0 three-d-caption">
              {threeDModelToShow?.caption || "3D car presentation 360 spin"}
            </p>
          </Col>

          <Col lg={7} md={7} className="main-display-column">
            {availableColors && availableColors.length > 0 && (
              <div className="color-swatches-container d-flex justify-content-center align-items-center mb-3 py-2">
                {availableColors.map((colorObj, index) => (
                  <Button key={`color-${index}-${colorObj.hex}`} variant="outline-light"
                    className={`color-swatch ${selectedColorHex === colorObj.hex ? 'active' : ''}`}
                    style={{ backgroundColor: colorObj.hex }}
                    onClick={() => handleColorSwatchClick(colorObj.hex)} title={`${colorObj.name || 'Color'} (${colorObj.hex})`}
                  />
                ))}
              </div>
            )}
            <div className="main-image-display-area mb-3 shadow-sm rounded-3 overflow-hidden">
              {activeMainImageUrl ? (
                <Image
                  src={resolveStorageUrl(activeMainImageUrl)}
                  alt={activeMainImageCaption || `${vehicleTitle} Image`}
                  fluid
                  className="main-gallery-image"
                />
              ) : (
                <div className="main-gallery-image-placeholder d-flex flex-column align-items-center justify-content-center text-muted" style={{ minHeight: 220 }}>
                  {isLoading && mediaItems.length === 0 ? (
                    <>
                      <Spinner animation="border" className="mb-2" /><div>Loading...</div>
                    </>
                  ) : filteredImagesByColor.length === 0 && selectedColorHex ? (
                    <>
                      <Image size={38} className="mb-2" />
                      <div>No images for this color</div>
                    </>
                  ) : (
                    <>
                      <Image size={38} className="mb-2" />
                      <div>No image available</div>
                    </>
                  )}
                </div>
              )}
            </div>
            {filteredImagesByColor && filteredImagesByColor.length > 0 && (
              <div className="thumbnail-gallery-strip d-flex align-items-center justify-content-center">
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => navigateThumbnails(-1)}
                  disabled={currentThumbnailStartIndex === 0}
                  className="thumbnail-nav-arrow"
                >
                  <LuChevronLeft />
                </Button>
                <div className="thumbnails-container d-flex mx-2">
                  {visibleThumbnails.map((thumb) => (
                    <div
                      key={thumb.id || thumb.url}
                      className={`thumbnail-item mx-1 ${activeMainImageUrl === thumb.url ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(thumb.url, thumb.caption)}
                      role="button"
                      tabIndex={0}
                    >
                      <Image src={resolveStorageUrl(thumb.url)} alt={thumb.caption || `Thumbnail`} className="thumbnail-image" />
                    </div>
                  ))}
                </div>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => navigateThumbnails(1)}
                  disabled={currentThumbnailStartIndex + THUMBNAILS_PER_VIEW >= sourceImages.length}
                  className="thumbnail-nav-arrow"
                >
                  <LuChevronRight />
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {vehicleModelId && (
        <Modal show={showMediaManagerModal} onHide={() => setShowMediaManagerModal(false)} size="xl" centered backdrop="static" keyboard={false} dialogClassName="media-manager-modal">
          <Modal.Body className="media-manager-modal-body" style={{ padding: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
  <VehicleModelMediaManager
    onHide={handleMediaManagerDidUpdate}
    vehicleModelId={vehicleModelId}
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
export { resolveStorageUrl };