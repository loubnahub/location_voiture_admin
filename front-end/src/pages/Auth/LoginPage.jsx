import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path
import { useNavigate, Link } from 'react-router-dom'; // Assuming react-router-dom v6
import { Form, Button, Container, Card, Alert, Spinner } from 'react-bootstrap';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, authError, setAuthError, isLoading } = useAuth();
    const navigate = useNavigate();
    const [formErrors, setFormErrors] = useState({}); // For client-side validation or specific API errors

    const validateForm = () => {
        const errors = {};
        if (!email) errors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email is invalid.";
        if (!password) errors.password = "Password is required.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError(null); // Clear previous general auth errors
        setFormErrors({});  // Clear previous form errors

        if (!validateForm()) return;

        try {
            const user = await login(email, password);
            // Navigate based on role or to a default dashboard
            if (user && user.roles && user.roles.includes('admin')) { // Or your main admin role
                 navigate('/admin/dashboard'); // Adjust your desired admin redirect path
            } else {
                 navigate('/dashboard'); // Default redirect for other authenticated users
            }
        } catch (error) {
            // authError is already set by AuthContext's login function
            // You could parse specific field errors from 'error.errors' if backend provides them
            if (error.errors) {
                setFormErrors(prev => ({...prev, ...error.errors}));
            }
            console.error("Login failed:", error);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Log In</h2>
                        {authError && !formErrors.email && !formErrors.password && <Alert variant="danger">{authError}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="email" className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    isInvalid={!!formErrors.email}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group id="password" className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    isInvalid={!!formErrors.password}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{formErrors.password}</Form.Control.Feedback>
                            </Form.Group>
                            <Button disabled={isLoading} className="w-100 mt-3" type="submit">
                                {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Log In'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
                <div className="w-100 text-center mt-2">
                    Need an account? <Link to="/register">Sign Up</Link>
                </div>
                 {/* You might add a "Forgot Password?" link here later */}
            </div>
        </Container>
    );
};

export default LoginPage;