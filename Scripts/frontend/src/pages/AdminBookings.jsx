import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setActionLoading(bookingId + newStatus);
    try {
      const response = await axios.put(`/api/bookings/${bookingId}/status`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? response.data : booking
      ));
      setShowActionModal(false);
      setSelectedBooking(null);
      setActionType('');
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(err.response?.data?.message || 'Failed to update booking status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setActionLoading(bookingId + 'cancel');
    try {
      const response = await axios.put(`/api/bookings/${bookingId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? response.data : booking
      ));
      setShowActionModal(false);
      setSelectedBooking(null);
      setActionType('');
    } catch (err) {
      console.error('Error canceling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmAction = (booking, type) => {
    setSelectedBooking(booking);
    setActionType(type);
    setShowActionModal(true);
  };

  const executeAction = () => {
    if (!selectedBooking || !actionType) return;
    
    if (actionType === 'approve') {
      handleStatusUpdate(selectedBooking._id, 'approved');
    } else if (actionType === 'reject') {
      handleStatusUpdate(selectedBooking._id, 'rejected');
    } else if (actionType === 'cancel') {
      handleCancelBooking(selectedBooking._id);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'warning', text: 'Pending' },
      'approved': { bg: 'success', text: 'Approved' },
      'rejected': { bg: 'danger', text: 'Rejected' },
      'cancelled': { bg: 'secondary', text: 'Cancelled' },
      'completed': { bg: 'info', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
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

  const getBookingDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.propertyId?.propType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.propertyId?.address?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesProperty = filterProperty === 'all' || booking.propertyId?.propType === filterProperty;
    
    return matchesSearch && matchesStatus && matchesProperty;
  });

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading bookings...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Manage Bookings</h1>
          <p className="text-muted">Manage all property bookings in the system</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by tenant, email, property, or city..."
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
            onClick={fetchBookings}
            className="w-100"
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </Button>
        </Col>
        <Col md={2}>
          <Button 
            variant="success" 
            onClick={() => window.print()}
            className="w-100"
          >
            <i className="fas fa-print me-2"></i>
            Print Report
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
                      {booking.propertyId?.address?.city || 'No Address'}
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
                      <strong>Tenant:</strong> {booking.username}
                    </div>
                    <div className="col-6">
                      <strong>Phone:</strong> {booking.userPhone}
                    </div>
                  </div>
                  
                  <div className="row text-muted small mb-2">
                    <div className="col-6">
                      <strong>Move-in:</strong> {formatDate(booking.moveInDate)}
                    </div>
                    <div className="col-6">
                      <strong>Duration:</strong> {booking.leaseDuration} months
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
                        <strong>Message:</strong> {booking.message}
                      </small>
                    </div>
                  )}
                </div>

                <div className="d-grid gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => confirmAction(booking, 'approve')}
                        disabled={actionLoading === booking._id + 'approved'}
                      >
                        {actionLoading === booking._id + 'approved' ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check me-2"></i>
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => confirmAction(booking, 'reject')}
                        disabled={actionLoading === booking._id + 'rejected'}
                      >
                        {actionLoading === booking._id + 'rejected' ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-times me-2"></i>
                            Reject
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  
                  {booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => confirmAction(booking, 'cancel')}
                      disabled={actionLoading === booking._id + 'cancel'}
                    >
                      {actionLoading === booking._id + 'cancel' ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-ban me-2"></i>
                          Cancel
                        </>
                      )}
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
              : 'No bookings are available yet.'}
          </p>
        </Alert>
      )}

      {/* Action Confirmation Modal */}
      <Modal show={showActionModal} onHide={() => setShowActionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'approve' && 'Approve Booking'}
            {actionType === 'reject' && 'Reject Booking'}
            {actionType === 'cancel' && 'Cancel Booking'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to{' '}
            <strong>
              {actionType === 'approve' && 'approve'}
              {actionType === 'reject' && 'reject'}
              {actionType === 'cancel' && 'cancel'}
            </strong>{' '}
            the booking for <strong>{selectedBooking?.username}</strong> at{' '}
            <strong>{selectedBooking?.propertyId?.propType}</strong>?
          </p>
          {actionType === 'cancel' && (
            <p className="text-warning">
              <strong>Note:</strong> This will cancel the booking and notify the tenant.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActionModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={
              actionType === 'approve' ? 'success' : 
              actionType === 'reject' ? 'danger' : 'warning'
            }
            onClick={executeAction}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 
              actionType === 'approve' ? 'Approve' :
              actionType === 'reject' ? 'Reject' : 'Cancel'
            }
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminBookings; 