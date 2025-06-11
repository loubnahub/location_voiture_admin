// src/components/Section/CarsGridDisplay.jsx (Assuming path based on VehicleListPage import)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Settings2, ShoppingBag, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { fetchAllVehicleModels } from '../../../services/api'; // Adjust path as needed
import Pagination from './Pagination'; // Assuming you have this component in the same directory

const MAX_CARDS_PER_PAGE = 18; // Or your desired number

const DEFAULT_GRID_IMAGE = '/images/Cars/placeholder-car.png'; // Your defined fallback image

const CarsGridDisplay = ({ filters }) => {
  const [allFetchedVehicles, setAllFetchedVehicles] = useState([]);
  const [filteredAndPaginatedVehicles, setFilteredAndPaginatedVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);

  // Effect to fetch all vehicles ONCE on component mount
  useEffect(() => {
    const loadAllVehicles = async () => {
      setLoading(true);
      setError(null);
      setAllFetchedVehicles([]);
      try {
        // If your API supports fetching all without pagination, use that.
        // Otherwise, you might need to handle multiple fetches if the total is very large.
        // For simplicity, assuming fetchAllVehicleModels can get all or a large enough set.
        const response = await fetchAllVehicleModels({ /* params like per_page: 'all' or a large number if needed */ });
        let vehiclesData = [];
        // Standardized data extraction from API response
        if (response.data?.data && Array.isArray(response.data.data)) {
            vehiclesData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            vehiclesData = response.data;
        } else if (response && Array.isArray(response)) { // Fallback if API returns array directly
            vehiclesData = response;
        } else {
            console.error("CarsGridDisplay: Vehicles data is not in a recognized array format.", response);
            throw new Error("Vehicles data format is invalid.");
        }
        // Ensure basic validity for display and linking
        const validVehicles = vehiclesData.filter(v => v && typeof v.id !== 'undefined');
        setAllFetchedVehicles(validVehicles);
      } catch (err) {
        console.error("CarsGridDisplay: Error fetching vehicles:", err);
        setError(err.message || 'Failed to load vehicles.');
        setAllFetchedVehicles([]); // Ensure it's an empty array on error
      } finally {
        setLoading(false);
      }
    };
    loadAllVehicles();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to filter and paginate vehicles WHENEVER filters, allFetchedVehicles, or currentPage changes
  useEffect(() => {
    if (loading) return; // Don't filter if initial data is still loading

    let carsToFilter = [...allFetchedVehicles];

    // Search filter (case-insensitive)
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        carsToFilter = carsToFilter.filter(car =>
            (car.title?.toLowerCase().includes(searchTerm)) ||
            (car.brand?.toLowerCase().includes(searchTerm)) ||
            (car.model?.toLowerCase().includes(searchTerm))
        );
    }
    // Category filter (vehicle_type_id)
    if (filters.categories && filters.categories.length > 0) {
        // Ensure comparison is consistent (e.g., string to string)
        const selectedCategoryIds = filters.categories.map(String);
        carsToFilter = carsToFilter.filter(car =>
            selectedCategoryIds.includes(String(car.vehicle_type_id))
        );
    }
    // Location filter
    if (filters.location && carsToFilter.some(c => typeof c.location === 'string')) {
        const locationTerm = filters.location.toLowerCase();
        carsToFilter = carsToFilter.filter(car => car.location?.toLowerCase().includes(locationTerm));
    }
    // Capacities (number_of_seats)
    if (filters.capacities && filters.capacities.length > 0 && carsToFilter.some(c => typeof c.number_of_seats !== 'undefined')) {
        carsToFilter = carsToFilter.filter(car => {
            const carSeats = parseInt(car.number_of_seats, 10);
            if (isNaN(carSeats)) return false;
            return filters.capacities.some(capRange => {
                // Adjusted capacity logic to be more precise
                if (capRange === '+2') return carSeats >= 1 && carSeats <= 2;
                if (capRange === '+4') return carSeats >= 3 && carSeats <= 4; // Example: 3-4 seats
                if (capRange === '+6') return carSeats >= 5 && carSeats <= 6; // Example: 5-6 seats
                if (capRange === '+8') return carSeats >= 7 && carSeats <= 8; // Example: 7-8 seats
                if (capRange === '+12') return carSeats >= 9;       // 9+ seats
                return false;
            });
        });
    }
    // Years filter
    if (filters.years && filters.years.length > 0 && carsToFilter.some(c => typeof c.year !== 'undefined')) {
        const selectedYears = filters.years.map(String);
        carsToFilter = carsToFilter.filter(car => selectedYears.includes(String(car.year)));
    }
    // Fuel types filter
    if (filters.fuelTypes && filters.fuelTypes.length > 0 && carsToFilter.some(c => typeof c.fuel_type === 'string')) {
        carsToFilter = carsToFilter.filter(car => filters.fuelTypes.includes(car.fuel_type));
    }
    // Transmissions filter
    if (filters.transmissions && filters.transmissions.length > 0 && carsToFilter.some(c => typeof c.transmission === 'string')) {
        carsToFilter = carsToFilter.filter(car => filters.transmissions.includes(car.transmission));
    }
    // Price filter (max price)
    if (filters.price && carsToFilter.some(c => typeof c.base_price_per_day !== 'undefined') ) {
        const maxPrice = parseFloat(filters.price);
        if (!isNaN(maxPrice)) {
            carsToFilter = carsToFilter.filter(car => {
                const carPrice = parseFloat(car.base_price_per_day);
                return !isNaN(carPrice) && carPrice <= maxPrice;
            });
        }
    }

    setTotalFilteredCount(carsToFilter.length);

    // Reset to page 1 if current page becomes invalid after filtering
    let newCurrentPage = currentPage;
    const totalPages = Math.ceil(carsToFilter.length / MAX_CARDS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
        newCurrentPage = 1;
    } else if (totalPages === 0 && carsToFilter.length === 0){ // Also reset if no results
        newCurrentPage = 1;
    }
    // Only update currentPage state if it actually needs to change
    if (newCurrentPage !== currentPage) {
        setCurrentPage(newCurrentPage);
    }

    const indexOfLastCar = newCurrentPage * MAX_CARDS_PER_PAGE;
    const indexOfFirstCar = indexOfLastCar - MAX_CARDS_PER_PAGE;
    setFilteredAndPaginatedVehicles(carsToFilter.slice(indexOfFirstCar, indexOfLastCar));

  }, [allFetchedVehicles, filters, currentPage, loading]); // Key dependencies for re-filtering/pagination

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => { if (currentPage < Math.ceil(totalFilteredCount / MAX_CARDS_PER_PAGE)) { setCurrentPage(currentPage + 1); } };
  const prevPage = () => { if (currentPage > 1) { setCurrentPage(currentPage - 1); } };

  // --- JSX for Loading, Error, and No Results states (using tw- prefix consistently) ---
  if (loading && allFetchedVehicles.length === 0) { // Show full page loading only if no vehicles loaded yet
    return (
      <div className="tw-w-full tw-text-center tw-py-20 tw-flex tw-flex-col tw-items-center tw-justify-center tw-min-h-[300px]">
        <Loader2 size={40} className="tw-animate-spin tw-text-amber-500 tw-mb-3" />
        <p className="tw-text-neutral-300 tw-text-lg">Loading vehicles...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="tw-w-full tw-text-center tw-py-20 tw-bg-[#1F1F1F] tw-rounded-xl tw-p-5 tw-border tw-border-red-600/50 tw-flex tw-flex-col tw-items-center tw-justify-center tw-min-h-[300px]">
        <AlertTriangle size={40} className="tw-text-red-500 tw-mb-3"/>
        <p className="tw-font-semibold tw-text-lg tw-text-red-400">An Error Occurred</p>
        <p className="tw-text-sm tw-text-red-500 tw-mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="tw-mt-2 tw-px-6 tw-py-2.5 tw-bg-amber-500 tw-text-black tw-rounded-lg hover:tw-bg-amber-600 tw-transition-colors tw-font-semibold">Retry</button>
      </div>
    );
  }
  // Show "No vehicles match" or "No vehicles available" only after initial load is complete and if applicable
  if (!loading && filteredAndPaginatedVehicles.length === 0) {
    return (
      <div className="tw-w-full tw-text-center tw-py-20 tw-min-h-[300px] tw-flex tw-items-center tw-justify-center">
        <p className="tw-text-neutral-400 tw-text-lg">
          {totalFilteredCount === 0 && allFetchedVehicles.length > 0
            ? "No vehicles match your current filters."
            : "No vehicles available at the moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="tw-w-full">
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 sm:tw-gap-8"> {/* Changed xl:grid-cols-3 to lg:grid-cols-3 for wider cards */}
        {filteredAndPaginatedVehicles.map((vehicle) => {
          // 'vehicle' is a vehicle model object from your API
          const vehicleFullName = vehicle.title || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Vehicle Name';
          const displayPrice = vehicle.base_price_per_day;
          const imageUrl = vehicle.thumbnail_url || DEFAULT_GRID_IMAGE; // Prioritize thumbnail_url

          return (
            <div
              key={vehicle.id} // vehicle.id is vehicle_model_id
              className="tw-relative tw-rounded-xl sm:tw-rounded-2xl tw-overflow-hidden tw-shadow-xl tw-group tw-bg-[#1B1B1B] tw-border tw-border-transparent hover:tw-border-neutral-700 tw-aspect-[4/5] tw-transition-all tw-duration-300"
            >
              <img
                src={imageUrl}
                className="tw-w-full tw-h-full tw-object-cover tw-transition-transform tw-duration-300 group-hover:tw-scale-105"
                alt={vehicleFullName}
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_GRID_IMAGE; }}
              />
              <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-px-3 sm:tw-px-3.5 tw-pt-12 tw-pb-3 sm:tw-pb-3.5 tw-bg-gradient-to-t tw-from-black/90 tw-via-black/75 tw-to-transparent tw-rounded-b-xl sm:tw-rounded-b-2xl">
                <div className="tw-flex tw-items-end tw-justify-start tw-w-full tw-gap-x-2.5 sm:tw-gap-x-3.5">
                  <Link
                    to={`/fleet/details/${vehicle.id}`} // Link to the model's detail page
                    className="group/pricebtn tw-flex-shrink-0 tw-no-underline" // Added tw-no-underline
                    aria-label={`View details for ${vehicleFullName}`}
                  >
                    <div role="button" tabIndex={0} className="tw-bg-zinc-900/80 tw-border tw-border-[1.5px] sm:tw-border-2 tw-border-[#FFA500] tw-w-14 tw-h-14 sm:tw-w-[60px] sm:tw-h-[60px] tw-rounded-full tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-shadow-lg tw-relative tw-z-10 tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-bg-[#FFA500]/10 tw-cursor-pointer">
                      <div className="tw-transition-all tw-duration-300 group-hover/pricebtn:tw-translate-x-[-35px] sm:group-hover/pricebtn:tw-translate-x-[-45px] group-hover/pricebtn:tw-opacity-0">
                        <span className="tw-font-bold tw-text-[#FFA500] tw-text-xs sm:tw-text-sm tw-leading-none">
                          ${displayPrice != null && !isNaN(Number(displayPrice)) ? Math.floor(Number(displayPrice)) : 'N/A'}
                        </span>
                        <span className="tw-text-[#FFA500] tw-text-[7px] sm:tw-text-[8px] tw-uppercase tw-leading-none tw-pt-0.5">/DAY</span>
                      </div>
                      <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-opacity-0 tw-transition-all tw-duration-300 tw-transform tw-translate-x-7 sm:tw-translate-x-9 group-hover/pricebtn:tw-opacity-100 group-hover/pricebtn:tw-translate-x-0">
                        <ArrowRight size={18} className="tw-text-[#FFA500]" strokeWidth={2.5} />
                      </div>
                      <div className="tw-absolute tw-inset-0 tw-rounded-full tw-border-2 tw-border-[#FFA500] tw-opacity-0 tw-scale-90 tw-transition-all tw-duration-300 group-hover/pricebtn:tw-opacity-100 group-hover/pricebtn:tw-scale-110 tw--z-10"></div>
                    </div>
                  </Link>
                  <div className='tw-space-y-0.5 tw-flex-grow tw-min-w-0'>
                    <h3 className="tw-text-white tw-w-full tw-font-semibold tw-text-sm sm:tw-text-base md:tw-text-lg tw-truncate" title={vehicleFullName}>{vehicleFullName}</h3>
                    <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-x-3 tw-gap-y-1 tw-text-[#A0A0A0] tw-text-[10px] sm:tw-text-[11px] tw-min-w-0">
                      <span className="tw-flex tw-items-center tw-whitespace-nowrap"><Users size={14} className="tw-mr-1 tw-text-[#FFA500]" strokeWidth={2} />{vehicle.number_of_seats ?? 'N/A'}</span>
                      <span className="tw-flex tw-items-center tw-whitespace-nowrap"><Settings2 size={14} className="tw-mr-1 tw-text-[#FFA500]" strokeWidth={2} />{vehicle.transmission ?? 'N/A'}</span>
                      <span className="tw-flex tw-items-center tw-whitespace-nowrap"><ShoppingBag size={14} className="tw-mr-1 tw-text-[#FFA500]" strokeWidth={2} />{vehicle.fuel_type ?? 'N/A'}</span>
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