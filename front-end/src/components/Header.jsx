import React from 'react';
import { Navbar, Nav, NavDropdown, Button, Container } from 'react-bootstrap'; // Assuming you use React Bootstrap
import { LuLogOut, } from 'react-icons/lu'; // Example icons
import { useAuth } from '../contexts/AuthContext'; // Adjust path to your AuthContext
import { Link, useNavigate } from 'react-router-dom';
import{ UserCircle} from 'lucide-react'
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

const Header = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // This already navigates to /login by default from AuthContext
      // navigate('/login'); // Optional: if you want to explicitly navigate here instead of relying on AuthContext's default
    } catch (error) {
      console.error("Logout failed in Header:", error);
      // Handle any UI feedback for logout failure if necessary
    }
  };

  return (
    <Navbar expand="lg" className="mb-0 app-header app-header-transparent ">
      <Container fluid >
       
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto px-3 py-2 align-items-center">
            {isAuthenticated && currentUser ? (
              <>
                <NavDropdown
                  title={
                    <>
                      <UserCircle size={20} className="me-1 d-inline" />
                      {currentUser.full_name || currentUser.email}
                    </>
                  }
                  id="basic-nav-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/admin/profile"> {/* Example profile link */}
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/settings"> {/* Example settings link */}
                    Settings
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    <LuLogOut size={16} className="me-2" />Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                {/* Optionally show Login/Register if not authenticated and header is visible on public pages */}
                {/* This part might not be needed if header is only in AdminLayout */}
                {/* <Nav.Link as={Link} to="/login">Login</Nav.Link> */}
                {/* <Nav.Link as={Link} to="/register">Register</Nav.Link> */}
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;