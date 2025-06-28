import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { House, Search, Shield, People } from 'react-bootstrap-icons';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section
        className="hero-section d-flex align-items-center justify-content-center text-white text-center"
        style={{
          minHeight: '100vh',
          background: `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80') center/cover no-repeat`,
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-3">Find Your Perfect Rental Home</h1>
              <p className="lead mb-4">
                Discover thousands of rental properties in your area. From cozy apartments to spacious houses, HouseHunt helps you find the perfect place to call home.
              </p>
              <div className="d-grid gap-3 d-md-flex justify-content-center">
                <Button as={Link} to="/properties" variant="light" size="lg" className="fw-bold px-4 py-2">
                  Browse Properties
                </Button>
                <Button as={Link} to="/register" variant="outline-light" size="lg" className="fw-bold px-4 py-2">
                  Get Started
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light text-center">
        <Container>
          <h2 className="fw-bold mb-4">How It Works</h2>
          <p className="text-muted mb-5">Renting made simple in 3 easy steps</p>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <Search size={50} className="mb-3 text-primary" />
                  <h5 className="fw-bold">Search Properties</h5>
                  <p className="text-muted">Browse and filter thousands of verified rental listings in your desired location.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <People size={50} className="mb-3 text-success" />
                  <h5 className="fw-bold">Connect with Owners</h5>
                  <p className="text-muted">Contact property owners directly and schedule viewings with ease.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <House size={50} className="mb-3 text-warning" />
                  <h5 className="fw-bold">Book & Move In</h5>
                  <p className="text-muted">Book your favorite property securely and move in with confidence.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center fw-bold mb-4">Why Choose HouseHunt?</h2>
          <p className="text-center text-muted mb-5">We make finding your perfect rental home simple and secure</p>
          <Row className="g-4">
            <Col xs={12} md={6} lg={3} className="text-center">
              <Search size={40} className="text-primary mb-3" />
              <h5>Easy Search</h5>
              <p className="text-muted">Filter properties by location, price, and amenities to find exactly what you need.</p>
            </Col>
            <Col xs={12} md={6} lg={3} className="text-center">
              <Shield size={40} className="text-success mb-3" />
              <h5>Verified Properties</h5>
              <p className="text-muted">All properties are verified and listed by trusted property owners.</p>
            </Col>
            <Col xs={12} md={6} lg={3} className="text-center">
              <People size={40} className="text-info mb-3" />
              <h5>Direct Contact</h5>
              <p className="text-muted">Connect directly with property owners for quick responses and negotiations.</p>
            </Col>
            <Col xs={12} md={6} lg={3} className="text-center">
              <House size={40} className="text-warning mb-3" />
              <h5>Secure Booking</h5>
              <p className="text-muted">Safe and secure booking process with transparent communication.</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-5 text-center">
        <Container>
          <h2 className="mb-3">Ready to Find Your New Home?</h2>
          <p className="lead mb-4">Join thousands of satisfied renters who found their perfect home through HouseHunt.</p>
          <div className="d-grid gap-3 d-md-flex justify-content-center">
            <Button as={Link} to="/register" variant="light" size="lg" className="fw-bold px-4 py-2">
              Sign Up Now
            </Button>
            <Button as={Link} to="/login" variant="outline-light" size="lg" className="fw-bold px-4 py-2">
              Login
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;
