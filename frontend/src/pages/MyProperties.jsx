import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import { authenticatedRequest } from '../utils/apiUtils';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await authenticatedRequest({
          method: 'GET',
          url: '/api/properties/user/properties'
        });
        setProperties(res.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch properties';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    setDeletingId(id);
    setError(null); // Clear any previous errors
    try {
      await authenticatedRequest({
        method: 'DELETE',
        url: `/api/properties/${id}`
      });
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete property';
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your properties..." />;
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">My Properties</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && properties.length === 0 && (
        <Alert variant="info">You have not listed any properties yet.</Alert>
      )}
      <Row>
        {properties.map((property) => {
          const formattedPrice = property.propAmt?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
          const imageUrl = property.images && property.images.length > 0
            ? `${BACKEND_URL}/uploads/${property.images[0]}`
            : '';
          return (
            <Col md={6} lg={4} className="mb-4" key={property._id}>
              <Card>
                {imageUrl && (
                  <Card.Img
                    variant="top"
                    src={imageUrl}
                    alt={property.propType}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{property.propType} - {property.adType}</Card.Title>
                  <Card.Text>
                    <strong>Address:</strong> {property.address?.street}, {property.address?.city}, {property.address?.state}<br />
                    <strong>Price:</strong> {formattedPrice}<br />
                    <strong>Status:</strong> {property.isAvailable ? 'Available' : 'Not Available'}
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(property._id)}
                      disabled={deletingId === property._id}
                    >
                      {deletingId === property._id ? 'Deleting...' : 'Delete'}
                    </Button>
                    {/* Edit button will be added next */}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default MyProperties; 