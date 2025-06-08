import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // Adjust this path to your AuthContext

// Navigation links data
const navLinksData = [
  { name: 'HOME', href: '/' },
  { name: 'ABOUT', href: '/about' },
  { name: 'SERVICES', href: '/services' },
  { name: 'VEHICLE FLEET', href: '/fleet' },
  { name: 'CONTACT', href: '/contact' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // --- REAL AUTHENTICATION from CONTEXT ---
  // Replaces all the simulated useState hooks
  const { isAuthenticated, user, logout } = useAuth();
  // --- END OF REAL AUTHENTICATION ---

  // Real logout handler using the function from AuthContext
  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false); // Close dropdown
    if (mobileMenuOpen) toggleMobileMenu(); // Close mobile menu if open
    navigate('/'); // Redirect to home page after logout
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check scroll position on initial render
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const logoSrc = "/images/Logo/Logo.png"; // Ensure this path is correct in your public folder

  return (
    <header 
      className={`tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-30 tw-transition-all tw-duration-300 tw-ease-in-out ${
        scrolled 
          ? 'tw-bg-[#18181B] tw-shadow-lg tw-py-3 md:tw-py-4'
          : 'tw-bg-transparent tw-py-4 md:tw-py-6'
      }`}
    >
      <div className="container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
        <div className="tw-flex tw-items-center tw-justify-between">
          <Link to="/" className="tw-flex tw-items-center tw-flex-shrink-0">
            <img src={logoSrc} alt="RENTACAR Logo" 
              className={`tw-transition-all tw-duration-300 ${scrolled ? 'tw-h-8 sm:tw-h-10' : 'tw-h-10 sm:tw-h-12'}`} />
          </Link>

          <nav className="tw-hidden md:tw-flex tw-items-center tw-space-x-4 lg:tw-space-x-6 xl:tw-space-x-8">
            {navLinksData.map(link => (
              <Link key={link.name} to={link.href}
                className={`tw-uppercase tw-text-xs lg:tw-text-sm tw-font-medium tw-transition-colors tw-duration-300 tw-whitespace-nowrap ${
                  location.pathname === link.href 
                    ? 'tw-text-amber-400 tw-border-b-2 tw-border-amber-400 tw-pb-1' 
                    : (scrolled ? 'tw-text-gray-200 hover:tw-text-amber-300' : 'tw-text-white hover:tw-text-amber-300 tw-shadow-sm [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]')
                }`}>
                {link.name}
              </Link>
            ))}
          </nav>

          {/* --- AUTH SECTION using real isAuthenticated state --- */}
          <div className="tw-hidden md:tw-flex tw-items-center tw-space-x-3 lg:tw-space-x-4">
            {isAuthenticated && user ? (
              // --- Logged In State ---
              <div className="tw-relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="tw-flex tw-items-center tw-space-x-2 focus:tw-outline-none"
                >
                  {user.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt={user.full_name} className="tw-w-8 tw-h-8 tw-rounded-full tw-object-cover tw-border-2 tw-border-amber-400" />
                  ) : (
                    <UserCircle size={32} className="tw-text-amber-400 tw-rounded-full tw-bg-gray-700 tw-p-1" />
                  )}
                  <span className={`tw-text-xs lg:tw-text-sm tw-font-medium tw-transition-colors ${scrolled ? 'tw-text-gray-200' : 'tw-text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]'}`}>{user.full_name}</span>
                  <ChevronDown size={16} className={`tw-transition-transform tw-duration-200 ${profileDropdownOpen ? 'tw-rotate-180' : ''} ${scrolled ? 'tw-text-gray-300' : 'tw-text-white'}`} />
                </button>
                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div 
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="tw-absolute tw-right-0 tw-mt-2 tw-w-48 tw-bg-[#1F1F23] tw-rounded-md tw-shadow-2xl tw-border tw-border-gray-700 tw-py-1 tw-z-40">
                    <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-300 hover:tw-bg-gray-700 hover:tw-text-amber-400">My Profile</Link>
                    <Link to="/my-bookings" onClick={() => setProfileDropdownOpen(false)} className="tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-300 hover:tw-bg-gray-700 hover:tw-text-amber-400">My Bookings</Link>
                    <button onClick={handleLogout} className="tw-w-full tw-text-left tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-red-400 hover:tw-bg-gray-700 hover:tw-text-red-300">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // --- Logged Out State ---
              <>
                <Link to="/Login"
                  className={`tw-transition-colors tw-px-3 tw-py-1.5 tw-text-xs lg:tw-text-sm tw-rounded-md hover:tw-bg-white/10 ${
                    scrolled ? 'tw-text-gray-200 hover:tw-text-amber-300' : 'tw-text-white hover:tw-text-amber-300 tw-shadow-sm [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]'
                  }`}>
                  Sign in
                </Link>
                <Link to="/Signup"
                  className="tw-bg-[#1572D3] tw-text-white hover:tw-bg-blue-600 tw-transition-colors tw-px-4 tw-py-2 tw-rounded-md tw-text-xs lg:tw-text-sm tw-font-medium tw-shadow-md">
                  Sign up
                </Link>
              </>
            )}
          </div>
          {/* --- END OF AUTH SECTION --- */}

          <button 
            className={`md:tw-hidden tw-text-white tw-p-2 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-amber-400 tw-transition-colors ${
              scrolled ? 'tw-bg-amber-500/90 hover:tw-bg-amber-500' : 'tw-bg-amber-500/80 hover:tw-bg-amber-500 tw-shadow-md'
            }`}
            onClick={toggleMobileMenu} aria-label="Toggle mobile menu" aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div 
            className={`md:tw-hidden tw-absolute tw-left-0 tw-right-0 tw-top-full tw-mt-0.5 tw-mx-0 tw-shadow-2xl tw-overflow-hidden tw-border-gray-700/50 ${
              scrolled ? 'tw-bg-[#18181B] tw-border-t' : 'tw-bg-black/90 backdrop-blur-md tw-rounded-b-lg tw-border' 
            }`}>
            <nav className="tw-flex tw-flex-col">
              {navLinksData.map(link => (
                <Link key={link.name} to={link.href} onClick={toggleMobileMenu}
                  className={`tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3.5 tw-border-b tw-border-gray-800/70 tw-transition-colors tw-text-sm tw-font-medium ${location.pathname === link.href ? 'tw-text-amber-400 tw-bg-gray-800' : 'tw-text-gray-200 hover:tw-bg-gray-800 hover:tw-text-amber-400'}`}>
                  {link.name}
                  <ChevronDown size={16} className="tw-ml-2 tw-transform -tw-rotate-90 tw-text-gray-500" />
                </Link>
              ))}
            </nav>
            <div className={`tw-p-4 ${scrolled ? 'tw-bg-[#151518]' : 'tw-bg-black/80'}`}>
              <p className="tw-text-gray-400 tw-mb-3 tw-text-xs tw-font-medium tw-uppercase tw-tracking-wider">
                {isAuthenticated && user ? `Welcome, ${user.full_name.split(' ')[0]}` : "Account Access"}
              </p>
              <div className="tw-space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={toggleMobileMenu} className="tw-block tw-w-full tw-text-center tw-font-medium tw-text-gray-200 tw-border tw-border-gray-700 hover:tw-border-amber-400 hover:tw-text-amber-400 tw-px-4 tw-py-2.5 tw-rounded-lg tw-text-sm">My Profile</Link>
                    <button onClick={handleLogout} className="tw-block tw-w-full tw-text-center tw-bg-red-500/80 hover:tw-bg-red-600/90 tw-text-white tw-px-4 tw-py-2.5 tw-rounded-lg tw-font-medium tw-shadow-md tw-text-sm">
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                    <Link to="/Login" onClick={toggleMobileMenu} className="tw-text-center tw-font-medium tw-text-gray-200 tw-border tw-border-gray-700 hover:tw-border-amber-400 hover:tw-text-amber-400 tw-px-4 tw-py-2.5 tw-rounded-lg tw-text-sm">Sign in</Link>
                    <Link to="/Signup" onClick={toggleMobileMenu} className="tw-text-center tw-bg-amber-500 hover:tw-bg-amber-600 tw-px-4 tw-py-2.5 tw-rounded-lg tw-font-medium tw-text-white tw-shadow-md tw-text-sm">Sign up</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;