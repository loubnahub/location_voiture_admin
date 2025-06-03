// AlertsVehicleHealthCard.jsx
import React from 'react';
import { Button, Card } from 'react-bootstrap'; // Using Card component
import { AlertTriangle, Edit as EditIcon } from 'lucide-react'; // Renamed Edit to EditIcon to avoid conflict
import { 
    LuWrench, LuMapPin, LuShieldCheck, LuBell, 
    LuTrash2, LuArrowRight // Added LuArrowRight
} from 'react-icons/lu';

// --- Alert Styles - Tailored to Figma ---
// Note: The 'border' property from your original style is not used as per Figma.
// The icon 'bg' is the main color indicator.
const alertTypeStyles = {
  damage:   { 
    iconBg: '#DC3545', // Figma Red (Bootstrap danger)
    iconColor: '#FFFFFF', 
    icon: <AlertTriangle size={20} />, 
    actionButtonBg: '#FFE5E5', // Light red for button bg
    actionButtonColor: '#DC3545', // Darker red for button icon/text
    defaultActionLabel: 'View Report' 
  },
  maintenance: { 
    iconBg: '#FFC107', // Figma Yellow (Bootstrap warning)
    iconColor: '#212529', // Dark text on yellow
    icon: <LuWrench size={20} />,
    actionButtonBg: '#FFF3CD', // Light yellow
    actionButtonColor: '#B58900', // Darker yellow/brown
    defaultActionLabel: 'View Log'
  },
  relocation:  { // Figma purple - using a generic purple, adjust as needed
    iconBg: '#6F42C1', // Bootstrap purple example
    iconColor: '#FFFFFF', 
    icon: <LuMapPin size={20} />,
    actionButtonBg: '#E9DFFF', // Light purple
    actionButtonColor: '#6F42C1',
    defaultActionLabel: 'View Details' 
  },
  cleaning:    { // Figma blue for cleaning
    iconBg: '#0D6EFD', // Bootstrap primary blue
    iconColor: '#FFFFFF', 
    icon: <LuShieldCheck size={20} />,
    actionButtonBg: '#CFE2FF', // Light blue
    actionButtonColor: '#0D6EFD',
    defaultActionLabel: 'View Hold'
  },
  default:     { 
    iconBg: '#ADB5BD', 
    iconColor: '#FFFFFF', 
    icon: <LuBell size={20} />,
    actionButtonBg: '#E9ECEF',
    actionButtonColor: '#495057',
    defaultActionLabel: 'View Info'
  },
};

