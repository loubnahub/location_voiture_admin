import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell, FileText, Download, Eye, Tag, Copy, CheckCircle,
  FileSearch, Percent, ListFilter, Circle, 
} from 'lucide-react';
import {reject} from 'lodash'; // Assuming lodash is available for deep copying
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Nav'; // Assuming your Header component is here

// --- SAMPLE NOTIFICATIONS DATA (AS REQUESTED) ---
// We will parse the 'message' string to get the actionable data.
const sampleNotificationsData = [
  {
    id: "1",
    title: 'Your Rental Agreement is Ready!',
    // The link is embedded in the message string
    message: "The rental agreement for your Booking @ASKLSKENMEK@ is ready. Please review and sign it. Download Link: @http://localhost:8000/api/rental-agreements/d72309de-8ec2-4809-bc75-11885389b9e3/download?expires=1750272158&signature=7998d0eacffdcf3beab92a3ad8c1d72f379700f8883b87bce1dff4ff17a6a0d4@",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    isRead: false,
  },
  {
    id: "2",
    title: 'A Special Weekend Promo!',
    // The promo code is embedded in the message string
    message: "Here is a special offer just for you. Use this promo code for your next booking: @WEEKEND25@",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    isRead: true,
  },{
    id: "3",
    title: 'A Special Weekend Promo!',
    message: "Here is a special offer just for you. Use this promo code for your next booking: @S33BG5SD@ . Please review and sign it. Download Link: @http://localhost:8000/api/rental-agreements/d72309de-8ec2-4809-bc75-11885389b9e3/download?expires=1750272158&signature=7998d0eacffdcf3beab92a3ad8c1d72f379700f8883b87bce1dff4ff17a6a0d4@",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    isRead: true,
  }
];
// --- END OF SAMPLE NOTIFICATIONS DATA ---


// --- MOCK API FUNCTION (Unchanged) ---
const fetchClientNotifications = async () => {
  console.log("Fetching client notifications...");
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const deepCopiedData = JSON.parse(JSON.stringify(sampleNotificationsData));
        resolve(deepCopiedData);
      } catch (e) {
        reject(new Error("Internal error processing notification data."));
      }
    }, 1200);
  });
};
// --- END OF MOCK API FUNCTION ---

