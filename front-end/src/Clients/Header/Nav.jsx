import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Menu, X, ChevronDown, UserCircle, LogOut } from 'lucide-react'; // Added UserCircle, LogOut



// Navigation links data
const navLinksData = [
  { name: 'HOME', href: '/home' },
  { name: 'ABOUT', href: '/about' },
  { name: 'SERVICES', href: '/services' },
  { name: 'VEHICLE FLEET', href: '/fleet' },
  { name: 'CONTACT', href: '/contact' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // For redirecting after logout

  // --- SIMULATED AUTH STATE ---
  // In a real app, this would come from Context, Redux, or props
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default to not logged in
  const [userData, setUserData] = useState(null);
  // Example:
  // const { isLoggedIn, user, logout } = useAuth(); // From your auth context

  // --- SIMULATED LOGIN/LOGOUT FOR DEMO ---
  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserData({ 
      name: 'Lahyane oussama', // Replace with actual user name
      profilePicture: '' // Replace with actual URL or placeholder logic
    });
    // Typically navigate to a dashboard or home page
    // navigate('/'); 
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    // Navigate to home or login page after logout
    navigate('/'); 
    if (mobileMenuOpen) toggleMobileMenu(); // Close mobile menu if open
  };
  // --- END OF SIMULATED AUTH ---


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const logoSrc = "/images/Logo/Logo.png"; // Ensure this path is correct

  // Dropdown for logged-in user profile
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);


  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out ${
        scrolled 
          ? 'bg-[#18181B] shadow-lg py-3 md:py-4'
          : 'bg-transparent py-4 md:py-6'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/home" className="flex items-center flex-shrink-0">
            <img src={logoSrc} alt="RENTACAR Logo" 
              className={`transition-all duration-300 ${scrolled ? 'h-8 sm:h-10' : 'h-10 sm:h-12'}`} />
          </Link>

          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
            {navLinksData.map(link => (
              <Link key={link.name} to={link.href}
                className={`uppercase text-xs lg:text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                  location.pathname === link.href 
                    ? 'text-amber-400 border-b-2 border-amber-400 pb-1' 
                    : (scrolled ? 'text-gray-200 hover:text-amber-300' : 'text-white hover:text-amber-300 shadow-sm [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]')
                }`}>
                {link.name}
              </Link>
            ))}
          </nav>

          {/* --- CONDITIONAL AUTH SECTION --- */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {isLoggedIn && userData ? (
              // --- Logged In State ---
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {userData.profilePicture ? (
                    <img src={userData.profilePicture} alt={userData.name} className="w-8 h-8 rounded-full object-cover border-2 border-amber-400" />
                  ) : (
                    <UserCircle size={32} className="text-amber-400 rounded-full bg-gray-700 p-1" />
                  )}
                  <span className={`text-xs lg:text-sm font-medium transition-colors ${scrolled ? 'text-gray-200' : 'text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]'}`}>{userData.name}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''} ${scrolled ? 'text-gray-300' : 'text-white'}`} />
                </button>
                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div 
                    onMouseLeave={() => setProfileDropdownOpen(false)} // Optional: close on mouse leave
                    className="absolute right-0 mt-2 w-48 bg-[#1F1F23] rounded-md shadow-2xl border border-gray-700 py-1 z-40">
                    <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400">My Profile</Link>
                    <Link to="/my-bookings" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400">My Bookings</Link>
                    <button onClick={() => { handleLogout(); setProfileDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // --- Logged Out State ---
              <>
                <Link to="/Login"
                  className={`transition-colors px-3 py-1.5 text-xs lg:text-sm rounded-md hover:bg-white/10 ${
                    scrolled ? 'text-gray-200 hover:text-amber-300' : 'text-white hover:text-amber-300 shadow-sm [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]'
                  }`}>
                  Sign in
                </Link>
                <Link to="/Signup"
                  className="bg-[#1572D3] text-white hover:bg-blue-600 transition-colors px-4 py-2 rounded-md text-xs lg:text-sm font-medium shadow-md">
                  Sign up
                </Link>
              </>
            )}
          </div>
          {/* --- END OF CONDITIONAL AUTH SECTION --- */}


          <button 
            className={`md:hidden text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
              scrolled ? 'bg-amber-500/90 hover:bg-amber-500' : 'bg-amber-500/80 hover:bg-amber-500 shadow-md'
            }`}
            onClick={toggleMobileMenu} aria-label="Toggle mobile menu" aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div 
            className={`md:hidden absolute left-0 right-0 top-full mt-0.5 mx-0 shadow-2xl overflow-hidden border-gray-700/50 ${
              scrolled ? 'bg-[#18181B] border-t' : 'bg-black/90 backdrop-blur-md rounded-b-lg border' 
            }`}>
            <nav className="flex flex-col">
              {navLinksData.map(link => (
                <Link key={link.name} to={link.href} onClick={toggleMobileMenu}
                  className={`flex items-center justify-between px-4 py-3.5 border-b border-gray-800/70 transition-colors text-sm font-medium ${location.pathname === link.href ? 'text-amber-400 bg-gray-800' : 'text-gray-200 hover:bg-gray-800 hover:text-amber-400'}`}>
                  {link.name}
                  <ChevronDown size={16} className="ml-2 transform -rotate-90 text-gray-500 group-hover:text-amber-400" />
                </Link>
              ))}
            </nav>
            <div className={`p-4 ${scrolled ? 'bg-[#151518]' : 'bg-black/80'}`}>
              <p className="text-gray-400 mb-3 text-xs font-medium uppercase tracking-wider">
                {isLoggedIn && userData ? `Welcome, ${userData.name.split(' ')[0]}` : "Account Access"}
              </p>
              <div className="space-y-3">
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" onClick={toggleMobileMenu} className="block w-full text-center font-medium text-gray-200 border border-gray-700 hover:border-amber-400 hover:text-amber-400 px-4 py-2.5 rounded-lg text-sm">My Profile</Link>
                    <button onClick={handleLogout} className="block w-full text-center bg-red-500/80 hover:bg-red-600/90 text-white px-4 py-2.5 rounded-lg font-medium shadow-md text-sm">
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/Login" onClick={toggleMobileMenu} className="text-center font-medium text-gray-200 border border-gray-700 hover:border-amber-400 hover:text-amber-400 px-4 py-2.5 rounded-lg text-sm">Sign in</Link>
                    <Link to="/Signup" onClick={toggleMobileMenu} className="text-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-4 py-2.5 rounded-lg font-medium text-white shadow-md text-sm">Sign up</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
       {/* --- SIMULATED LOGIN BUTTON FOR DEMO --- */}
       {/* Remove this button in your actual application */}
       {!isLoggedIn && (
        <button onClick={handleLogin} className="fixed bottom-5 right-5 bg-green-500 text-white p-3 rounded-full shadow-lg z-50">
          Simulate Login
        </button>
       )}
       {/* --- END OF SIMULATED LOGIN BUTTON --- */}
    </header>
  );
};

export default Header;