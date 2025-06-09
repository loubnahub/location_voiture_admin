// src/pages/VehicleListPage.jsx (or your chosen path)
import React, { useState, useEffect } from 'react';
import FiltersSidebar from '../Section/Filtre'; // Adjust path
import CarsGridDisplay from '../Section/Cars'; // IMPORT THE RENAMED COMPONENT
// No need for allCarsData or local Pagination if CarsGridDisplay handles it
import { SlidersHorizontal } from 'lucide-react';

const initialFilters = {
  search: '', location: '', categories: [], types: [], capacities: [],
  years: [], fuelTypes: [], transmissions: [], price: '1000', // Default max price
};

const VehicleListPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // This useEffect is now primarily for side effects of filter changes,
  // like closing the sidebar, as CarsGridDisplay will react to the filters prop.
  useEffect(() => {
    // console.log("Filters updated in VehicleListPage:", filters);
    // The CarsGridDisplay component will re-filter based on the 'filters' prop
    if (isSidebarOpen && window.innerWidth < 1024 && filters !== initialFilters) { // Close on apply if not reset
        // setIsSidebarOpen(false); // Sidebar can close itself on apply
    }
  }, [filters, isSidebarOpen]);

  const handleApplyFilters = () => {
    // The actual filtering now happens inside CarsGridDisplay because it receives 'filters' prop
    // This function primarily ensures the sidebar closes on mobile after applying.
    console.log("Apply Filters button clicked. Current filters:", filters);
    if (isSidebarOpen && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleResetFilters = () => {
    setFilters(initialFilters); // This will trigger re-render and pass new initialFilters to CarsGridDisplay
    if (isSidebarOpen && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const pageSpecificStyles = `
    /* ... Your existing styles ... */
  `;

  return (
    <>
      <style>{pageSpecificStyles}</style>
      <div className="flex bg-[#1b1b1b] min-h-screen text-white pt-10 md:pt-16 lg:pt-24 pb-10 -mt-64 lg:-mt-20"> {/* Your original top padding */}
        <div className={`fixed lg:sticky top-0 lg:top-auto h-full lg:h-auto z-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-[280px] sm:w-[320px] lg:w-96 flex-shrink-0 bg-[#1b1b1b] border-r border-gray-700 lg:border-none`}> {/* Added bg and border for consistency */}
          <FiltersSidebar 
              filters={filters} 
              setFilters={setFilters} 
              onApplyFilters={handleApplyFilters} 
              onResetFilters={handleResetFilters}
              toggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
          />
        </div>
        
        <div className="w-full p-3 sm:p-5 "> {/* Adjust ml based on sidebar width */}
          <main className="flex-1 flex flex-col "> 
            <div className="mb-6 flex justify-between items-center flex-shrink-0"> 
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-100">Vehicle Fleet</h1>
              <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white p-2 rounded-md border border-transparent hover:border-gray-600">
                <SlidersHorizontal size={20} />
                <span className="sr-only">Open Filters</span>
              </button>
            </div>

            {/* CarsGridDisplay now receives filters and handles fetching, filtering, and pagination */}
            <div className="flex-grow w-full">
                <CarsGridDisplay filters={filters} />
            </div>
            
          </main>
        </div>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={toggleSidebar}></div>
        )}
      </div>
    </>
  );
};

export default VehicleListPage;