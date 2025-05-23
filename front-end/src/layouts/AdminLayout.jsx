import React from 'react';
import Sidebar from '../components/Sidebar';   // Adjust path if needed
import Header from '../components/Header';     // Adjust path if needed
import { Outlet } from 'react-router-dom';
import './AdminLayout.css'; // Your existing styles for the layout

const AdminLayout = () => {
  return (
    <div className="d-flex admin-layout-wrapper" style={{ minHeight: '100vh' }}>
      {/* Sidebar takes its own vertical space on the left */}
      <Sidebar />

      {/* This div will contain the Header and the Main Content (Outlet) stacked vertically */}
      {/* It will take the remaining horizontal space next to the Sidebar */}
      <div className="flex-grow-1 d-flex flex-column admin-main-panel">
        <Header /> {/* Header is now inside this column, above the Outlet */}

        <main className="flex-grow-1 admin-content-area p-3">
          {/* Main content area takes remaining vertical space within this panel */}
          <Outlet /> {/* Nested admin routes will render here */}
        </main>

        {/* Optional Footer could go here, within this panel */}
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default AdminLayout;