import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
// Import icons from react-icons (still a good choice)
import {
  LuLayoutDashboard, LuCar, LuListTree, LuSettings2, LuFileText, LuUsers,
  LuBriefcase, LuWarehouse, LuShieldCheck, LuWrench, LuDollarSign,
  LuMegaphone, LuTicket ,
  LuMail, LuMessageSquare, 
} from 'react-icons/lu';
import { AlertTriangle ,LineChart} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should be first
import './Sidebar.css'; // Caustom CSS for theming

// Replace with your actual logo
const LogoPlaceholder = () => (
  <div className="sidebar-logo-container">
    LGO {/* Simple text logo for now */}
  </div>
);


const Sidebar = () => {
  const menuItems = [
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
        { name: 'Operational Holds', icon: <LuBriefcase size={18} />, path: 'operations/operational-holds' },
        { name: 'Damage Reports', icon: <AlertTriangle size={18} />, path: 'operations/damage-reports' },
      ],
    },
     {
      group: 'CUSTOMER RELATIONS',
      items: [
        { name: 'Users', icon: <LuUsers size={18} />, path: 'users/customers' },
        { name: 'Rental Agreements', icon: <LuFileText size={18} />, path: 'operations/rental-agreements' },
        { name: 'Reviews', icon: <LuMessageSquare size={18} />, path: 'customer-relations/reviews' },
        { name: 'Contact Messages', icon: <LuMail size={18} />, path: 'customer-relations/contact-messages' },
      ],
    },
    // --- NEW GROUP FOR PROMOTIONS ---
    {
        group: 'MARKETING & PROMOTIONS',
        items: [
            { name: 'Promotion Campaigns', icon: <LuMegaphone size={18} />, path: 'marketing/promotion-campaigns' },
            { name: 'Promotion Codes', icon: <LuTicket size={18} />, path: 'marketing/promotion-codes' },
        ]
    },
   
  ];

  return (
    <Nav className="col-md-3 col-lg-2 d-md-block sidebar_custom_bg text-white sidebar-sticky">
      <div className="sidebar-header-custom text-center py-4 mb-3">
      <div className='d-flex justify-content-center flex-column align-items-center'> <img  src='/images/Logo/Logobe.png' width={170}/><span className='text-light-secondary'>Management System</span></div>
      </div>
      <div className="pt-3 sidebar-nav-custom">
        {menuItems.map((groupItem, index) => (
          <div key={index} className="mb-3">
            {groupItem.group ? (
              <>
                <h6 className="sidebar-heading-custom px-3 mt-2 mb-1 text-uppercase">
                  {groupItem.group}
                </h6>
                <Nav defaultActiveKey="/home" className="flex-column"> {/* Consider removing defaultActiveKey from group loops for better NavLink active state handling */}
                  {groupItem.items.map((item) => (
                    <Nav.Item key={item.name}>
                      <Nav.Link
                        as={NavLink}
                        to={item.path}
                        className="sidebar-link-custom" // NavLink will automatically get 'active' class
                      >
                        <span className="sidebar-icon-custom me-2">{item.icon}</span>
                        {item.name}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </>
            ) : (
              // Single item (like Dashboard)
              <Nav defaultActiveKey="/home" className="flex-column"> {/* Same consideration for defaultActiveKey */}
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