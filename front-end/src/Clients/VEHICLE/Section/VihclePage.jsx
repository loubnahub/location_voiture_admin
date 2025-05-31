import React, { useState, useEffect } from 'react';
import FiltersSidebar from './Filtre'; 
import CarCard from './Cars';        
import allCarsData from './Cars/CarsCardFiltre'; 
import Pagination from './Pagination';
import { SlidersHorizontal } from 'lucide-react';

const initialFilters = {
  search: '', location: '', categories: [], types: [], capacities: [],
  years: [], fuelTypes: [], transmissions: [], price: '1000',
};


const VehicleListPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilteredCars, setActiveFilteredCars] = useState(allCarsData); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [carsPerPage] = useState(18); 

  useEffect(() => {
    
    applyFiltersInternal(); 
 
  }, [filters]); 

  const applyFiltersInternal = () => { 
    let cars = [...allCarsData];

    if (filters.search) cars = cars.filter(car => car.name.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.location) cars = cars.filter(car => car.location === filters.location);
    if (filters.categories.length > 0) cars = cars.filter(car => filters.categories.includes(car.category));
    if (filters.types.length > 0) cars = cars.filter(car => filters.types.includes(car.type));
    if (filters.capacities.length > 0) {
        cars = cars.filter(car => {
            const carSeats = car.seats;
            return filters.capacities.some(capRange => {
                if (capRange === '+2') return carSeats >= 1 && carSeats <= 2;
                if (capRange === '+4') return carSeats >= 1 && carSeats <= 4;
                if (capRange === '+8') return carSeats >= 1 && carSeats <= 8;
                if (capRange === '+12') return carSeats >= 1 && carSeats <= 8;
       
                return false;
            });
        });
    }
    if (filters.years.length > 0) cars = cars.filter(car => filters.years.includes(car.makeYear));
    if (filters.fuelTypes.length > 0) cars = cars.filter(car => filters.fuelTypes.includes(car.fuelType));
    if (filters.transmissions.length > 0) cars = cars.filter(car => filters.transmissions.includes(car.transmission));
    cars = cars.filter(car => car.price <= parseInt(filters.price));

    setActiveFilteredCars(cars);
    setCurrentPage(1); 
    if (isSidebarOpen && window.innerWidth < 1024) setIsSidebarOpen(false); 
  };
  const resetFilters = () => {
    setFilters(initialFilters);
    setActiveFilteredCars(allCarsData); 
    setCurrentPage(1);
    if (isSidebarOpen && window.innerWidth < 1024) setIsSidebarOpen(false);
  };
//   const resetFilters = () => {
//     setFilters(initialFilters);
//     // setActiveFilteredCars(allCarsData); // This will be handled by the useEffect above
//     setCurrentPage(1);
//     if (isSidebarOpen && window.innerWidth < 1024) setIsSidebarOpen(false);
//   };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Get current cars for pagination
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCarsToDisplay = activeFilteredCars.slice(indexOfFirstCar, indexOfLastCar);

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(activeFilteredCars.length / carsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const pageSpecificStyles = `
    .range-slider-track { /* ... same as before ... */ }
    .range-slider-track::-webkit-slider-thumb { /* ... same as before ... */ }
    .range-slider-track::-moz-range-thumb { /* ... same-as-before ... */ }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #3D3D47; border-radius: 3px;}
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #5A5A66; border-radius: 3px;}
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FFA500; }
    .custom-scrollbar-filter-section::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar-filter-section::-webkit-scrollbar-track { background: #D1D5DB; border-radius: 1.5px; }
    .custom-scrollbar-filter-section::-webkit-scrollbar-thumb { background: #FFA500; border-radius: 1.5px; }
    .custom-scrollbar-filter-section::-webkit-scrollbar-thumb:hover { background: #F97316; }
    .custom-scrollbar-filter-section { scrollbar-width: thin; scrollbar-color: #FFA500 #D1D5DB; }
  `;


  return (
    <>
      <style>{pageSpecificStyles}</style>
      <div className="flex bg-[#1b1b1b] min-h-screen text-white pt-10 md:pt-16 lg:pt-24 pb-10 -mt-64 lg:-mt-20">
     <div className='w-0 lg:w-80 '>
     <FiltersSidebar 
              filters={filters} 
              setFilters={setFilters} 
              onApplyFilters={applyFiltersInternal} 
              onResetFilters={resetFilters}
              toggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
          />
     </div>
        <div className="w-full p-5">
          <main className="flex-1  sm:p-6 lg:p-8 flex flex-col "> 
            <div className="mb-6 flex justify-between items-center flex-shrink-0"> 
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-100">Vehicle Fleet</h1>
              <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white p-2 rounded-md border border-transparent hover:border-gray-600">
                <SlidersHorizontal size={20} />
                <span className="sr-only">Open Filters</span>
              </button>
            </div>

            {currentCarsToDisplay.length > 0 ? (
              <div className="flex-grow"> 
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                  {currentCarsToDisplay.map(car => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 flex-grow flex flex-col justify-center items-center"> 
                <p className="text-xl text-gray-400">No cars match your current filters.</p>
                <button onClick={resetFilters} className="mt-4 bg-[#FFA500] text-black font-semibold py-2 px-6 rounded-md hover:bg-opacity-90 transition-opacity text-sm">
                  Reset All Filters
                </button>
              </div>
            )}
            {/* Pagination  */}
            {activeFilteredCars.length > carsPerPage && (
                <div className="mt-auto pt-8 flex-shrink-0"> 
                    <Pagination
                        carsPerPage={carsPerPage}
                        totalCars={activeFilteredCars.length}
                        paginate={paginate}
                        currentPage={currentPage}
                        nextPage={nextPage}
                        prevPage={prevPage}
                    />
                </div>
            )}
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