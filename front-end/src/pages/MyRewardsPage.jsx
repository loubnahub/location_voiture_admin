// src/pages/MyRewardsPage.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { LuAward, LuTicket, LuClipboard, LuClipboardCheck } from 'react-icons/lu';
import { fetchMyRewards } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MyRewardsPage.css'; // We'll create this CSS file next

const MyRewardsPage = () => {
    const [rewardsData, setRewardsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        const loadRewards = async () => {
            try {
                setLoading(true);
                const response = await fetchMyRewards();
                setRewardsData(response.data.data);
            } catch (err) {
                setError('Failed to load your rewards. Please try again later.');
                console.error("Error fetching rewards:", err);
            } finally {
                setLoading(false);
            }
        };
        loadRewards();
    }, []);

    const handleCopyCode = (codeString) => {
        navigator.clipboard.writeText(codeString);
        setCopiedCode(codeString);
        setTimeout(() => setCopiedCode(null), 2000); // Reset after 2 seconds
    };

    if (loading) {
        return (
            <Container className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading Your Rewards...</p>
            </Container>
        );
    }

    if (error) {
        return <Container><Alert variant="danger">{error}</Alert></Container>;
    }

    if (!rewardsData) {
        return <Container><Alert variant="warning">No rewards data found.</Alert></Container>;
    }

    const { loyalty_points, next_level_points, points_to_next_level, promotion_codes } = rewardsData;
    
    const progressPercent = next_level_points ? ((loyalty_points / next_level_points) * 100) : 100;

    const activeCodes = promotion_codes.filter(c => c.status.value === 'active');
    const usedOrExpiredCodes = promotion_codes.filter(c => c.status.value !== 'active');

    return (
        <div className="my-rewards-page">
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={8}>
                        <div className="text-center mb-5">
                            <LuAward size={50} className="text-primary mb-3" />
                            <h1>My Loyalty & Rewards</h1>
                            <p className="lead text-muted">Earn points with every booking and unlock exclusive discounts!</p>
                        </div>
                        
                        <Card className="shadow-sm mb-5 loyalty-progress-card">
                            <Card.Body className="p-4">
                                <Row className="align-items-center">
                                    <Col>
                                        <Card.Title as="h5">Loyalty Progress</Card.Title>
                                        <p className="mb-2">You have <strong className="text-primary">{loyalty_points}</strong> points.</p>
                                    </Col>
                                    <Col xs="auto">
                                        {next_level_points && (
                                            <div className="text-end">
                                                <span className="fw-bold">{next_level_points}</span>
                                                <p className="small text-muted mb-0">Next Reward</p>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                                <ProgressBar now={progressPercent} className="mt-2" style={{height: '10px'}} />
                                {points_to_next_level && (
                                    <p className="text-center small mt-2 mb-0">
                                        You are just <strong>{points_to_next_level}</strong> points away from your next reward!
                                    </p>
                                )}
                                 {!next_level_points && loyalty_points > 0 && (
                                    <p className="text-center small mt-2 mb-0 text-success fw-bold">
                                        You have reached the highest loyalty level!
                                    </p>
                                )}
                            </Card.Body>
                        </Card>

                        <h3 className="mb-4">Your Promotion Codes</h3>
                        
                        {activeCodes.length > 0 ? (
                            activeCodes.map(code => (
                                <Card key={code.id} className="mb-3 promo-code-card active-card">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <Badge bg="success" className="mb-2">Active</Badge>
                                                <h5 className="mb-1">{code.campaign_name}</h5>
                                                <p className="text-muted mb-2">{code.reward_display}</p>
                                                <p className="small mb-0">
                                                    Expires: {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="text-end">
                                                <Button variant="outline-primary" onClick={() => handleCopyCode(code.code_string)} className="copy-code-btn">
                                                    <code>{code.code_string}</code>
                                                    {copiedCode === code.code_string ? <LuClipboardCheck className="ms-2" /> : <LuClipboard className="ms-2" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))
                        ) : (
                            <Alert variant="light">You have no active promotion codes right now. Complete more bookings to earn rewards!</Alert>
                        )}

                        {usedOrExpiredCodes.length > 0 && (
                            <>
                                <h4 className="mt-5 mb-4">Past Codes</h4>
                                {usedOrExpiredCodes.map(code => (
                                    <Card key={code.id} className="mb-3 promo-code-card past-card">
                                        <Card.Body>
                                             <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <Badge bg={code.status.value === 'used' ? 'secondary' : 'warning'} className="mb-2">{code.status_display}</Badge>
                                                    <h5 className="mb-1 text-muted">{code.campaign_name}</h5>
                                                    <p className="text-muted mb-0">{code.reward_display}</p>
                                                </div>
                                                <div className="text-end">
                                                    <code className="text-muted text-decoration-line-through">{code.code_string}</code>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default MyRewardsPage;