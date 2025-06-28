import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/admin/properties', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      setProperties(response.data);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err.response?.data?.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;
    
    setDeleteLoading(propertyToDelete._id);
    try {
      await axios.delete(`/api/admin/properties/${propertyToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setProperties(properties.filter(property => property._id !== propertyToDelete._id));
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(err.response?.data?.message || 'Failed to delete property');
    } finally {
      setDeleteLoading(null);
    }
  };

  const confirmDelete = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (property) => {
    if (property.isAvailable) {
      return <Badge bg="success">Available</Badge>;
    } else {
      return <Badge bg="secondary">Not Available</Badge>;
    }
  };

  const getPropertyTypeBadge = (type) => {
    const typeColors = {
      'apartment': 'primary',
      'house': 'success',
      'villa': 'warning',
      'condo': 'info',
      'studio': 'dark'
    };
    return <Badge bg={typeColors[type] || 'secondary'}>{type}</Badge>;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getCreatedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFullAddress = (address) => {
    if (!address) return 'No address provided';
    const parts = [address.street, address.city, address.state, address.zipCode];
    return parts.filter(part => part).join(', ');
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.propType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.userID?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || property.propType === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'available' && property.isAvailable) ||
      (filterStatus === 'unavailable' && !property.isAvailable);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading properties...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Manage Properties</h1>
          <p className="text-muted">Manage all properties listed in the system</p>
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
            placeholder="Search by type, city, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="condo">Condo</option>
            <option value="studio">Studio</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Not Available</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button 
            variant="outline-primary" 
            onClick={fetchProperties}
            className="w-100"
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </Button>
        </Col>
        <Col md={2}>
          <Button 
            variant="success" 
            onClick={() => window.open('/add-property', '_blank')}
            className="w-100"
          >
            <i className="fas fa-plus me-2"></i>
            Add Property
          </Button>
        </Col>
      </Row>

      {/* Properties Count */}
      <Row className="mb-3">
        <Col>
          <p className="text-muted">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </Col>
      </Row>

      {/* Properties Grid */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredProperties.map(property => (
          <Col key={property._id}>
            <Card className="h-100 border-0 shadow-sm">
              {property.images && property.images.length > 0 && (
                <Card.Img 
                  variant="top" 
                  src={`${BACKEND_URL}/uploads/${property.images[0]}`}
                  alt={property.propType}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <Card.Title className="mb-1">{property.propType}</Card.Title>
                    <Card.Subtitle className="text-muted mb-2">
                      {getFullAddress(property.address)}
                    </Card.Subtitle>
                  </div>
                  <div className="text-end">
                    {getStatusBadge(property)}
                    <div className="mt-1">
                      {getPropertyTypeBadge(property.propType)}
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="mb-2">
                    <strong className="text-success fs-5">
                      {formatPrice(property.propAmt)}
                    </strong>
                    <small className="text-muted"> /month</small>
                  </div>
                  
                  <div className="row text-muted small">
                    <div className="col-6">
                      <i className="fas fa-bed me-1"></i>
                      {property.bedrooms || 0} Beds
                    </div>
                    <div className="col-6">
                      <i className="fas fa-bath me-1"></i>
                      {property.bathrooms || 0} Baths
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <small className="text-muted">
                      <strong>Owner:</strong> {property.userID?.name || 'Unknown'}
                    </small>
                  </div>
                  
                  <div>
                    <small className="text-muted">
                      <strong>Listed:</strong> {getCreatedDate(property.createdAt)}
                    </small>
                  </div>
                </div>

                <div className="d-grid">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => confirmDelete(property)}
                    disabled={deleteLoading === property._id}
                  >
                    {deleteLoading === property._id ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash me-2"></i>
                        Delete Property
                      </>
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredProperties.length === 0 && !loading && (
        <Alert variant="info" className="text-center">
          <Alert.Heading>No Properties Found</Alert.Heading>
          <p>
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'No properties match your search criteria.' 
              : 'No properties are listed yet.'}
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
            Are you sure you want to delete <strong>{propertyToDelete?.propType}</strong> at{' '}
            <strong>{getFullAddress(propertyToDelete?.address)}</strong>?
          </p>
          <p className="text-danger">
            <strong>Warning:</strong> This action cannot be undone. All associated bookings will also be deleted.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteProperty}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Property'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminProperties; 