// src/components/vehicle/AlertsVehicleHealthCard.jsx

import React, { useState } from 'react'; // Import useState
import { Button, Card } from 'react-bootstrap';
import { AlertTriangle, Edit as EditIcon } from 'lucide-react';
import { 
    LuWrench, LuMapPin, LuShieldCheck, LuBell, LuArrowRight 
} from 'react-icons/lu';
import 'bootstrap/dist/css/bootstrap.min.css';

// Centralized styles for different alert types (no changes here)
const alertTypeStyles = {
  damage:   { 
    iconBg: '#DC3545',
    iconColor: '#FFFFFF', 
    icon: <AlertTriangle size={20} />, 
    actionButtonBg: '#FFE5E5',
    actionButtonColor: '#DC3545',
    defaultActionLabel: 'View Report' 
  },
  maintenance: { 
    iconBg: '#FFC107',
    iconColor: '#212529',
    icon: <LuWrench size={20} />,
    actionButtonBg: '#FFF3CD',
    actionButtonColor: '#B58900',
    defaultActionLabel: 'View Log'
  },
  relocation:  {
    iconBg: '#6F42C1',
    iconColor: '#FFFFFF', 
    icon: <LuMapPin size={20} />,
    actionButtonBg: '#E9DFFF',
    actionButtonColor: '#6F42C1',
    defaultActionLabel: 'View Details' 
  },
  cleaning:    {
    iconBg: '#0D6EFD',
    iconColor: '#FFFFFF', 
    icon: <LuShieldCheck size={20} />,
    actionButtonBg: '#CFE2FF',
    actionButtonColor: '#0D6EFD',
    defaultActionLabel: 'View Hold'
  },
  inspection:  {
    iconBg: '#6F42C1',
    iconColor: '#FFFFFF', 
    icon: <LuShieldCheck size={20} />,
    actionButtonBg: '#E9DFFF',
    actionButtonColor: '#6F42C1',
    defaultActionLabel: 'View Details' 
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

const AlertsVehicleHealthCard = ({ alertsAndHealth, onAlertClick }) => {
  // --- NEW: State to control visibility ---
  const [showAll, setShowAll] = useState(false);

  const allAlerts = Array.isArray(alertsAndHealth) ? alertsAndHealth : [];

  // --- NEW: Determine which alerts to display ---
  const alertsToDisplay = showAll ? allAlerts : allAlerts.slice(0, 3);

  const handleAlertAction = (e, item) => {
    e.stopPropagation();
    if (onAlertClick) {
      onAlertClick(item);
    } else {
      console.log(`Action for: ${item.title}\nDetails: ${item.details}`);
    }
  };

  return (
    <Card className="alerts-vehicle-health-card h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Alerts & Vehicle Health</h5>
        
        {/* --- NEW: "View All" button --- */}
        {allAlerts.length > 3 && (
          <Button 
            variant="link" 
            className="p-0 view-all-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `View All (${allAlerts.length})`}
          </Button>
        )}
      </Card.Header>
      <Card.Body className={alertsToDisplay.length > 0 ? "p-0" : "d-flex align-items-center justify-content-center"}>
        {alertsToDisplay.length === 0 ? (
          <p className="text-muted mb-0">No active alerts or health items.</p>
        ) : (
          <ul className="list-group list-group-flush p-3">
            {/* --- MODIFIED: Use alertsToDisplay instead of alerts --- */}
            {alertsToDisplay.map((item, index) => {
              const style = alertTypeStyles[item.type] || alertTypeStyles.default;
              const actionLabel = item.action_label || style.defaultActionLabel;
              return (
                <li
                  key={item.id || index}
                  className="list-group-item alert-list-item"
                  onClick={(e) => handleAlertAction(e, item)} 
                  style={{cursor: 'pointer'}}
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
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </small>
                      )}
                    </div>
                  </div>
                  {/* <Button 
                    variant="light"
                    size="sm" 
                    className="alert-action-button"
                    onClick={(e) => handleAlertAction(e, item)}
                    style={{ 
                        backgroundColor: style.actionButtonBg, 
                        borderColor: style.actionButtonBg,
                        color: style.actionButtonColor
                    }}
                  >
                    <span className="action-label">{actionLabel}</span>
                    <LuArrowRight size={16} className="ms-1 action-arrow" />
                  </Button> */}
                </li>
              );
            })}
          </ul>
        )}
      </Card.Body>
      {/* --- This is your exact original style block, with one addition for the new button --- */}
      <style jsx>{`
        .alerts-vehicle-health-card {
          border-radius: 16px !important;
          background-color:rgba(255, 255, 255, 0.61);
          border: none;
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
        }
        .alerts-vehicle-health-card .card-header {
          background-color: rgba(255, 255, 255, 0.61) !important;
          border-bottom: 1px solid #F0F2F5;
          padding: 1rem 1.5rem;
          border-radius: 16px !important;
        }
        .alerts-vehicle-health-card .card-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #212529;
        }

        /* --- NEW STYLE FOR "VIEW ALL" BUTTON --- */
        .view-all-btn {
            font-size: 0.85rem;
            font-weight: 600;
            color: #0D6EFD; /* Primary blue color */
            text-decoration: none;
        }
        .view-all-btn:hover {
            text-decoration: underline;
        }
        /* --- END NEW STYLE --- */

        .alerts-vehicle-health-card .list-group-flush {
            padding: 1rem 1.5rem;
        }

        .alert-list-item {
          background-color:rgba(255, 255, 255, 0.61) !important;
          border: 1px solid #F0F2F5 !important;
          border-radius: 10px !important;
          padding: 0.75rem 1rem !important;
          margin-bottom: 0.75rem;
          box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.04);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .alert-list-item:last-child {
          margin-bottom: 0;
        }
        .alert-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
        }
        .alert-text-content {
            /* flex-grow: 1; */
        }
        .alert-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #343a40;
          margin-bottom: 0.1rem;
        }
        .alert-subtitle, .alert-date {
          font-size: 0.8rem;
          color: #6c757d;
        }
        .alert-action-button {
          padding: 0.3rem 0.3rem !important;
          border-radius: 6px !important;
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
        }
        .alert-action-button .action-label {
          display: none;
        }
        .alert-action-button .action-arrow {
          margin-left: 0 !important;
          font-size: 1rem;
        }
      `}</style>
    </Card>
  );
};

export default AlertsVehicleHealthCard;