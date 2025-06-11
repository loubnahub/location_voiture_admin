import React, { useState, useEffect } from 'react';
import {
  Bell, FileText, Download, Eye, Tag, Copy, CheckCircle,
  FileSearch, Percent, ListFilter, Circle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Nav'; // Assuming your Header component is here

// --- SAMPLE NOTIFICATIONS DATA ---
const sampleNotificationsData = [
    {
      id: 'n1',
      type: 'contract_ready',
      title: 'Your Rental Contract for BMW X3 is Ready!',
      message: 'The rental agreement for your booking #12345 (BMW X3) is now available for review and download.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      isRead: false,
      contractDetails: {
        documentName: 'Rental_Agreement_BMW_X3_Booking_12345.pdf',
        contractId: 'C789',
        vehicleInfo: 'BMW X3 - 2024 Model',
        bookingId: 'B12345',
        downloadUrl: '/api/contracts/C789/download',
        viewUrl: '/my-account/bookings/B12345/contract',
      },
      actions: [
        { label: 'Mark as Read', type: 'mark_read', variant: 'secondary' }
      ]
    },
    {
      id: 'n2',
      type: 'promotion',
      title: 'Weekend Special: 25% Off SUVs!',
      message: 'Book any SUV this weekend and get a 25% discount. Don\'t miss out on this limited-time offer.',
      timestamp: new Date(Date.now() - 3600000 * 24 * 1).toISOString(), // 1 day ago
      isRead: false,
      promotionDetails: {
        promoCode: 'SUVWKND25',
        discount: '25%',
        appliesTo: 'All SUV Models',
        offerUrl: '/offers/suv-weekend',
        expiryDate: new Date(Date.now() + 3600000 * 24 * 3).toISOString(),
      },
      actions: [
          { label: 'Mark as Read', type: 'mark_read', variant: 'secondary' }
      ]
    },
    {
      id: 'n3',
      type: 'booking_update',
      title: 'Your Audi A4 Pickup Time Changed',
      message: 'Your pickup time for booking #B67890 (Audi A4) has been updated to 3:00 PM on July 20, 2024.',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      isRead: true,
      bookingDetails: {
          bookingId: 'B67890',
          vehicleInfo: 'Audi A4',
          viewUrl: '/my-account/bookings/B67890'
      },
      actions: [
        { label: 'View Booking', type: 'view_booking', variant: 'primary', payload: { bookingId: 'B67890', viewUrl: '/my-account/bookings/B67890' } }
      ]
    },
    {
      id: 'n4',
      type: 'general_reminder',
      title: 'Upcoming: Vehicle Return',
      message: 'Friendly reminder: Your Tesla Model S is due for return tomorrow by 10:00 AM at our Downtown location.',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      isRead: false,
      actions: [
          { label: 'View Details', type: 'view_details', variant: 'primary', payload: { detailsUrl: '/my-account/bookings/B11223' } },
          { label: 'Mark as Read', type: 'mark_read', variant: 'secondary' }
      ]
    },
    {
      id: 'n5',
      type: 'contract_ready',
      title: 'Mercedes C-Class Contract Finalized',
      message: 'Your contract for the Mercedes C-Class (Booking #B00789) is ready. Please review and sign at your earliest convenience.',
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      isRead: true,
      contractDetails: {
        documentName: 'Contract_Mercedes_CClass_B00789.pdf',
        contractId: 'C101',
        vehicleInfo: 'Mercedes C-Class - 2023 Edition',
        bookingId: 'B00789',
        downloadUrl: '/api/contracts/C101/download',
        viewUrl: '/my-account/bookings/B00789/contract',
      },
      actions: []
    },
    {
      id: 'n6',
      type: 'promotion',
      title: 'Exclusive Offer for Loyal Customers!',
      message: 'As a thank you for your loyalty, enjoy an additional 10% off your next rental. Use code LOYAL10.',
      timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      isRead: false,
      promotionDetails: {
        promoCode: 'LOYAL10',
        discount: '10% (additional)',
        appliesTo: 'Next Rental',
        offerUrl: '/my-account/rewards',
      },
      actions: [
          { label: 'Mark as Read', type: 'mark_read', variant: 'secondary' }
      ]
    },
    {
      id: 'n7',
      type: 'general_reminder',
      title: 'Payment Due Soon',
      message: 'A payment for your upcoming rental (Booking #B99001) is due in 3 days. Ensure your payment method is up to date.',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      isRead: false,
      actions: [
          { label: 'Update Payment', type: 'update_payment', variant: 'primary', payload: { bookingId: 'B99001', paymentUrl: '/my-account/billing' } },
          { label: 'Mark as Read', type: 'mark_read', variant: 'secondary' }
      ]
    }
  ];
// --- END OF SAMPLE NOTIFICATIONS DATA ---

// --- MOCK API FUNCTION ---
const fetchClientNotifications = async () => {
  console.log("Fetching client notifications...");
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate a chance of API error
      // if (Math.random() > 0.8) { // ~20% chance of error for testing
      //   console.error("Mock API Error: Failed to fetch notifications.");
      //   reject(new Error("Simulated API error: Could not fetch notifications."));
      //   return;
      // }

      try {
        // Deep copy to ensure state is mutable and simulate fresh data
        const deepCopiedData = JSON.parse(JSON.stringify(sampleNotificationsData));
        console.log("Successfully fetched and parsed notifications:", deepCopiedData);
        resolve(deepCopiedData);
      } catch (e) {
        console.error("Error during JSON stringify/parse of sampleNotificationsData in mock fetch:", e);
        reject(new Error("Internal error processing notification data."));
      }
    }, 1200); // Simulate 1.2 second network delay
  });
};
// --- END OF MOCK API FUNCTION ---


