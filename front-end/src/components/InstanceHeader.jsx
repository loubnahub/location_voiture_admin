// InstanceHeader.jsx
import React, { useState } from 'react';
import { Dropdown, Badge, Image } from 'react-bootstrap';
import { LuListTree, LuChevronDown } from 'react-icons/lu';

const InstanceHeader = ({
  modelTitle,
  modelSubtitle,
  mainImageUrl,
  allInstancesForDropdown = [],
  activeInstanceId,
  onInstanceChange,
  // This prop is still received but won't be used on the toggle itself
}) => {
  const activeInstance = allInstancesForDropdown.find(inst => inst.id === activeInstanceId);
  const [showDropdown, setShowDropdown] = useState(false);

  let toggleText = "Select Instance";
  if (activeInstance) {
    toggleText = activeInstance.license_plate; // Only license plate for the toggle button
  }

  const selectableInstances = allInstancesForDropdown.filter(inst => inst.id !== activeInstanceId);

  const handleSelect = (instanceId) => {
    if (instanceId && instanceId !== activeInstanceId) { 
      onInstanceChange(instanceId);
    }
    setShowDropdown(false); 
  };

  return (
    <div className="mb-4 instance-header-section">
      <h1 className="instance-title">{modelTitle || 'Vehicle Details'}</h1>
      <p className="instance-subtitle">{modelSubtitle || 'Instance specific view'}</p>
      
      {selectableInstances.length > 0 && ( 
        <Dropdown 
          show={showDropdown}
          onToggle={(isOpen) => setShowDropdown(isOpen)}
          className="d-inline-block instance-switcher-dropdown"
        >
          <Dropdown.Toggle 
            variant="dark" 
            size="sm" 
            id="instance-switcher-btn" 
            className="instance-switcher-toggle px-4 py-1 rounded-2"
            onClick={() => setShowDropdown(!showDropdown)} 
          >
            <LuListTree size={16} className="toggle-icon me-1" />
            {toggleText}
  
          </Dropdown.Toggle>
          <Dropdown.Menu className="instance-switcher-menu">
            {selectableInstances.map(inst => {
              let badgeBg = 'secondary-subtle';
              let badgeText = 'dark';

              if (inst.status?.value === 'Available') {
                badgeBg = 'success-subtle';
                badgeText = 'success';
              } else if (inst.status?.value === 'In_Maintenance') { 
                badgeBg = 'warning-subtle';
                badgeText = 'warning-emphasis';
              } else if (inst.status?.value === 'Booked' || inst.status?.value === 'Rented') {
                badgeBg = 'primary-subtle';
                badgeText = 'primary';
              } else if (inst.status?.value === 'Damaged') {
                badgeBg = 'danger-subtle';
                badgeText = 'danger';
              } else if (inst.status?.value === 'Unavailable') {
                badgeBg = 'light';
                badgeText = 'dark';
              }
              
              return (
                <Dropdown.Item
                  key={inst.id}
                  onClick={() => handleSelect(inst.id)}
                  className="dropdown-instance-item d-flex align-items-center justify-content-between"
                >
                  <div className="item-main-info">
                    {/* License plate and VIN are shown INSIDE the dropdown items */}
                    <span className="item-license-plate">{inst.license_plate}</span>
                  </div>
                  
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      )}
      
      {mainImageUrl ? (
        <Image src={mainImageUrl} alt={modelTitle || 'Vehicle image'} fluid rounded className="mb-3  instance-main-image" />
      ) : (
        <div className="no-image-placeholder-maquette instance-main-image mb-3">
            No Image Available
        </div>
      )}
    </div>
  );
};

export default InstanceHeader;