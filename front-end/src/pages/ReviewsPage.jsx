import React, { useState } from 'react';
import { Modal, Button, Badge, Row, Col } from 'react-bootstrap';
import { MessageSquare, Star, Eye, Calendar, User, Car } from 'lucide-react';
import ResourcePage from '../components/ResourcePage';
import { fetchAllReviews, deleteReview } from '../services/api';
import './ReviewDetailsModal.css'; // Your beautiful modal CSS is still needed

// Helper to render star ratings - no changes needed
const StarRating = ({ rating }) => (
  <div className="d-flex align-items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-warning' : 'text-muted'}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ))}
    <span className="ms-2">({rating})</span>
  </div>
);

const ReviewsPage = () => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const handleShowDetails = (review) => {
    setSelectedReview(review);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedReview(null);
  };

  // The table columns are simple and clean.
  const reviewColumns = [
    { header: 'Name', key: 'name', className: 'fw-bold' },
    { header: 'Rating', key: 'rating', render: (item) => <StarRating rating={item.rating} /> },
    { header: 'Comment', key: 'comment', render: (item) => item.comment.substring(0, 70) + (item.comment.length > 70 ? '...' : '') },
    { header: 'Car Name', key: 'car_name', render: (item) => item.car_name || <Badge bg="secondary-subtle" text="secondary-emphasis">N/A</Badge> },
    { header: 'Submitted', key: 'created_at', render: (item) => new Date(item.created_at).toLocaleDateString() },
  ];
  
  // --- THIS IS THE FIX ---
  // We now define the action button configuration using the same keys as your working VehiclePage.
  const viewAction = {
    icon: <Eye size={18} />,           // Use the 'icon' property
    title: 'View Full Review',      // Use the 'title' property for the hover tooltip
    handler: handleShowDetails,      // Use the 'handler' property for the onClick function
  };

  // The ResourcePage will receive an array of action objects.
  const tableActionsConfig = [viewAction];

  return (
    <>
      <ResourcePage
        resourceName="Review"
        resourceNamePlural="Customer Reviews"
        IconComponent={MessageSquare}
        columns={reviewColumns}
        fetchAllItems={fetchAllReviews}
        deleteItem={deleteReview} // ResourcePage will automatically add a standard delete button
        canCreate={false} // Correctly disables the "Create" button
        tableActionsConfig={tableActionsConfig} // Pass the correctly structured action
        searchPlaceholder="Search by name, comment, or car..."
      />

      {/* The enhanced details modal remains unchanged and will work perfectly */}
      <Modal show={showDetailsModal} onHide={handleCloseDetails} centered size="lg" contentClassName="review-details-modal-content">
        <Modal.Header closeButton className="review-details-modal-header">
          <Modal.Title as="h5">
            <MessageSquare size={22} className="me-2 d-inline text-primary" />
            Review Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="review-details-modal-body">
          {selectedReview && (
            <div className="p-2">
              <Row className="mb-4">
                <Col md={6} className="mb-3 mb-md-0">
                  <div className="detail-item">
                    <User size={18} className="detail-icon" />
                    <div>
                      <span className="detail-label">Reviewer</span>
                      <p className="detail-value">{selectedReview.name}</p>
                    </div>
                  </div>
                </Col>
                 <Col md={6}>
                  <div className="detail-item">
                    <Calendar size={18} className="detail-icon" />
                    <div>
                      <span className="detail-label">Submitted On</span>
                      <p className="detail-value">{new Date(selectedReview.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row className="mb-4">
                 <Col md={6} className="mb-3 mb-md-0">
                  <div className="detail-item">
                    <Car size={18} className="detail-icon" />
                    <div>
                      <span className="detail-label">Car Name</span>
                      <p className="detail-value">{selectedReview.car_name || 'Not specified'}</p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                   <div className="detail-item">
                    <Star size={18} className="detail-icon" />
                    <div>
                      <span className="detail-label">Rating</span>
                      <div className="detail-value">
                        <StarRating rating={selectedReview.rating} />
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <hr className="my-4" />
              
              <div>
                <h6 className="detail-comment-header">Full Comment</h6>
                <div className="p-3 bg-light-subtle rounded border detail-comment-box">
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{selectedReview.comment}</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="review-details-modal-footer">
          <Button variant="outline-secondary" onClick={handleCloseDetails}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReviewsPage;