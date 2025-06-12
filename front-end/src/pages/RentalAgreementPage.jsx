import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ResourcePage from '../components/ResourcePage';
import {
  fetchAllRentalAgreements,
  generateRentalAgreement,
  updateRentalAgreement,
  deleteRentalAgreement,
  sendRentalAgreementNotification,
fetchBookingsForAgreementDropdown
} from '../services/api';
import { Form, Row, Col, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import { LuFileText, LuDownload, LuPrinter, LuSend,} from 'react-icons/lu';
import { CheckSquare, CheckCircle  } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

// --- Initial Form Data for the "Edit Agreement Details" Modal ---
const initialAgreementEditData = {
  id: null,
  signed_by_renter_at: '',
  signed_by_platform_at: '',
  notes: '',
};

// Helper to format date from backend for datetime-local input
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0,16);
    return localISOTime;
  } catch (e) { console.error("Error formatting date for input:", dateString, e); return ''; }
};

// Helper to format various date string inputs to 'YYYY-MM-DD HH:MM:SS' for backend
const formatDateTimeForBackend = (dateTimeString) => {
  if (!dateTimeString || String(dateTimeString).trim() === '') return null;
  const s = String(dateTimeString);
  const backendFormatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (backendFormatRegex.test(s)) return s;
  const dateTimeLocalFormatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (dateTimeLocalFormatRegex.test(s)) return s.replace('T', ' ') + ':00';
  const dateTimeLocalWithSecondsFormatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  if (dateTimeLocalWithSecondsFormatRegex.test(s)) return s.replace('T', ' ');
  if (dateTimeString instanceof Date && !isNaN(dateTimeString)) {
      const pad = (num) => (num < 10 ? '0' : '') + num;
      return `${dateTimeString.getFullYear()}-${pad(dateTimeString.getMonth() + 1)}-${pad(dateTimeString.getDate())} ${pad(dateTimeString.getHours())}:${pad(dateTimeString.getMinutes())}:${pad(dateTimeString.getSeconds())}`;
  }
  console.warn("formatDateTimeForBackend: Unexpected date format:", s, ". Attempting generic parse.");
  try {
    const dateObj = new Date(s);
    if (isNaN(dateObj.getTime())) { console.error("formatDateTimeForBackend: Failed generic parse. Returning null."); return null; }
    const pad = (num) => (num < 10 ? '0' : '') + num;
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
  } catch (e) { console.error("Error in formatDateTimeForBackend final parse:", s, e); return null; }
};

// --- Modal Form Fields for EDITING an Agreement ---
const EditAgreementModalFormFields = ({ formData, handleInputChange, modalFormErrors }) => {
  if (!formData || typeof formData !== 'object' || formData === null) {
    console.error("EditAgreementModalFormFields: CRITICAL - formData is not valid. Received:", formData);
    return (<div className="text-center p-3"><Spinner animation="border" size="sm" /> Error: Invalid form data.</div>);
  }
  return (
    <>
      <Alert variant="info" size="sm" className="mb-3">Edit signing status and notes. Document cannot be changed here.</Alert>
      <Form.Group className="mb-3" controlId="raEditNotes"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={3} name="notes" value={formData.notes || ''} onChange={handleInputChange} placeholder="Internal notes..." isInvalid={!!modalFormErrors?.notes} /><Form.Control.Feedback type="invalid">{modalFormErrors?.notes?.join(', ')}</Form.Control.Feedback></Form.Group>
      <Row>
        <Col md={6}><Form.Group className="mb-3" controlId="raEditSignedByRenterAt"><Form.Label>Signed by Renter At</Form.Label><Form.Control type="datetime-local" name="signed_by_renter_at" value={formatDateForInput(formData.signed_by_renter_at)} onChange={handleInputChange} isInvalid={!!modalFormErrors?.signed_by_renter_at} /><Form.Control.Feedback type="invalid">{modalFormErrors?.signed_by_renter_at?.join(', ')}</Form.Control.Feedback></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3" controlId="raEditSignedByPlatformAt"><Form.Label>Signed by Platform At</Form.Label><Form.Control type="datetime-local" name="signed_by_platform_at" value={formatDateForInput(formData.signed_by_platform_at)} onChange={handleInputChange} isInvalid={!!modalFormErrors?.signed_by_platform_at} /><Form.Control.Feedback type="invalid">{modalFormErrors?.signed_by_platform_at?.join(', ')}</Form.Control.Feedback></Form.Group></Col>
      </Row>
    </>
  );
};

