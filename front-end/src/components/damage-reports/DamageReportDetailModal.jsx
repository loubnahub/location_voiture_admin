// src/components/damage-reports/DamageReportDetailModal.jsx

import React from 'react';
import { Modal, Button, Row, Col, Badge, Image, Carousel } from 'react-bootstrap';
import { LuFileText, LuCalendar, LuUser, LuCar, LuDollarSign, LuImage } from 'react-icons/lu';
import './DamageReportDetailModal.css'; // We will create this CSS file

const DamageReportDetailModal = ({ show, onHide, report }) => {
    if (!report) return null;

    const formatDisplayDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const getStatusBadge = (status) => {
        let variant = 'secondary';
        switch (status) {
            case 'pending_assessment': variant = 'warning'; break;
            case 'under_assessment': variant = 'info'; break;
            case 'assessment_complete': variant = 'primary'; break;
            case 'repair_in_progress': variant = 'info'; break;
            case 'resolved_paid': case 'resolved_no_cost': variant = 'success'; break;
            case 'closed': variant = 'dark'; break;
            default: variant = 'light'; break;
        }
        const textClass = ['warning', 'info', 'light'].includes(variant) ? 'text-dark' : 'text-white';
        return <Badge bg={variant} className={`p-2 fs-6 ${textClass}`}>{report.status_display || 'Unknown'}</Badge>;
    };

    const images = report.images || [];

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton className=" text-white">
                <Modal.Title >
                    <h1><LuFileText className="me-2 d-inline" />
                    Damage Report Details</h1>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h4 className="mb-0">Report ID: {report.id?.substring(0, 8)}...</h4>
                        <span className="text-muted">For Booking: {report.booking_identifier}</span>
                    </Col>
                    <Col xs="auto">
                        {getStatusBadge(report.status)}
                    </Col>
                </Row>

                <Row>
                    {/* Left Column - Details */}
                    <Col lg={5} className="mb-4 mb-lg-0">
                        <div className="detail-section">
                            <h6 className="detail-header"><LuCar className="me-2" />Vehicle & Reporter</h6>
                            <p><strong>Vehicle:</strong> {report.vehicle_display || 'N/A'}</p>
                            <p><strong>Reported By:</strong> {report.reporter_name || 'N/A'}</p>
                        </div>

                        <div className="detail-section">
                            <h6 className="detail-header"><LuCalendar className="me-2" />Date & Time</h6>
                            <p><strong>Reported At:</strong> {formatDisplayDate(report.reported_at)}</p>
                        </div>
                        
                        <div className="detail-section">
                            <h6 className="detail-header"><LuDollarSign className="me-2" />Financials</h6>
                            <p>
                                <strong>Repair Cost:</strong> 
                                <span className="fw-bold ms-2">
                                    {report.repair_cost != null ? `${parseFloat(report.repair_cost).toFixed(2)} MAD` : 'Not assessed'}
                                </span>
                            </p>
                        </div>
                    </Col>

                    {/* Right Column - Description & Images */}
                    <Col lg={7}>
                        <div className="detail-section">
                            <h6 className="detail-header">Damage Description</h6>
                            <p className="report-description">{report.description || 'No description provided.'}</p>
                        </div>
                        
                        <div className="detail-section">
                            <h6 className="detail-header"><LuImage className="me-2" />Damage Images</h6>
                            {images.length > 0 ? (
                                <Carousel variant="dark" interval={null}>
                                    {images.map(image => (
                                        <Carousel.Item key={image.id}>
                                            <Image src={image.url} className="d-block w-100 report-image" fluid />
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            ) : (
                                <div className="text-center text-muted p-4 border rounded">
                                    <LuImage size={30} className="mb-2" />
                                    <p>No images were uploaded for this report.</p>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DamageReportDetailModal;