// --- HELPER FUNCTION TO PARSE THE MESSAGE STRING ---
// This is the key to solving the problem without changing the data structure.
const parseMessageForActions = (message) => {
  // Regex to find a URL enclosed in @...@
  const urlRegex = /@(https?:\/\/[^@]+)@/;
  // Regex to find a promo code (assumed to be uppercase letters/numbers) enclosed in @...@
  const promoCodeRegex = /@([A-Z0-9]+)@/;

  const urlMatch = message.match(urlRegex);
  const promoCodeMatch = message.match(promoCodeRegex);

  let cleanMessage = message;
  let downloadUrl = null;
  let promoCode = null;

  if (urlMatch && urlMatch[1]) {
    downloadUrl = urlMatch[1];
    // Remove the link part from the message for cleaner display
    cleanMessage = cleanMessage.replace(urlRegex, '').replace('Download Link:', '').trim();
  }
  
  // Check for a promo code that is NOT a URL
  if (promoCodeMatch && promoCodeMatch[1] && !promoCodeMatch[1].startsWith('http')) {
    promoCode = promoCodeMatch[1];
    // Remove the promo code part from the message for cleaner display
    cleanMessage = cleanMessage.replace(promoCodeRegex, '').replace('promo code for your next booking:', '').trim();
  }

  // Also extract the booking ID for display
  const bookingIdMatch = message.match(/@(#\w+)@/);
  if (bookingIdMatch && bookingIdMatch[1]) {
    cleanMessage = cleanMessage.replace(bookingIdMatch[0], bookingIdMatch[1]);
  }

  return { cleanMessage, downloadUrl, promoCode };
};
// --- END OF HELPER FUNCTION ---


// --- ClientNotificationItem Component (MODIFIED) ---
const ClientNotificationItem = ({ notification, onAction }) => {
  const { id, title, message, timestamp, isRead } = notification;

  // CHANGED: Parse the message when the component renders
  // useMemo ensures this parsing only happens when the message changes
  const parsedData = useMemo(() => parseMessageForActions(message), [message]);

  const handleActionClick = (actionType, data = {}) => onAction(id, actionType, data);

  // This logic is now simpler, as it doesn't need to know the 'type'
  const getIcon = () => {
    const commonClass = 'tw-w-6 tw-h-6';
    const readClass = 'tw-opacity-70';
    if (parsedData.downloadUrl) {
      return <FileText className={`${commonClass} ${isRead ? readClass + ' tw-text-gray-400' : 'tw-text-[#1572D3]'}`} />;
    }
    if (parsedData.promoCode) {
      return <Tag className={`${commonClass} ${isRead ? readClass + ' tw-text-gray-400' : 'tw-text-green-400'}`} />;
    }
    return <Bell className={`${commonClass} ${isRead ? readClass + ' tw-text-gray-500' : 'tw-text-gray-400'}`} />;
  };

  const timeAgo = (dateString) => {
    // ... (timeAgo function is unchanged) ...
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
      alert('Promo code copied to clipboard!');
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
          {/* CHANGED: Display the cleaned message */}
          <p className={`tw-text-xs sm:tw-text-sm ${isRead ? 'tw-text-gray-500' : 'tw-text-gray-300'} tw-mb-3`}>
            {parsedData.cleanMessage}
          </p>

          {/* CHANGED: Conditionally render action buttons based on parsed data */}
          {parsedData.downloadUrl && (
            <div className="tw-mt-2 tw-flex tw-gap-2">
              <button onClick={() => handleActionClick('open_url', { url: parsedData.downloadUrl })} className="tw-flex tw-items-center tw-border-0 tw-gap-1 tw-px-3 tw-py-1 tw-bg-[#1572D3] hover:tw-bg-[#115ba1] tw-text-white tw-rounded tw-text-xs tw-font-medium"><Eye size={14} /> View</button>
              <button onClick={() => handleActionClick('open_url', { url: parsedData.downloadUrl })} className="tw-flex tw-items-center tw-border-0 tw-gap-1 tw-px-3 tw-py-1 tw-bg-green-600 hover:tw-bg-green-700 tw-text-white tw-rounded tw-text-xs tw-font-medium"><Download size={14} /> Download</button>
            </div>
          )}
          
          {parsedData.promoCode && (
             <div className="tw-bg-[#222222]/70 tw-p-2.5 tw-rounded-md tw-mb-3 tw-text-xs">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mt-1">
                  <span className="tw-text-gray-400">Code:</span>
                  <span className="tw-font-mono tw-text-[#FFA600] tw-bg-[#1b1b1b] tw-px-1.5 tw-py-0.5 tw-rounded">{parsedData.promoCode}</span>
                  <button onClick={() => copyToClipboard(parsedData.promoCode)} className="tw-text-[#1572D3] tw-border-0 hover:tw-text-[#0e4e8c]"><Copy size={14} /></button>
                </div>
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
  const [activeFilter, setActiveFilter] = useState('all'); // Filter is less useful now, but we'll keep it
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchClientNotifications();
        setNotifications(data);
        setFilteredNotifications(data); 
      } catch (err) {
        setError(err.message || 'Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  useEffect(() => {
    if (activeFilter === 'unread') {
      setFilteredNotifications(notifications.filter(n => !n.isRead));
    } else {
      setFilteredNotifications(notifications);
    }
  }, [activeFilter, notifications]); 

  // CHANGED: Simplified action handler. It just opens a URL now.
  const handleNotificationAction = (notificationId, actionType, data) => {
    console.log(`Action: ${actionType} on notification ${notificationId}`, data);
    
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );

    if (actionType === 'open_url' && data.url) {
      window.open(data.url, '_blank');
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };
  
  // NOTE: 'Contracts' and 'Promotions' filters are removed as we can't reliably
  // determine the type without parsing every message, which is inefficient for filtering.
  const filters = [
    { id: 'all', label: 'All', icon: <ListFilter size={16} /> },
    { id: 'unread', label: 'Unread', icon: <Bell size={16} /> },
  ];

  const headerHeight = 70; 

  // --- RENDER LOGIC --- (No major changes here)
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
 
   if (error) { 
     return (
       <>
         <Header />
         <div className="tw-min-h-screen tw-bg-[#1b1b1b] tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-px-4" style={{ paddingTop: `${headerHeight}px` }}>
           <Bell className="tw-w-16 tw-h-16 tw-text-red-400 tw-mb-4" />
           <h2 className="tw-text-xl tw-font-semibold tw-text-red-400 tw-mb-2">Oops! Something went wrong.</h2>
           <p className="tw-text-gray-400 tw-mb-6">{error}</p>
           <button 
             onClick={() => window.location.reload()}
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
            <h1 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-center sm:tw-text-left tw-text-[#FFA600]">Notifications</h1>
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
        
        {filteredNotifications.length > 0 ? (
          <div className="tw-space-y-4">
            {filteredNotifications.map(notification => (
              <ClientNotificationItem key={notification.id} notification={notification} onAction={handleNotificationAction} />
            ))}
          </div>
        ) : (
          <div className="tw-text-center tw-py-10 tw-bg-[#2a2a2a] tw-rounded-lg">
              <Bell className="tw-mx-auto tw-w-12 tw-h-12 tw-text-gray-500 tw-mb-4" />
              <p className="tw-text-gray-400">
              {activeFilter === 'all' ? "You're all caught up!" : `No ${activeFilter} notifications found.`}
              </p>
          </div>
        )}
        <div className="tw-mt-10 tw-text-center tw-text-sm tw-text-gray-500">End of notifications.</div>
      </div>
    </div>
  );
}