const AlertsVehicleHealthCard = ({ alertsAndHealth }) => {
  const alerts = Array.isArray(alertsAndHealth) ? alertsAndHealth : [];

  const handleAlertAction = (item) => {
    alert(`Action for: ${item.title}\nDetails: ${item.details}`);
  };


  return (
    // Using Bootstrap Card component for base structure
    <Card className="alerts-vehicle-health-card h-100"> {/* h-100 for equal height if parent is d-flex */}
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Alerts & Vehicle Health</h5>
        
      </Card.Header>
      <Card.Body className={alerts.length > 0 ? "p-0" : "d-flex align-items-center justify-content-center"}>
        {alerts.length === 0 ? (
          <p className="text-muted mb-0">No active alerts or health items.</p>
        ) : (
          <ul className="list-group list-group-flush p-3"> {/* Added p-3 for spacing around list items */}
            {alerts.map((item, index) => {
              const style = alertTypeStyles[item.type] || alertTypeStyles.default;
              const actionLabel = item.action_label || style.defaultActionLabel;
              return (
                <li
                  key={item.id || index}
                  className="list-group-item alert-list-item" // Custom class for specific styling
                >
                  <div className="d-flex align-items-center">
                    <span className="alert-icon-wrapper" style={{ backgroundColor: style.iconBg, color: style.iconColor }}>
                      {style.icon}
                    </span>
                    <div className="alert-text-content">
                      <strong className="alert-title">{item.title}</strong>
                      <small className="alert-subtitle text-muted d-block">{item.details}</small>
                      {item.date && (
                        <small className="alert-date text-muted d-block">
                          {/* Using "Until" or "Due" based on Figma hints */}
                          {item.type === 'maintenance' ? 'Due: ' : 'Until: '} 
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          {item.time && ` ${item.time}`} {/* Assuming item.time might exist */}
                        </small>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="light" // Using variant="light" to then style background with CSS/inline
                    size="sm" 
                    className="alert-action-button"
                    onClick={() => handleAlertAction(item)}
                    style={{ 
                        backgroundColor: style.actionButtonBg, 
                        borderColor: style.actionButtonBg, // Or a slightly darker shade
                        color: style.actionButtonColor
                    }}
                  >
                    <span className="action-label">{actionLabel}</span>
                    <LuArrowRight size={16} className="ms-1 action-arrow" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card.Body>
      <style jsx>{`
        .alerts-vehicle-health-card {
          border-radius: 16px !important; /* Figma like */
          background-color:rgba(255, 255, 255, 0.61);
          border: none; /* Figma has no border on the main card, relies on shadow */
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05); /* Subtle shadow */
        }
        .alerts-vehicle-health-card .card-header {
          background-color: rgba(255, 255, 255, 0.61) !important; /* White header */
          border-bottom: 1px solid #F0F2F5; /* Light separator */
          padding: 1rem 1.5rem; /* Adjust padding */
          border-radius: 16px !important;

        }
        .alerts-vehicle-health-card .card-title {
          font-size: 1.125rem; /* Approx 18px */
          font-weight: 600; /* Semi-bold */
          color: #212529;
        }
        .header-action-button {
          font-size: 0.8rem;
          font-weight: 500;
          padding: 0.4rem 0.8rem !important;
          border-radius: 8px !important;
          display: inline-flex;
          align-items: center;
        }
        .header-action-button svg {
           margin-right: 0.3rem;
        }
        .delete-button {
          background-color: #FF5C5C !important; /* Figma red */
          border-color: #FF5C5C !important;
        }
        .edit-button {
          background-color: #4A90E2 !important; /* Figma blue */
          border-color: #4A90E2 !important;
        }

     
        .alerts-vehicle-health-card .list-group-flush {
            padding: 1rem 1.5rem; /* Spacing for the list items from card edge */
        }

        .alert-list-item {
          background-color:rgba(255, 255, 255, 0.61) !important; /* Each item is white */
          border: 1px solid #F0F2F5 !important; /* Very light border for each item */
          border-radius: 10px !important; /* Rounded corners for each item */
          padding: 0.75rem 1rem !important; /* Padding inside each item */
          margin-bottom: 0.75rem; /* Space between items */
          box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.04); /* Subtle shadow per item */
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .alert-list-item:last-child {
          margin-bottom: 0;
        }
        .alert-icon-wrapper {
          width: 40px; /* Figma icon circle size */
          height: 40px; /* Figma icon circle size */
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem; /* Space between icon and text */
        }
        .alert-text-content {
            /* flex-grow: 1; */ /* Allow text to take up space if needed */
        }
        .alert-title {
          font-size: 0.9rem; /* Approx 14-15px */
          font-weight: 600; /* Semi-bold */
          color: #343a40;
          margin-bottom: 0.1rem;
        }
        .alert-subtitle, .alert-date {
          font-size: 0.8rem; /* Approx 12-13px */
          color: #6c757d;
        }
        .alert-action-button {
          padding: 0.3rem 0.3rem !important; /* Tighter padding for the square button */
          border-radius: 6px !important; /* Rounded corners for the action button */
          width: 30px; /* Square button width */
          height: 30px; /* Square button height */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
        }
        .alert-action-button .action-label {
          display: none; /* Hide text label as per Figma, only show icon */
        }
        .alert-action-button .action-arrow {
          margin-left: 0 !important; /* No margin if label is hidden */
          font-size: 1rem; /* Adjust arrow size */
        }
      `}</style>
    </Card>
  );
};

export default AlertsVehicleHealthCard;