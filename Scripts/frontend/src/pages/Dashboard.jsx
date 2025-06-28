import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const Dashboard = () => {
  const { user, isOwner, isAdmin, isRenter } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (isOwner) {
        const [propertiesRes, bookingsRes] = await Promise.all([
          axios.get('/api/properties/user/properties', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('/api/bookings/owner', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        setStats({
          properties: propertiesRes.data.length,
          bookings: bookingsRes.data.length,
          pendingBookings: bookingsRes.data.filter(b => b.status === 'pending').length
        });
      } else if (isRenter) {
        const bookingsRes = await axios.get('/api/bookings/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats({
          bookings: bookingsRes.data.length,
          pendingBookings: bookingsRes.data.filter(b => b.status === 'pending').length
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Welcome back, {user?.name}! 👋</h1>
          <p className="text-muted">Here's what's happening with your account</p>
        </Col>
      </Row>

      {isOwner && (
        <>
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-primary">{stats.properties || 0}</h3>
                  <p className="mb-0">Properties Listed</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-success">{stats.bookings || 0}</h3>
                  <p className="mb-0">Total Bookings</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-warning">{stats.pendingBookings || 0}</h3>
                  <p className="mb-0">Pending Approvals</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Quick Actions</h5>
                  </div>
                  <div className="d-flex gap-3">
                    <Button as={Link} to="/add-property" variant="primary">
                      Add New Property
                    </Button>
                    <Button as={Link} to="/my-bookings" variant="outline-primary">
                      View Bookings
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {isRenter && (
        <>
          <Row className="mb-4">
            <Col md={6}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-primary">{stats.bookings || 0}</h3>
                  <p className="mb-0">My Bookings</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-warning">{stats.pendingBookings || 0}</h3>
                  <p className="mb-0">Pending Applications</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Quick Actions</h5>
                  </div>
                  <div className="d-flex gap-3">
                    <Button as={Link} to="/properties" variant="primary">
                      Browse Properties
                    </Button>
                    <Button as={Link} to="/my-bookings" variant="outline-primary">
                      View My Bookings
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {isAdmin && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Admin Dashboard</h5>
                <p>Welcome to the admin panel. You can manage users, properties, and platform settings.</p>
                <Button as={Link} to="/admin" variant="primary">
                  Go to Admin Panel
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Account Information</h5>
              <Row>
                <Col md={6}>
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Account Type:</strong> 
                    <Badge bg={isOwner ? 'success' : isAdmin ? 'danger' : 'primary'} className="ms-2">
                      {user?.type}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
                  <p><strong>Address:</strong> {user?.address || 'Not provided'}</p>
                  <p><strong>Status:</strong> 
                    <Badge bg={user?.isApproved ? 'success' : 'warning'} className="ms-2">
                      {user?.isApproved ? 'Approved' : 'Pending Approval'}
                    </Badge>
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 