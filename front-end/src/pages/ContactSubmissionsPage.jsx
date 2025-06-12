import React, { useState } from 'react';
import { Modal, Button, Badge, Row, Col } from 'react-bootstrap';
import { Mail, Eye, User, Phone, Calendar, Type } from 'lucide-react'; // Removed CheckSquare, Square
import ResourcePage from '../components/ResourcePage';
import {
  fetchAllContactSubmissions,
  updateContactSubmission,
  deleteContactSubmission,
} from '../services/api';
import './ReviewDetailsModal.css'; 

// The safe date formatter is correct and remains.
const formatSafeDate = (dateString, format = 'locale-string') => {
  if (!dateString || new Date(dateString).toString() === 'Invalid Date') {
    return 'N/A';
  }
  const date = new Date(dateString);
  if (format === 'locale-string') return date.toLocaleString();
  if (format === 'locale-date') return date.toLocaleDateString();
  return date.toISOString();
};

const contactColumns = [
  { header: 'Status', key: 'is_read', render: (item) => (
      item.is_read
        ? <Badge pill bg="success" className="fw-normal">Read</Badge>
        : <Badge pill bg="warning" className="fw-normal text-dark">Unread</Badge>
  )},
  { header: 'Name', key: 'name', className: 'fw-bold' },
  { header: 'Email', key: 'email' },
  { header: 'Subject', key: 'subject', render: (item) => item.subject.substring(0, 40) + (item.subject.length > 40 ? '...' : '') },
  { 
    header: 'Received', 
    key: 'created_at_iso',
    render: (item) => formatSafeDate(item.created_at_iso, 'locale-date')
  },
];

const ContactSubmissionsPage = () => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reloadDataTrigger, setReloadDataTrigger] = useState(0);

  // --- THIS IS THE PRIMARY CHANGE ---
  // The function now automatically marks the message as read if it isn't already.
  const handleShowDetails = (message) => {
    // If the message is already read, just show it.
    if (message.is_read) {
      setSelectedMessage(message);
      setShowDetailsModal(true);
      return;
    }

    // If it's unread, send the update request in the background.
    updateContactSubmission(message.id, { is_read: true })
      .then(() => {
        // On success, trigger the main table to reload its data to show the new "Read" badge.
        setReloadDataTrigger(prev => prev + 1);
      })
      .catch(err => {
        // Log the error, but still open the modal so the user isn't blocked.
        console.error("Failed to auto-mark as read:", err);
      });
    
    // Optimistically update the object before showing the modal.
    // This isn't strictly necessary anymore but is good practice.
    const messageToView = { ...message, is_read: true };
    setSelectedMessage(messageToView);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedMessage(null);
  };

  // The toggle button handler is no longer needed in the modal,
  // but we leave the function here in case you want to add a button back to the table later.
  // const handleToggleReadStatus = useCallback(...)

  const viewAction = {
    icon: <Eye size={18} />,
    title: 'View Message Details',
    handler: handleShowDetails,
  };

  const tableActionsConfig = [viewAction];

  return (
    <>
      <ResourcePage
        resourceName="Contact Message"
        resourceNamePlural="Contact Messages"
        IconComponent={Mail}
        columns={contactColumns}
        fetchAllItems={fetchAllContactSubmissions}
        deleteItem={deleteContactSubmission}
        canCreate={false}
        tableActionsConfig={tableActionsConfig}
        reloadDataTrigger={reloadDataTrigger}
        searchPlaceholder="Search by name, email, or subject..."
      />

      {selectedMessage && (
        <Modal show={showDetailsModal} onHide={handleCloseDetails} centered size="lg" contentClassName="review-details-modal-content">
          <Modal.Header closeButton className="review-details-modal-header">
            <Modal.Title as="h5">
               <Mail size={22} className="me-2 text-primary d-inline" />
              Contact Message Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="review-details-modal-body">
              <div className="p-2">
                 <Row className="mb-4">
                  <Col md={6} className="mb-3 mb-md-0">
                    <div className="detail-item">
                      <User size={18} className="detail-icon" />
                      <div>
                        <span className="detail-label">From</span>
                        <p className="detail-value">{selectedMessage.name}</p>
                      </div>
                    </div>
                  </Col>
                   <Col md={6}>
                    <div className="detail-item">
                      <Mail size={18} className="detail-icon" />
                      <div>
                        <span className="detail-label">Email</span>
                        <p className="detail-value">{selectedMessage.email}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className="mb-4">
                   <Col md={6} className="mb-3 mb-md-0">
                    <div className="detail-item">
                      <Phone size={18} className="detail-icon" />
                      <div>
                        <span className="detail-label">Phone</span>
                        <p className="detail-value">{selectedMessage.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="detail-item">
                      <Calendar size={18} className="detail-icon" />
                      <div>
                        <span className="detail-label">Received On</span>
                        <p className="detail-value">{formatSafeDate(selectedMessage.created_at_iso, 'locale-string')}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
                <hr className="my-4" />
                <div className="detail-item mb-3">
                   <Type size={18} className="detail-icon" />
                   <div>
                      <span className="detail-label">Subject</span>
                      <h5 className="detail-value mb-0">{selectedMessage.subject}</h5>
                   </div>
                </div>
                <div>
                  <div className="p-3 bg-light-subtle rounded border detail-comment-box">
                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</p>
                  </div>
                </div>
              </div>
          </Modal.Body>
          {/* --- THIS IS THE SECONDARY CHANGE --- */}
          {/* The footer is now simpler, as the toggle button has been removed. */}
          <Modal.Footer className="review-details-modal-footer">
            <Button variant="secondary" onClick={handleCloseDetails}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default ContactSubmissionsPage;