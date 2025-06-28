import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5 w-100" style={{ width: '100%' }}>
      <Container fluid>
        <Row>
          <Col md={6}>
            <h5>🏠 HouseHunt</h5>
            <p className="mb-0">Finding Your Perfect Rental Home</p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-0">
              © {new Date().getFullYear()} HouseHunt. All rights reserved.
            </p>
            <small className="text-muted">
              Built with React, Node.js, and MongoDB
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 