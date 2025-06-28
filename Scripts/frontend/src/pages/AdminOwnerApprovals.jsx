import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminOwnerApprovals = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [actionType, setActionType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');

  useEffect(() => {
    fetchPendingOwners();
  }, []);

  const fetchPendingOwners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/admin/pending-owners', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      setOwners(response.data);
    } catch (err) {
      console.error('Error fetching pending owners:', err);
      setError(err.response?.data?.message || 'Failed to load pending owners');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOwner = async (ownerId) => {
    setActionLoading(ownerId + 'approve');
    try {
      await axios.put(`/api/admin/approve-owner/${ownerId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setOwners(owners.filter(owner => owner._id !== ownerId));
      setShowActionModal(false);
      setSelectedOwner(null);
      setActionType('');
    } catch (err) {
      console.error('Error approving owner:', err);
      setError(err.response?.data?.message || 'Failed to approve owner');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOwner = async (ownerId) => {
    setActionLoading(ownerId + 'reject');
    try {
      await axios.delete(`/api/admin/reject-owner/${ownerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setOwners(owners.filter(owner => owner._id !== ownerId));
      setShowActionModal(false);
      setSelectedOwner(null);
      setActionType('');
    } catch (err) {
      console.error('Error rejecting owner:', err);
      setError(err.response?.data?.message || 'Failed to reject owner');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmAction = (owner, type) => {
    setSelectedOwner(owner);
    setActionType(type);
    setShowActionModal(true);
  };

  const executeAction = () => {
    if (!selectedOwner || !actionType) return;
    
    if (actionType === 'approve') {
      handleApproveOwner(selectedOwner._id);
    } else if (actionType === 'reject') {
      handleRejectOwner(selectedOwner._id);
    }
  };

  const getApplicationDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysSinceApplication = (dateString) => {
    const applicationDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - applicationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyBadge = (dateString) => {
    const days = getDaysSinceApplication(dateString);
    if (days >= 7) {
      return <Badge bg="danger">High Priority</Badge>;
    } else if (days >= 3) {
      return <Badge bg="warning">Medium Priority</Badge>;
    } else {
      return <Badge bg="success">New</Badge>;
    }
  };

  const filteredOwners = owners.filter(owner => {
    const matchesSearch = 
      owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = filterDate === 'all' || 
      (filterDate === 'recent' && getDaysSinceApplication(owner.createdAt) <= 3) ||
      (filterDate === 'old' && getDaysSinceApplication(owner.createdAt) > 7);
    
    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading pending owner applications...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Owner Approvals</h1>
          <p className="text-muted">Review and manage pending property owner applications</p>
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
              <div className="display-6 text-primary mb-2">{owners.length}</div>
              <Card.Title>Total Pending</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="display-6 text-danger mb-2">
                {owners.filter(owner => getDaysSinceApplication(owner.createdAt) >= 7).length}
              </div>
              <Card.Title>High Priority</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="display-6 text-warning mb-2">
                {owners.filter(owner => {
                  const days = getDaysSinceApplication(owner.createdAt);
                  return days >= 3 && days < 7;
                }).length}
              </div>
              <Card.Title>Medium Priority</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="display-6 text-success mb-2">
                {owners.filter(owner => getDaysSinceApplication(owner.createdAt) < 3).length}
              </div>
              <Card.Title>New Applications</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search by name, email, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="all">All Applications</option>
            <option value="recent">Recent (≤3 days)</option>
            <option value="old">Old (&gt;7 days)</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button 
            variant="outline-primary" 
            onClick={fetchPendingOwners}
            className="w-100"
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Applications Count */}
      <Row className="mb-3">
        <Col>
          <p className="text-muted">
            Showing {filteredOwners.length} of {owners.length} pending applications
          </p>
        </Col>
      </Row>

      {/* Applications Grid */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredOwners.map(owner => (
          <Col key={owner._id}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <Card.Title className="mb-1">{owner.name}</Card.Title>
                    <Card.Subtitle className="text-muted mb-2">
                      {owner.email}
                    </Card.Subtitle>
                  </div>
                  {getUrgencyBadge(owner.createdAt)}
                </div>
                
                <div className="mb-3">
                  <div className="row text-muted small mb-2">
                    <div className="col-6">
                      <strong>Phone:</strong>
                    </div>
                    <div className="col-6">
                      {owner.phone || 'Not provided'}
                    </div>
                  </div>
                  
                  <div className="row text-muted small mb-2">
                    <div className="col-6">
                      <strong>Applied:</strong>
                    </div>
                    <div className="col-6">
                      {getApplicationDate(owner.createdAt)}
                    </div>
                  </div>
                  
                  <div className="row text-muted small mb-2">
                    <div className="col-6">
                      <strong>Days ago:</strong>
                    </div>
                    <div className="col-6">
                      {getDaysSinceApplication(owner.createdAt)} days
                    </div>
                  </div>
                  
                  {owner.address && (
                    <div className="mt-2">
                      <small className="text-muted">
                        <strong>Address:</strong> {owner.address}
                      </small>
                    </div>
                  )}
                </div>

                <div className="d-grid gap-2">
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => confirmAction(owner, 'approve')}
                    disabled={actionLoading === owner._id + 'approve'}
                  >
                    {actionLoading === owner._id + 'approve' ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Approve Owner
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => confirmAction(owner, 'reject')}
                    disabled={actionLoading === owner._id + 'reject'}
                  >
                    {actionLoading === owner._id + 'reject' ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times me-2"></i>
                        Reject & Delete
                      </>
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredOwners.length === 0 && !loading && (
        <Alert variant="info" className="text-center">
          <Alert.Heading>No Pending Applications</Alert.Heading>
          <p>
            {searchTerm || filterDate !== 'all'
              ? 'No applications match your search criteria.' 
              : 'All owner applications have been processed!'}
          </p>
        </Alert>
      )}

      {/* Action Confirmation Modal */}
      <Modal show={showActionModal} onHide={() => setShowActionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'approve' && 'Approve Owner'}
            {actionType === 'reject' && 'Reject Owner'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to{' '}
            <strong>
              {actionType === 'approve' && 'approve'}
              {actionType === 'reject' && 'reject and delete'}
            </strong>{' '}
            the owner application for <strong>{selectedOwner?.name}</strong>?
          </p>
          {actionType === 'approve' && (
            <p className="text-success">
              <strong>Note:</strong> This will approve the owner and allow them to list properties.
            </p>
          )}
          {actionType === 'reject' && (
            <p className="text-danger">
              <strong>Warning:</strong> This will permanently delete the owner's account and all associated data.
            </p>
          )}
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
            {actionLoading ? 'Processing...' : 
              actionType === 'approve' ? 'Approve Owner' : 'Reject & Delete'
            }
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminOwnerApprovals; 