import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, ListGroup, Modal } from 'react-bootstrap';
import { User, Mail, Phone, MapPin, Trash2, AlertTriangle, Building } from 'lucide-react'; // Added Building icon
import { useAuth } from '../contexts/AuthContext';
import { clearOldReadNotifications } from '../services/api';
import AddressManagerModal from '../components/AddressManagerModal';

// --- NEW: Import the custom CSS file ---
import './AdminProfilePage.css';

const AdminProfilePage = () => {
  const { currentUser, refetchUser } = useAuth();
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({ type: '', text: '' });
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [daysToClear, setDaysToClear] = useState(0);

  const handleClearNotificationsRequest = (days) => {
    setDaysToClear(days);
    setShowConfirmModal(true);
  };

  const confirmClearNotifications = async () => {
    setShowConfirmModal(false);
    setIsClearing(true);
    setNotificationMessage({ type: '', text: '' });
    try {
      const response = await clearOldReadNotifications(daysToClear);
      setNotificationMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to clear notifications.';
      setNotificationMessage({ type: 'danger', text: errorMessage });
    } finally {
      setIsClearing(false);
      setDaysToClear(0);
    }
  };

  // Helper function to get initials from a name
  const getInitials = (name) => {
    if (!name) return 'A';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return name.charAt(0);
  };
  
  // Helper for displaying details
  const ProfileDetailRow = ({ icon, label, value }) => (
    <div className="d-flex align-items-center mb-3">
      <div className="text-muted me-3">{React.cloneElement(icon, { size: 20 })}</div>
      <div>
        <small className="text-muted d-block">{label}</small>
        <strong>{value || 'Not provided'}</strong>
      </div>
    </div>
  );

  if (!currentUser) {
    return <div className="p-5 text-center"><Spinner /></div>;
  }

  return (
    <>
      <Container fluid className="p-4">
        <h1 className="h3 mb-4">Admin Profile & Settings</h1>
        <Row>
          {/* --- NEW: Redesigned Profile Card --- */}
          <Col lg={7} xl={8}>
            <div className="profile-card-custom mb-4">
              <div className="profile-header">
                <div className="avatar-wrapper">
                  {currentUser.profile_picture_url ? (
                    <img src={currentUser.profile_picture_url} alt="Profile" className="avatar-image" />
                  ) : (
                    <div className="avatar-placeholder">{getInitials(currentUser.full_name)}</div>
                  )}
                </div>
                <div className="user-info">
                  <h4>{currentUser.full_name}</h4>
                  <span className="role-badge">Admin</span>
                </div>
              </div>
              <div className="profile-body">
                <h6 className="section-title">Contact Information</h6>
                <ProfileDetailRow icon={<Mail />} label="Email Address" value={currentUser.email} />
                <ProfileDetailRow icon={<Phone />} label="Phone Number" value={currentUser.phone} />
              </div>
            </div>
          </Col>

          {/* --- NEW: Restyled Management Card --- */}
          <Col lg={5} xl={4}>
            <Card className="management-card mb-4">
              <Card.Header>
                  <h5 className="card-title mb-0">Management</h5>
              </Card.Header>
              <ListGroup variant="flush">
                  <ListGroup.Item className="management-list-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Building className="me-2 text-muted" />
                            Manage Addresses
                        </div>
                        <Button variant="outline-secondary" size="sm" onClick={() => setShowAddressModal(true)}>Open Manager</Button>
                      </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="management-list-item">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div><Trash2 className="me-2 text-muted" /> Clear Old Notifications</div>
                        </div>
                        <p className="text-muted small mb-2">Permanently delete read notifications to keep things tidy.</p>
                        {notificationMessage.text && <Alert variant={notificationMessage.type} className="py-2 px-3 small" onClose={() => setNotificationMessage({type: '', text: ''})} dismissible>{notificationMessage.text}</Alert>}
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="outline-danger" size="sm" onClick={() => handleClearNotificationsRequest(30)} disabled={isClearing}>
                                {isClearing ? <Spinner size="sm" /> : 'Older than 30 days'}
                            </Button>
                        </div>
                      </div>
                  </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <AddressManagerModal 
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
        onAddressChange={refetchUser} 
      />

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            <AlertTriangle className="me-2 text-danger" />
            Confirm Action
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to permanently delete all read notifications older than <strong>{daysToClear} days</strong>? 
          <br/><br/>
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmClearNotifications}>
            Yes, Clear Notifications
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminProfilePage;