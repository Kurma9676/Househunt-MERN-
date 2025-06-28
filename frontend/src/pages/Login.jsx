import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Form,
  Button,
  Card,
  Spinner,
  Modal,
  Alert
} from 'react-bootstrap';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const response = await axios.post('/api/users/forgot-password', {
        email: forgotEmail
      });

      setForgotSuccess(response.data.message);
      setForgotEmail('');
      
      // Show reset URL for development (remove in production)
      if (response.data.resetUrl) {
        setForgotSuccess(`${response.data.message} 
        
        For development, you can use this reset link:
        ${response.data.resetUrl}`);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      const errorDetails = error.response?.data?.error;
      
      if (errorDetails) {
        setForgotError(`${errorMessage}. Details: ${errorDetails}`);
      } else {
        setForgotError(errorMessage);
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setForgotEmail('');
    setForgotError('');
    setForgotSuccess('');
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotError('');
    setForgotSuccess('');
  };

  return (
    <Container
      fluid
      className="bg-light min-vh-100 d-flex align-items-center justify-content-center py-5"
    >
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h3 className="fw-bold">Welcome Back</h3>
              <p className="text-muted small">
                Sign in to your HouseHunt account
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="text-end mb-3">
                <Button
                  variant="link"
                  className="text-decoration-none p-0"
                  onClick={openForgotModal}
                >
                  Forgot Password?
                </Button>
              </div>

              <div className="d-grid mb-3">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </Form>

            <div className="text-center">
              <small>
                Don't have an account?{' '}
                <Link to="/register" className="text-decoration-none">
                  Sign up here
                </Link>
              </small>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Forgot Password Modal */}
      <Modal show={showForgotModal} onHide={closeForgotModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Forgot Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          {forgotError && (
            <Alert variant="danger" dismissible onClose={() => setForgotError('')}>
              {forgotError}
            </Alert>
          )}
          
          {forgotSuccess && (
            <Alert variant="success" dismissible onClose={() => setForgotSuccess('')}>
              {forgotSuccess}
            </Alert>
          )}

          <Form onSubmit={handleForgotPassword}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={forgotLoading}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeForgotModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleForgotPassword}
            disabled={forgotLoading}
          >
            {forgotLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Login;
