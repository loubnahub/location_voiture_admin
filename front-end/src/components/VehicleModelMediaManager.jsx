import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Row, Col, Form, Spinner, Alert, Image, ListGroup, Badge, Card, InputGroup } from 'react-bootstrap';
import {
  LuTrash2, LuArrowUp, LuArrowDown, LuImage, LuBox, LuPlus, LuX, LuPalette,
  LuCheck, LuEye, LuGripVertical
} from 'react-icons/lu';
import { resolveStorageUrl } from './VehicleDisplayGallery'; // Make sure to import this at the top

import { UploadCloud, Save, Edit3, CheckCircle as IconCheckCircleLucide } from 'lucide-react';
import { ChromePicker } from 'react-color';
import {
  fetchVehicleModelMediaList,
  uploadVehicleModelMedia,
  updateVehicleModelMediaItem,
  deleteVehicleModelMediaItem,
  reorderVehicleModelMedia,
  fetchVehicleModelColors,
  updateVehicleModelColors
} from '../services/api';
import './VehicleModelMediaManager.css';
import ThreeDModelViewer from './ThreeDModelViewer';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'model/gltf-binary'];
const ALLOWED_EXTENSIONS_DISPLAY = '.jpg, .png, .gif, .webp, .glb';

const VehicleModelMediaManager = ({
  onHide,
  vehicleModelId,
  vehicleModelTitle,
  onMediaUpdate
}) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  const [filesToUpload, setFilesToUpload] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [fileMetadata, setFileMetadata] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [editingCaptionItem, setEditingCaptionItem] = useState(null);
  const [newCaption, setNewCaption] = useState('');
  const [newColorHexForEdit, setNewColorHexForEdit] = useState('');

  const [colors, setColors] = useState([]);
  const [isLoadingColors, setIsLoadingColors] = useState(false);
  const [colorError, setColorError] = useState(null);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FFFFFF');
  const [showColorPickerModal, setShowColorPickerModal] = useState(false);
  const [colorPickerCurrentHex, setColorPickerCurrentHex] = useState('#FFFFFF');

  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [globalSuccessMessage, setGlobalSuccessMessage] = useState('');
  const [globalError, setGlobalError] = useState('');

  // Combined load function
  const loadInitialData = useCallback(async () => {
    if (!vehicleModelId) return;
    setIsLoadingMedia(true); setIsLoadingColors(true);
    setMediaError(null); setColorError(null); setGlobalError(''); setGlobalSuccessMessage('');

    try {
      const [mediaResponse, colorsResponse] = await Promise.all([
        fetchVehicleModelMediaList(vehicleModelId),
        fetchVehicleModelColors(vehicleModelId)
      ]);
      setMediaItems(mediaResponse.data.data || []);
      let colorData = colorsResponse.data.data;
      if (typeof colorData === 'string') {
        try { colorData = JSON.parse(colorData); } catch { colorData = []; }
      }
      setColors(Array.isArray(colorData) ? colorData : []);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Could not load data.";
      setMediaError(errMsg); setColorError(errMsg); setGlobalError(errMsg);
      setMediaItems([]); setColors([]);
    } finally {
      setIsLoadingMedia(false); setIsLoadingColors(false);
    }
  }, [vehicleModelId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFilesBatch = []; const newPreviewsBatch = []; const newMetadataBatch = [];
    let hasErrorInBatch = false; setGlobalError(null);

    selectedFiles.forEach(file => {
      if (file.size > MAX_FILE_SIZE_BYTES) { setGlobalError(`File "${file.name}" > ${MAX_FILE_SIZE_MB}MB.`); hasErrorInBatch=true; return; }
      if (!ALLOWED_MIMES.includes(file.type) && !file.name.toLowerCase().endsWith('.glb')) { setGlobalError(`File "${file.name}" type not allowed.`); hasErrorInBatch=true; return; }
      newFilesBatch.push(file);
      let mediaType = 'image'; if (file.name.toLowerCase().endsWith('.glb')) mediaType = '3d_model_glb';
      newMetadataBatch.push({ caption: file.name.split('.').slice(0, -1).join('.'), media_type: mediaType, is_cover: false, color_hex: colors[0]?.hex || '' });
      if (mediaType === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => setPreviews(prev => [...prev, {fileName: file.name, dataUrl: reader.result}]);
        reader.readAsDataURL(file);
      } else { setPreviews(prev => [...prev, {fileName: file.name, dataUrl: null}]); }
    });
    if (hasErrorInBatch) return;
    setFilesToUpload(prev => [...prev, ...newFilesBatch]);
    setFileMetadata(prev => [...prev, ...newMetadataBatch]);
    event.target.value = null;
  };

  const handleMetadataChange = (index, field, value) => {
    const updatedMetadata = [...fileMetadata];
    if (field === 'is_cover' && value === true) updatedMetadata.forEach((meta, i) => meta.is_cover = (i === index));
    else updatedMetadata[index][field] = value;
    setFileMetadata(updatedMetadata);
  };
  const handleRemoveFileFromUpload = (indexToRemove) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== indexToRemove));
    setPreviews(prev => prev.filter((f, i) => i !== indexToRemove));
    setFileMetadata(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // --- Color Management ---
  const handleColorNameChange = (e) => setNewColorName(e.target.value);
  const handleColorHexChangeInPicker = (color) => setColorPickerCurrentHex(color.hex);
  const handleOpenColorPicker = () => { setColorPickerCurrentHex(newColorHex); setShowColorPickerModal(true); };
  const handleSelectColorFromPicker = () => { setNewColorHex(colorPickerCurrentHex); setShowColorPickerModal(false); };
  const handleAddNewColor = (e) => {
    e.preventDefault();
    if (!newColorName.trim()) { setColorError("Color name is required."); return; }
    if (colors.find(c => c.hex.toLowerCase() === newColorHex.toLowerCase())) { setColorError("This hex color already exists."); return; }
    if (colors.find(c => c.name.toLowerCase() === newColorName.toLowerCase().trim())) { setColorError("This color name already exists."); return; }
    setColorError(null);
    setColors(prev => [...prev, { name: newColorName.trim(), hex: newColorHex.toUpperCase() }]);
    setNewColorName(''); setNewColorHex('#FFFFFF'); setColorPickerCurrentHex('#FFFFFF');
  };
  const handleDeleteColor = (hexToDelete) => {
    if (!window.confirm("Are you sure you want to remove this color? This won't affect existing media, only the available color palette for this model.")) return;
    setColors(prev => prev.filter(c => c.hex !== hexToDelete));
  };

  // --- Existing Media Item Actions ---
  const handleOpenEditCaptionModal = (item) => {
    setEditingCaptionItem(item);
    setNewCaption(item.caption || '');
    setNewColorHexForEdit(item.color_hex || '');
  };

  const handleSaveCaptionAndColorLocal = async () => {
    if (!editingCaptionItem) return;
    setMediaItems(prev =>
      prev.map(item =>
        item.id === editingCaptionItem.id
          ? { ...item, caption: newCaption, color_hex: newColorHexForEdit }
          : item
      )
    );
    setGlobalSuccessMessage('Caption and color updated locally. Save all changes to persist.');
    setEditingCaptionItem(null);
  };

  const handleSetCoverLocal = (mediaIdToSet) => {
    setMediaItems(prev => prev.map(item => ({
        ...item,
        is_cover: item.id === mediaIdToSet && item.media_type === 'image'
    })));
    setGlobalSuccessMessage('Cover image changed locally. Save all changes to persist.');
  };
  const handleDeleteMediaItemLocal = (mediaIdToDelete) => {
    if (!window.confirm("Mark this media for deletion? It will be permanently deleted on 'Submit All Changes'.")) return;
    setMediaItems(prev => prev.map(item => item.id === mediaIdToDelete ? {...item, _toBeDeleted: true } : item));
    setGlobalSuccessMessage('Media marked for deletion. Save all changes to persist.');
  };
  const handleUndeleteMediaItemLocal = (mediaIdToUndelete) => {
    setMediaItems(prev => prev.map(item => item.id === mediaIdToUndelete ? {...item, _toBeDeleted: false } : item));
  };
  const handleReorderMedia = async (orderedMedia) => {
    setMediaItems(orderedMedia.map((item, index) => ({ ...item, order: index + 1 })));
    setGlobalSuccessMessage('Media reordered locally. Save all changes to persist.');
  };
  const handleMoveMediaItem = (index, direction) => {
    const newItems = [...mediaItems];
    const item = newItems.splice(index, 1)[0];
    newItems.splice(index + direction, 0, item);
    handleReorderMedia(newItems);
  };

  // --- Color Change for Existing Media (outside edit mode) ---
  const handleColorChangeForMedia = (mediaId, newHex) => {
    setMediaItems(prev =>
      prev.map(item =>
        item.id === mediaId ? { ...item, color_hex: newHex } : item
      )
    );
    setGlobalSuccessMessage('Color changed locally. Save all changes to persist.');
  };

  // --- SUBMIT ALL CHANGES ---
  const handleSubmitAllChanges = async () => {
    setIsSubmittingAll(true); setGlobalError(null); setGlobalSuccessMessage(null);
    try {
      // 1. Upload new files
      if (filesToUpload.length > 0) {
        const newFilesFormData = new FormData();
        filesToUpload.forEach((file, index) => {
          newFilesFormData.append('media_files[]', file);
          newFilesFormData.append(`captions[${index}]`, fileMetadata[index]?.caption || '');
          newFilesFormData.append(`media_types[${index}]`, fileMetadata[index]?.media_type || 'image');
          newFilesFormData.append(`is_cover_flags[${index}]`, fileMetadata[index]?.is_cover ? '1' : '0');
          newFilesFormData.append(`color_hexes[${index}]`, fileMetadata[index]?.color_hex || '');
        });
        await uploadVehicleModelMedia(vehicleModelId, newFilesFormData);
        setFilesToUpload([]); setPreviews([]); setFileMetadata([]);
      }

      // 2. Delete marked media items
      const itemsToDelete = mediaItems.filter(item => item._toBeDeleted && item.id);
      for (const item of itemsToDelete) {
        await deleteVehicleModelMediaItem(item.id);
      }

      // 3. Update existing media items (caption, is_cover, color_hex, order)
      const itemsToUpdate = mediaItems.filter(item => !item._toBeDeleted && item.id);
      for (const item of itemsToUpdate) {
        await updateVehicleModelMediaItem(item.id, {
          caption: item.caption,
          is_cover: item.is_cover,
          color_hex: item.color_hex,
        });
      }
      // 4. Reorder all current (non-deleted) media items
      const orderedIds = itemsToUpdate.map(item => item.id);
      if (orderedIds.length > 0) {
        await reorderVehicleModelMedia(vehicleModelId, orderedIds);
      }

      // 5. Update colors
      await updateVehicleModelColors(vehicleModelId, { available_colors: colors });

      setGlobalSuccessMessage("All media and color changes submitted successfully!");
      await loadInitialData();
      if (onMediaUpdate) onMediaUpdate();
    } catch (err) {
      setGlobalError(err.response?.data?.message || "Failed to submit changes. Please check individual errors.");
    } finally {
      setIsSubmittingAll(false);
    }
  };

  return (
    <div className="vehicle-model-media-manager-content p-3">
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <h4 className="mb-0">Manage Media & Colors: {vehicleModelTitle || "Vehicle Model"}</h4>
        <Button variant="outline-secondary" size="sm" onClick={onHide}>
            <LuX size={18} className="me-1" /> Close Manager
        </Button>
      </div>

      {globalError && <Alert variant="danger" onClose={() => setGlobalError(null)} dismissible>{globalError}</Alert>}
      {globalSuccessMessage && <Alert variant="success" onClose={() => setGlobalSuccessMessage(null)} dismissible>{globalSuccessMessage}</Alert>}

      {/* --- Color Management Section --- */}
      <Card className="mb-4">
        <Card.Header><LuPalette className="me-2"/>Available Colors</Card.Header>
        <Card.Body>
          {colorError && <Alert variant="warning" size="sm" onClose={() => setColorError(null)} dismissible>{colorError}</Alert>}
          <Form onSubmit={handleAddNewColor} className="mb-3">
            <Row className="g-2 align-items-end">
              <Col xs={12} sm="auto">
                <Form.Label htmlFor="newColorName" className="visually-hidden">Color Name</Form.Label>
                <Form.Control id="newColorName" size="sm" type="text" placeholder="Color Name (e.g., Alpine White)" value={newColorName} onChange={handleColorNameChange} required />
              </Col>
              <Col xs="auto">
                <Form.Label htmlFor="colorPreviewButton" className="visually-hidden">Pick Color</Form.Label>
                <Button id="colorPreviewButton" variant="light" onClick={handleOpenColorPicker} className="color-picker-trigger-btn" style={{ backgroundColor: newColorHex, width: '38px', height: '38px', border: '1px solid #ccc' }} aria-label="Open color picker"/>
              </Col>
              <Col xs="auto">
                 <Form.Control plaintext readOnly value={newColorHex.toUpperCase()} size="sm" style={{fontFamily: 'monospace'}} />
              </Col>
              <Col xs="auto">
                <Button type="submit" variant="outline-success" size="sm"><LuPlus size={16} className="me-1"/>Add</Button>
              </Col>
            </Row>
          </Form>
          {isLoadingColors ? <Spinner animation="border" size="sm" /> :
            colors.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {colors.map(color => (
                  <Badge pill key={color.hex} bg="light" text="dark" className="p-2 d-flex align-items-center color-tag-badge">
                    <span style={{ display: 'inline-block', width: 18, height: 18, backgroundColor: color.hex, border: '1px solid #ddd', borderRadius: '50%', marginRight: 8 }} title={color.hex} />
                    {color.name} ({color.hex.toUpperCase()})
                    <Button variant="link" size="sm" className="text-danger p-0 ms-2" onClick={() => handleDeleteColor(color.hex)} title="Delete Color"><LuX size={14}/></Button>
                  </Badge>
                ))}
              </div>
            ) : <p className="text-muted small mb-0">No colors defined for this model yet.</p>
          }
        </Card.Body>
      </Card>

      {/* ChromePicker Modal */}
      <Modal show={showColorPickerModal} onHide={() => setShowColorPickerModal(false)} centered size="sm">
        <Modal.Header closeButton><Modal.Title>Select Color</Modal.Title></Modal.Header>
        <Modal.Body className="d-flex justify-content-center">
          <ChromePicker color={colorPickerCurrentHex} onChangeComplete={handleColorHexChangeInPicker} disableAlpha styles={{ default: { picker: { boxShadow: 'none', width: 'auto' } } }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowColorPickerModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSelectColorFromPicker}>Select</Button>
        </Modal.Footer>
      </Modal>

      {/* Upload New Media Section */}
      <Card className="mb-4">
        <Card.Header><UploadCloud className="me-2"/>Upload New Media</Card.Header>
        <Card.Body>
          {globalError && <Alert variant="warning" size="sm" onClose={() => setGlobalError(null)} dismissible>{globalError}</Alert>}
          <Form.Group controlId="mediaFileUpload" className="mb-3">
            <Form.Label>Select files (images or .glb, max {MAX_FILE_SIZE_MB}MB each)</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileSelect} accept={ALLOWED_MIMES.join(',')} />
            <Form.Text muted>{ALLOWED_EXTENSIONS_DISPLAY}</Form.Text>
          </Form.Group>

          {filesToUpload.length > 0 && (
            <div>
              <h6 className="mt-3">Files Queued for Upload:</h6>
              {filesToUpload.map((file, index) => (
                <Card key={index} className="mb-2 upload-preview-card">
                  <Card.Body className="p-2">
                    <Row className="align-items-center g-2">
                      <Col xs={3} md={2} className="text-center">
                        {previews.find(p=>p.fileName === file.name)?.dataUrl && fileMetadata[index]?.media_type === 'image' ? (
                          <Image src={previews.find(p=>p.fileName === file.name)?.dataUrl} alt={file.name} fluid rounded style={{ maxHeight: '50px' }} />
                        ) : ( fileMetadata[index]?.media_type === '3d_model_glb' ? <LuBox size={30} className="text-secondary"/> : <LuImage size={30} className="text-secondary"/> )}
                      </Col>
                      <Col xs={9} md={10}>
                        <Form.Control className="mb-1" size="sm" type="text" placeholder="Caption" value={fileMetadata[index]?.caption || ''} onChange={(e) => handleMetadataChange(index, 'caption', e.target.value)} />
                        <Row className="g-2">
                            <Col sm={5}><Form.Select size="sm" value={fileMetadata[index]?.media_type || 'image'} onChange={(e) => handleMetadataChange(index, 'media_type', e.target.value)}> <option value="image">Image</option> <option value="3d_model_glb">3D Model</option> </Form.Select></Col>
                            <Col sm={4}><Form.Select size="sm" value={fileMetadata[index]?.color_hex || ''} onChange={e => handleMetadataChange(index, 'color_hex', e.target.value)} disabled={colors.length === 0} style={{ minWidth: '110px' }}><option value="">Assign Color</option>{colors.map(c=><option key={c.hex} value={c.hex}>{c.name}</option>)}</Form.Select></Col>
                            <Col sm={3} className="d-flex align-items-center justify-content-end">
                                <Form.Check type="radio" id={`cover-upload-${index}`} name="uploadCoverRadio" label="Cover" bsPrefix="form-check-inline form-check-sm" checked={fileMetadata[index]?.is_cover || false} onChange={(e) => handleMetadataChange(index, 'is_cover', e.target.checked)} disabled={fileMetadata[index]?.media_type !== 'image'}/>
                                <Button variant="link" className="text-danger p-0 ms-2" onClick={() => handleRemoveFileFromUpload(index)} title="Remove"><LuX size={18}/></Button>
                            </Col>
                        </Row>
                         <small className="text-muted d-block mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Existing Media List Section */}
      <Card className="mb-4">
        <Card.Header><LuImage className="me-2"/>Existing Media</Card.Header>
        <Card.Body>
          {isLoadingMedia && <div className="text-center p-3"><Spinner animation="border" size="sm" /> Loading...</div>}
          {!isLoadingMedia && mediaError && <Alert variant="warning" size="sm">{mediaError}</Alert>}
          {!isLoadingMedia && !mediaError && mediaItems.filter(item => !item._toBeDeleted).length === 0 && <p className="text-muted small mb-0">No existing media items.</p>}
          {!isLoadingMedia && !mediaError && mediaItems.filter(item => !item._toBeDeleted).length > 0 && (
            <ListGroup variant="flush">
              {mediaItems.filter(item => !item._toBeDeleted).map((item, index, arr) => (
                <ListGroup.Item key={item.id || item._temp_id} className="p-2 media-manage-item existing-media-item">
                  <Row className="g-2 align-items-center">
                    <Col xs="auto" className="d-flex flex-column justify-content-center reorder-controls">
                      <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => handleMoveMediaItem(arr.findIndex(i=>i.id===item.id), -1)} disabled={index === 0} title="Move Up"><LuArrowUp size={14}/></Button>
                      <LuGripVertical size={16} className="text-muted my-1 reorder-grip-icon" title="Reorder (drag-drop placeholder)"/>
                      <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => handleMoveMediaItem(arr.findIndex(i=>i.id===item.id), 1)} disabled={index === arr.length - 1} title="Move Down"><LuArrowDown size={14}/></Button>
                    </Col>
                    <Col xs={2} sm={1} className="text-center">
{item.media_type === 'image' ? (
  <Image src={resolveStorageUrl(item.url)} alt={item.caption || 'Media'} thumbnail style={{ maxHeight: '40px', maxWidth: '60px' }} />
) : item.media_type === '3d_model_glb' ? (
  <div style={{ width: 100, height: 80 }}>
    <ThreeDModelViewer src={resolveStorageUrl(item.url)} style={{ width: '100%', height: '100%' }} />
  </div>
) : (
  <LuBox size={24} className="text-secondary"/>
)}                </Col>
                    <Col>
  {editingCaptionItem?.id === item.id ? (
    <InputGroup size="sm" className="mb-1">
      <Form.Control
        type="text"
        value={newCaption}
        onChange={e => setNewCaption(e.target.value)}
        autoFocus
        placeholder="Edit caption"
      />
      <Button variant="outline-success" onClick={handleSaveCaptionAndColorLocal}>
        <Save size={16} />
      </Button>
      <Button variant="outline-secondary" onClick={() => setEditingCaptionItem(null)}>
        <LuX size={16} />
      </Button>
    </InputGroup>
  ) : (
    <span
      className="media-caption-display clickable"
      onClick={() => handleOpenEditCaptionModal(item)}
      title="Click to edit caption"
      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
    >
      {item.caption || <em className="text-muted">No caption</em>}
      <Edit3 size={16} className="ms-2 text-primary" />
    </span>
  )}
  {item.is_cover && <Badge bg="success" pill className="ms-2">Cover</Badge>}
  <small className="text-muted d-block">Order: {item.order} | Type: {item.media_type}</small>
</Col>

                     <Col xs={12} md="auto" className="mt-1 mt-md-0">
                        {editingCaptionItem?.id === item.id ? null : (
                          <Form.Select size="sm" value={item.color_hex || ''} 
                              onChange={e => handleColorChangeForMedia(item.id, e.target.value)}
                              disabled={colors.length === 0}
                              style={{ minWidth: '120px' }}
                              title="Assign Color from Palette"
                          >
                              <option value="">No Color</option>
                              {colors.map(c=><option key={c.hex} value={c.hex}>{c.name} ({c.hex})</option>)}
                          </Form.Select>
                        )}
                    </Col>
                    <Col xs="auto" className="text-end media-item-actions">
                      {item.media_type === 'image' && !item.is_cover && (
                        <Button variant="link" size="sm" className="p-1 text-success" onClick={() => handleSetCoverLocal(item.id)} title="Set as Cover"><IconCheckCircleLucide size={16}/></Button>
                      )}
                      <Button variant="link" size="sm" className="p-1 text-danger" onClick={() => handleDeleteMediaItemLocal(item.id)} title="Mark for Delete"><LuTrash2 size={16}/></Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
           {mediaItems.filter(item => item._toBeDeleted).length > 0 && (
                <Alert variant="warning" className="mt-3 small">
                    <p className="mb-1">The following media items are marked for deletion upon submitting all changes:</p>
                    <ListGroup variant="flush" bsPrefix="list-group-sm">
                        {mediaItems.filter(item => item._toBeDeleted).map(item => (
                            <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center p-1 bg-transparent border-0">
                                <span>{item.caption || item.url.split('/').pop()}</span>
                                <Button variant="link" size="sm" className="text-info p-0" onClick={() => handleUndeleteMediaItemLocal(item.id)}>Undo</Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Alert>
            )}
        </Card.Body>
      </Card>

      {/* Submit All Changes Button */}
      <div className="mt-4 text-end">
        <Button variant="secondary" onClick={onHide} className="me-2" disabled={isSubmittingAll}>
          Cancel All
        </Button>
        <Button variant="success" size="lg" onClick={handleSubmitAllChanges} disabled={isSubmittingAll || isUploading}>
          {isSubmittingAll ? <><Spinner as="span" animation="border" size="sm" className="me-1"/> Submitting...</>
           : isUploading ? <><Spinner as="span" animation="border" size="sm" className="me-1"/> Uploading Files First...</>
           : <><Save size={18} className="me-1"/> Submit All Changes</>}
        </Button>
      </div>
    </div>
  );
};

export default VehicleModelMediaManager;