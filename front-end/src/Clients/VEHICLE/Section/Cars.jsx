// src/components/CarsGridDisplay.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Settings2, ShoppingBag, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { fetchAllVehicleModels } from '../../../services/api'; // Adjust path as needed
import Pagination from './Pagination'; // Assuming you have this component

const MAX_CARDS_PER_PAGE = 18; 
const DEFAULT_GRID_IMAGE = '/images/Cars/placeholder-car.png'; // Your defined fallback image

const CarsGridDisplay = ({ filters }) => {
  const [allFetchedVehicles, setAllFetchedVehicles] = useState([]);
  const [filteredAndPaginatedVehicles, setFilteredAndPaginatedVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);

  useEffect(() => {
    const loadAllVehicles = async () => {
      setLoading(true);
      setError(null);
      setAllFetchedVehicles([]);
      // setCurrentPage(1); // Resetting here might be too eager if filters change later
      try {
        const response = await fetchAllVehicleModels({ /* per_page: 'all' or similar if needed */ });
        let vehiclesData = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
            vehiclesData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            vehiclesData = response.data;
        } else if (response && Array.isArray(response)) {
            vehiclesData = response;
        } else {
            console.error("CarsGridDisplay: Vehicles data is not in a recognized array format.", response);
            throw new Error("Vehicles data format is invalid.");
        }
        const validVehicles = vehiclesData.filter(v => v && typeof v.id !== 'undefined');
        setAllFetchedVehicles(validVehicles);
      } catch (err) {
        console.error("CarsGridDisplay: Error fetching vehicles:", err);
        setError(err.message || 'Failed to load vehicles.');
        setAllFetchedVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    loadAllVehicles();
  }, []);

  useEffect(() => {
    if (loading) return; 

    let carsToFilter = [...allFetchedVehicles];

    // Search filter (uses 'title' from your API response for vehicle models)
    if (filters.search) {
        carsToFilter = carsToFilter.filter(car => 
            (car.title?.toLowerCase().includes(filters.search.toLowerCase())) || // API gives 'title'
            (car.brand?.toLowerCase().includes(filters.search.toLowerCase())) ||
            (car.model?.toLowerCase().includes(filters.search.toLowerCase())) // API gives 'model'
        );
    }
    // Category filter (uses 'vehicle_type_id' from your API response)
    if (filters.categories && filters.categories.length > 0) {
        carsToFilter = carsToFilter.filter(car => 
            filters.categories.map(String).includes(String(car.vehicle_type_id))
        );
    }
    // Location filter (ensure 'location' is part of your API response for vehicle models)
    if (filters.location && carsToFilter.some(c => typeof c.location === 'string')) {
        carsToFilter = carsToFilter.filter(car => car.location?.toLowerCase().includes(filters.location.toLowerCase()));
    }
    // Capacities filter (uses 'number_of_seats' from your API response)
    if (filters.capacities && filters.capacities.length > 0 && carsToFilter.some(c => typeof c.number_of_seats !== 'undefined')) {
        carsToFilter = carsToFilter.filter(car => {
            const carSeats = parseInt(car.number_of_seats, 10);
            return filters.capacities.some(capRange => {
                if (capRange === '+2') return carSeats >= 1 && carSeats <= 2;
                if (capRange === '+4') return carSeats >= 1 && carSeats <= 4;
                if (capRange === '+8') return carSeats >= 1 && carSeats <= 8;
                if (capRange === '+12') return carSeats >= 9; // Corrected logic
                return false;
            });
        });
    }
    // Years filter (uses 'year' from your API response)
    if (filters.years && filters.years.length > 0 && carsToFilter.some(c => typeof c.year !== 'undefined')) {
        carsToFilter = carsToFilter.filter(car => filters.years.includes(String(car.year)));
    }
    // Fuel types filter (uses 'fuel_type' from your API response)
    if (filters.fuelTypes && filters.fuelTypes.length > 0 && carsToFilter.some(c => typeof c.fuel_type === 'string')) {
        carsToFilter = carsToFilter.filter(car => filters.fuelTypes.includes(car.fuel_type));
    }
    // Transmissions filter (uses 'transmission' from your API response)
    if (filters.transmissions && filters.transmissions.length > 0 && carsToFilter.some(c => typeof c.transmission === 'string')) {
        carsToFilter = carsToFilter.filter(car => filters.transmissions.includes(car.transmission));
    }
    // Price filter (uses 'base_price_per_day' from your API response)
    if (filters.price && carsToFilter.some(c => typeof c.base_price_per_day !== 'undefined') ) {
        carsToFilter = carsToFilter.filter(car => parseFloat(car.base_price_per_day) <= parseFloat(filters.price));
    }

    setTotalFilteredCount(carsToFilter.length);

    let newCurrentPage = currentPage;
    const totalPages = Math.ceil(carsToFilter.length / MAX_CARDS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
        newCurrentPage = 1;
    } else if (totalPages === 0 && carsToFilter.length === 0){
        newCurrentPage = 1;
    }
    if (newCurrentPage !== currentPage) {
        setCurrentPage(newCurrentPage);
    }
    
    const indexOfLastCar = newCurrentPage * MAX_CARDS_PER_PAGE;
    const indexOfFirstCar = indexOfLastCar - MAX_CARDS_PER_PAGE;
    setFilteredAndPaginatedVehicles(carsToFilter.slice(indexOfFirstCar, indexOfLastCar));

  }, [allFetchedVehicles, filters, currentPage, loading]);


  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(totalFilteredCount / MAX_CARDS_PER_PAGE)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) { 
    return (
      <div className="w-full text-center py-20 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 size={40} className="animate-spin text-amber-500 mb-3" />
        <p className="text-neutral-300 text-lg">Loading vehicles...</p>
      </div>
    );
  }
  if (error) { 
    return (
      <div className="w-full text-center py-20 bg-[#1F1F1F] rounded-xl p-5 border border-red-600/50 flex flex-col items-center justify-center min-h-[300px]">
        <AlertTriangle size={40} className="text-red-500 mb-3"/>
        <p className="font-semibold text-lg text-red-400">An Error Occurred</p>
        <p className="text-sm text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-6 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition-colors font-semibold">Retry</button>
      </div>
    );
  }
  if (filteredAndPaginatedVehicles.length === 0) { 
    return (
      <div className="w-full text-center py-20 min-h-[300px] flex items-center justify-center">
        <p className="text-neutral-400 text-lg">
          {totalFilteredCount === 0 && allFetchedVehicles.length > 0 
            ? "No vehicles match your current filters." 
            : "No vehicles available at the moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Your existing grid structure - design unchanged */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"> 
        {filteredAndPaginatedVehicles.map((vehicle) => {
          // 'vehicle' is a vehicle model object from your API
          const vehicleFullName = vehicle.title || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Vehicle Name';
          const displayPrice = vehicle.base_price_per_day;
          
          
          const imageUrl = vehicle.thumbnail_url || DEFAULT_GRID_IMAGE;

          return (
            // Your existing card structure - design unchanged
            <div
              key={vehicle.id} // vehicle.id is vehicle_model_id
              className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl group bg-[#1B1B1B] border border-transparent hover:border-neutral-700 aspect-[4/5] transition-all duration-300"
            >
              <img
                src={imageUrl} // <<<< USE THE CORRECT IMAGE URL HERE
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                alt={vehicleFullName}
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_GRID_IMAGE; }}
              />
              <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-3.5 pt-12 pb-3 sm:pb-3.5 bg-gradient-to-t from-black/90 via-black/75 to-transparent rounded-b-xl sm:rounded-b-2xl">
                <div className="flex items-end justify-start w-full gap-x-2.5 sm:gap-x-3.5">
                  <Link
                    to={`/fleet/details/${vehicle.id}`} // Uses vehicle_model_id
                    className="group/pricebtn flex-shrink-0"
                    aria-label={`View details for ${vehicleFullName}`}
                  >
                    <div role="button" tabIndex={0} className="bg-zinc-900/80 border-[1.5px] sm:border-2 border-[#FFA500] w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-full flex flex-col items-center justify-center text-center shadow-lg relative z-10 overflow-hidden transition-all duration-300 hover:bg-[#FFA500]/10 cursor-pointer">
                      <div className="transition-all duration-300 group-hover/pricebtn:translate-x-[-35px] sm:group-hover/pricebtn:translate-x-[-45px] group-hover/pricebtn:opacity-0">
                        <span className="font-bold text-[#FFA500] text-xs sm:text-sm leading-none">
                          ${displayPrice != null && !isNaN(Number(displayPrice)) ? Math.floor(Number(displayPrice)) : 'N/A'}
                        </span>
                        <span className="text-[#FFA500] text-[7px] sm:text-[8px] uppercase leading-none pt-0.5">/DAY</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 transform translate-x-7 sm:translate-x-9 group-hover/pricebtn:opacity-100 group-hover/pricebtn:translate-x-0">
                        <ArrowRight size={18} className="text-[#FFA500]" strokeWidth={2.5} />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-[#FFA500] opacity-0 scale-90 transition-all duration-300 group-hover/pricebtn:opacity-100 group-hover/pricebtn:scale-110 -z-10"></div>
                    </div>
                  </Link>
                  <div className='space-y-0.5 flex-grow min-w-0'>
                    <h3 className="text-white w-full font-semibold text-sm sm:text-base md:text-lg truncate" title={vehicleFullName}>{vehicleFullName}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#A0A0A0] text-[10px] sm:text-[11px] min-w-0">
                      <span className="flex items-center whitespace-nowrap"><Users size={14} className="mr-1 text-[#FFA500]" strokeWidth={2} />{vehicle.number_of_seats ?? 'N/A'}</span>
                      <span className="flex items-center whitespace-nowrap"><Settings2 size={14} className="mr-1 text-[#FFA500]" strokeWidth={2} />{vehicle.transmission ?? 'N/A'}</span>
                      <span className="flex items-center whitespace-nowrap"><ShoppingBag size={14} className="mr-1 text-[#FFA500]" strokeWidth={2} />{vehicle.fuel_type ?? 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {totalFilteredCount > MAX_CARDS_PER_PAGE && (
        <Pagination
          carsPerPage={MAX_CARDS_PER_PAGE}
          totalCars={totalFilteredCount}
          paginate={paginate}
          currentPage={currentPage}
          nextPage={nextPage}
          prevPage={prevPage}
        />
      )}
    </div>
  );
};

export default CarsGridDisplay;