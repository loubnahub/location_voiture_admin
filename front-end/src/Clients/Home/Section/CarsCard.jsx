// src/pages/Client/VehicleFleet.jsx (Assuming this is the client-facing fleet page)
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Settings2,
    Briefcase, // In HEAD, this was used for Doors. In 9fe, it was used for Model. Standardizing to Doors.
    ArrowRight,
    AlertTriangle,
    Loader2,
    ChevronDown, // From HEAD, not used in final merged JSX but kept if needed for dropdowns
    ChevronLeft, // From 9fe for filter scroll
    ChevronRight // From 9fe for filter scroll
} from 'lucide-react';
import { fetchAllVehicleModels, fetchAllVehicleTypes } from '../../../services/api'; // Adjust path as needed

const DEFAULT_IMAGE_URL = '/images/Cars/bentley.jpg'; // Ensure this path is valid
const ITEMS_PER_PAGE_INCREMENT = 8;

const baseFilters = [{ label: 'All', value: 'All' }]; // 'All' filter is common

const VehicleFleet = () => {
  const [activeFilter, setActiveFilter] = useState('All'); // Stores the ID of the vehicle type or 'All'
  const [displayedItemsCount, setDisplayedItemsCount] = useState(ITEMS_PER_PAGE_INCREMENT);

  const [vehicles, setVehicles] = useState([]); // This state holds vehicle models
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [errorVehicles, setErrorVehicles] = useState(null);

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errorTypes, setErrorTypes] = useState(null);
  
  // Note: currentPage state was in HEAD but not actively used for pagination logic in displayedVehicles.
  // Kept if pagination logic is to be more complex later.
  const [currentPage, setCurrentPage] = useState(1); 

  const filterScrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // --- DATA FETCHING for Vehicle Types ---
  useEffect(() => {
    const loadVehicleTypes = async () => {
      try {
        setLoadingTypes(true);
        setErrorTypes(null);
        const response = await fetchAllVehicleTypes();
        // Standardized data extraction
        let typesData = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
            typesData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            typesData = response.data;
        } else if (response && Array.isArray(response)) { 
            typesData = response;
        } else {
          console.error("VehicleFleet: Vehicle types data is not in a recognized array format. Response:", response);
          throw new Error("Vehicle types data format is invalid.");
        }
        setVehicleTypes(typesData.filter(type => type && type.name && typeof type.id !== 'undefined')); // Ensure ID is present
      } catch (err) {
        console.error("VehicleFleet: Error fetching vehicle types:", err);
        setErrorTypes(err.message || 'Failed to load vehicle types.');
        setVehicleTypes([]);
      } finally {
        setLoadingTypes(false);
      }
    };
    loadVehicleTypes();
  }, []);

  // --- DATA FETCHING for Vehicles (Models) ---
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoadingVehicles(true);
        setErrorVehicles(null);
        const response = await fetchAllVehicleModels(); // This fetches vehicle models
        let vehiclesData = [];
        // Standardized data extraction
        if (response.data?.data && Array.isArray(response.data.data)) {
            vehiclesData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            vehiclesData = response.data;
        } else if (response && Array.isArray(response)) {
            vehiclesData = response;
        } else {
            console.error("VehicleFleet: Vehicles data not in recognized array format.", response);
            throw new Error("Vehicles data format is invalid.");
        }
        // Ensure vehicle_type_id is present for filtering, and id is present for linking
        const validVehicles = vehiclesData.filter(v => v && typeof v.id !== 'undefined' && typeof v.vehicle_type_id !== 'undefined');
        setVehicles(validVehicles);
      } catch (err) {
        console.error("VehicleFleet: Error fetching vehicles:", err);
        setErrorVehicles(err.message || 'Failed to load vehicles.');
        setVehicles([]);
      } finally {
        setLoadingVehicles(false);
      }
    };
    loadVehicles();
  }, []);

  // Reset displayed items when filter changes
  useEffect(() => {
    setDisplayedItemsCount(ITEMS_PER_PAGE_INCREMENT);
    setCurrentPage(1); 
  }, [activeFilter]);

  const dynamicFilters = useMemo(() => {
    if (loadingTypes || errorTypes || !Array.isArray(vehicleTypes) || vehicleTypes.length === 0) {
      return baseFilters;
    }
    const filtersFromApi = vehicleTypes
      .map(type => ({ 
        label: type.name, 
        value: String(type.id), // Use ID as value for filtering
      }));
    return [...baseFilters, ...filtersFromApi];
  }, [vehicleTypes, loadingTypes, errorTypes]);

  const filteredVehicles = useMemo(() => {
    if (loadingVehicles) return [];
    if (activeFilter === 'All') return vehicles;
    // Filter by vehicle_type_id (converted to string for comparison)
    return vehicles.filter(vehicle => String(vehicle.vehicle_type_id) === String(activeFilter));
  }, [activeFilter, vehicles, loadingVehicles]);

  const displayedVehicles = useMemo(() => {
    return filteredVehicles.slice(0, displayedItemsCount);
  }, [filteredVehicles, displayedItemsCount]);

  const handleLoadMore = () => {
    setDisplayedItemsCount(prevCount => prevCount + ITEMS_PER_PAGE_INCREMENT);
  };

  // --- Filter Scroll Logic (from 9fe) ---
  const checkScrollability = () => {
    const container = filterScrollContainerRef.current;
    if (container) {
      const currentScrollLeft = Math.ceil(container.scrollLeft); // Use Math.ceil for precision
      const currentScrollWidth = container.scrollWidth;
      const currentClientWidth = container.clientWidth;
      setCanScrollLeft(currentScrollLeft > 0);
      // Check if scrollLeft is less than the maximum scrollable distance
      setCanScrollRight(currentScrollLeft < (currentScrollWidth - currentClientWidth -1)); // -1 for subpixel rendering issues
    }
  };

  useEffect(() => {
    const container = filterScrollContainerRef.current;
    if (container && !loadingTypes && dynamicFilters.length > 1) { 
      checkScrollability(); // Initial check
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability); // Re-check on resize
      const timeoutId = setTimeout(checkScrollability, 150); // Check again after layout might have settled
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
        clearTimeout(timeoutId);
      };
    } else {
      // Reset scrollability if conditions are not met
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, [dynamicFilters, loadingTypes]); // Dependencies that affect the filter bar content or visibility

  const scrollFilters = (direction) => {
    const container = filterScrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.7; // Scroll by 70% of visible width
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };
  
  const displayTransmission = (transmission) => {
    if (typeof transmission === 'string') {
      if (transmission.toLowerCase() === 'automatic') return 'Auto';
      if (transmission.toLowerCase() === 'manual') return 'Manual';
      // Capitalize first letter for other string values
      return transmission.charAt(0).toUpperCase() + transmission.slice(1);
    }
    return String(transmission || 'N/A'); // Default if not a string
  };

  // --- Render Helper Functions (using tw- prefix) ---
  const renderLoadingIndicator = (text = "Loading...", className="") => ( 
    <div className={`tw-flex tw-items-center tw-justify-center tw-text-neutral-400 tw-py-10 tw-col-span-full ${className}`}> 
      <Loader2 size={24} className="tw-animate-spin tw-mr-3" /> 
      <span>{text}</span> 
    </div> 
  );
  const renderErrorIndicator = (errorMsg, context = "", className="") => ( 
    <div className={`tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-red-400 tw-py-10 tw-col-span-full ${className}`}> 
      <AlertTriangle size={40} className="tw-mb-3 tw-text-red-500" /> {/* Adjusted size and color */}
      <p className="tw-text-lg tw-font-semibold tw-text-red-300">Failed to load {context || "data"}</p> 
      <p className="tw-text-sm tw-text-red-400">{typeof errorMsg === 'string' ? errorMsg : "An unknown error occurred."}</p> 
    </div> 
  );
  
  // Combined loading state for initial page load
  if (loadingTypes && loadingVehicles) { return ( <div className="tw-bg-[#1B1B1B] tw-text-white tw-py-16 tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-min-h-screen"> <div className="tw-container tw-mx-auto tw-max-w-7xl"> {renderLoadingIndicator("Initializing fleet page...", "tw-h-64")} </div> </div> ); }
  // Error for types if it happens before vehicles load attempt (vehicles might depend on types)
  if (errorTypes && !loadingTypes) { return ( <div className="tw-bg-[#1B1B1B] tw-text-white tw-py-16 tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-min-h-screen"> <div className="tw-container tw-mx-auto tw-max-w-7xl"> {renderErrorIndicator(errorTypes, "vehicle categories for filtering", "tw-h-64")} </div> </div> ); }
  
  const showVehicleLoadingState = loadingVehicles && !errorVehicles; // Only show vehicle loading if no prior error

  return (
    <div className="tw-bg-[#1B1B1B] tw-text-neutral-200 tw-py-16 tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-min-h-screen">
      <style>{`
        .horizontal-filter-scrollbar::-webkit-scrollbar { height: 5px; }
        .horizontal-filter-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .horizontal-filter-scrollbar::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 10px; border: 1px solid #1B1B1B; }
        .horizontal-filter-scrollbar::-webkit-scrollbar-thumb:hover { background: #FFA500; }
        .horizontal-filter-scrollbar { scrollbar-width: thin; scrollbar-color: #4B5563 transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="tw-container tw-mx-auto tw-max-w-7xl">
        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between sm:tw-items-center tw-mb-10 sm:tw-mb-12">
          <h2 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-bold tw-text-neutral-100 tw-text-left mb-4 sm:tw-mb-0">
            Our Vehicle Fleet
          </h2>
        </div>

        {/* Filter Buttons with Scroll (from 9fe) */}
        <div className="tw-mb-12 sm:tw-mb-16"> {/* Standardized margin */}
          {loadingTypes ? (
            renderLoadingIndicator("Loading filters...", "tw-py-5")
          ) : dynamicFilters.length > 1 ? ( // Only show scrollable filters if more than 'All'
            <div className="tw-relative group">
              <button
                onClick={() => scrollFilters('left')}
                aria-label="Scroll filters left"
                className={`tw-absolute tw-left-0 tw-top-1/2 -tw-translate-y-1/2 tw-z-20 tw-p-2.5 tw-bg-zinc-800/80 tw-backdrop-blur-sm hover:tw-bg-amber-500 tw-text-white tw-rounded-full tw-shadow-lg tw-transition-all tw-duration-200 tw-ease-in-out
                            ${canScrollLeft ? 'tw-opacity-100 group-hover:tw-opacity-100 focus-within:tw-opacity-100 tw-transform group-hover:-tw-translate-x-1 focus-within:-tw-translate-x-1' : 'tw-opacity-0 tw-pointer-events-none'} 
                            -tw-ml-1 sm:tw-ml-0`} // Use tw- prefixes
              >
                <ChevronLeft size={22} strokeWidth={2.5}/>
              </button>
              <div 
                ref={filterScrollContainerRef}
                className="horizontal-filter-scrollbar no-scrollbar tw-flex tw-items-center tw-space-x-3 sm:tw-space-x-4 tw-overflow-x-auto tw-py-2 
                           tw-px-12 sm:tw-px-16" // Use tw- prefixes
              >
                {dynamicFilters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    // Merged button styling: 9fe's gradient for active, HEAD's subtle for inactive
                    className={`tw-whitespace-nowrap tw-px-5 tw-py-2.5 tw-rounded-xl tw-text-sm tw-font-semibold tw-transition-all tw-duration-300 tw-ease-in-out focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-offset-[#1B1B1B]
                      ${activeFilter === filter.value
                        ? 'tw-bg-gradient-to-r tw-from-amber-500 tw-to-amber-600 tw-text-black tw-shadow-xl tw-shadow-amber-500/30 focus:tw-ring-amber-400 tw-transform tw-scale-105' // Active style from 9fe
                        : 'tw-bg-neutral-800 tw-text-neutral-300 hover:tw-bg-neutral-700 hover:tw-text-amber-400 focus:tw-ring-amber-500' // Inactive style (mix of HEAD and 9fe for hover)
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => scrollFilters('right')}
                aria-label="Scroll filters right"
                className={`tw-absolute tw-right-0 tw-top-1/2 -tw-translate-y-1/2 tw-z-20 tw-p-2.5 tw-bg-zinc-800/80 tw-backdrop-blur-sm hover:tw-bg-amber-500 tw-text-white tw-rounded-full tw-shadow-lg tw-transition-all tw-duration-200 tw-ease-in-out
                            ${canScrollRight ? 'tw-opacity-100 group-hover:tw-opacity-100 focus-within:tw-opacity-100 tw-transform group-hover:tw-translate-x-1 focus-within:tw-translate-x-1' : 'tw-opacity-0 tw-pointer-events-none'}
                            -tw-mr-1 sm:tw-mr-0`} // Use tw- prefixes
              >
                <ChevronRight size={22} strokeWidth={2.5}/>
              </button>
            </div>
          ) : ( // Case for "All" filter only or error loading types
            !errorTypes && <p className="tw-text-neutral-500 tw-text-center sm:tw-text-left">No specific vehicle categories available for filtering.</p>
          )}
        </div>
        
        {/* Vehicle Grid */}
        {showVehicleLoadingState ? (
          renderLoadingIndicator("Loading vehicles...", "tw-h-96")
        ) : errorVehicles ? (
          renderErrorIndicator(errorVehicles, "vehicles", "tw-h-96")
        ) : displayedVehicles.length > 0 ? (
          <>
            <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-x-6 tw-gap-y-8 md:tw-gap-x-8 md:tw-gap-y-10">
              {displayedVehicles.map((vehicle) => ( // 'vehicle' here is a vehicle model
                <div
                  key={vehicle.id} // This is vehicle_model_id
                  className="tw-relative tw-rounded-xl sm:tw-rounded-2xl tw-overflow-hidden group
                             tw-bg-neutral-800 tw-border tw-border-neutral-700/60 hover:tw-border-amber-500/50
                             tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300 tw-aspect-[4/5]" // Card style from HEAD
                >
                    <img
                      src={vehicle.thumbnail_url || vehicle.image_url || vehicle.imageUrl || vehicle.image || DEFAULT_IMAGE_URL} // Robust image source checking
                      alt={vehicle.title || vehicle.brand || 'Vehicle image'}
                      className="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-object-cover tw-transition-transform tw-duration-300 group-hover:tw-scale-105 -tw-z-0" // Using -tw-z-0 from HEAD
                      loading="lazy"
                      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE_URL; }}
                    />
                  <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-flex tw-flex-col tw-justify-end tw-p-3 sm:tw-p-4 
                                  tw-bg-gradient-to-t tw-from-black/90 tw-via-black/70 to-transparent tw-z-10 tw-pt-16"> {/* Gradient from HEAD */}
                    <div className="tw-flex tw-items-end tw-justify-start tw-w-full tw-gap-x-3 sm:tw-gap-x-4">
                      <Link 
                        to={`/fleet/details/${vehicle.id}`} // Use vehicle.id (which is model_id here)
                        className="group/pricebtn tw-flex-shrink-0 tw-no-underline" 
                        aria-label={`View details for ${vehicle.title || vehicle.brand}`}
                      >
                        <div
                          className="tw-bg-neutral-900/80 tw-border-[1.5px] sm:tw-border-2 tw-border-amber-500 // Merged border style
                                     tw-w-14 tw-h-14 sm:tw-w-16 sm:tw-h-16 md:tw-w-[70px] md:tw-h-[70px]
                                     tw-rounded-full tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-shadow-lg
                                     tw-relative tw-z-10 tw-overflow-hidden tw-transition-all tw-duration-300
                                     hover:tw-bg-amber-500/20 tw-cursor-pointer"
                        >
                          <div className="tw-transition-all tw-duration-300 group-hover/pricebtn:tw-translate-x-[-45px] sm:group-hover/pricebtn:tw-translate-x-[-55px] group-hover/pricebtn:tw-opacity-0">
                            <span className="tw-font-bold tw-text-amber-400 tw-text-xs sm:tw-text-sm md:tw-text-base tw-leading-none">
                              ${parseFloat(vehicle.base_price_per_day || vehicle.price || 0).toFixed(0)}
                            </span>
                            <span className="tw-text-amber-400 tw-text-[7px] sm:tw-text-[8px] tw-uppercase tw-leading-none tw-pt-0.5 sm:tw-pt-1">
                              /day
                            </span>
                          </div>
                          <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-opacity-0
                                          tw-transition-all tw-duration-300 tw-transform tw-translate-x-8 sm:tw-translate-x-10
                                          group-hover/pricebtn:tw-opacity-100 group-hover/pricebtn:tw-translate-x-0">
                            <ArrowRight size={22} className="tw-text-amber-500" strokeWidth={2.5} />
                          </div>
                          <div className="tw-absolute tw-inset-0 tw-rounded-full tw-border-2 tw-border-amber-500
                                          tw-opacity-0 tw-scale-90 tw-transition-all tw-duration-300
                                          group-hover/pricebtn:tw-opacity-100 group-hover/pricebtn:tw-scale-110 -tw-z-10"></div>
                        </div>
                      </Link>

                      <div className='tw-space-y-0.5 sm:tw-space-y-1 tw-flex-grow tw-min-w-0'>
                        <p className="tw-text-white tw-w-full tw-font-bold tw-text-sm sm:tw-text-base md:tw-text-lg tw-truncate" title={vehicle.title || vehicle.brand}>
                          {vehicle.title || vehicle.brand }
                        </p>
                        <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-x-2 sm:tw-gap-x-3 tw-gap-y-0.5 tw-text-neutral-300 tw-text-[10px] sm:tw-text-xs tw-min-w-0">
                          <span title="Seats" className="tw-flex tw-items-center tw-whitespace-nowrap">
                            <Users size={14} className="tw-mr-0.5 sm:tw-mr-1 tw-text-amber-500/80" strokeWidth={2} />
                            {vehicle.number_of_seats || 'N/A'}
                          </span>
                          <span title="Transmission" className="tw-flex tw-items-center tw-whitespace-nowrap">
                            <Settings2 size={14} className="tw-mr-0.5 sm:tw-mr-1 tw-text-amber-500/80" strokeWidth={2} />
                            {displayTransmission(vehicle.transmission) }
                          </span>
                          <span title="Doors" className="tw-flex tw-items-center tw-whitespace-nowrap"> {/* Briefcase used for Doors as in HEAD */}
                            <Briefcase size={14} className="tw-mr-0.5 sm:tw-mr-1 tw-text-amber-500/80" strokeWidth={2} />
                            {vehicle.number_of_doors || 'N/A'} Doors
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          </>
        ) : (
          <p className="tw-text-center tw-text-neutral-400 tw-col-span-full tw-py-20 tw-text-lg">
            {vehicles.length === 0 && activeFilter === 'All' && !loadingVehicles && !errorVehicles
              ? 'No vehicles available at the moment.'
              : `No vehicles found for the "${dynamicFilters.find(f => f.value === activeFilter)?.label || activeFilter}" filter.`}
          </p>
        )}
      </div>
    </div>
  );
};

export default VehicleFleet;