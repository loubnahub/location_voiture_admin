import React, { useState, useEffect, useCallback } from 'react';
import ResourcePage from '../components/ResourcePage';
import {
  fetchAllDamageReports,
  createDamageReport,
  updateDamageReport,
  deleteDamageReport,
  fetchAllBookings,
fetchAllUsersForAdmin as fetchAllUsers,
} from '../services/api';
import { Form, Row, Col, Spinner, InputGroup, Button, Image, Alert, CloseButton } from 'react-bootstrap';
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { DamageReportStatus as DamageReportStatusEnum, getDisplayLabel } from '../Enums';

// --- Columns ---
const damageReportColumns = [
  { header: 'Report ID', key: 'id', render: (item) => item.id ? item.id.substring(0, 8) + '...' : 'N/A',},
  { header: 'Booking', key: 'booking_identifier', render: (item) => item.booking_identifier || <span className="text-muted-custom">N/A</span>,},
  { header: 'Vehicle', key: 'vehicle_display', render: (item) => item.vehicle_display || <span className="text-muted-custom">N/A</span>,},
  { header: 'Reported By', key: 'reporter_name', render: (item) => item.reporter_name || <span className="text-muted-custom">N/A</span>,},
  { header: 'Reported At', key: 'reported_at', render: (item) => item.reported_at ? new Date(item.reported_at).toLocaleDateString() : 'N/A',},
  {
    header: 'Status',
    key: 'status_display',
    render: (item) => {
      let badgeBg = 'secondary';
      switch (item.status) {
        case DamageReportStatusEnum.PENDING_ASSESSMENT: badgeBg = 'warning'; break;
        case DamageReportStatusEnum.UNDER_ASSESSMENT: badgeBg = 'info'; break;
        case DamageReportStatusEnum.ASSESSMENT_COMPLETE: badgeBg = 'primary'; break;
        case DamageReportStatusEnum.REPAIR_IN_PROGRESS: badgeBg = 'info'; break;
        case DamageReportStatusEnum.RESOLVED_PAID:
        case DamageReportStatusEnum.RESOLVED_NO_COST: badgeBg = 'success'; break;
        case DamageReportStatusEnum.CLOSED: badgeBg = 'dark'; break;
        default: badgeBg = 'light'; break;
      }
      const textClass = ['light', 'warning', 'info'].includes(badgeBg) ? 'text-dark' : '';
      return item.status_display ? <span className={`badge bg-${badgeBg} ${textClass}`}>{item.status_display}</span> : <span className="text-muted-custom">N/A</span>;
    }
  },
  { header: 'Repair Cost', key: 'repair_cost', textAlign: 'right', render: (item) => item.repair_cost !== null ? `${parseFloat(item.repair_cost).toFixed(2)} MAD` : <span className="text-muted-custom">N/A</span>,},
  { header: 'Images', key: 'image_count', textAlign: 'center', render: (item) => item.image_count !== null ? item.image_count : <span className="text-muted-custom">0</span>,}
];

// --- Initial Form Data ---
const initialDamageReportData = {
  id: null,
  booking_id: '',
  reported_by_user_id: '',
  reported_at: '',
  description: '',
  status: DamageReportStatusEnum.PENDING_ASSESSMENT || 'pending_assessment',
  repair_cost: '',
  newly_uploaded_images: [],
  image_ids_to_delete: [],
};

// --- Helpers ---
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
  } catch (e) { return ''; }
};
const statusOptions = Object.values(DamageReportStatusEnum || {}).map(status => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
}));

// --- Modal Form Fields ---
const DamageReportModalFormFields = ({ formData, handleInputChange, modalFormErrors, isEditMode, setCurrentItemData }) => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [currentImages, setCurrentImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imageUploadError, setImageUploadError] = useState('');
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    const loadDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
        const bookingsPromise = fetchAllBookings({ all: true, with_vehicle_info: true });
        const usersPromise = fetchAllUsers({ all: true });
        const [bookingsRes, usersRes] = await Promise.all([bookingsPromise, usersPromise]);
        const bookingsData = bookingsRes.data.data || bookingsRes.data || [];
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        const usersData = usersRes.data.data || usersRes.data || [];
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        setBookings([]);
        setUsers([]);
      } finally {
        setLoadingDropdowns(false);
      }
    };
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (!isEditMode && !formData.id && !formData.reported_at && setCurrentItemData) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const nowFormatted = now.toISOString().slice(0, 16);
      handleInputChange({ target: { name: 'reported_at', value: nowFormatted } });
    }
  }, [isEditMode, formData.id, formData.reported_at, setCurrentItemData, handleInputChange]);

  useEffect(() => {
    if (isEditMode && formData.id) {
      setLoadingImages(true);
      setImageUploadError('');
      try {
        const existingImages = formData.images || [];
        setCurrentImages(Array.isArray(existingImages) ? existingImages : []);
      } catch (error) {
        setImageUploadError('Failed to load existing images.');
        setCurrentImages([]);
      } finally {
        setLoadingImages(false);
      }
    } else {
      setCurrentImages([]);
      setNewImageFiles([]);
    }
  }, [isEditMode, formData.id, JSON.stringify(formData.images)]);

  const handleImageFileChange = (event) => {
    setImageUploadError('');
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      setNewImageFiles(prevFiles => [...prevFiles, ...filesArray]);
    }
    event.target.value = null;
  };
  const handleRemoveNewImage = (index) => {
    setNewImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  const handleDeleteExistingImage = (imageId) => {
    setCurrentImages(prev => prev.filter(img => img.id !== imageId));
    setCurrentItemData(prevData => ({
      ...prevData,
      image_ids_to_delete: [...(prevData.image_ids_to_delete || []), imageId]
    }));
  };

  useEffect(() => {
    if (setCurrentItemData) {
      setCurrentItemData(prevData => ({
        ...prevData,
        newly_uploaded_images: newImageFiles,
      }));
    }
  }, [newImageFiles, setCurrentItemData]);

  if (loadingDropdowns && !isEditMode && (bookings.length === 0 || users.length === 0)) {
    return (<div className="text-center p-3"><Spinner animation="border" size="sm" className="me-2" />Loading form options...</div>);
  }

  return (
    <>
      <Form.Group className="mb-3" controlId="drBookingId">
        <Form.Label>Related Booking <span className="text-danger">*</span></Form.Label>
        <Form.Select
          name="booking_id"
          value={formData.booking_id || ''}
          onChange={handleInputChange}
          required
          isInvalid={!!modalFormErrors?.booking_id}
          disabled={loadingDropdowns && bookings.length === 0}
        >
          <option value="">{loadingDropdowns && bookings.length === 0 ? "Loading..." : "Select Booking..."}</option>
          {bookings.map(booking => (
            <option key={booking.id} value={booking.id}>
              {`ID: ${booking.id.substring(0, 8)}... (Vehicle: ${booking.vehicle_display || 'N/A'}, Renter: ${booking.renter_name || 'N/A'})`}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {modalFormErrors?.booking_id?.join(', ')}
        </Form.Control.Feedback>
      </Form.Group>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="drReportedByUserId">
            <Form.Label>Reported By <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="reported_by_user_id"
              value={formData.reported_by_user_id || ''}
              onChange={handleInputChange}
              required
              isInvalid={!!modalFormErrors?.reported_by_user_id}
              disabled={loadingDropdowns && users.length === 0}
            >
              <option value="">{loadingDropdowns && users.length === 0 ? "Loading..." : "Select User..."}</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.name} ({user.email})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {modalFormErrors?.reported_by_user_id?.join(', ')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="drReportedAt">
            <Form.Label>Reported At <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="datetime-local"
              name="reported_at"
              value={formatDateForInput(formData.reported_at)}
              onChange={handleInputChange}
              required
              isInvalid={!!modalFormErrors?.reported_at}
            />
            <Form.Control.Feedback type="invalid">
              {modalFormErrors?.reported_at?.join(', ')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-3" controlId="drDescription">
        <Form.Label>Damage Description <span className="text-danger">*</span></Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          required
          placeholder="Detailed description of the damage observed..."
          isInvalid={!!modalFormErrors?.description}
        />
        <Form.Control.Feedback type="invalid">
          {modalFormErrors?.description?.join(', ')}
        </Form.Control.Feedback>
      </Form.Group>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="drStatus">
            <Form.Label>Status <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="status"
              value={formData.status || ''}
              onChange={handleInputChange}
              required
              isInvalid={!!modalFormErrors?.status}
            >
              <option value="">Select Status...</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {modalFormErrors?.status?.join(', ')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="drRepairCost">
            <Form.Label>Repair Cost (MAD)</Form.Label>
            <InputGroup>
              <InputGroup.Text>MAD</InputGroup.Text>
              <Form.Control
                type="number"
                name="repair_cost"
                value={formData.repair_cost || ''}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                isInvalid={!!modalFormErrors?.repair_cost}
              />
            </InputGroup>
            {modalFormErrors?.repair_cost && (
              <div className="invalid-feedback d-block">
                {modalFormErrors.repair_cost.join(', ')}
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>
      <div className="image-management-section border p-3 mt-3">
        <h5>Damage Images</h5>
        {imageUploadError && <Alert variant="danger" size="sm">{imageUploadError}</Alert>}
        {loadingImages && <Spinner animation="border" size="sm" />}
        {!loadingImages && currentImages.length > 0 && (
          <div className="mb-3">
            <h6>Existing Images:</h6>
            <Row xs={2} md={3} lg={4} className="g-2">
              {currentImages.map((image) => (
                <Col key={image.id} className="position-relative">
                  <Image src={image.url} thumbnail fluid style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-1 p-1 lh-1"
                    onClick={() => handleDeleteExistingImage(image.id)}
                    title="Delete this image"
                  >
                    <FaTrash size={10} />
                  </Button>
                </Col>
              ))}
            </Row>
          </div>
        )}
        {!loadingImages && isEditMode && currentImages.length === 0 && (
          <p className="text-muted small">No existing images for this report.</p>
        )}
        {newImageFiles.length > 0 && (
          <div className="mb-3">
            <h6>New Images to Upload:</h6>
            <Row xs={2} md={3} lg={4} className="g-2">
              {newImageFiles.map((file, index) => (
                <Col key={index} className="position-relative">
                  <Image src={URL.createObjectURL(file)} thumbnail fluid style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                  <Button
                    variant="warning"
                    size="sm"
                    className="position-absolute top-0 end-0 m-1 p-1 lh-1"
                    onClick={() => handleRemoveNewImage(index)}
                    title="Remove this image before upload"
                  >
                    <CloseButton variant="white" style={{ fontSize: '0.5rem' }} />
                  </Button>
                  <p className="small text-muted truncate-text" title={file.name}>{file.name}</p>
                </Col>
              ))}
            </Row>
          </div>
        )}
        <Form.Group controlId="drImageUpload">
          <Form.Label>Add Images</Form.Label>
          <Form.Control
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageFileChange}
          />
          <Form.Text className="text-muted">
            You can select multiple images (JPG, PNG, GIF, WEBP).
          </Form.Text>
        </Form.Group>
      </div>
    </>
  );
};

// --- Main Page Component ---
const DamageReportPage = () => {
  // Only process core fields for API (not helper/image fields)
  const processCoreReportFields = useCallback((data) => {
    const processed = {
      id: data.id || null,
      booking_id: data.booking_id || null,
      reported_by_user_id: data.reported_by_user_id || null,
      reported_at: data.reported_at || null,
      description: data.description || '',
      status: data.status || null,
      repair_cost: data.repair_cost || null,
    };

    // Date formatting for reported_at
    if (processed.reported_at) {
      try {
        const date = new Date(processed.reported_at);
        if (!isNaN(date.getTime())) {
          processed.reported_at = date.getFullYear() + '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('0' + date.getDate()).slice(-2) + ' ' +
            ('0' + date.getHours()).slice(-2) + ':' +
            ('0' + date.getMinutes()).slice(-2) + ':' +
            ('0' + date.getSeconds()).slice(-2);
        } else {
          processed.reported_at = null;
        }
      } catch (e) {
        processed.reported_at = null;
      }
    } else {
      processed.reported_at = null;
    }

    // Repair cost formatting
    if (processed.repair_cost === '' || processed.repair_cost === null || processed.repair_cost === undefined) {
      processed.repair_cost = null;
    } else {
      const cost = parseFloat(processed.repair_cost);
      processed.repair_cost = isNaN(cost) ? null : cost;
    }
    return processed;
  }, []);

  const renderModalFormWithLogic = useCallback((formData, handleInputChange, modalFormErrors, isEditMode, setCurrentItemData) => {
    return (
      <DamageReportModalFormFields
        formData={formData}
        handleInputChange={handleInputChange}
        modalFormErrors={modalFormErrors}
        isEditMode={isEditMode}
        setCurrentItemData={setCurrentItemData}
      />
    );
  }, []);

  const handleCreateDamageReport = async (dataFromResourcePage) => {
    console.log("DRP: handleCreate - Raw dataFromResourcePage:", JSON.stringify(dataFromResourcePage, null, 2));
    const coreReportData = processCoreReportFields({ ...dataFromResourcePage });
    const imageFilesToUpload = dataFromResourcePage.newly_uploaded_images || [];

    console.log("DRP: handleCreate - Core Report Data:", coreReportData);
    console.log("DRP: handleCreate - New Image Files:", imageFilesToUpload.map(f => f.name));

    let payload;
    if (imageFilesToUpload.length > 0 && imageFilesToUpload.every(f => f instanceof File)) {
      console.log("DRP: handleCreate - Using FormData.");
      payload = new FormData();
      for (const key in coreReportData) {
        if (coreReportData[key] !== null && coreReportData[key] !== undefined) {
          payload.append(key, String(coreReportData[key]));
        }
      }
      imageFilesToUpload.forEach((file, index) => {
        payload.append(`images[${index}]`, file, file.name);
      });
    } else {
      console.log("DRP: handleCreate - Using JSON.", coreReportData);
      payload = coreReportData;
    }
    return createDamageReport(payload);
  };

  const handleUpdateDamageReport = async (id, dataFromResourcePage) => {
    console.log("DRP: handleUpdate - Raw dataFromResourcePage for ID:", id, JSON.stringify(dataFromResourcePage, null, 2));
    const coreReportData = processCoreReportFields({ ...dataFromResourcePage });
    const imageFilesToUpload = dataFromResourcePage.newly_uploaded_images || [];
    const imageIdsScheduledForDeletion = dataFromResourcePage.image_ids_to_delete || [];

    console.log("DRP: handleUpdate - Core Report Data:", coreReportData);
    console.log("DRP: handleUpdate - New Image Files:", imageFilesToUpload.map(f => f.name));
    console.log("DRP: handleUpdate - Image IDs to Delete:", imageIdsScheduledForDeletion);

    let payload;
    if (imageFilesToUpload.length > 0 && imageFilesToUpload.every(f => f instanceof File)) {
      console.log("DRP: handleUpdate - Using FormData (new images present).");
      payload = new FormData();
      payload.append('_method', 'PUT');

      for (const key in coreReportData) {
        if (coreReportData[key] !== null && coreReportData[key] !== undefined) {
          payload.append(key, String(coreReportData[key]));
        }
      }
      if (imageIdsScheduledForDeletion.length > 0) {
        imageIdsScheduledForDeletion.forEach((imgId) => {
          payload.append('image_ids_to_delete[]', String(imgId));
        });
      }
      imageFilesToUpload.forEach((file, index) => {
        payload.append(`images[${index}]`, file, file.name);
      });
      console.log("DRP: handleUpdate - FormData entries being sent:");
      for (let pair of payload.entries()) {
        console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]);
      }
    } else {
      // No new images, send as JSON. This payload will include image_ids_to_delete if present.
      console.log("DRP: handleUpdate - Using JSON (no new files).");
      payload = { ...coreReportData };
      if (imageIdsScheduledForDeletion.length > 0) {
        payload.image_ids_to_delete = imageIdsScheduledForDeletion;
      }
      // 'newly_uploaded_images' is not part of coreReportData
      // 'images' (array of existing image objects) is also not part of coreReportData
      console.log("DRP: handleUpdate - JSON Payload for ID:", id, JSON.stringify(payload, null, 2));
    }
    return updateDamageReport(id, payload);
  };

  return (
    <ResourcePage
      resourceName="Damage Report"
      resourceNamePlural="Damage Reports"
      IconComponent={FaExclamationTriangle}
      columns={damageReportColumns}
      initialFormData={initialDamageReportData}
      renderModalForm={renderModalFormWithLogic}
      fetchAllItems={fetchAllDamageReports}
      createItem={handleCreateDamageReport}
      updateItem={handleUpdateDamageReport}
      deleteItem={deleteDamageReport}
      searchPlaceholder="Search by description, vehicle, reporter..."
    />
  );
};

export default DamageReportPage;