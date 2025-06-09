// src/pages/VehicleFleet.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    Users, 
    Settings2, 
    Briefcase, 
    ArrowRight, 
    AlertTriangle, 
    Loader2, 
    ChevronLeft, 
    ChevronRight 
} from 'lucide-react';
import { fetchAllVehicleModels, fetchAllVehicleTypes } from '../../../services/api'; 

const DEFAULT_IMAGE_URL = '/images/Cars/bentley.jpg'; // Make sure this path is valid in your public folder
const ITEMS_PER_PAGE_INCREMENT = 8;

const baseFilters = [{ label: 'All', value: 'All' }];

const VehicleFleet = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [displayedItemsCount, setDisplayedItemsCount] = useState(ITEMS_PER_PAGE_INCREMENT);

  const [vehicles, setVehicles] = useState([]); // Note: This state holds vehicle models
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [errorVehicles, setErrorVehicles] = useState(null);

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errorTypes, setErrorTypes] = useState(null);
  
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
        setVehicleTypes(typesData.filter(type => type && type.name && type.id));
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
        if (response.data?.data && Array.isArray(response.data.data)) {
            vehiclesData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            vehiclesData = response.data;
        } else if (response && Array.isArray(response)) {
            vehiclesData = response;
        } else {
            console.error("VehicleFleet: Vehicles data is not in a recognized array format. Response:", response);
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
        value: type.id, 
      }));
    return [...baseFilters, ...filtersFromApi];
  }, [vehicleTypes, loadingTypes, errorTypes]);

  const filteredVehicles = useMemo(() => {
    if (loadingVehicles) return [];
    if (activeFilter === 'All') return vehicles;
    return vehicles.filter(vehicle => String(vehicle.vehicle_type_id) === String(activeFilter));
  }, [activeFilter, vehicles, loadingVehicles]);

  const displayedVehicles = useMemo(() => {
    return filteredVehicles.slice(0, displayedItemsCount);
  }, [filteredVehicles, displayedItemsCount]);

  const handleLoadMore = () => {
    setDisplayedItemsCount(prevCount => prevCount + ITEMS_PER_PAGE_INCREMENT);
  };

  const checkScrollability = () => {
    const container = filterScrollContainerRef.current;
    if (container) {
      const currentScrollLeft = Math.ceil(container.scrollLeft);
      const currentScrollWidth = container.scrollWidth;
      const currentClientWidth = container.clientWidth;
      setCanScrollLeft(currentScrollLeft > 0);
      setCanScrollRight(currentScrollLeft < currentScrollWidth - currentClientWidth -1);
    }
  };

  useEffect(() => {
    const container = filterScrollContainerRef.current;
    if (container && !loadingTypes && dynamicFilters.length > 1) { 
      checkScrollability();
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      const timeoutId = setTimeout(checkScrollability, 150); 
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
        clearTimeout(timeoutId);
      };
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, [dynamicFilters, loadingTypes]);

  const scrollFilters = (direction) => {
    const container = filterScrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.7; 
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const displayTransmission = (transmission) => {
    if (typeof transmission === 'string') {
        if (transmission.toLowerCase() === 'automatic') return 'Auto';
        if (transmission.toLowerCase() === 'manual') return 'Manual';
        return transmission.charAt(0).toUpperCase() + transmission.slice(1);
    }
    return String(transmission || 'N/A');
  };

  const renderLoadingIndicator = (text = "Loading...", className="") => ( 
    <div className={`flex items-center justify-center text-gray-400 py-10 col-span-full ${className}`}> 
      <Loader2 size={24} className="animate-spin mr-2" /> 
      <span>{text}</span> 
    </div> 
  );
  const renderErrorIndicator = (errorMsg, context = "", className="") => ( 
    <div className={`flex flex-col items-center justify-center text-red-400 py-10 col-span-full ${className}`}> 
      <AlertTriangle size={48} className="mb-4 text-red-500" /> 
      <p className="text-xl font-semibold text-red-300">Failed to load {context || "data"}</p> 
      <p className="text-sm text-red-400">{typeof errorMsg === 'string' ? errorMsg : "An unknown error occurred."}</p> 
    </div> 
  );
  
  if (loadingTypes && loadingVehicles) { return ( <div className="bg-[#1B1B1B] text-white py-16 px-4 sm:px-6 lg:px-8 min-h-screen"> <div className="container mx-auto max-w-7xl"> {renderLoadingIndicator("Initializing fleet page...", "h-64")} </div> </div> ); }
  if (errorTypes && !loadingVehicles) { return ( <div className="bg-[#1B1B1B] text-white py-16 px-4 sm:px-6 lg:px-8 min-h-screen"> <div className="container mx-auto max-w-7xl"> {renderErrorIndicator(errorTypes, "vehicle categories", "h-64")} </div> </div> ); }
  
  const showVehicleLoadingState = loadingVehicles;

  return (
    <div className="bg-[#1B1B1B] text-white py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <style>{`
        .horizontal-filter-scrollbar::-webkit-scrollbar { height: 5px; }
        .horizontal-filter-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .horizontal-filter-scrollbar::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 10px; border: 1px solid #1B1B1B; }
        .horizontal-filter-scrollbar::-webkit-scrollbar-thumb:hover { background: #FFA500; }
        .horizontal-filter-scrollbar { scrollbar-width: thin; scrollbar-color: #4B5563 transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-left mb-4 sm:mb-0">
            Our Vehicle Fleet
          </h2>
        </div>

        <div className="mb-12 sm:mb-16">
          {loadingTypes ? (
            renderLoadingIndicator("Loading categories...", "py-5")
          ) : dynamicFilters.length > 1 ? (
            <div className="relative group">
              <button
                onClick={() => scrollFilters('left')}
                aria-label="Scroll filters left"
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-zinc-800/80 backdrop-blur-sm hover:bg-amber-500 text-white rounded-full shadow-lg transition-all duration-200 ease-in-out
                            ${canScrollLeft ? 'opacity-100 group-hover:opacity-100 focus-within:opacity-100 transform group-hover:-translate-x-1 focus-within:-translate-x-1' : 'opacity-0 pointer-events-none'} 
                            -ml-1 sm:ml-0`}
              >
                <ChevronLeft size={22} strokeWidth={2.5}/>
              </button>
              <div 
                ref={filterScrollContainerRef}
                className="horizontal-filter-scrollbar no-scrollbar flex items-center space-x-3 sm:space-x-4 overflow-x-auto py-2 
                           px-12 sm:px-16"
              >
                {dynamicFilters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1B1B1B]
                      ${activeFilter === filter.value
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-xl shadow-amber-500/30 ring-amber-400 transform scale-105'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-amber-400 hover:shadow-md focus:ring-amber-500' 
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => scrollFilters('right')}
                aria-label="Scroll filters right"
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-zinc-800/80 backdrop-blur-sm hover:bg-amber-500 text-white rounded-full shadow-lg transition-all duration-200 ease-in-out
                            ${canScrollRight ? 'opacity-100 group-hover:opacity-100 focus-within:opacity-100 transform group-hover:translate-x-1 focus-within:translate-x-1' : 'opacity-0 pointer-events-none'}
                            -mr-1 sm:mr-0`}
              >
                <ChevronRight size={22} strokeWidth={2.5}/>
              </button>
            </div>
          ) : (
            !errorTypes && <p className="text-gray-500 text-center sm:text-left">No specific vehicle categories available for filtering.</p>
          )}
        </div>

        {showVehicleLoadingState ? (
          renderLoadingIndicator("Loading vehicles...", "h-96")
        ) : errorVehicles ? (
          renderErrorIndicator(errorVehicles, "vehicles", "h-96")
        ) : displayedVehicles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
              {displayedVehicles.map((vehicle) => ( // 'vehicle' here is a vehicle model
                <div
                  key={vehicle.id} // This is vehicle_model_id
                  className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl group
                             bg-zinc-800 border border-zinc-700/50 hover:border-amber-500/70 transition-colors duration-300 aspect-[4/5]"
                >
                    <img
                      src={vehicle.thumbnail_url || vehicle.image_url || vehicle.imageUrl || vehicle.image || DEFAULT_IMAGE_URL}
                      alt={vehicle.title || vehicle.brand || 'Vehicle image'}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 -z-0"
                      loading="lazy"
                      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE_URL; }}
                    />
                  <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-3 sm:p-4 
                                  bg-gradient-to-t from-black/80 via-black/60 to-transparent z-10 pt-16">
                    <div className="flex items-end justify-start w-full gap-x-3 sm:gap-x-4">
                      {/* MODIFIED Link component */}
                      <Link 
                        to={`/fleet/details/${vehicle.id}`} // Use vehicle.id (which is model_id here)
                        className="group/pricebtn flex-shrink-0" 
                        aria-label={`View details for ${vehicle.title || vehicle.brand}`}
                      >
                        <div
                          className="bg-zinc-900/80 border-[1.5px] sm:border-2 border-amber-500
                                     w-14 h-14 sm:w-16 sm:h-16 md:w-[70px] md:h-[70px]
                                     rounded-full flex flex-col items-center justify-center text-center shadow-lg
                                     relative z-10 overflow-hidden transition-all duration-300
                                     hover:bg-amber-500/20 cursor-pointer"
                        >
                          <div className="transition-all duration-300 group-hover/pricebtn:translate-x-[-45px] sm:group-hover/pricebtn:translate-x-[-55px] group-hover/pricebtn:opacity-0">
                            <span className="font-bold text-amber-400 text-xs sm:text-sm md:text-base leading-none">
                              ${parseFloat(vehicle.base_price_per_day || vehicle.price || 0).toFixed(0)}
                            </span>
                            <span className="text-amber-400 text-[7px] sm:text-[8px] uppercase leading-none pt-0.5 sm:pt-1">
                              /day
                            </span>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0
                                          transition-all duration-300 transform translate-x-8 sm:translate-x-10
                                          group-hover/pricebtn:opacity-100 group-hover/pricebtn:translate-x-0">
                            <ArrowRight size={22} className="text-amber-500" strokeWidth={2.5} />
                          </div>
                          <div className="absolute inset-0 rounded-full border-2 border-amber-500
                                          opacity-0 scale-90 transition-all duration-300
                                          group-hover/pricebtn:opacity-100 group-hover/pricebtn:scale-110 -z-10"></div>
                        </div>
                      </Link>

                      <div className='space-y-0.5 sm:space-y-1 flex-grow min-w-0'>
                        <p className="text-white w-full font-bold text-sm sm:text-base md:text-lg truncate" title={vehicle.title || vehicle.brand}>
                          {vehicle.title || vehicle.brand }
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 text-amber-400 text-[10px] sm:text-xs min-w-0">
                          <span title="Seats" className="flex items-center whitespace-nowrap">
                            <Users size={14} className="mr-0.5 sm:mr-1 text-amber-500" strokeWidth={2} />
                            {vehicle.number_of_seats || 'N/A'}
                          </span>
                          <span title="Transmission" className="flex items-center whitespace-nowrap">
                            <Settings2 size={14} className="mr-0.5 sm:mr-1 text-amber-500" strokeWidth={2} />
                            {displayTransmission(vehicle.transmission) }
                          </span>
                          <span title="Model" className="flex items-center whitespace-nowrap">
                            <Briefcase size={14} className="mr-0.5 sm:mr-1 text-amber-500" strokeWidth={2} />
                            {vehicle.model || 'N/A'}
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
          <p className="text-center text-gray-500 col-span-full py-20 text-lg">
            {activeFilter === 'All' && vehicles.length === 0 
              ? 'No vehicles currently in our fleet.'
              : `Sorry, no vehicles match your current selection.`}
          </p>
        )}
      </div>
    </div>
  );
};

export default VehicleFleet;