// src/pages/Client/VehicleListPage.jsx (Assuming this is the client-facing page)
import React, { useState, useEffect } from 'react';
import FiltersSidebar from './Filtre'; // Adjusted path assuming FiltersSidebar is in components/Section
import CarsGridDisplay from './Cars';   // Adjusted path assuming CarsGridDisplay is in components/Section
import { SlidersHorizontal } from 'lucide-react';

const initialFilters = {
  search: '', location: '', categories: [], types: [], capacities: [],
  years: [], fuelTypes: [], transmissions: [], price: '1000', // Default max price
};

const VehicleListPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // This useEffect is primarily for side effects of filter changes,
  // like closing the sidebar if it was a mobile apply.
  // CarsGridDisplay will react to the 'filters' prop for re-fetching/re-filtering.
  useEffect(() => {
    // console.log("Filters updated in VehicleListPage:", filters);
    if (isSidebarOpen && window.innerWidth < 1024 && filters !== initialFilters) {
      // Consider if sidebar should close automatically on filter change on mobile.
      // If FiltersSidebar has an "Apply" button, that button's handler can close it.
      // setIsSidebarOpen(false); // This might be too aggressive if filters change rapidly (e.g., typing in search)
    }
  }, [filters, isSidebarOpen]);

  const handleApplyFilters = () => {
    // console.log("Apply Filters button clicked in VehicleListPage. Current filters:", filters);
    // The actual filtering logic is now encapsulated within CarsGridDisplay,
    // which receives the 'filters' prop and re-renders accordingly.
    // This function in VehicleListPage is mainly for closing the sidebar on mobile.
    if (isSidebarOpen && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleResetFilters = () => {
    setFilters(initialFilters); // This will trigger CarsGridDisplay to re-fetch/re-filter with initial settings.
    if (isSidebarOpen && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Using tw- prefix consistently
  return (
    <>
      {/* Main container for the page */}
      <div className="tw-flex tw-bg-[#1b1b1b] tw-min-h-screen tw-text-white tw-pt-16 md:tw-pt-20 lg:tw-pt-24 tw-pb-10">

        {/* Sidebar Area */}
        {/*
          On large screens (lg+), FiltersSidebar itself should use `lg:tw-sticky lg:tw-top-X`
          to remain visible and scroll independently if its content is long.
          The parent div here just needs to allocate space for it.
          The `transform` and `transition` classes are for the mobile fly-in effect.
        */}
       
          <FiltersSidebar
              filters={filters}
              setFilters={setFilters}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
              // toggleSidebar={toggleSidebar} // FiltersSidebar can handle its own close on mobile
              // isSidebarOpen={isSidebarOpen} // FiltersSidebar can manage this internally for its close button
          />
       

        {/* Main Content Area */}
        <div className="tw-flex-grow tw-p-3 sm:tw-p-5 lg:tw-pl-0"> {/* lg:pl-0 because sidebar is sticky and takes its own space */}
          <main className="tw-flex-1 tw-flex tw-flex-col">
            <div className="tw-mb-6 tw-flex tw-justify-between tw-items-center tw-flex-shrink-0">
              <h1 className="tw-text-2xl sm:tw-text-3xl lg:tw-text-4xl tw-font-semibold tw-text-gray-100">Vehicle Fleet</h1>
              <button
                onClick={toggleSidebar}
                className="lg:tw-hidden tw-text-gray-300 hover:tw-text-white tw-p-2 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-amber-500 focus:tw-ring-offset-2 focus:tw-ring-offset-[#1b1b1b]" // Consistent focus style
                aria-label="Open filters menu"
                aria-expanded={isSidebarOpen}
              >
                <SlidersHorizontal size={20} />
                <span className="tw-sr-only">Open Filters</span>
              </button>
            </div>

            <div className="tw-flex-grow tw-w-full">
                {/* CarsGridDisplay receives filters and handles its own data fetching and pagination */}
                <CarsGridDisplay filters={filters} />
            </div>
          </main>
        </div>

        {/* Overlay for mobile sidebar when open */}
        {isSidebarOpen && window.innerWidth < 1024 && (
          <div
            className="tw-fixed tw-inset-0 tw-z-30 tw-bg-black/60 lg:tw-hidden" // z-30, below sidebar (z-40)
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
        )}
      </div>
    </>
  );
};

export default VehicleListPage;