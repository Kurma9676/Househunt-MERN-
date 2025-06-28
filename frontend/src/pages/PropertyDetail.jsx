import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const PropertyDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    username: '',
    userPhone: '',
    userEmail: '',
    message: '',
    moveInDate: '',
    leaseDuration: 12
  });

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`/api/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Error loading property details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(
        '/api/bookings',
        {
          propertyId: id,
          ...bookingForm
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success('Booking request sent successfully!');
      setShowBookingModal(false);
      setBookingForm({
        username: '',
        userPhone: '',
        userEmail: '',
        message: '',
        moveInDate: '',
        leaseDuration: 12
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending booking request');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading property details..." />;
  }

  if (!property) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h4>Property not found</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          {/* Property Images */}
          <div className="mb-4">
            {property.images && property.images.length > 0 ? (
              <img
                src={`${BACKEND_URL}/uploads/${property.images[0]}`}
                alt={property.propType}
                className="img-fluid rounded"
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              />
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '400px' }}>
                <span className="text-muted">No Image Available</span>
              </div>
            )}
          </div>

          {/* Property Details */}
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="fw-bold">{property.propType}</h2>
                  <p className="text-muted mb-0">
                    {property.address?.street}, {property.address?.city}, {property.address?.state} {property.address?.zipCode}
                  </p>
                </div>
                <div className="text-end">
                  <h3 className="text-primary fw-bold">
                    {property.propAmt?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}/month
                  </h3>
                  <Badge bg={property.isAvailable ? 'success' : 'secondary'}>
                    {property.isAvailable ? 'Available' : 'Rented'}
                  </Badge>
                </div>
              </div>

              <Row className="mb-3">
                <Col md={3}>
                  <strong>Bedrooms:</strong> {property.addInfo?.bedrooms}
                </Col>
                <Col md={3}>
                  <strong>Bathrooms:</strong> {property.addInfo?.bathrooms}
                </Col>
                <Col md={3}>
                  <strong>Area:</strong> {property.addInfo?.area} sq ft
                </Col>
                <Col md={3}>
                  <strong>Type:</strong> {property.propType}
                </Col>
              </Row>

              {property.addInfo?.description && (
                <div className="mb-3">
                  <h5>Description</h5>
                  <p>{property.addInfo.description}</p>
                </div>
              )}

              {property.addInfo?.amenities && property.addInfo.amenities.length > 0 && (
                <div className="mb-3">
                  <h5>Amenities</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {property.addInfo.amenities.map((amenity, index) => (
                      <Badge key={index} bg="light" text="dark">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Owner Contact */}
          <Card className="mb-4">
            <Card.Body>
              <h5>Property Owner</h5>
              <p className="mb-2">
                <strong>Name:</strong> {property.userID?.name}
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {property.ownerContact?.email}
              </p>
              <p className="mb-3">
                <strong>Phone:</strong> {property.ownerContact?.phone}
              </p>
              
              {isAuthenticated && property.isAvailable ? (
                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book This Property
                </Button>
              ) : !isAuthenticated ? (
                <Button variant="outline-primary" className="w-100" disabled>
                  Login to Book
                </Button>
              ) : (
                <Button variant="secondary" className="w-100" disabled>
                  Property Not Available
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book Property</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBookingSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                value={bookingForm.username}
                onChange={(e) => setBookingForm(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                value={bookingForm.userPhone}
                onChange={(e) => setBookingForm(prev => ({ ...prev, userPhone: e.target.value }))}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={bookingForm.userEmail}
                onChange={(e) => setBookingForm(prev => ({ ...prev, userEmail: e.target.value }))}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Move-in Date</Form.Label>
              <Form.Control
                type="date"
                value={bookingForm.moveInDate}
                onChange={(e) => setBookingForm(prev => ({ ...prev, moveInDate: e.target.value }))}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Lease Duration (months)</Form.Label>
              <Form.Select
                value={bookingForm.leaseDuration}
                onChange={(e) => setBookingForm(prev => ({ ...prev, leaseDuration: e.target.value }))}
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={18}>18 months</option>
                <option value={24}>24 months</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Message to Owner</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bookingForm.message}
                onChange={(e) => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell the owner about yourself and why you're interested in this property..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Send Booking Request
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default PropertyDetail; 