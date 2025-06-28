import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    bedrooms: ''
  });

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await axios.get(`/api/properties?${params}`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <LoadingSpinner message="Loading properties..." />;
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Available Properties</h1>
          <p className="text-muted">Find your perfect rental home</p>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Search Filters</h5>
              <Row>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Type</Form.Label>
                    <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                      <option value="">All Types</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="room">Room</option>
                      <option value="studio">Studio</option>
                      <option value="villa">Villa</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Min Price</Form.Label>
                    <Form.Control
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      placeholder="Min"
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Max Price</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="Max"
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={filters.city}
                      onChange={handleFilterChange}
                      placeholder="City"
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Bedrooms</Form.Label>
                    <Form.Select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange}>
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button variant="outline-secondary" onClick={() => setFilters({})}>
                    Clear Filters
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Properties Grid */}
      <Row>
        {properties.length === 0 ? (
          <Col>
            <div className="text-center py-5">
              <h4>No properties found</h4>
              <p className="text-muted">Try adjusting your search filters</p>
            </div>
          </Col>
        ) : (
          properties.map(property => (
            <Col key={property._id} lg={4} md={6} className="mb-4">
              <Card className="h-100 property-card">
                <div className="property-image">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={`${BACKEND_URL}/uploads/${property.images[0]}`}
                      alt={property.propType}
                      className="card-img-top"
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                      <span className="text-muted">No Image</span>
                    </div>
                  )}
                  <Badge bg={property.isAvailable ? 'success' : 'secondary'} className="position-absolute top-0 end-0 m-2">
                    {property.isAvailable ? 'Available' : 'Rented'}
                  </Badge>
                </div>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{property.propType}</h5>
                    <span className="text-primary fw-bold">
                      {property.propAmt?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}/month
                    </span>
                  </div>
                  <p className="text-muted mb-2">
                    {property.address?.city}, {property.address?.state}
                  </p>
                  <div className="mb-3">
                    <small className="text-muted">
                      {property.addInfo?.bedrooms} bed • {property.addInfo?.bathrooms} bath • {property.addInfo?.area} sq ft
                    </small>
                  </div>
                  <Button as={Link} to={`/properties/${property._id}`} variant="primary" className="w-100">
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default PropertyList; 