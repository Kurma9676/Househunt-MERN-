import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Form,
  Button,
  Card,
  Spinner,
  Alert
} from 'react-bootstrap';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setVerifying(true);
      const response = await axios.get(`/api/users/verify-reset-token/${token}`);
      setTokenValid(true);
    } catch (error) {
      console.error('Token verification error:', error);
      setTokenError(error.response?.data?.message || 'Invalid or expired reset token');
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(`/api/users/reset-password/${token}`, {
        password: formData.password
      });
      
      setSuccess(response.data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to reset password'
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <Container
        fluid
        className="bg-light min-vh-100 d-flex align-items-center justify-content-center py-5"
      >
        <div style={{ maxWidth: '500px', width: '100%' }}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4 text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Verifying reset token...</p>
            </Card.Body>
          </Card>
        </div>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container
        fluid
        className="bg-light min-vh-100 d-flex align-items-center justify-content-center py-5"
      >
        <div style={{ maxWidth: '500px', width: '100%' }}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-danger">Invalid Reset Link</h3>
                <p className="text-muted">
                  The password reset link is invalid or has expired.
                </p>
              </div>
              
              <Alert variant="danger">
                <Alert.Heading>Error</Alert.Heading>
                <p>{tokenError}</p>
              </Alert>
              
              <div className="text-center">
                <p className="mb-3">
                  Please request a new password reset link.
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="bg-light min-vh-100 d-flex align-items-center justify-content-center py-5"
    >
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h3 className="fw-bold">Reset Your Password</h3>
              <p className="text-muted small">
                Enter your new password below
              </p>
            </div>

            {success && (
              <Alert variant="success" className="mb-4">
                <Alert.Heading>Success!</Alert.Heading>
                <p>{success}</p>
                <p className="mb-0">
                  You will be redirected to the login page shortly...
                </p>
              </Alert>
            )}

            {errors.submit && (
              <Alert variant="danger" className="mb-4">
                <Alert.Heading>Error</Alert.Heading>
                <p>{errors.submit}</p>
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  disabled={loading || !!success}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Password must be at least 6 characters long
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!!errors.confirmPassword}
                  disabled={loading || !!success}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-grid mb-3">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading || !!success}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </div>
            </Form>

            <div className="text-center">
              <small>
                Remember your password?{' '}
                <Link to="/login" className="text-decoration-none">
                  Sign in here
                </Link>
              </small>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default ResetPassword; 