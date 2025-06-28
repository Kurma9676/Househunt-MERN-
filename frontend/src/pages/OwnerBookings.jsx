import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/bookings/owner', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBookings(response.data);
    } catch (err) {
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
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setBookings(bookings.map(booking =>
        booking._id === bookingId ? response.data : booking
      ));
      setShowActionModal(false);
      setSelectedBooking(null);
      setActionType('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status');
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
          <p className="text-muted">Approve or reject bookings for your properties</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      <Row xs={1} md={2} lg={3} className="g-4">
        {bookings.map(booking => (
          <Col key={booking._id}>
            <Card className="h-100 border-0 shadow-sm">
              {booking.propertyId?.images && booking.propertyId.images.length > 0 && (
                <Card.Img
                  variant="top"
                  src={`/uploads/${booking.propertyId.images[0]}`}
                  alt={booking.propertyId.propType}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; }}
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
                      {booking.propertyId?.propAmt?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || 0}
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
                      <strong>Message:</strong> {booking.message}
                    </small>
                  </div>
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
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Action Confirmation Modal */}
      <Modal show={showActionModal} onHide={() => setShowActionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'approve' && 'Approve Booking'}
            {actionType === 'reject' && 'Reject Booking'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to{' '}
            <strong>
              {actionType === 'approve' && 'approve'}
              {actionType === 'reject' && 'reject'}
            </strong>{' '}
            the booking for <strong>{selectedBooking?.username}</strong> at{' '}
            <strong>{selectedBooking?.propertyId?.propType}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActionModal(false)}>
            Cancel
          </Button>
          <Button
            variant={actionType === 'approve' ? 'success' : 'danger'}
            onClick={executeAction}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OwnerBookings; 