// --- ClientNotificationItem Component ---
const ClientNotificationItem = ({ notification, onAction }) => {
  const { id, type, title, message, timestamp, isRead, contractDetails, promotionDetails, bookingDetails, actions = [] } = notification;
  const handleActionClick = (actionType, data = {}) => onAction(id, actionType, data);

  const getIcon = () => {
    const commonClass = 'tw-w-6 tw-h-6';
    const readClass = 'tw-opacity-70';
    switch (type) {
      case 'contract_ready':
        return <FileText className={`${commonClass} ${isRead ? readClass + ' tw-text-gray-400' : 'tw-text-[#1572D3]'}`} />;
      case 'promotion':
        return <Tag className={`${commonClass} ${isRead ? readClass + ' tw-text-gray-400' : 'tw-text-green-400'}`} />;
      case 'booking_update':
        return <Bell className={`${commonClass} ${isRead ? readClass + ' tw-text-gray-400' : 'tw-text-yellow-400'}`} />;
      case 'general_reminder':
        return <Bell className={`${commonClass} ${isRead ? readClass + ' tw-text-gray-400' : 'tw-text-purple-400'}`} />;
      default:
        return <Bell className={`${commonClass} ${isRead ? readClass + ' tw-text-gray-500' : 'tw-text-gray-400'}`} />;
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Promo code copied to clipboard!'); // Consider a more subtle notification
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className={`tw-bg-[#2a2a2a] tw-p-4 sm:tw-p-5 tw-rounded-lg tw-border ${isRead ? 'tw-border-gray-700' : 'tw-border-[#1572D3] shadow-lg'} hover:tw-shadow-xl tw-transition-all tw-duration-200`}>
      <div className="tw-flex tw-items-start tw-space-x-3 sm:tw-space-x-4">
        <div className="tw-flex-shrink-0 tw-pt-1 tw-relative">
          {getIcon()}
          {!isRead && <Circle className="tw-w-2.5 tw-h-2.5 tw-fill-[#1572D3] tw-text-[#1572D3] tw-absolute tw-top-0 tw-right-0 tw--mr-1" />}
        </div>
        <div className="tw-flex-1 tw-min-w-0">
          <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
            <h3 className={`tw-font-semibold ${isRead ? 'tw-text-gray-400' : 'tw-text-white'} tw-text-sm sm:tw-text-base tw-leading-tight`}>{title}</h3>
            <span className="tw-text-xs tw-text-gray-500 tw-flex-shrink-0 tw-ml-2">{timeAgo(timestamp)}</span>
          </div>
          <p className={`tw-text-xs sm:tw-text-sm ${isRead ? 'tw-text-gray-500' : 'tw-text-gray-300'} tw-mb-3`}>{message}</p>

          {type === 'contract_ready' && contractDetails && (
            <div className="tw-bg-[#222222]/70 tw-p-2.5 tw-rounded-md tw-mb-3 tw-text-xs">
              <p className="tw-text-gray-300 tw-font-medium">Contract: {contractDetails.documentName}</p>
              <p className="tw-text-gray-400">Vehicle: {contractDetails.vehicleInfo}</p>
              <div className="tw-mt-2 tw-flex tw-gap-2">
                <button onClick={() => handleActionClick('view_contract', contractDetails)} className="tw-flex tw-items-center tw-border-0 tw-gap-1 tw-px-3 tw-py-1 tw-bg-[#1572D3] hover:tw-bg-[#115ba1] tw-text-white tw-rounded tw-text-xs tw-font-medium"><Eye size={14} /> View</button>
                <button onClick={() => handleActionClick('download_contract', contractDetails)} className="tw-flex tw-items-center tw-border-0 tw-gap-1 tw-px-3 tw-py-1 tw-bg-green-600 hover:tw-bg-green-700 tw-text-white tw-rounded tw-text-xs tw-font-medium"><Download size={14} /> Download</button>
              </div>
            </div>
          )}
          {type === 'promotion' && promotionDetails && (
            <div className="tw-bg-[#222222]/70 tw-p-2.5 tw-rounded-md tw-mb-3 tw-text-xs">
              <p className="tw-text-gray-300 tw-font-medium">Offer: {promotionDetails.discount} on {promotionDetails.appliesTo}</p>
              {promotionDetails.promoCode && (
                <div className="tw-flex tw-items-center tw-gap-2 tw-mt-1">
                  <span className="tw-text-gray-400">Code:</span>
                  <span className="tw-font-mono tw-text-[#FFA600] tw-bg-[#1b1b1b] tw-px-1.5 tw-py-0.5 tw-rounded">{promotionDetails.promoCode}</span>
                  <button onClick={() => copyToClipboard(promotionDetails.promoCode)} className="tw-text-[#1572D3] tw-border-0 hover:tw-text-[#0e4e8c]"><Copy size={14} /></button>
                </div>
              )}
              {promotionDetails.expiryDate && <p className="tw-text-gray-500 tw-mt-1">Expires: {new Date(promotionDetails.expiryDate).toLocaleDateString()}</p>}
              <div className="tw-mt-2">
                <button onClick={() => handleActionClick('view_promotion', promotionDetails)} className="tw-px-3 tw-py-1 tw-bg-[#FFA600] tw-border-0 hover:tw-bg-[#e09100] tw-text-black tw-rounded tw-text-xs tw-font-medium">View Offer</button>
              </div>
            </div>
          )}
          {type === 'booking_update' && bookingDetails && (
             <div className="tw-mt-2 tw-mb-3">
                <button onClick={() => handleActionClick('view_booking', bookingDetails)} className="tw-px-3 tw-py-1 tw-bg-[#1572D3] hover:tw-bg-[#115ba1] tw-border-0 tw-text-white tw-rounded tw-text-xs tw-font-medium">View Booking Details</button>
              </div>
          )}
          {actions && actions.length > 0 && (
            <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-3">
              {actions.map((action, index) => (
                <button key={index} onClick={() => handleActionClick(action.type, action.payload || {})}
                  className={`tw-px-3 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-border-0
                    ${action.variant === 'primary' ? 'tw-bg-[#FFA600] hover:tw-bg-[#e09100] tw-text-black' 
                      : action.variant === 'danger' ? 'tw-bg-red-600 hover:tw-bg-red-700 tw-text-white'
                      : 'tw-bg-gray-600 hover:tw-bg-gray-500 tw-text-gray-200'}`}
                >{action.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// --- END OF ClientNotificationItem Component ---


// --- NotificationsPage Component (Main Page) ---
export default function NotificationsPage() { 
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      setError(null); // Reset error before fetching
      try {
        const data = await fetchClientNotifications(); // Call the mock API
        if (Array.isArray(data)) {
            setNotifications(data);
            setFilteredNotifications(data); // Initially, all notifications are shown
        } else {
            // This case should ideally not happen with the current mock, but good for robustness
            console.error("Fetched data is not an array:", data);
            setNotifications([]);
            setFilteredNotifications([]);
            setError('Received invalid notification data format.');
        }
      } catch (err) {
        // This catch block will handle rejections from fetchClientNotifications
        console.error("Error fetching notifications:", err);
        setError(err.message || 'Failed to load notifications. Please try again.');
        setNotifications([]); // Clear any old data on error
        setFilteredNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []); // Empty dependency array means this runs once on component mount

  useEffect(() => {
    // This effect runs whenever 'activeFilter' or 'notifications' state changes
    let currentNotifications = [...notifications]; // Create a new array to avoid mutating state directly
    if (activeFilter === 'unread') {
      currentNotifications = notifications.filter(n => !n.isRead);
    } else if (activeFilter === 'contracts') {
      currentNotifications = notifications.filter(n => n.type === 'contract_ready');
    } else if (activeFilter === 'promotions') {
      currentNotifications = notifications.filter(n => n.type === 'promotion');
    }
    // For 'all', no filtering is needed beyond the initial setNotifications
    setFilteredNotifications(currentNotifications);
  }, [activeFilter, notifications]); // Re-run when filter or base notifications change

  const handleNotificationAction = (notificationId, actionType, data) => {
    console.log(`Action: ${actionType} on notification ${notificationId}`, data);

    if (actionType === 'mark_read') {
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } else if (actionType === 'download_contract' && data.downloadUrl) {
      window.open(data.downloadUrl, '_blank'); // For mock, this won't actually download
    } else if (data.viewUrl) { 
        navigate(data.viewUrl);
    } else if (data.offerUrl) {
        navigate(data.offerUrl);
    } else if (data.detailsUrl) {
        navigate(data.detailsUrl);
    } else if (data.paymentUrl) {
        navigate(data.paymentUrl);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const filters = [
    { id: 'all', label: 'All', icon: <ListFilter size={16} /> },
    { id: 'unread', label: 'Unread', icon: <Bell size={16} /> },
    { id: 'contracts', label: 'Contracts', icon: <FileSearch size={16} /> },
    { id: 'promotions', label: 'Promotions', icon: <Percent size={16} /> },
  ];

  const headerHeight = 70; 

  // --- RENDER LOGIC ---
  if (loading) {
    return (
      <>
        <Header />
        <div className="tw-min-h-screen tw-bg-[#1b1b1b] tw-flex tw-items-center tw-justify-center tw-text-white" style={{ paddingTop: `${headerHeight}px` }}>
          <p>Loading notifications...</p>
        </div>
      </>
    );
  }

  // Show general error if loading is done and error exists
  // (and potentially no notifications to show as a fallback)
  if (error && filteredNotifications.length === 0) { 
    return (
      <>
        <Header />
        <div className="tw-min-h-screen tw-bg-[#1b1b1b] tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-px-4" style={{ paddingTop: `${headerHeight}px` }}>
          <Bell className="tw-w-16 tw-h-16 tw-text-red-400 tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-red-400 tw-mb-2">Oops! Something went wrong.</h2>
          <p className="tw-text-gray-400 tw-mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} // Simple reload action
            className="tw-px-6 tw-py-2 tw-bg-[#FFA600] tw-text-black tw-rounded-lg tw-font-semibold hover:tw-bg-[#e09100]"
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-[#1b1b1b] tw-text-white">
      <Header />
      <div className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6" style={{ paddingTop: `${headerHeight + 30}px`, paddingBottom: '40px' }}>
        <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-mb-6 sm:tw-mb-8">
            <h1 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-center sm:tw-text-left tw-text-[#FFA600]">Notifications</h1> {/* Adjusted text-center for small screens */}
        </div>
        <div className="tw-mb-6 tw-flex tw-flex-wrap tw-gap-2 sm:tw-gap-3">
          {filters.map(filter => (
            <button key={filter.id} onClick={() => setActiveFilter(filter.id)}
              className={`tw-px-3 sm:tw-px-4 tw-py-1.5 tw-border-0 sm:tw-py-2 tw-text-xs sm:tw-text-sm tw-font-medium tw-rounded-full tw-flex tw-items-center tw-gap-2 tw-transition-colors
                ${activeFilter === filter.id
                  ? 'tw-bg-[#FFA600] tw-text-black' 
                  : 'tw-bg-[#2a2a2a] hover:tw-bg-[#3a3a3a] tw-text-gray-300'
                }`}
            >{filter.icon} {filter.label}</button>
          ))}
        </div>
        
        {/* Display specific error message if it occurred but we might still have old data */}
        {error && filteredNotifications.length > 0 && <p className="tw-text-red-400 tw-mb-4">Warning: Could not fetch latest updates. {error}</p>}

        {filteredNotifications.length > 0 ? (
          <div className="tw-space-y-4">
            {filteredNotifications.map(notification => (
              <ClientNotificationItem key={notification.id} notification={notification} onAction={handleNotificationAction} />
            ))}
          </div>
        ) : (
          !loading && ( // Only show "no notifications" if not loading AND no general error screen was shown
            <div className="tw-text-center tw-py-10 tw-bg-[#2a2a2a] tw-rounded-lg">
                <Bell className="tw-mx-auto tw-w-12 tw-h-12 tw-text-gray-500 tw-mb-4" />
                <p className="tw-text-gray-400">
                {activeFilter === 'all' ? "You're all caught up!" : `No ${activeFilter} notifications found.`}
                </p>
            </div>
          )
        )}
        <div className="tw-mt-10 tw-text-center tw-text-sm tw-text-gray-500">End of notifications.</div>
      </div>
    </div>
  );
}