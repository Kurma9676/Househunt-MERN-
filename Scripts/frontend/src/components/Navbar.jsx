import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Navbar,
  Nav,
  Container,
  Dropdown
} from 'react-bootstrap';
import './Navbar.css';

const NavigationBar = () => {
  const { user, isAuthenticated, logout, isOwner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setExpanded(false);
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      className="py-3 w-100"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container fluid className="px-4"> {/* full-width container with padding */}
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
          🏠 House Hunter
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/properties" onClick={() => setExpanded(false)}>
              Houses
            </Nav.Link>
          </Nav>

          <Nav>
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/login" onClick={() => setExpanded(false)}>
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" onClick={() => setExpanded(false)}>
                  Register
                </Nav.Link>
              </>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" id="dropdown-user">
                  👤 {user?.name}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/dashboard" onClick={() => setExpanded(false)}>
                    Dashboard
                  </Dropdown.Item>
                  {isOwner && (
                    <Dropdown.Item as={Link} to="/add-property" onClick={() => setExpanded(false)}>
                      Add Property
                    </Dropdown.Item>
                  )}
                  {isOwner && (
                    <Dropdown.Item as={Link} to="/my-properties" onClick={() => setExpanded(false)}>
                      My Properties
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item as={Link} to="/my-bookings" onClick={() => setExpanded(false)}>
                    My Bookings
                  </Dropdown.Item>
                  {isAdmin && (
                    <Dropdown.Item as={Link} to="/admin" onClick={() => setExpanded(false)}>
                      Admin Panel
                    </Dropdown.Item>
                  )}
                  {isOwner && (
                    <Dropdown.Item as={Link} to="/owner-bookings" onClick={() => setExpanded(false)}>
                      Owner Bookings
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
