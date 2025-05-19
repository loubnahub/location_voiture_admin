import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
// Import icons from react-icons (still a good choice)
import {
  LuLayoutDashboard, LuCar, LuListTree, LuSettings2, LuFileText, LuUsers,
  LuBriefcase, LuWarehouse, LuShieldCheck, LuWrench, LuDollarSign, 
} from 'react-icons/lu';
import { AlertTriangle ,LineChart} from 'lucide-react'; 
import './Sidebar.css'; // Custom CSS for theming

// Replace with your actual logo
const LogoPlaceholder = () => (
  <div className="sidebar-logo-container">
    LGO {/* Simple text logo for now */}
  </div>
);


const Sidebar = () => {
  const menuItems = [
    // ... (menuItems array remains the same as the Tailwind example) ...
    { name: 'DASHBOARD', icon: <LuLayoutDashboard size={18} />, path: '/admin/dashboard', group: null },
    {
      group: 'FLEET CATALOG',
      items: [
        { name: 'Vehicle Models', icon: <LuCar size={18} />, path: '/admin/fleet/vehicle-models' },
        { name: 'Vehicle Types', icon: <LuListTree size={18} />, path: '/admin/fleet/vehicle-types' },
        { name: 'Features', icon: <LuSettings2 size={18} />, path: '/admin/fleet/features' },
        { name: 'Extras', icon: <LuSettings2 size={18} />, path: '/admin/fleet/extras' },
        { name: 'Insurance Plans', icon: <LuShieldCheck size={18} />, path: '/admin/fleet/insurance-plans' },
      ],
    },
    {
      group: 'INVENTORY & OPERATIONS',
      items: [
        { name: 'Vehicles', icon: <LuWarehouse size={18} />, path: '/admin/inventory/vehicles' },
        { name: 'Bookings', icon: <LuFileText size={18} />, path: '/admin/inventory/bookings' },
        { name: 'Operational Holds', icon: <LuBriefcase size={18} />, path: '/admin/inventory/operational-holds' },
        { name: 'Maintenance Log', icon: <LuWrench size={18} />, path: '/admin/inventory/maintenance-log' },
        { name: 'Damage Reports', icon: <AlertTriangle size={18} />, path: '/admin/inventory/damage-reports' },
      ],
    },
    {
      group: 'CUSTOMER RELATIONS',
      items: [
        { name: 'Users', icon: <LuUsers size={18} />, path: '/admin/customers/users' },
        { name: 'Rental Agreements', icon: <LuFileText size={18} />, path: '/admin/customers/rental-agreements' },
      ],
    },
    {
        group: 'FINANCIALS',
        items: [
            { name: 'Payments', icon: <LuDollarSign size={18} />, path: '/admin/financials/payments' },
            { name: 'Reports', icon: <LineChart size={18} />, path: '/admin/financials/reports' },
        ]
    },
    {
        group: 'SYSTEM CONFIGURATION',
        items: [
            { name: 'User Roles', icon: <LuUsers size={18} />, path: '/admin/system/user-roles' },
        ]
    }
  ];

  return (
    <Nav className="col-md-3 col-lg-2 d-md-block sidebar_custom_bg text-white sidebar-sticky">
      <div className="sidebar-header-custom text-center py-4 mb-3">
        <LogoPlaceholder />
        <h1 className="sidebar-title-custom h5 mb-0 mt-2">LGO DRIVE</h1>
        <p className="sidebar-subtitle-custom small">Management System</p>
      </div>
      <div className="pt-3 sidebar-nav-custom">
        {menuItems.map((groupItem, index) => (
          <div key={index} className="mb-3">
            {groupItem.group ? (
              <>
                <h6 className="sidebar-heading-custom px-3 mt-2 mb-1 text-uppercase">
                  {groupItem.group}
                </h6>
                <Nav defaultActiveKey="/home" className="flex-column">
                  {groupItem.items.map((item) => (
                    <Nav.Item key={item.name}>
                      <Nav.Link
                        as={NavLink}
                        to={item.path}
                        className="sidebar-link-custom"
                      >
                        <span className="sidebar-icon-custom me-2">{item.icon}</span>
                        {item.name}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </>
            ) : (
              // Single item
              <Nav defaultActiveKey="/home" className="flex-column">
                <Nav.Item key={groupItem.name}>
                  <Nav.Link
                    as={NavLink}
                    to={groupItem.path}
                    className="sidebar-link-custom"
                  >
                    <span className="sidebar-icon-custom me-2">{groupItem.icon}</span>
                    {groupItem.name}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            )}
          </div>
        ))}
      </div>
    </Nav>
  );
};

export default Sidebar;