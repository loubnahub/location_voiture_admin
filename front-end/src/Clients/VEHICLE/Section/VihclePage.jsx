// src/pages/Client/VehicleListPage.jsx

import React, { useState } from 'react';
// Make sure this path is correct for your project structure
import FiltersSidebar from './Filtre';
import CarsGridDisplay from './Cars';
import { SlidersHorizontal } from 'lucide-react';

const initialFilters = {
  search: '', location: '', categories: [], types: [], capacities: [],
  years: [], fuelTypes: [], transmissions: [], price: '1000',
};

const VehicleListPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleApplyFilters = () => {
    if (isSidebarOpen && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    if (isSidebarOpen && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Main container for the page */}
      <div className="tw-flex tw-bg-[#1b1b1b] tw-min-h-screen tw-text-white tw-pt-16 md:tw-pt-20 lg:tw-pt-24 tw-pb-10">

        {/* 
          CORRECTION: The FiltersSidebar component is placed directly here.
          The extra <div> with padding has been removed.
        */}
        <div className='md:tw-p-10'>
        <FiltersSidebar
          filters={filters}
          setFilters={setFilters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        </div>

        {/* Main Content Area */}
        <main className="tw-flex-grow tw-p-3 sm:tw-p-5 lg:tw-px-8 tw-flex tw-flex-col">
          <div className="tw-mb-6 tw-flex tw-justify-between tw-items-center tw-flex-shrink-0">
            <h1 className="tw-text-2xl sm:tw-text-3xl lg:tw-text-4xl tw-font-semibold tw-text-gray-100">Vehicle Fleet</h1>
            
            <button
              onClick={toggleSidebar}
              className="lg:tw-hidden tw-text-gray-300 hover:tw-text-white tw-p-2 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-amber-500 focus:tw-ring-offset-2 focus:tw-ring-offset-[#1b1b1b]"
              aria-label="Open filters menu"
              aria-expanded={isSidebarOpen}
            >
              <SlidersHorizontal size={20} />
              <span className="tw-sr-only">Open Filters</span>
            </button>
          </div>

          <div className="tw-flex-grow tw-w-full">
            <CarsGridDisplay filters={filters} />
          </div>
        </main>
      </div>
    </>
  );
};

export default VehicleListPage;