import React from 'react';
import './SpecItemCard.css'; // We'll create this CSS file

const SpecItemCard = ({ icon, label, value }) => {
  if (value === undefined || value === null || value === '') {
    return null; // Don't render if there's no value
  }

  return (
    <div className="spec-item-figma"> {/* Matches class from VehicleModelDetailPage.css */}
      <div className="spec-item-icon-wrapper-figma">{icon}</div>
      <div className="spec-item-text-content">
        <div className="spec-label-figma">{label}</div>
        <div className="spec-value-figma">{value}</div>
      </div>
    </div>
  );
};

export default SpecItemCard;