import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, UserCircle, LogOut, Bell } from 'lucide-react'; // Added Bell icon

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
  const navigate = useNavigate();

  // --- SIMULATED AUTH STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  // --- SIMULATED NOTIFICATION STATE ---
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Example count
  const [notificationsOpen, setNotificationsOpen] = useState(false);


  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserData({ 
      name: 'Lahyane oussama',
      profilePicture: '' 
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setUnreadNotifications(0); // Clear notifications on logout for demo
    setProfileDropdownOpen(false); // Close profile dropdown
    setNotificationsOpen(false); // Close notifications dropdown
    navigate('/'); 
    if (mobileMenuOpen) toggleMobileMenu();
  };
  // --- END OF SIMULATED STATES ---

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setProfileDropdownOpen(false); // Close other dropdowns
    setNotificationsOpen(false);
  };
  
  const logoSrc = "/images/Logo/Logo.png";

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setProfileDropdownOpen(false); // Close profile dropdown if open
    // In a real app, you might mark notifications as read here or when the panel opens fully
    // For demo, let's just clear the count if it was > 0
    if (unreadNotifications > 0 && !notificationsOpen) { // Only clear if opening and had unread
        // setUnreadNotifications(0); // Simulate marking as read
    }
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    setNotificationsOpen(false); // Close notifications dropdown if open
  };


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

          <div className="flex items-center space-x-3 lg:space-x-4"> {/* Combined Auth and Mobile Toggle */}
            {/* --- CONDITIONAL AUTH SECTION (Desktop) --- */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              {isLoggedIn && userData ? (
                <>
                  {/* Notification Icon & Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={toggleNotifications}
                      className={`p-2 rounded-full transition-colors focus:outline-none ${
                        scrolled ? 'text-gray-300 hover:bg-gray-700 hover:text-amber-400' : 'text-white hover:bg-white/10 hover:text-amber-300'
                      }`}
                      aria-label="Notifications"
                    >
                      <Bell size={20} />
                      {unreadNotifications > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#18181B]"></span>
                      )}
                    </button>
                    {notificationsOpen && (
                      <div 
                        onMouseLeave={() => setNotificationsOpen(false)}
                        className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#1F1F23] rounded-md shadow-2xl border border-gray-700 py-1 z-40 max-h-96 overflow-y-auto">
                        <div className="px-4 py-2 text-sm font-semibold text-gray-200 border-b border-gray-700">Notifications</div>
                        {/* Example Notification Items - Replace with dynamic data */}
                        {unreadNotifications > 0 ? (
                            <>
                                <Link to="/notifications/1" onClick={() => setNotificationsOpen(false)} className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400 border-b border-gray-700/50">
                                    <p className="font-medium">New Booking Confirmed!</p>
                                    <p className="text-xs text-gray-400">Your booking for Toyota Camry is confirmed.</p>
                                </Link>
                                <Link to="/notifications/2" onClick={() => setNotificationsOpen(false)} className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400">
                                    <p className="font-medium">Special Offer Just For You</p>
                                    <p className="text-xs text-gray-400">Get 15% off on your next SUV rental.</p>
                                </Link>
                                <div className="px-4 py-2 mt-1">
                                    <button onClick={() => setUnreadNotifications(0)} className="text-xs text-amber-400 hover:underline">Mark all as read</button>
                                </div>
                            </>
                        ) : (
                            <p className="px-4 py-6 text-sm text-center text-gray-400">No new notifications.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={toggleProfileDropdown}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      {userData.profilePicture ? (
                        <img src={userData.profilePicture} alt={userData.name} className="w-8 h-8 rounded-full object-cover border-2 border-amber-400" />
                      ) : (
                        <UserCircle size={32} className="text-amber-400 rounded-full bg-gray-700/50 p-1" />
                      )}
                      <span className={`hidden lg:inline text-xs lg:text-sm font-medium transition-colors ${scrolled ? 'text-gray-200' : 'text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]'}`}>{userData.name.split(' ')[0]}</span>
                      <ChevronDown size={16} className={`transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''} ${scrolled ? 'text-gray-300' : 'text-white'}`} />
                    </button>
                    {profileDropdownOpen && (
                      <div 
                        onMouseLeave={() => setProfileDropdownOpen(false)}
                        className="absolute right-0 mt-2 w-48 bg-[#1F1F23] rounded-md shadow-2xl border border-gray-700 py-1 z-40">
                        <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400">My Profile</Link>
                        <button onClick={() => { handleLogout(); }} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300">
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/Login" className={`transition-colors px-3 py-1.5 text-xs lg:text-sm rounded-md hover:bg-white/10 ${ scrolled ? 'text-gray-200 hover:text-amber-300' : 'text-white hover:text-amber-300 shadow-sm [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]' }`}>Sign in</Link>
                  <Link to="/Signup" className="bg-blue-500 text-white transition-colors px-4 py-2 rounded-md text-xs lg:text-sm font-medium shadow-md">Sign up</Link>
                </>
              )}
            </div>
            {/* --- END OF DESKTOP AUTH SECTION --- */}

            {/* Mobile Menu Toggle Button */}
            <button 
              className={`md:hidden text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
                scrolled ? 'bg-amber-500/90 hover:bg-amber-500' : 'bg-amber-500/80 hover:bg-amber-500 shadow-md'
              }`}
              onClick={toggleMobileMenu} aria-label="Toggle mobile menu" aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
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
                    {/* Mobile Notifications */}
                    <button onClick={() => { toggleNotifications(); /* toggleMobileMenu(); // Optional: close mobile menu when opening notifications */ }} className="flex items-center justify-between w-full text-left font-medium text-gray-200 border border-gray-700 hover:border-amber-400 hover:text-amber-400 px-4 py-2.5 rounded-lg text-sm">
                      <span>Notifications</span>
                      <div className="relative">
                        <Bell size={18} className="text-gray-400"/>
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 transform rounded-full bg-red-500 ring-1 ring-white dark:ring-[#151518]"></span>
                        )}
                      </div>
                    </button>
                    {/* Mobile Profile Links */}
                    <Link to="/Profiel" onClick={toggleMobileMenu} className="block w-full text-center font-medium text-gray-200 border border-gray-700 hover:border-amber-400 hover:text-amber-400 px-4 py-2.5 rounded-lg text-sm">My Profile</Link>
                    <button onClick={handleLogout} className="block w-full text-center bg-red-500/80 hover:bg-red-600/90 text-white px-4 py-2.5 rounded-lg font-medium shadow-md text-sm">
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/Login" onClick={toggleMobileMenu} className="text-center font-medium text-gray-200 border border-gray-700 hover:border-amber-400 hover:text-amber-400 px-4 py-2.5 rounded-lg text-sm">Sign in</Link>
                    <Link to="/Signup" onClick={toggleMobileMenu} className="text-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-4 py-2.5 rounded-lg font-medium text-white shadow-md text-sm">Sign up</Link>
                  </div>
                )}
              </div>
            </div>
            {/* Mobile Notifications Panel (if opened from mobile menu) */}
            {notificationsOpen && (
                <div className="absolute left-0 right-0 top-full mt-0.5 mx-0 shadow-2xl overflow-hidden border-gray-700/50 bg-[#1F1F23] z-50"> {/* Ensure high z-index */}
                    <div className="px-4 py-2 text-sm font-semibold text-gray-200 border-b border-gray-700 flex justify-between items-center">
                        <span>Notifications</span>
                        <button onClick={() => setNotificationsOpen(false)}><X size={18} className="text-gray-400 hover:text-white"/></button>
                    </div>
                    {unreadNotifications > 0 ? (
                        <>
                            <Link to="/notifications/1" onClick={() => {setNotificationsOpen(false); toggleMobileMenu();}} className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400 border-b border-gray-700/50">
                                <p className="font-medium">New Booking Confirmed!</p>
                                <p className="text-xs text-gray-400">Your booking for Toyota Camry is confirmed.</p>
                            </Link>
                            {/* Add more notifications */}
                            <div className="px-4 py-2 mt-1">
                                <button onClick={() => setUnreadNotifications(0)} className="text-xs text-amber-400 hover:underline">Mark all as read</button>
                            </div>
                        </>
                    ) : (
                        <p className="px-4 py-6 text-sm text-center text-gray-400">No new notifications.</p>
                    )}
                </div>
            )}
          </div>
        )}
      </div>
       {/* --- SIMULATED LOGIN BUTTON FOR DEMO --- */}
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