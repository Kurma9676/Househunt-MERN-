import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('Admin stats response:', response.data);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err.response?.data?.message || 'Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading admin dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
          <Button onClick={fetchStats} variant="outline-danger">
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Admin Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.name}!</p>
        </Col>
      </Row>

      {stats && (
        <>
          <Row className="mb-4" xs={1} md={2} lg={4}>
            <Col>
              <Card className="text-center h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="display-6 text-primary mb-2">{stats.totalUsers || 0}</div>
                  <Card.Title>Total Users</Card.Title>
                  <small className="text-muted">
                    {stats.totalRenters || 0} Renters • {stats.totalOwners || 0} Owners
                  </small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col>
              <Card className="text-center h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="display-6 text-success mb-2">{stats.totalProperties || 0}</div>
                  <Card.Title>Total Properties</Card.Title>
                  <small className="text-muted">
                    {stats.availableProperties || 0} Available
                  </small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col>
              <Card className="text-center h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="display-6 text-info mb-2">{stats.totalBookings || 0}</div>
                  <Card.Title>Total Bookings</Card.Title>
                  <small className="text-muted">
                    {stats.pendingBookings || 0} Pending
                  </small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col>
              <Card className="text-center h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="display-6 text-warning mb-2">{stats.pendingOwners || 0}</div>
                  <Card.Title>Pending Approvals</Card.Title>
                  <small className="text-muted">
                    Owner Applications
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4" xs={1} md={2} lg={4}>
            <Col>
              <Button 
                as={Link} 
                to="/admin/users" 
                variant="outline-primary" 
                className="w-100 py-3"
              >
                <i className="fas fa-users me-2"></i>
                Manage Users
              </Button>
            </Col>
            <Col>
              <Button 
                as={Link} 
                to="/admin/properties" 
                variant="outline-success" 
                className="w-100 py-3"
              >
                <i className="fas fa-home me-2"></i>
                Manage Properties
              </Button>
            </Col>
            <Col>
              <Button 
                as={Link} 
                to="/admin/bookings" 
                variant="outline-info" 
                className="w-100 py-3"
              >
                <i className="fas fa-calendar me-2"></i>
                Manage Bookings
              </Button>
            </Col>
            <Col>
              <Button 
                as={Link} 
                to="/admin/owner-approvals" 
                variant="outline-warning" 
                className="w-100 py-3"
              >
                <i className="fas fa-user-check me-2"></i>
                Owner Approvals
              </Button>
            </Col>
          </Row>
        </>
      )}

      {!stats && !loading && !error && (
        <Alert variant="info">
          <Alert.Heading>No Data Available</Alert.Heading>
          <p>No statistics are currently available. Please try refreshing the page.</p>
          <Button onClick={fetchStats} variant="outline-info">
            Refresh Data
          </Button>
        </Alert>
      )}
    </Container>
  );
};

export default AdminDashboard; 