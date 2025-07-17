import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Clients/Header/Nav'; // Your public-facing Header
import '../Clients/clients.css'
import Footer from '../Clients/Home/Section/Footer';
const ClientLayout = () => {
  return (
    // This main div is important for pages with dark backgrounds
    <div className="tw-bg-[#1B1B1B]"> 
      <Header />
      <main>
        {/* The Outlet will render the specific page component (Home, About, etc.) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;