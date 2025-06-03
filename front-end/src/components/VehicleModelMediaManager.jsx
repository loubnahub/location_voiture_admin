// VehicleModelMediaManager.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Button, Row, Col, Form, Spinner, Alert, Image, ListGroup, Badge, Card, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap'; // Added DropdownButton, Dropdown
import {
  LuTrash2, LuArrowUp, LuArrowDown, LuImage, LuBox, LuPlus, LuX, LuPalette,
  LuCheck, LuEye, LuGripVertical, LuFilter // Added LuFilter for color filter
} from 'react-icons/lu';
import { resolveStorageUrl } from './VehicleDisplayGallery';

import { UploadCloud, Save, Edit3, CheckCircle as IconCheckCircleLucide } from 'lucide-react';
import { ChromePicker } from 'react-color';
import {
  fetchVehicleModelMediaList,
  uploadVehicleModelMedia,
  updateVehicleModelMediaItem,
  deleteVehicleModelMediaItem,
  reorderVehicleModelMedia, // This API will be used
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
  // Removed isUploading state as handleSubmitAllChanges handles the combined state with isSubmittingAll

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

  const [selectedColorFilter, setSelectedColorFilter] = useState(''); // '' for All Colors

  // Filtered media items based on selectedColorFilter
  const filteredMediaItems = useMemo(() => {
    if (!selectedColorFilter) return mediaItems.filter(item => !item._toBeDeleted); // Show all non-deleted
    return mediaItems.filter(item => !item._toBeDeleted && (item.color_hex === selectedColorFilter || (!item.color_hex && selectedColorFilter === 'UNASSIGNED')));
  }, [mediaItems, selectedColorFilter]);

  const imageMediaItems = filteredMediaItems.filter(item => item.media_type === 'image');
  const model3DMediaItems = filteredMediaItems.filter(item => item.media_type === '3d_model_glb');

  const loadInitialData = useCallback(async () => {
    if (!vehicleModelId) return;
    setIsLoadingMedia(true); setIsLoadingColors(true);
    setMediaError(null); setColorError(null); setGlobalError(''); setGlobalSuccessMessage('');

    try {
      const [mediaResponse, colorsResponse] = await Promise.all([
        fetchVehicleModelMediaList(vehicleModelId),
        fetchVehicleModelColors(vehicleModelId)
      ]);
      // Ensure media items have a stable _localId for UI key and operations before API IDs exist
      setMediaItems((mediaResponse.data.data || []).map(m => ({...m, _localId: m.id || `temp-${Math.random().toString(36).slice(2)}` })));
      let colorData = colorsResponse.data.data;
      if (typeof colorData === 'string') { try { colorData = JSON.parse(colorData); } catch { colorData = []; }}
      setColors(Array.isArray(colorData) ? colorData : []);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Could not load data.";
      setMediaError(errMsg); setColorError(errMsg); setGlobalError(errMsg);
      setMediaItems([]); setColors([]);
    } finally {
      setIsLoadingMedia(false); setIsLoadingColors(false);
    }
  }, [vehicleModelId]);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFilesBatch = []; const newPreviewsBatch = []; const newMetadataBatch = [];
    let hasErrorInBatch = false; setGlobalError(null);

    selectedFiles.forEach(file => {
      if (file.size > MAX_FILE_SIZE_BYTES) { setGlobalError(`File "${file.name}" > ${MAX_FILE_SIZE_MB}MB.`); hasErrorInBatch=true; return; }
      if (!ALLOWED_MIMES.includes(file.type) && !file.name.toLowerCase().endsWith('.glb')) { setGlobalError(`File "${file.name}" type not allowed.`); hasErrorInBatch=true; return; }
      
      const _localId = `new-${file.name}-${Math.random().toString(36).slice(2)}`;
      newFilesBatch.push({file, _localId}); // Store file with localId

      let mediaType = 'image'; if (file.name.toLowerCase().endsWith('.glb')) mediaType = '3d_model_glb';
      
      // If setting a new cover, unmark previous cover in fileMetadata
      let isCoverForThisFile = false;
      if (mediaType === 'image' && fileMetadata.every(m => !m.is_cover) && mediaItems.every(m => !m.is_cover || m._toBeDeleted)) {
          // If no cover is set in queue or existing items, make this first uploaded image the cover
          // Or simply let user choose. For now, default to false.
      }

      newMetadataBatch.push({ 
        _localId, // Link metadata to file
        caption: file.name.split('.').slice(0, -1).join('.'), 
        media_type: mediaType, 
        is_cover: isCoverForThisFile, 
        color_hex: colors[0]?.hex || selectedColorFilter || '' 
      });

      if (mediaType === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => setPreviews(prev => [...prev, {_localId, fileName: file.name, dataUrl: reader.result}]);
        reader.readAsDataURL(file);
      } else { setPreviews(prev => [...prev, {_localId, fileName: file.name, dataUrl: null}]); }
    });
    if (hasErrorInBatch) return;
    setFilesToUpload(prev => [...prev, ...newFilesBatch]);
    setFileMetadata(prev => [...prev, ...newMetadataBatch]);
    event.target.value = null;
  };

  const handleMetadataChange = (localId, field, value) => {
    const updatedMetadata = [...fileMetadata];
    const metaIndex = updatedMetadata.findIndex(m => m._localId === localId);
    if (metaIndex === -1) return;

    if (field === 'is_cover' && value === true) {
      // Unset existing cover on other *newly uploaded* files
      updatedMetadata.forEach((meta) => { if(meta.media_type === 'image') meta.is_cover = false; });
      updatedMetadata[metaIndex].is_cover = true;
      // Unset existing cover on *already uploaded* media items
      setMediaItems(prev => prev.map(item => item.media_type === 'image' ? { ...item, is_cover: false } : item));
    } else {
      updatedMetadata[metaIndex][field] = value;
    }
    setFileMetadata(updatedMetadata);
  };

  const handleRemoveFileFromUpload = (localIdToRemove) => {
    setFilesToUpload(prev => prev.filter(f => f._localId !== localIdToRemove));
    setPreviews(prev => prev.filter(p => p._localId !== localIdToRemove));
    setFileMetadata(prev => prev.filter(m => m._localId !== localIdToRemove));
  };

  // Color Management (largely unchanged, ensure `setColorError(null)` when successful)
  const handleColorNameChange = (e) => setNewColorName(e.target.value);
  const handleColorHexChangeInPicker = (color) => setColorPickerCurrentHex(color.hex);
  const handleOpenColorPicker = () => { setColorPickerCurrentHex(newColorHex); setShowColorPickerModal(true); };
  const handleSelectColorFromPicker = () => { setNewColorHex(colorPickerCurrentHex); setShowColorPickerModal(false); };
  const handleAddNewColor = (e) => {
    e.preventDefault(); setColorError(null);
    if (!newColorName.trim()) { setColorError("Color name is required."); return; }
    if (colors.find(c => c.hex.toLowerCase() === newColorHex.toLowerCase())) { setColorError("This hex color already exists."); return; }
    if (colors.find(c => c.name.toLowerCase() === newColorName.toLowerCase().trim())) { setColorError("This color name already exists."); return; }
    setColors(prev => [...prev, { name: newColorName.trim(), hex: newColorHex.toUpperCase() }]);
    setNewColorName(''); setNewColorHex('#FFFFFF'); setColorPickerCurrentHex('#FFFFFF');
  };
  const handleDeleteColor = (hexToDelete) => {
    if (!window.confirm("Sure? This won't affect existing media, only palette.")) return;
    setColors(prev => prev.filter(c => c.hex !== hexToDelete));
    // If the deleted color was the current filter, reset filter
    if (selectedColorFilter === hexToDelete) setSelectedColorFilter('');
  };

  // Existing Media Actions
  const handleOpenEditCaptionModal = (item) => { setEditingCaptionItem(item); setNewCaption(item.caption || ''); setNewColorHexForEdit(item.color_hex || ''); };
  const handleSaveCaptionAndColorLocal = async () => { // No API call here, just local state
    if (!editingCaptionItem) return;
    setMediaItems(prev => prev.map(item => item._localId === editingCaptionItem._localId ? { ...item, caption: newCaption, color_hex: newColorHexForEdit } : item));
    setGlobalSuccessMessage('Local update. Submit to save.'); setEditingCaptionItem(null);
  };

  const handleSetCoverLocal = (localIdToSet) => { // Operates on _localId
    setMediaItems(prev => prev.map(item => ({ ...item, is_cover: item._localId === localIdToSet && item.media_type === 'image' })));
    // Also uncheck any newly uploaded file metadata that was marked as cover
    setFileMetadata(prevMeta => prevMeta.map(meta => meta.media_type === 'image' ? ({ ...meta, is_cover: false }) : meta));
    setGlobalSuccessMessage('Local cover change. Submit to save.');
  };

  const handleDeleteMediaItemLocal = (localIdToDelete) => {
    if (!window.confirm("Mark for deletion? Permadelete on Submit.")) return;
    setMediaItems(prev => prev.map(item => item._localId === localIdToDelete ? {...item, _toBeDeleted: true } : item));
    setGlobalSuccessMessage('Marked for deletion. Submit to save.');
  };
  const handleUndeleteMediaItemLocal = (localIdToUndelete) => setMediaItems(prev => prev.map(item => item._localId === localIdToUndelete ? {...item, _toBeDeleted: false } : item));
  
  const handleMoveMediaItem = (currentIndexInFiltered, direction) => {
    // We need to operate on the original mediaItems array, not the filtered one, then re-filter.
    const itemToMove = filteredMediaItems[currentIndexInFiltered];
    if (!itemToMove) return;

    const originalIndex = mediaItems.findIndex(mi => mi._localId === itemToMove._localId);
    if (originalIndex === -1) return;

    const newMediaItems = [...mediaItems];
    const [movedItem] = newMediaItems.splice(originalIndex, 1); // Remove item

    // Calculate new position in the original array. This is tricky if items are filtered.
    // A simpler approach for UI-driven reorder within a filter:
    // For now, this basic move works if all items are shown or if the filter is simple.
    // For robust reordering with filters, a more complex logic or backend-assisted reordering is needed.
    // Let's assume for now it works on the currently *displayed* (filtered) subset, and order is global.
    
    let targetOriginalIndex = originalIndex + direction; // Simplistic, might need adjustment with filters

    // Find the actual target index in the original list based on filtered view
    if (direction < 0 && currentIndexInFiltered > 0) { // Moving up
        const itemBeforeInFiltered = filteredMediaItems[currentIndexInFiltered - 1];
        targetOriginalIndex = mediaItems.findIndex(mi => mi._localId === itemBeforeInFiltered._localId);
    } else if (direction > 0 && currentIndexInFiltered < filteredMediaItems.length - 1) { // Moving down
        const itemAfterInFiltered = filteredMediaItems[currentIndexInFiltered + 1];
        targetOriginalIndex = mediaItems.findIndex(mi => mi._localId === itemAfterInFiltered._localId) + 1; // Insert before this item
    } else {
        // If moving to ends or filter complicates, place at start/end of original list relative to current position
        targetOriginalIndex = Math.max(0, Math.min(mediaItems.length -1 , originalIndex + direction));
    }


    newMediaItems.splice(targetOriginalIndex, 0, movedItem); // Insert item at new position

    // Renumber order for all items to ensure sequence
    setMediaItems(newMediaItems.map((item, idx) => ({ ...item, order: idx + 1 })));
    setGlobalSuccessMessage('Local reorder. Submit to save.');
  };

  const handleColorChangeForMedia = (localId, newHex) => setMediaItems(prev => prev.map(item => item._localId === localId ? { ...item, color_hex: newHex } : item));

  const handleSubmitAllChanges = async () => {
    setIsSubmittingAll(true); setGlobalError(null); setGlobalSuccessMessage(null);
    try {
      // 1. Upload new files
      if (filesToUpload.length > 0) {
        const newFilesFormData = new FormData();
        filesToUpload.forEach(({file, _localId}) => {
          const meta = fileMetadata.find(m => m._localId === _localId);
          if (!meta) return; // Should not happen
          newFilesFormData.append('media_files[]', file);
          newFilesFormData.append(`captions[]`, meta.caption || '');
          newFilesFormData.append(`media_types[]`, meta.media_type || 'image');
          newFilesFormData.append(`is_cover_flags[]`, meta.is_cover ? '1' : '0');
          newFilesFormData.append(`color_hexes[]`, meta.color_hex || '');
        });
        await uploadVehicleModelMedia(vehicleModelId, newFilesFormData);
        setFilesToUpload([]); setPreviews([]); setFileMetadata([]);
      }

      // Fetch fresh list after uploads to get IDs for new items before further operations
      const freshMediaResponse = await fetchVehicleModelMediaList(vehicleModelId);
      const upToDateMediaItems = (freshMediaResponse.data.data || []).map(m => ({...m, _localId: m.id, _toBeDeleted: mediaItems.find(mi => mi.id === m.id)?._toBeDeleted || false }));

      // Identify items that were marked for deletion locally using their original IDs
      const itemsToDeleteNow = mediaItems.filter(item => item._toBeDeleted && item.id && !upToDateMediaItems.find(udm => udm.id === item.id && udm._toBeDeleted === false));
      for (const item of itemsToDeleteNow) { await deleteVehicleModelMediaItem(item.id); }
      
      // Update media items that were NOT deleted (caption, is_cover, color_hex)
      // This list should be based on the mediaItems state, as it holds the desired final state.
      const currentLiveMedia = mediaItems.filter(item => !item._toBeDeleted);

      for (const localItem of currentLiveMedia) {
          const apiItem = upToDateMediaItems.find(udm => udm.id === localItem.id); // Find corresponding item from fresh fetch
          if(apiItem) { // It's an existing item to update
             await updateVehicleModelMediaItem(apiItem.id, {
                caption: localItem.caption,
                is_cover: localItem.is_cover,
                color_hex: localItem.color_hex,
             });
          }
      }
      
      // Reorder: get IDs of current, non-deleted items in their current local order
      const finalOrderedIds = mediaItems.filter(item => !item._toBeDeleted && item.id).sort((a,b) => a.order - b.order).map(item => item.id);
      if (finalOrderedIds.length > 0) {
        await reorderVehicleModelMedia(vehicleModelId, finalOrderedIds);
      }

      await updateVehicleModelColors(vehicleModelId, { available_colors: colors });
      setGlobalSuccessMessage("All changes submitted!");
      await loadInitialData(); // Reload everything fresh
      if (onMediaUpdate) onMediaUpdate();
    } catch (err) {
      console.error("Submit All Error: ", err.response?.data || err.message);
      setGlobalError(err.response?.data?.message || "Failed to submit changes.");
    } finally {
      setIsSubmittingAll(false);
    }
  };

  return (
    <div className="vehicle-model-media-manager-content p-md-4 p-3"> {/* Responsive padding */}
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <h4 className="mb-0 text-truncate">Manage Media & Colors: {vehicleModelTitle || "Vehicle Model"}</h4>
        <Button variant="outline-secondary" size="sm" onClick={onHide}>
            <LuX size={18} className="me-1 d-none d-sm-inline" /> Close
        </Button>
      </div>

      {globalError && <Alert variant="danger" onClose={() => setGlobalError(null)} dismissible>{globalError}</Alert>}
      {globalSuccessMessage && <Alert variant="success" onClose={() => setGlobalSuccessMessage(null)} dismissible>{globalSuccessMessage}</Alert>}

      <Card className="mb-4">
        <Card.Header><LuPalette className="me-2"/>Available Colors</Card.Header>
        <Card.Body>
          {colorError && <Alert variant="warning" size="sm" onClose={() => setColorError(null)} dismissible>{colorError}</Alert>}
          <Form onSubmit={handleAddNewColor} className="mb-3">
            <Row className="g-2 align-items-end">
              <Col xs={12} sm={5} md="auto" className="flex-grow-1">
                <Form.Label htmlFor="newColorName" className="visually-hidden">Color Name</Form.Label>
                <Form.Control id="newColorName" size="sm" type="text" placeholder="Color Name" value={newColorName} onChange={handleColorNameChange} required />
              </Col>
              <Col xs="auto">
                <Form.Label htmlFor="colorPreviewButton" className="visually-hidden">Pick Color</Form.Label>
                <Button id="colorPreviewButton" variant="light" onClick={handleOpenColorPicker} className="color-picker-trigger-btn" style={{ backgroundColor: newColorHex, width: '38px', height: '38px', border: '1px solid #ccc' }} aria-label="Open color picker"/>
              </Col>
              <Col xs={4} sm={2} md="auto">
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
            ) : <p className="text-muted small mb-0">No colors defined.</p>
          }
        </Card.Body>
      </Card>

      <Modal show={showColorPickerModal} onHide={() => setShowColorPickerModal(false)} centered size="sm">
        {/* ... ChromePicker Modal content ... */}
        <Modal.Header closeButton><Modal.Title>Select Color</Modal.Title></Modal.Header>
        <Modal.Body className="d-flex justify-content-center"><ChromePicker color={colorPickerCurrentHex} onChangeComplete={handleColorHexChangeInPicker} disableAlpha styles={{ default: { picker: { boxShadow: 'none', width: 'auto' } } }} /></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowColorPickerModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSelectColorFromPicker}>Select</Button></Modal.Footer>
      </Modal>

      <Card className="mb-4">
        <Card.Header><UploadCloud className="me-2"/>Upload New Media</Card.Header>
        <Card.Body>
          {/* ... Upload form ... */}
          <Form.Group controlId="mediaFileUpload" className="mb-3">
            <Form.Label>Select files (max {MAX_FILE_SIZE_MB}MB each)</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileSelect} accept={ALLOWED_MIMES.join(',')} />
            <Form.Text muted>{ALLOWED_EXTENSIONS_DISPLAY}</Form.Text>
          </Form.Group>

          {filesToUpload.length > 0 && (
            <div>
              <h6 className="mt-3">Files Queued:</h6>
              {filesToUpload.map(({file, _localId}, index) => {
                const meta = fileMetadata.find(m => m._localId === _localId);
                if (!meta) return null;
                const preview = previews.find(p => p._localId === _localId);
                return (
                  <Card key={_localId} className="mb-2 upload-preview-card">
                    <Card.Body className="p-2">
                      <Row className="align-items-center g-2">
                        <Col xs={3} md={2} className="text-center">
                          {preview?.dataUrl && meta.media_type === 'image' ? (
                            <Image src={preview.dataUrl} alt={file.name} fluid rounded style={{ maxHeight: '50px' }} />
                          ) : ( meta.media_type === '3d_model_glb' ? <LuBox size={30} className="text-secondary"/> : <LuImage size={30} className="text-secondary"/> )}
                        </Col>
                        <Col xs={9} md={10}>
                          <Form.Control className="mb-1" size="sm" type="text" placeholder="Caption" value={meta.caption || ''} onChange={(e) => handleMetadataChange(_localId, 'caption', e.target.value)} />
                          <Row className="g-2">
                              <Col sm={5}><Form.Select size="sm" value={meta.media_type || 'image'} onChange={(e) => handleMetadataChange(_localId, 'media_type', e.target.value)}> <option value="image">Image</option> <option value="3d_model_glb">3D Model</option> </Form.Select></Col>
                              <Col sm={4}><Form.Select size="sm" value={meta.color_hex || ''} onChange={e => handleMetadataChange(_localId, 'color_hex', e.target.value)} disabled={colors.length === 0} style={{ minWidth: '110px' }}><option value="">Assign Color</option>{colors.map(c=><option key={c.hex} value={c.hex}>{c.name}</option>)}</Form.Select></Col>
                              <Col sm={3} className="d-flex align-items-center justify-content-end">
                                  {/* Changed to Checkbox for Cover */}
                                  <Form.Check type="checkbox" id={`cover-upload-${_localId}`} label="Cover" bsPrefix="form-check-inline form-check-sm" checked={meta.is_cover || false} onChange={(e) => handleMetadataChange(_localId, 'is_cover', e.target.checked)} disabled={meta.media_type !== 'image'}/>
                                  <Button variant="link" className="text-danger p-0 ms-2" onClick={() => handleRemoveFileFromUpload(_localId)} title="Remove"><LuX size={18}/></Button>
                              </Col>
                          </Row>
                           <small className="text-muted d-block mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span><LuImage className="me-2"/>Existing Media</span>
          <DropdownButton
            id="color-filter-dropdown"
            title={selectedColorFilter ? colors.find(c => c.hex === selectedColorFilter)?.name || (selectedColorFilter === 'UNASSIGNED' ? 'Unassigned' : 'Filter Color') : 'All Colors'}
            variant="outline-secondary"
            size="sm"
            disabled={colors.length === 0 && !mediaItems.some(item => !item.color_hex)}
          >
            <Dropdown.Item onClick={() => setSelectedColorFilter('')} active={!selectedColorFilter}>All Colors</Dropdown.Item>
            {colors.map(color => (
              <Dropdown.Item key={color.hex} onClick={() => setSelectedColorFilter(color.hex)} active={selectedColorFilter === color.hex}>
                <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: color.hex, border: '1px solid #ddd', borderRadius: '50%', marginRight: 5 }} />
                {color.name}
              </Dropdown.Item>
            ))}
            {mediaItems.some(item => !item.color_hex && !item._toBeDeleted) && <Dropdown.Divider />}
            {mediaItems.some(item => !item.color_hex && !item._toBeDeleted) && 
              <Dropdown.Item onClick={() => setSelectedColorFilter('UNASSIGNED')} active={selectedColorFilter === 'UNASSIGNED'}>
                Unassigned Color
              </Dropdown.Item>
            }
          </DropdownButton>
        </Card.Header>
        <Card.Body style={{ position: 'relative', minHeight: 220, overflow: 'visible', background: '#fafbfc' }}>
          {/* ... Existing Media loading/error display ... */}
          <div style={{ opacity: isLoadingMedia ? 0.5 : 1, pointerEvents: isLoadingMedia ? 'none' : 'auto' }}>
            {!isLoadingMedia && mediaError && <Alert variant="warning" size="sm">{mediaError}</Alert>}
            {!isLoadingMedia && filteredMediaItems.length === 0 && <p className="text-muted text-center p-3">No media items match the current filter.</p>}
            
            {/* 3D Models Section (uses filteredMediaItems) */}
            {model3DMediaItems.length > 0 && <>
                <h6 className="mb-2 mt-2"><LuBox className="me-2" />3D Models ({model3DMediaItems.length})</h6>
                <ListGroup variant="flush" className="mb-3">
                {model3DMediaItems.map((item, index) => ( // index here is for the filtered list
                  <ListGroup.Item key={item._localId} className="p-2 media-manage-item existing-media-item">
                    <Row className="g-2 align-items-center">
                      <Col xs="auto" className="d-flex flex-column justify-content-center reorder-controls">
                        <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => handleMoveMediaItem(filteredMediaItems.findIndex(i=>i._localId===item._localId), -1)} disabled={filteredMediaItems.findIndex(i=>i._localId===item._localId) === 0} title="Move Up"><LuArrowUp size={14}/></Button>
                        <LuGripVertical size={16} className="text-muted my-1 reorder-grip-icon"/>
                        <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => handleMoveMediaItem(filteredMediaItems.findIndex(i=>i._localId===item._localId), 1)} disabled={filteredMediaItems.findIndex(i=>i._localId===item._localId) === filteredMediaItems.length - 1} title="Move Down"><LuArrowDown size={14}/></Button>
                      </Col>
                      <Col xs={2} sm={1} className="text-center d-flex align-items-center justify-content-center">
                        <div style={{ width: 100, height: 80 }}><ThreeDModelViewer src={resolveStorageUrl(item.url)} style={{ width: '100%', height: '100%' }} /></div>
                      </Col>
                      <Col>{/* ... Caption Edit ... */}
                        {editingCaptionItem?._localId === item._localId ? ( <InputGroup size="sm" className="mb-1"><Form.Control type="text" value={newCaption} onChange={e => setNewCaption(e.target.value)} autoFocus/><Button variant="outline-success" onClick={handleSaveCaptionAndColorLocal}><Save size={16} /></Button><Button variant="outline-secondary" onClick={() => setEditingCaptionItem(null)}><LuX size={16} /></Button></InputGroup>) 
                        : (<span className="media-caption-display clickable" onClick={() => handleOpenEditCaptionModal(item)} title="Edit caption"><Edit3 size={16} className="ms-2 text-primary me-1" />{item.caption || <em className="text-muted">No caption</em>}</span>)}
                        <small className="text-muted d-block">Order: {item.order} | Type: {item.media_type}</small>
                      </Col>
                      <Col xs={12} md="auto" className="mt-1 mt-md-0">{editingCaptionItem?._localId === item._localId ? null : (<Form.Select size="sm" value={item.color_hex || ''} onChange={e => handleColorChangeForMedia(item._localId, e.target.value)} disabled={colors.length === 0} style={{ minWidth: '120px' }} title="Assign Color"><option value="">No Color</option>{colors.map(c=><option key={c.hex} value={c.hex}>{c.name} ({c.hex})</option>)}</Form.Select>)}</Col>
                      <Col xs="auto" className="text-end media-item-actions"><Button variant="link" size="sm" className="p-1 text-danger" onClick={() => handleDeleteMediaItemLocal(item._localId)} title="Mark for Delete"><LuTrash2 size={16}/></Button></Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>}

            {/* Images Section (uses filteredMediaItems) */}
            {imageMediaItems.length > 0 && <>
                <h6 className="mb-2 mt-3"><LuImage className="me-2" />Images ({imageMediaItems.length})</h6>
                <ListGroup variant="flush">
                {imageMediaItems.map((item, index) => ( // index here is for the filtered list
                  <ListGroup.Item key={item._localId} className="p-2 media-manage-item existing-media-item">
                     <Row className="g-2 align-items-center">
                      <Col xs="auto" className="d-flex flex-column justify-content-center reorder-controls">
                        <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => handleMoveMediaItem(filteredMediaItems.findIndex(i=>i._localId===item._localId), -1)} disabled={filteredMediaItems.findIndex(i=>i._localId===item._localId) === 0} title="Move Up"><LuArrowUp size={14}/></Button>
                        <LuGripVertical size={16} className="text-muted my-1 reorder-grip-icon"/>
                        <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => handleMoveMediaItem(filteredMediaItems.findIndex(i=>i._localId===item._localId), 1)} disabled={filteredMediaItems.findIndex(i=>i._localId===item._localId) === filteredMediaItems.length - 1} title="Move Down"><LuArrowDown size={14}/></Button>
                      </Col>
                      <Col xs={2} sm={1} className="text-center"><Image src={resolveStorageUrl(item.url)} alt={item.caption || 'Media'} thumbnail style={{ maxHeight: '40px', maxWidth: '60px' }} /></Col>
                      <Col>{/* ... Caption Edit ... */}
                        {editingCaptionItem?._localId === item._localId ? ( <InputGroup size="sm" className="mb-1"><Form.Control type="text" value={newCaption} onChange={e => setNewCaption(e.target.value)} autoFocus/><Button variant="outline-success" onClick={handleSaveCaptionAndColorLocal}><Save size={16} /></Button><Button variant="outline-secondary" onClick={() => setEditingCaptionItem(null)}><LuX size={16} /></Button></InputGroup>) 
                        : (<span className="media-caption-display clickable" onClick={() => handleOpenEditCaptionModal(item)} title="Edit caption"><Edit3 size={16} className="ms-2 text-primary me-1" />{item.caption || <em className="text-muted">No caption</em>}</span>)}
                        {item.is_cover && <Badge bg="success" pill className="ms-2">Cover</Badge>}
                        <small className="text-muted d-block">Order: {item.order} | Type: {item.media_type}</small>
                      </Col>
                      <Col xs={12} md="auto" className="mt-1 mt-md-0">{editingCaptionItem?._localId === item._localId ? null : (<Form.Select size="sm" value={item.color_hex || ''} onChange={e => handleColorChangeForMedia(item._localId, e.target.value)} disabled={colors.length === 0} style={{ minWidth: '120px' }} title="Assign Color"><option value="">No Color</option>{colors.map(c=><option key={c.hex} value={c.hex}>{c.name} ({c.hex})</option>)}</Form.Select>)}</Col>
                      <Col xs="auto" className="text-end media-item-actions">
                        {item.media_type === 'image' && !item.is_cover && (<Button variant="link" size="sm" className="p-1 text-success" onClick={() => handleSetCoverLocal(item._localId)} title="Set as Cover"><IconCheckCircleLucide size={16}/></Button>)}
                        <Button variant="link" size="sm" className="p-1 text-danger" onClick={() => handleDeleteMediaItemLocal(item._localId)} title="Mark for Delete"><LuTrash2 size={16}/></Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>}
            
            {mediaItems.filter(item => item._toBeDeleted).length > 0 && (
              <Alert variant="warning" className="mt-3 small">
                <p className="mb-1">Marked for deletion (on Submit):</p>
                <ListGroup variant="flush" bsPrefix="list-group-sm">
                  {mediaItems.filter(item => item._toBeDeleted).map(item => (
                    <ListGroup.Item key={item._localId} className="d-flex justify-content-between align-items-center p-1 bg-transparent border-0">
                      <span>{item.caption || item.url?.split('/').pop()}</span>
                      <Button variant="link" size="sm" className="text-info p-0" onClick={() => handleUndeleteMediaItemLocal(item._localId)}>Undo</Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Alert>
            )}
          </div>
          {isLoadingMedia && ( /* ... Loading overlay ... */
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', zIndex: 10}}>
              <Spinner animation="border" size="sm" /> <span className="ms-2">Loading...</span>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="mt-4 text-end">
        <Button variant="secondary" onClick={onHide} className="me-2" disabled={isSubmittingAll}>Cancel All</Button>
        <Button variant="success" size="lg" onClick={handleSubmitAllChanges} disabled={isSubmittingAll}>
          {isSubmittingAll ? <><Spinner as="span" animation="border" size="sm" className="me-1"/> Submitting...</>
           : <><Save size={18} className="me-1"/> Submit All Changes</>}
        </Button>
      </div>
    </div>
  );
};

export default VehicleModelMediaManager;