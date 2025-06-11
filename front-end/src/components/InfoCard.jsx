import React from 'react';
import './InfoCard.css'; // We'll create this
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first

const InfoCard = ({ title, titleIcon, children, className, titleRightContent }) => {
  return (
    <div className={`figma-card ${className || ''}`}> {/* Base figma-card style + any additional classes */}
      {title && (
        <div className="info-card-header">
          <h5 className="card-section-title-figma">
            {titleIcon && <span className="card-title-icon">{titleIcon}</span>}
            {title}
          </h5>
          {titleRightContent && <div className="info-card-title-right">{titleRightContent}</div>}
        </div>
      )}
      <div className="info-card-body">
        {children}
      </div>
    </div>
  );
};

export default InfoCard;