const RentalAgreementPage = () => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [bookingsForDropdown, setBookingsForDropdown] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingForGeneration, setSelectedBookingForGeneration] = useState('');
  const [generationNotes, setGenerationNotes] = useState('');
  const [generationSignedByRenterAt, setGenerationSignedByRenterAt] = useState('');
  const [generationSignedByPlatformAt, setGenerationSignedByPlatformAt] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [generationSuccess, setGenerationSuccess] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reloadDataTrigger, setReloadDataTrigger] = useState(0);
  const [sendingNotificationId, setSendingNotificationId] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState({ type: '', message: '' });
  const [markingAsSignedInfo, setMarkingAsSignedInfo] = useState({ id: null, type: null });

  // In src/pages/RentalAgreementPage.jsx

const fetchBookingsForDropdown = useCallback(async () => {
    setLoadingBookings(true);
    console.log("--- Starting to fetch eligible bookings... ---"); // LOG 1
    try {
      const response = await fetchBookingsForAgreementDropdown();
      
      console.log("API Response Received:", response); // LOG 2 - Check the whole response object

      const data = response.data.data || [];
      console.log("Extracted data from response:", data); // LOG 3 - Check the extracted array

      setBookingsForDropdown(Array.isArray(data) ? data : []);
      console.log("State should now be set."); // LOG 4

    } catch (error) {
      console.error("CRITICAL: Error fetching eligible bookings:", error.response || error);
    } finally {
      setLoadingBookings(false);
    }
}, []);
  const handleOpenGenerateModal = () => {
    fetchBookingsForDropdown();
    setSelectedBookingForGeneration(''); setGenerationNotes('');
    setGenerationSignedByRenterAt(''); setGenerationSignedByPlatformAt('');
    setGenerationError(''); setGenerationSuccess(''); setShowGenerateModal(true);
  };
  const handleCloseGenerateModal = () => setShowGenerateModal(false);

  const handleGenerateAgreement = async () => {
    if (!selectedBookingForGeneration) { setGenerationError("Please select a booking."); return; }
    setIsGenerating(true); setGenerationError(''); setGenerationSuccess('');
    const generationData = {
      booking_id: selectedBookingForGeneration, notes: generationNotes || null,
      signed_by_renter_at: formatDateTimeForBackend(generationSignedByRenterAt),
      signed_by_platform_at: formatDateTimeForBackend(generationSignedByPlatformAt),
    };
    try {
      await generateRentalAgreement(generationData);
      setGenerationSuccess('Rental agreement generated!'); setReloadDataTrigger(p => p + 1);
      setTimeout(() => { handleCloseGenerateModal(); setGenerationSuccess(''); }, 2000);
    } catch (error) {
      console.error("Error generating agreement:", error.response?.data || error.message, error);
      const apiErrors = error.response?.data?.errors;
      let errorMsg = 'Failed to generate agreement.';
      if (apiErrors) errorMsg = Object.keys(apiErrors).map(key => `${key.replace(/_/g, ' ')}: ${apiErrors[key].join(', ')}`).join('; ');
      else if (error.response?.data?.message) errorMsg = error.response.data.message;
      setGenerationError(errorMsg);
    } finally { setIsGenerating(false); }
  };

  const processAgreementUpdateData = useCallback((data) => {
    const processed = {};
    if (data.notes !== undefined) processed.notes = data.notes === '' ? null : data.notes;
    if (data.signed_by_renter_at !== undefined) processed.signed_by_renter_at = formatDateTimeForBackend(data.signed_by_renter_at);
    if (data.signed_by_platform_at !== undefined) processed.signed_by_platform_at = formatDateTimeForBackend(data.signed_by_platform_at);
    return processed;
  }, []);

  const markAsSigned = async (agreementId, byWhom, specificLoadItemsFunc = null) => {
    setMarkingAsSignedInfo({ id: agreementId, type: byWhom });
    const now = new Date();
    const pad = (num) => (num < 10 ? '0' : '') + num;
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const updateData = {};
    if (byWhom === 'renter') updateData.signed_by_renter_at = timestamp;
    else if (byWhom === 'platform') updateData.signed_by_platform_at = timestamp;

    try {
      await updateRentalAgreement(agreementId, updateData);
      if (specificLoadItemsFunc && typeof specificLoadItemsFunc === 'function') {
        specificLoadItemsFunc();
      } else {
        setReloadDataTrigger(p => p + 1);
      }
      setNotificationStatus({ type: 'success', message: `Agreement marked signed by ${byWhom}.` });
      setTimeout(() => setNotificationStatus({ type: '', message: '' }), 3000);
    } catch (error) {
      console.error(`Error marking signed by ${byWhom}:`, error);
      const apiErrors = error.response?.data?.errors;
      let errorMsg = error.response?.data?.message || `Failed to record ${byWhom} signature.`;
      if (apiErrors) errorMsg = Object.keys(apiErrors).map(key => `${key.replace(/_/g, ' ')}: ${apiErrors[key].join(', ')}`).join('; ');
      setNotificationStatus({ type: 'danger', message: errorMsg });
    } finally {
      setMarkingAsSignedInfo({ id: null, type: null });
    }
  };

  const handleSendNotification = async (agreement, loadItemsFunc) => {
    if (!agreement?.id || sendingNotificationId) return;
    setSendingNotificationId(agreement.id); setNotificationStatus({ type: '', message: '' });
    try {
      const response = await sendRentalAgreementNotification(agreement.id);
      setNotificationStatus({ type: 'success', message: response.data.message || 'Notification sent!' });
    } catch (error) {
      console.error("Error sending notification:", error);
      setNotificationStatus({ type: 'danger', message: error.response?.data?.message || 'Failed to send notification.' });
    } finally {
      setSendingNotificationId(null);
      setTimeout(() => setNotificationStatus({ type: '', message: '' }), 5000);
    }
  };

  // --- Columns for the Rental Agreement Table ---
  const agreementColumns = useMemo(() => [
    { header: 'Agreement ID', key: 'id', render: (item) => item.id ? item.id.substring(0, 8) + '...' : 'N/A',},
    { header: 'Booking Ref', key: 'booking_identifier', render: (item) => item.booking_identifier || <span className="text-muted-custom">N/A</span>,},
    { header: 'Renter', key: 'renter_name', render: (item) => item.renter_name || <span className="text-muted-custom">N/A</span>,},
    { header: 'Vehicle', key: 'vehicle_display', render: (item) => item.vehicle_display || <span className="text-muted-custom">N/A</span>,},
    {
      header: 'Document', key: 'document_url_display', textAlign: 'center',
      render: (item) => item.document_url ? (<a href={item.document_url} target="_blank" rel="noopener noreferrer" title="View/Download PDF" className="text-primary"><LuDownload size={20} /></a>) : <span className="text-muted-custom">No File</span>,
    },
    { header: 'Generated At', key: 'generated_at', render: (item) => item.generated_at ? new Date(item.generated_at).toLocaleDateString() : 'N/A',},
    {
      header: 'Renter Signed',
      key: 'signed_by_renter_at',
      textAlign: 'center',
      render: (item) => {
        if (item.signed_by_renter_at) {
          return (
            <div className="d-flex flex-column align-items-center">
              <span  className="text-success">
                <CheckCircle size={18} className="me-1 d-inline" /> Signed
              </span>
              <small className="text-muted">{new Date(item.signed_by_renter_at).toLocaleDateString()}</small>
            </div>
          );
        } else {
          const isLoading = markingAsSignedInfo.id === item.id && markingAsSignedInfo.type === 'renter';
          return (
            <Button
              variant="outline-success"
              size="sm"
              type="button"
              className="mark-signed-button"
              onClick={(e) => { e.stopPropagation(); markAsSigned(item.id, 'renter'); }}
              disabled={isLoading}
              title="Mark Renter Signed"
            >
              {isLoading ? <Spinner as="span" animation="border" size="sm" /> : "Mark Signed"}
            </Button>
          );
        }
      },
    },
    {
      header: 'Platform Signed',
      key: 'signed_by_platform_at',
      textAlign: 'center',
      render: (item) => {
        if (item.signed_by_platform_at) {
          return (
            <div className="d-flex flex-column align-items-center">
               <span className="text-success">
                <CheckCircle size={18} className="me-1 d-inline" /> Signed
              </span>
              <small className="text-muted">{new Date(item.signed_by_platform_at).toLocaleDateString()}</small>
            </div>
          );
        } else {
          const isLoading = markingAsSignedInfo.id === item.id && markingAsSignedInfo.type === 'platform';
          return (
            <Button
              type="button"
              variant="outline-primary"
              size="sm"
              className="mark-signed-button"
              onClick={(e) => { e.stopPropagation(); markAsSigned(item.id, 'platform'); }}
              disabled={isLoading}
              title="Mark Platform Signed"
            >
              {isLoading ? <Spinner as="span" animation="border" size="sm" /> : "Mark Signed"}
            </Button>
          );
        }
      },
    },
  ], [markAsSigned, markingAsSignedInfo]);

  // --- customTableActions: Remove Mark as Signed, keep others ---
  const customTableActions = useCallback((loadItemsFunc) => ([
    {
      icon: <LuDownload size={18} />, title: "View/Download PDF", className: "text-primary",
      handler: (item) => { if (item.document_url) window.open(item.document_url, '_blank'); else alert("Document URL missing."); },
      shouldShow: (item) => !!item.document_url,
    },
    {
      icon: (item) => sendingNotificationId === item.id ? <Spinner as="span" animation="border" size="sm" /> : <LuSend size={18} />,
      handler: (item) => handleSendNotification(item, loadItemsFunc),
      title: "Send Notification to Renter", className: "text-info",
      disabled: () => !!sendingNotificationId,
      shouldShow: (item) => {
        const hasId = !!item.id; const hasBookingIdentifier = !!item.booking_identifier; const hasDocumentUrl = !!item.document_url;
        const show = hasId && hasBookingIdentifier && hasDocumentUrl;
        return show;
      },
    }
  ].filter(Boolean)), [sendingNotificationId, handleSendNotification]);

  return (
    <>
      {notificationStatus.message && (
        <Alert variant={notificationStatus.type || 'info'} dismissible onClose={() => setNotificationStatus({ type: '', message: '' })}
               className="mt-3 mb-0 position-fixed top-0 end-0 p-3" style={{ zIndex: 1050, minWidth: '250px' }}>
          {notificationStatus.message}
        </Alert>
      )}
      <ResourcePage
        resourceName="Rental Agreement" resourceNamePlural="Rental Agreements" IconComponent={LuFileText}
        columns={agreementColumns}
        fetchAllItems={fetchAllRentalAgreements} canCreate={false}
        updateItem={(id, data) => updateRentalAgreement(id, processAgreementUpdateData(data))}
        deleteItem={deleteRentalAgreement} searchPlaceholder="Search Agreements..."
        reloadDataTrigger={reloadDataTrigger}
        tableActionsConfig={customTableActions}
        customHeaderButton={
          <Button variant="success" onClick={handleOpenGenerateModal} className="ms-2">
            <LuPrinter size={18} className="me-1 d-inline" /> Generate New Agreement
          </Button>
        }
      />
      <Modal show={showGenerateModal} onHide={handleCloseGenerateModal} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Generate New Rental Agreement</Modal.Title></Modal.Header>
        <Modal.Body>
          {generationError && <Alert variant="danger">{generationError}</Alert>}
          {generationSuccess && <Alert variant="success">{generationSuccess}</Alert>}
          <Form.Group className="mb-3" controlId="generateRaBookingId">
            <Form.Label>Select Booking <span className="text-danger">*</span></Form.Label>
            <Form.Select 
    value={selectedBookingForGeneration}
    onChange={(e) => { setSelectedBookingForGeneration(e.target.value); setGenerationError(''); }}
    disabled={loadingBookings || isGenerating} required
>
    <option value="">{loadingBookings ? "Loading..." : "Select an eligible booking..."}</option>
    {bookingsForDropdown.map(b => (
        <option key={b.id} value={b.id}>
            {b.display_text}
        </option>
    ))}
</Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="generateRaNotes">
            <Form.Label>Initial Notes (Optional)</Form.Label>
            <Form.Control as="textarea" rows={2} value={generationNotes} onChange={(e) => setGenerationNotes(e.target.value)} placeholder="Notes..." disabled={isGenerating} />
          </Form.Group>
          <Row>
            <Col md={6}><Form.Group className="mb-3" controlId="generateRaSignedByRenterAt"><Form.Label>Signed by Renter At (Optional)</Form.Label><Form.Control type="datetime-local" value={generationSignedByRenterAt} onChange={(e) => setGenerationSignedByRenterAt(e.target.value)} disabled={isGenerating} /></Form.Group></Col>
            <Col md={6}><Form.Group className="mb-3" controlId="generateRaSignedByPlatformAt"><Form.Label>Signed by Platform At (Optional)</Form.Label><Form.Control type="datetime-local" value={generationSignedByPlatformAt} onChange={(e) => setGenerationSignedByPlatformAt(e.target.value)} disabled={isGenerating} /></Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseGenerateModal} disabled={isGenerating}>Cancel</Button>
          <Button variant="primary" onClick={handleGenerateAgreement} disabled={isGenerating || !selectedBookingForGeneration || loadingBookings}>
            {isGenerating && <Spinner as="span" animation="border" size="sm" className="me-1 d-inline"/>} Generate Agreement
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RentalAgreementPage;