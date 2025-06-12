// src/components/Header/Nav.jsx
import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, UserCircle, LogOut, Bell, ExternalLink } from 'lucide-react'; // Added ExternalLink
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api'; // Assuming you have a configured apiClient

const navLinksData = [
  { name: 'HOME', href: '/home' },
  { name: 'ABOUT', href: '/about' },
  { name: 'SERVICES', href: '/services' },
  { name: 'VEHICLE FLEET', href: '/fleet' },
  { name: 'CONTACT', href: '/contact' },
];

const Header = () => {
  // ... (mobileMenuOpen, scrolled, location, navigate, auth states remain the same)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout, isLoading: authIsLoading } = useAuth();


  // --- Notification States ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const notificationsDropdownRef = useRef(null); // For click outside

  // ... (useEffect for scroll, logoSrc remain the same) ...
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll); handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const logoSrc = "/images/Logo/Logo.png";


  // --- Fetch Notifications ---
  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setNotificationsLoading(true);
    try {
      // Fetch latest 3 unread for the dropdown preview
      const response = await apiClient.get('/notifications?unread_only=true&limit=5'); // Fetch 5, display 3, show "more" if count > 3
      if (response.data && Array.isArray(response.data.data)) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unread_count || 0); // Get total unread count from API
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Optionally set an error state to display to the user
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(); // Fetch on mount if authenticated

    // Optional: Poll for new notifications every minute
    // const intervalId = setInterval(fetchNotifications, 60000);
    // return () => clearInterval(intervalId);
  }, [isAuthenticated]); // Re-fetch if authentication state changes

  // --- Click Outside Handler for Dropdowns ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target)) {
        if (!event.target.closest('.notification-bell-button')) { // Don't close if bell itself is clicked
             setNotificationsOpen(false);
        }
      }
      // Similar logic for profile dropdown if needed
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const toggleMobileMenu = () => { /* ... same ... */ 
    setMobileMenuOpen(!mobileMenuOpen);
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(prev => !prev);
    setProfileDropdownOpen(false);
    if (!notificationsOpen && notifications.length === 0 && !notificationsLoading) { // Fetch if opening and no data
        fetchNotifications();
    }
  };

  const toggleProfileDropdown = () => { /* ... same ... */ 
    setProfileDropdownOpen(!profileDropdownOpen);
    setNotificationsOpen(false);
  };
  const handleLogout = async () => { /* ... same ... */ 
    await logout();
    setProfileDropdownOpen(false);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read (optional - backend might do this on view or frontend just optimistically updates)
    if (!notification.is_read) {
        try {
            await apiClient.post(`/notifications/${notification.id}/mark-as-read`);
            // Optimistically update UI or re-fetch
            setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, is_read: true} : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }
    setNotificationsOpen(false); // Close dropdown
 
    
    console.log("Notification clicked:", notification);
  };


  if (authIsLoading) { /* ... same loading header ... */ 
    return (
        <header className={`tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-30 tw-bg-[#18181B]/80 tw-backdrop-blur-sm tw-shadow-md tw-py-3 md:tw-py-4 tw-transition-opacity tw-duration-300`}>
            <div className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
                <div className="tw-flex tw-items-center tw-justify-between">
                    <Link to="/home" className="tw-flex tw-items-center tw-flex-shrink-0">
                        <img src={logoSrc} alt="RENTACAR Logo" className="tw-h-8 sm:tw-h-10" />
                    </Link>
                    <div className="tw-hidden md:tw-flex tw-items-center tw-space-x-4 tw-h-6"></div>
                    <div className="tw-flex tw-items-center tw-space-x-3 lg:tw-space-x-4 tw-h-10"></div>
                </div>
            </div>
        </header>
    );
  }

  const textColorClass = scrolled ? 'tw-text-gray-100' : 'tw-text-white';
  const hoverTextColorClass = 'hover:tw-text-amber-300';
  const activeTextColorClass = 'tw-text-amber-400';

  return (
    <header 
      className={`tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-30 tw-transition-all tw-duration-300 tw-ease-in-out ${
        scrolled 
          ? 'tw-py-3 sm:tw-py-4 tw-bg-[#1B1B1B] tw-shadow-lg'
          : 'tw-py-5 sm:tw-py-6 tw-bg-transparent'
      }`}
    >
      <div className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
        <div className="tw-flex tw-items-center tw-justify-between">
          <Link to="/home" className="tw-flex tw-items-center tw-flex-shrink-0">
            <img src={logoSrc} alt="RENTACAR Logo" 
              className={`tw-transition-all tw-duration-300 ${scrolled ? 'tw-h-12 sm:tw-h-14' : 'tw-h-16 sm:tw-h-20'}`} 
            />
          </Link>

          <nav className="tw-hidden md:tw-flex tw-items-center tw-space-x-1 lg:tw-space-x-2 xl:tw-space-x-3">
            {navLinksData.map(link => (
              <Link key={link.name} to={link.href} className={`tw-no-underline tw-uppercase tw-text-xs lg:tw-text-sm tw-font-medium tw-transition-colors tw-duration-300 tw-whitespace-nowrap tw-px-3 lg:tw-px-4 tw-py-2 tw-rounded-md ${ location.pathname === link.href ? activeTextColorClass : `${textColorClass} ${hoverTextColorClass}` } ${ !scrolled ? 'tw-shadow-sm [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]' : '' }`}>
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="tw-flex tw-items-center tw-space-x-3 lg:tw-space-x-4">
            <div className="tw-hidden md:tw-flex tw-items-center tw-space-x-3 lg:tw-space-x-4">
              {isAuthenticated && currentUser ? (
                <>
                  {/* --- Notification Bell and Dropdown --- */}
                  <div className="tw-relative" ref={notificationsDropdownRef}>
                    <button 
                      onClick={toggleNotifications}
                      className={`notification-bell-button tw-p-2 tw-rounded-full tw-transition-colors focus:tw-outline-none ${textColorClass} ${hoverTextColorClass}`}
                      aria-label="Notifications"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className={`tw-absolute tw-top-0 tw-right-0 tw-block tw-h-2.5 tw-w-2.5 tw-transform -tw-translate-y-0.5 tw-translate-x-0.5 tw-rounded-full tw-bg-red-500 tw-ring-1 ${scrolled ? 'tw-ring-[#1B1B1B]' : 'tw-ring-transparent'}`}></span>
                      )}
                    </button>
                    {notificationsOpen && (
                        <div className="tw-absolute tw-right-0 tw-mt-2 tw-w-80 sm:tw-w-96 tw-bg-[#1F1F23] tw-rounded-lg tw-shadow-2xl tw-border tw-border-gray-700/50 tw-z-40 tw-flex tw-flex-col">
                            <div className="tw-p-3 sm:tw-p-4 tw-border-b tw-border-gray-700/50">
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <h3 className="tw-text-sm tw-font-semibold tw-text-gray-100">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={async () => {
                                                await apiClient.post('/notifications/mark-all-as-read');
                                                fetchNotifications(); // Re-fetch to update list and count
                                            }} 
                                            className="tw-text-xs tw-text-amber-400 hover:tw-text-amber-300 focus:tw-outline-none"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="tw-py-1 tw-max-h-80 tw-overflow-y-auto tw-custom-scrollbar"> {/* Add custom scrollbar if needed */}
                                {notificationsLoading && <div className="tw-p-4 tw-text-center tw-text-xs tw-text-gray-400">Loading...</div>}
                                {!notificationsLoading && notifications.length === 0 && <div className="tw-p-4 tw-text-center tw-text-xs tw-text-gray-400">No new notifications.</div>}
                                {!notificationsLoading && notifications.slice(0, 3).map((notification) => ( // Display up to 3 recent
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`tw-px-3 sm:tw-px-4 tw-py-2.5 tw-border-b tw-border-gray-700/30 hover:tw-bg-gray-700/30 tw-cursor-pointer tw-transition-colors ${!notification.is_read ? 'tw-bg-gray-700/20' : ''}`}
                                    >
                                        <div className="tw-flex tw-justify-between tw-items-start">
                                            <p className={`tw-text-xs tw-font-medium ${!notification.is_read ? 'tw-text-amber-400' : 'tw-text-gray-200'}`}>{notification.title}</p>
                                            <span className="tw-text-[10px] tw-text-gray-500 tw-flex-shrink-0 tw-ml-2">{notification.timestamp_human}</span>
                                        </div>
                                        <p className="tw-text-xs tw-text-gray-400 tw-mt-0.5 tw-line-clamp-2">{notification.message}</p>
                                    </div>
                                ))}
                            </div>
                             {(unreadCount > 0 || notifications.length > 0) && ( // Show "View All" if more than 3 exist (either unread or fetched)
                                <div className="tw-p-2.5 tw-text-center tw-border-t tw-border-gray-700/50">
                                    <Link to="/notification" onClick={() => setNotificationsOpen(false)} className="tw-text-xs tw-font-medium tw-text-amber-400 hover:tw-text-amber-300 tw-no-underline">
                                        View All Notifications ({unreadCount})
                                    </Link>
                                </div>
                             )}
                        </div>
                    )}
                  </div>
                  {/* ... Profile Dropdown (remains the same) ... */}
                  <div className="tw-relative">
                    <button onClick={toggleProfileDropdown} className="tw-flex tw-items-center tw-space-x-2 focus:tw-outline-none">
                      {currentUser.profile_picture_url || currentUser.profile_photo_url ? ( <img src={currentUser.profile_picture_url || currentUser.profile_photo_url} alt={currentUser.full_name || currentUser.name} className="tw-w-8 tw-h-8 tw-rounded-full tw-object-cover tw-border-2 tw-border-amber-400" /> ) : ( <UserCircle size={32} className={activeTextColorClass} /> )}
                      <span className={`tw-hidden lg:tw-inline tw-text-xs lg:tw-text-sm tw-font-medium tw-transition-colors ${textColorClass} ${!scrolled ? '[text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]' : ''}`}>{(currentUser.full_name || currentUser.name)?.split(' ')[0]}</span>
                      <ChevronDown size={16} className={`tw-transition-transform tw-duration-200 ${profileDropdownOpen ? 'tw-rotate-180' : ''} ${textColorClass}`} />
                    </button>
                    {profileDropdownOpen && ( <div onMouseLeave={() => setProfileDropdownOpen(false)} className="tw-absolute tw-right-0 tw-mt-2 tw-w-48 tw-bg-[#1F1F23] tw-rounded-md tw-shadow-2xl tw-border tw-border-gray-700 tw-py-1 tw-z-40"> 
                    <Link to={`/Profiel/${currentUser.id}`} onClick={() => setProfileDropdownOpen(false)} className="tw-no-underline tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-300 hover:tw-bg-gray-700 hover:tw-text-amber-400">My Profile</Link> 
                    <Link to="/my-bookings" onClick={() => setProfileDropdownOpen(false)} className="tw-no-underline tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-300 hover:tw-bg-gray-700 hover:tw-text-amber-400">My Bookings</Link> <button onClick={handleLogout} className="tw-w-full tw-text-left tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-red-400 hover:tw-bg-gray-700 hover:tw-text-red-300"> Logout </button> </div> )}
                  </div>
                </>
              ) : ( /* ... Sign in/Sign up buttons (remain the same) ... */ 
                <>
                  <Link to="/Login" className={`tw-no-underline tw-transition-colors tw-px-4 tw-py-2 tw-text-xs lg:tw-text-sm tw-rounded-md ${textColorClass} ${hoverTextColorClass} ${!scrolled ? '[text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]' : ''}`}>Sign in</Link>
                  <Link to="/SignUp" className={`tw-no-underline tw-text-white hover:tw-opacity-90 tw-transition-opacity tw-px-4 tw-py-2 tw-rounded-md tw-text-xs lg:tw-text-sm tw-font-medium tw-shadow-md ${scrolled ? 'tw-bg-blue-600' : 'tw-bg-blue-500'}`}>Sign up</Link>
                </>
              )}
            </div>
            {/* ... Mobile Menu Toggle (remains the same) ... */}
            <button className={`md:tw-hidden tw-p-2 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-amber-400 tw-transition-colors ${textColorClass} ${hoverTextColorClass} ${mobileMenuOpen ? '!tw-text-amber-400' : ''} `} onClick={toggleMobileMenu} aria-label="Toggle mobile menu" aria-expanded={mobileMenuOpen}> {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />} </button>
          </div>
        </div>

        {/* ... Mobile Menu Panel (remains the same) ... */}
        {mobileMenuOpen && ( <div className={`md:tw-hidden tw-absolute tw-left-0 tw-right-0 tw-top-full tw-mt-0.5 tw-mx-0 tw-shadow-2xl tw-overflow-hidden tw-border-gray-700/50 tw-bg-black/90 tw-backdrop-blur-md tw-rounded-b-lg tw-border`}> <nav className="tw-flex tw-flex-col"> {navLinksData.map(link => ( <Link key={link.name} to={link.href} onClick={toggleMobileMenu} className={`tw-no-underline tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3.5 tw-border-b tw-border-gray-800/70 tw-transition-colors tw-text-sm tw-font-medium ${location.pathname === link.href ? 'tw-text-amber-400 tw-bg-gray-800' : 'tw-text-gray-200 hover:tw-bg-gray-800 hover:tw-text-amber-400'}`}> {link.name} <ChevronDown size={16} className="tw-ml-2 tw-transform -tw-rotate-90 tw-text-gray-500" /> </Link> ))} </nav> <div className={`tw-p-4 tw-bg-black/80`}> <p className="tw-text-gray-400 tw-mb-3 tw-text-xs tw-font-medium tw-uppercase tw-tracking-wider"> {isAuthenticated && currentUser ? `Welcome, ${(currentUser.full_name || currentUser.name)?.split(' ')[0]}` : "Account Access"} </p> <div className="tw-space-y-3"> {isAuthenticated && currentUser ? ( <> <Link to="/profile" onClick={toggleMobileMenu} className="tw-no-underline tw-block tw-w-full tw-text-center tw-font-medium tw-text-gray-200 tw-border tw-border-gray-700 hover:tw-border-amber-400 hover:tw-text-amber-400 tw-px-4 tw-py-2.5 tw-rounded-lg tw-text-sm">My Profile</Link> <Link to="/my-bookings" onClick={toggleMobileMenu} className="tw-no-underline tw-block tw-w-full tw-text-center tw-font-medium tw-text-gray-200 tw-border tw-border-gray-700 hover:tw-border-amber-400 hover:tw-text-amber-400 tw-px-4 tw-py-2.5 tw-rounded-lg tw-text-sm">My Bookings</Link> <button onClick={handleLogout} className="tw-block tw-w-full tw-text-center tw-bg-red-500/80 hover:tw-bg-red-600/90 tw-text-white tw-px-4 tw-py-2.5 tw-rounded-lg tw-font-medium tw-shadow-md tw-text-sm"> Logout </button> </> ) : ( <div className="tw-grid tw-grid-cols-2 tw-gap-3"> <Link to="/Login" onClick={toggleMobileMenu} className="tw-no-underline tw-text-center tw-font-medium tw-text-gray-200 tw-border tw-border-gray-700 hover:tw-border-amber-400 hover:tw-text-amber-400 tw-px-4 tw-py-2.5 tw-rounded-lg tw-text-sm">Sign in</Link> <Link to="/SignUp" onClick={toggleMobileMenu} className="tw-no-underline tw-text-center tw-bg-blue-500 hover:tw-bg-blue-600 tw-px-4 tw-py-2.5 tw-rounded-lg tw-font-medium tw-text-white tw-shadow-md tw-text-sm">Sign up</Link> </div> )} </div> </div> </div> )}
      </div>
    </header>
  );
};

export default Header;