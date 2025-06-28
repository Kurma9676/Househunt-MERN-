import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/bookings/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
      setShowCancelModal(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error canceling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmCancel = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'warning', text: 'Pending Review', icon: 'clock' },
      'approved': { bg: 'success', text: 'Approved', icon: 'check-circle' },
      'rejected': { bg: 'danger', text: 'Rejected', icon: 'times-circle' },
      'cancelled': { bg: 'secondary', text: 'Cancelled', icon: 'ban' },
      'completed': { bg: 'info', text: 'Completed', icon: 'flag-checkered' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status, icon: 'question' };
    return (
      <Badge bg={config.bg} className="d-flex align-items-center gap-1">
        <i className={`fas fa-${config.icon}`}></i>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getFullAddress = (address) => {
    if (!address) return 'No address provided';
    const parts = [address.street, address.city, address.state, address.zipCode];
    return parts.filter(part => part).join(', ');
  };

  const getBookingDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalCost = (price, duration) => {
    return price * duration;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.propertyId?.propType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.propertyId?.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.propertyId?.address?.street?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesProperty = filterProperty === 'all' || booking.propertyId?.propType === filterProperty;
    
    return matchesSearch && matchesStatus && matchesProperty;
  });

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your bookings...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">My Bookings</h1>
          <p className="text-muted">Manage and track all your property bookings</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Summary Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="display-6 text-primary mb-2">{bookings.length}</div>
              <Card.Title>Total Bookings</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="display-6 text-warning mb-2">
                {bookings.filter(b => b.status === 'pending').length}
              </div>
              <Card.Title>Pending</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="display-6 text-success mb-2">
                {bookings.filter(b => b.status === 'approved').length}
              </div>
              <Card.Title>Approved</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="display-6 text-info mb-2">
                {bookings.filter(b => b.status === 'completed').length}
              </div>
              <Card.Title>Completed</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by property type, city, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
          >
            <option value="all">All Properties</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="condo">Condo</option>
            <option value="studio">Studio</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button 
            variant="outline-primary" 
            onClick={fetchMyBookings}
            className="w-100"
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </Button>
        </Col>
        <Col md={2}>
          <Button 
            variant="success" 
            onClick={() => window.location.href = '/properties'}
            className="w-100"
          >
            <i className="fas fa-search me-2"></i>
            Find More
          </Button>
        </Col>
      </Row>

      {/* Bookings Count */}
      <Row className="mb-3">
        <Col>
          <p className="text-muted">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </Col>
      </Row>

      {/* Bookings Grid */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredBookings.map(booking => (
          <Col key={booking._id}>
            <Card className="h-100 border-0 shadow-sm">
              {booking.propertyId?.images && booking.propertyId.images.length > 0 && (
                <Card.Img 
                  variant="top" 
                  src={`/uploads/${booking.propertyId.images[0]}`} 
                  alt={booking.propertyId.propType}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <Card.Title className="mb-1">{booking.propertyId?.propType || 'Unknown Property'}</Card.Title>
                    <Card.Subtitle className="text-muted mb-2">
                      {getFullAddress(booking.propertyId?.address)}
                    </Card.Subtitle>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
                
                <div className="mb-3">
                  <div className="mb-2">
                    <strong className="text-success fs-6">
                      {formatPrice(booking.propertyId?.propAmt || 0)}
                    </strong>
                    <small className="text-muted"> /month</small>
                  </div>
                  
                  <div className="row text-muted small mb-2">
                    <div className="col-6">
                      <strong>Move-in:</strong>
                    </div>
                    <div className="col-6">
                      {formatDate(booking.moveInDate)}
                    </div>
                  </div>
                  
                  <div className="row text-muted small mb-2">
                    <div className="col-6">
                      <strong>Duration:</strong>
                    </div>
                    <div className="col-6">
                      {booking.leaseDuration} months
                    </div>
                  </div>
                  
                  <div className="row text-muted small mb-2">
                    <div className="col-6">
                      <strong>Total Cost:</strong>
                    </div>
                    <div className="col-6">
                      {formatPrice(getTotalCost(booking.propertyId?.propAmt || 0, booking.leaseDuration))}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Owner:</strong> {booking.ownerId?.name || 'Unknown'}
                    </small>
                  </div>
                  
                  <div>
                    <small className="text-muted">
                      <strong>Booked:</strong> {formatDate(booking.createdAt)}
                    </small>
                  </div>
                  
                  {booking.message && (
                    <div className="mt-2">
                      <small className="text-muted">
                        <strong>Your Message:</strong> {booking.message}
                      </small>
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  {booking.status === 'pending' && (
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => confirmCancel(booking)}
                      disabled={actionLoading === booking._id}
                    >
                      {actionLoading === booking._id ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-ban me-2"></i>
                          Cancel Booking
                        </>
                      )}
                    </Button>
                  )}
                  
                  {booking.status === 'approved' && (
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => window.open(`/properties/${booking.propertyId?._id}`, '_blank')}
                    >
                      <i className="fas fa-eye me-2"></i>
                      View Property
                    </Button>
                  )}
                  
                  {booking.status === 'rejected' && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled
                    >
                      <i className="fas fa-times me-2"></i>
                      Booking Rejected
                    </Button>
                  )}
                  
                  {booking.status === 'cancelled' && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled
                    >
                      <i className="fas fa-ban me-2"></i>
                      Booking Cancelled
                    </Button>
                  )}
                  
                  {booking.status === 'completed' && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => window.open(`/properties/${booking.propertyId?._id}`, '_blank')}
                    >
                      <i className="fas fa-star me-2"></i>
                      Leave Review
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredBookings.length === 0 && !loading && (
        <Alert variant="info" className="text-center">
          <Alert.Heading>No Bookings Found</Alert.Heading>
          <p>
            {searchTerm || filterStatus !== 'all' || filterProperty !== 'all'
              ? 'No bookings match your search criteria.' 
              : 'You haven\'t made any bookings yet.'}
          </p>
          <Button 
            variant="primary" 
            onClick={() => window.location.href = '/properties'}
          >
            <i className="fas fa-search me-2"></i>
            Browse Properties
          </Button>
        </Alert>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to cancel your booking for{' '}
            <strong>{selectedBooking?.propertyId?.propType}</strong> at{' '}
            <strong>{getFullAddress(selectedBooking?.propertyId?.address)}</strong>?
          </p>
          <p className="text-warning">
            <strong>Note:</strong> This action cannot be undone. The property owner will be notified of the cancellation.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Booking
          </Button>
          <Button 
            variant="warning" 
            onClick={() => handleCancelBooking(selectedBooking?._id)}
            disabled={actionLoading}
          >
            {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyBookings;
