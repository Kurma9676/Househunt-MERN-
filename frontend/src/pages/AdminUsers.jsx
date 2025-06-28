import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleteLoading(userToDelete._id);
    try {
      await axios.delete(`/api/admin/users/${userToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(null);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (user) => {
    if (user.type === 'admin') {
      return <Badge bg="danger">Admin</Badge>;
    } else if (user.type === 'owner') {
      return user.isApproved ? 
        <Badge bg="success">Approved Owner</Badge> : 
        <Badge bg="warning">Pending Owner</Badge>;
    } else {
      return <Badge bg="info">Renter</Badge>;
    }
  };

  const getJoinedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || user.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading users...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Manage Users</h1>
          <p className="text-muted">Manage all registered users in the system</p>
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
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="renter">Renters</option>
            <option value="owner">Owners</option>
            <option value="admin">Admins</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button 
            variant="outline-primary" 
            onClick={fetchUsers}
            className="w-100"
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Users Count */}
      <Row className="mb-3">
        <Col>
          <p className="text-muted">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </Col>
      </Row>

      {/* Users Grid */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredUsers.map(user => (
          <Col key={user._id}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <Card.Title className="mb-1">{user.name}</Card.Title>
                    <Card.Subtitle className="text-muted mb-2">
                      {user.email}
                    </Card.Subtitle>
                  </div>
                  {getStatusBadge(user)}
                </div>
                
                <div className="mb-3">
                  <small className="text-muted">
                    <strong>Joined:</strong> {getJoinedDate(user.createdAt)}
                  </small>
                  {user.phone && (
                    <div>
                      <small className="text-muted">
                        <strong>Phone:</strong> {user.phone}
                      </small>
                    </div>
                  )}
                  {user.address && (
                    <div>
                      <small className="text-muted">
                        <strong>Address:</strong> {user.address}
                      </small>
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  {user._id !== currentUser?._id ? (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => confirmDelete(user)}
                      disabled={deleteLoading === user._id}
                    >
                      {deleteLoading === user._id ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-trash me-2"></i>
                          Delete User
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button variant="outline-secondary" size="sm" disabled>
                      <i className="fas fa-user me-2"></i>
                      Current User
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredUsers.length === 0 && !loading && (
        <Alert variant="info" className="text-center">
          <Alert.Heading>No Users Found</Alert.Heading>
          <p>
            {searchTerm || filterType !== 'all' 
              ? 'No users match your search criteria.' 
              : 'No users are registered yet.'}
          </p>
        </Alert>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
          </p>
          <p className="text-danger">
            <strong>Warning:</strong> This action cannot be undone. All associated data (properties, bookings) will also be deleted.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteUser}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminUsers; 