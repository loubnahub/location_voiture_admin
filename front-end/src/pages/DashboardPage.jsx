// src/pages/DashboardPage.jsx
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext'; // Adjust path

const DashboardPage = () => {
    const { currentUser } = useAuth();
    return (
        <Container fluid>
            <Row className="mb-3">
                <Col>
                    <h1>Admin Dashboard</h1>
                    {currentUser && <p>Welcome, {currentUser.full_name}!</p>}
                </Col>
            </Row>
            <Row>
                <Col md={4} className="mb-3">
                    <Card>
                        <Card.Body>
                            <Card.Title>Quick Stats</Card.Title>
                            <Card.Text>Some statistics here...</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                {/* Add more dashboard widgets */}
            </Row>
        </Container>
    );
};
export default DashboardPage;