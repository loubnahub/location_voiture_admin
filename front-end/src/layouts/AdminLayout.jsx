import React from 'react';
import Sidebar from '../components/Sidebar'; // Your Sidebar component
import { Outlet } from 'react-router-dom';   // <<< IMPORT Outlet
import './AdminLayout.css';                // Styles for the layout

const AdminLayout = () => {
  return (
    <div className="d-flex admin-layout-wrapper"> {/* Main flex container */}
      <Sidebar />
      <main className="flex-grow-1 admin-content-area"> {/* Content area takes remaining space */}
        <Outlet /> {/* <<< NESTED ROUTES WILL RENDER HERE */}
      </main>
    </div>
  );
};

export default AdminLayout;