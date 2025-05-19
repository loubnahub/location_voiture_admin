import React from 'react';
import { LuChevronDown, LuSettings2 } from 'react-icons/lu'; // Assuming LuSettings2 for extras
import './ExtraList.css';

const ExtraList = ({ extras }) => {
  if (!extras || extras.length === 0) {
    return <p className="no-items-text">No optional extras available for this model.</p>;
  }

  return (
    <div className="extra-list-container">
      {extras.map((extra) => (
        <div key={extra.id} className="extra-item-figma">
          <div className="extra-item-main-content">
            <LuSettings2 size={16} className="extra-icon-figma" />
            <div className="extra-item-text">
              <span className="extra-name-figma">{extra.name}</span>
              {/* Optional: Show description if design allows or on expand */}
              {/* {extra.description && <small className="extra-description-figma">{extra.description}</small>} */}
            </div>
          </div>
          <div className="extra-item-details">
            <span className="extra-price-figma">
              Default price per day: <strong>${extra.default_price_per_day.toFixed(2)}</strong>
            </span>
            {/* Simple expand icon - no accordion logic for now */}
            <LuChevronDown className="extra-expand-icon-figma" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExtraList;