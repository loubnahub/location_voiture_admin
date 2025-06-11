// src/components/bookings/BookingDetailModal.jsx

import React from 'react';
import { Modal, Button, Row, Col, ListGroup, Badge, Card, Alert } from 'react-bootstrap';
import {
    LuUser, LuCar, LuCalendar, LuDollarSign, LuGift,
    LuShield, LuPackagePlus, LuFileText, LuArrowRight, LuClock
} from 'react-icons/lu';
import './BookingDetailModal.css'; // We will create this CSS file next

// Helper to format dates consistently
const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString([], {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
};

const BookingDetailModal = ({ show, onHide, booking }) => {
    if (!booking) return null;

    // A more robust way to calculate duration
    const getDuration = (start, end) => {
        if (!start || !end) return 'N/A';
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
            return 'Invalid dates';
        }
        const diff = endDate.getTime() - startDate.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    };

    const getStatusInfo = (status) => {
        let variant = 'secondary';
        let text = booking.status_display || 'Unknown';
        switch (status?.toLowerCase()) {
            case 'pending_confirmation': variant = 'warning'; break;
            case 'confirmed': variant = 'primary'; break;
            case 'active': variant = 'success'; break;
            case 'completed': variant = 'info'; break;
            case 'cancelled_by_renter':
            case 'cancelled_by_admin':
            case 'cancelled_by_user':
                variant = 'danger'; break;
            case 'no_show': variant = 'dark'; break;
            default: variant = 'light'; break;
        }
        const textClass = ['warning', 'info', 'light'].includes(variant) ? 'text-dark' : 'text-white';
        return <Badge bg={variant} className={`p-2 ${textClass}`}>{text}</Badge>;
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered dialogClassName="booking-detail-modal">
            <Modal.Header closeButton className=" text-white">
                <Modal.Title >
                    <h1>
                    <LuFileText className="me-2 d-inline" />

                    Booking Details
                    </h1>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h4 className="mb-0 fs-4">{booking.vehicle_display || 'Vehicle Information'}</h4>
                        <span className="text-muted ">Booking ID: {booking.id?.substring(0, 8)}...</span>
                    </Col>
                    <Col xs="auto">
                        {getStatusInfo(booking.status)}
                    </Col>
                </Row>
                
                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <Row>
                            <Col md={6} className="detail-section">
                                <h6 className="detail-header"><LuUser className="me-2" />Renter Information</h6>
                                <p><strong>Name:</strong> {booking.renter_name || 'N/A'}</p>
                                <p><strong>Email:</strong> {booking.renter_email || 'N/A'}</p>
                                <p><strong>Phone:</strong> {booking.renter_phone || 'N/A'}</p>
                            </Col>
                            <Col md={6} className="detail-section">
                                <h6 className="detail-header"><LuCar className="me-2" />Vehicle</h6>
                                <p>{booking.vehicle_display || 'N/A'}</p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <h6 className="detail-header mb-3"><LuCalendar className="me-2" />Rental Period</h6>
                        <div className="d-flex justify-content-around align-items-center text-center rental-period">
                            <div>
                                <p className="mb-0 fw-bold">Start Date</p>
                                <p className="text-muted">{formatDisplayDate(booking.start_date)}</p>
                            </div>
                            <LuArrowRight size={24} className="text-primary mx-3" />
                            <div>
                                <p className="mb-0 fw-bold">End Date</p>
                                <p className="text-muted">{formatDisplayDate(booking.end_date)}</p>
                            </div>
                        </div>
                        <div className="text-center mt-3">
                           <Badge pill bg="light" text="dark" className="p-2 fs-6">
                                <LuClock className="me-2 d-inline" />
                                Duration: {getDuration(booking.start_date, booking.end_date)}
                           </Badge>
                        </div>
                    </Card.Body>
                </Card>

                <Row>
                    <Col md={7}>
                        <h6 className="detail-header mb-3"><LuDollarSign className="me-2" />Price Summary</h6>
                        <ListGroup variant="flush">
                            <ListGroup.Item>Base Price <span className="float-end">{parseFloat(booking.calculated_base_price || 0).toFixed(2)} MAD</span></ListGroup.Item>
                            <ListGroup.Item>Extras <span className="float-end">+ {parseFloat(booking.calculated_extras_price || 0).toFixed(2)} MAD</span></ListGroup.Item>
                            <ListGroup.Item>Insurance <span className="float-end">+ {parseFloat(booking.calculated_insurance_price || 0).toFixed(2)} MAD</span></ListGroup.Item>
                            
                            {parseFloat(booking.discount_amount_applied || 0) > 0 && (
                                <ListGroup.Item className="text-success">
                                    Discount Applied
                                    <span className="float-end fw-bold">- {parseFloat(booking.discount_amount_applied || 0).toFixed(2)} MAD</span>
                                </ListGroup.Item>
                            )}
                            
                            <ListGroup.Item className="bg-light total-price-row">
                                <h5 className="mb-0 fw-bold">Final Price</h5>
                                <h5 className="mb-0 fw-bold float-end">{parseFloat(booking.final_price || 0).toFixed(2)} MAD</h5>
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                    <Col md={5}>
                        <h6 className="detail-header mb-3"><LuPackagePlus className="me-2" />Add-ons</h6>
                        {booking.insurance_plan_name && (
                            <Alert variant="info" className="d-flex align-items-center addon-alert">
                                <LuShield size={20} className="me-3" />
                                <div>
                                    <span>Insurance Plan:</span><br />
                                    <strong>{booking.insurance_plan_name}</strong>
                                </div>
                            </Alert>
                        )}
                        {booking.promotion_code_string && (
                            <Alert variant="warning" className="d-flex align-items-center addon-alert">
                                <LuGift size={20} className="me-3" />
                                <div>
                                    <span>Promotion Code:</span><br/>
                                    <b>{booking.promotion_code_string}</b>
                                </div>
                            </Alert>
                        )}
                        {booking.booking_extras && booking.booking_extras.length > 0 ? (
                            <ListGroup>
                                {booking.booking_extras.map(extra => (
                                    <ListGroup.Item key={extra.extra_id} className="d-flex justify-content-between align-items-center">
                                        {extra.name}
                                        <Badge bg="primary" pill>x{extra.quantity}</Badge>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                           <p className="text-muted fst-italic">No additional extras selected.</p>
                        )}
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BookingDetailModal;