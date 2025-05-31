// src/pages/VehicleFleet.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Settings2, Briefcase, UserCheck, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchAllVehicleModels, fetchAllVehicleTypes } from '../../../services/api'; // Assuming this path is correct

const DEFAULT_IMAGE_URL = '/images/Cars/bentley.jpg'; // Use if vehicle image is missing
const ITEMS_PER_PAGE_INCREMENT = 8;

const VehicleFleet = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [displayedItemsCount, setDisplayedItemsCount] = useState(ITEMS_PER_PAGE_INCREMENT);

  // State for ALL vehicles fetched from the API
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [errorVehicles, setErrorVehicles] = useState(null);

  // State for vehicle types (for filters)
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errorTypes, setErrorTypes] = useState(null);

  // --- Fetch Vehicle Types ---
  useEffect(() => {
    const loadVehicleTypes = async () => {
      try {
        setLoadingTypes(true);
        setErrorTypes(null);
        const response = await fetchAllVehicleTypes();
        const typesData = response.data?.data || response.data || []; // Handle potential nesting
        if (!Array.isArray(typesData)) {
          console.error("VehicleFleet: Vehicle types data is not an array. Response:", response);
          throw new Error("Vehicle types data format is invalid.");
        }
        setVehicleTypes(typesData);
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

  // --- Fetch All Vehicles ---
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoadingVehicles(true);
        setErrorVehicles(null);
        const response = await fetchAllVehicleModels(); // Using your service function
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

        const validVehicles = vehiclesData.filter(v => v && typeof v.id !== 'undefined');
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

  // Reset displayedItemsCount when filter changes
  useEffect(() => {
    setDisplayedItemsCount(ITEMS_PER_PAGE_INCREMENT);
  }, [activeFilter]);

  const dynamicFilters = useMemo(() => {
    const baseFilters = [{ label: 'All', value: 'All' }];
    if (loadingTypes || errorTypes || !Array.isArray(vehicleTypes) || vehicleTypes.length === 0) {
      return baseFilters;
    }
    const filtersFromApi = vehicleTypes
      .filter(type => type && type.name) 
      .map(type => ({
        label: type.name,
        value: type.name, 
      }));
    return [...baseFilters, ...filtersFromApi];
  }, [vehicleTypes, loadingTypes, errorTypes]);

  const filteredVehicles = useMemo(() => {
    if (loadingVehicles) return []; 
    if (activeFilter === 'All') {
      return vehicles;
    }
    return vehicles.filter(vehicle => vehicle.type_name === activeFilter || vehicle.type?.name === activeFilter || vehicle.type === activeFilter);
  }, [activeFilter, vehicles, loadingVehicles]);

  const displayedVehicles = useMemo(() => {
    return filteredVehicles.slice(0, displayedItemsCount);
  }, [filteredVehicles, displayedItemsCount]);

  const handleLoadMore = () => {
    setDisplayedItemsCount(prevCount => prevCount + ITEMS_PER_PAGE_INCREMENT);
  };

  const displayTransmission = (transmission) => {
    if (typeof transmission === 'string') {
        if (transmission.toLowerCase() === 'automatic') return 'Auto';
        if (transmission.toLowerCase() === 'manual') return 'Manual';
        return transmission.charAt(0).toUpperCase() + transmission.slice(1);
    }
    return transmission || 'N/A';
  };

  const renderLoadingIndicator = (text = "Loading...") => (
    <div className="flex items-center justify-center text-gray-400 py-10 col-span-full">
      <Loader2 size={24} className="animate-spin mr-2" />
      <span>{text}</span>
    </div>
  );

  const renderErrorIndicator = (errorMsg, context = "") => (
    <div className="flex flex-col items-center justify-center text-red-400 py-10 col-span-full">
      <AlertTriangle size={48} className="mb-4" />
      <p className="text-xl font-semibold">Failed to load {context || "data"}</p>
      <p className="text-sm">{typeof errorMsg === 'string' ? errorMsg : "An unknown error occurred."}</p>
    </div>
  );

  if (loadingTypes || loadingVehicles) {
    return (
      <div className="bg-[#1B1B1B] text-white py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          {renderLoadingIndicator("Initializing fleet page...")}
        </div>
      </div>
    );
  }

  if (errorTypes) {
    return (
      <div className="bg-[#1B1B1B] text-white py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          {renderErrorIndicator(errorTypes, "vehicle types")}
        </div>
      </div>
    );
  }
  if (errorVehicles && !loadingVehicles) {
    return (
      <div className="bg-[#1B1B1B] text-white py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          {renderErrorIndicator(errorVehicles, "vehicles")}
        </div>
      </div>
    );
  }


  return (
    <div className="bg-[#1B1B1B] text-white py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-left">
            Our Vehicle Fleet
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-10 sm:mb-12 min-h-[40px]">
          {!loadingTypes && !errorTypes && dynamicFilters.length > 1 && dynamicFilters.map(filter => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-md text-sm sm:text-base font-medium transition-colors duration-200
                ${activeFilter === filter.value
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600 hover:text-white'
                }`}
            >
              {filter.label}
            </button>
          ))}
          {!loadingTypes && !errorTypes && vehicleTypes.length === 0 && dynamicFilters.length <= 1 && (
             <p className="text-gray-400">No specific vehicle types available for filtering.</p>
          )}
        </div>

        {displayedVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {displayedVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl group
                           bg-zinc-800 border border-zinc-700/50 aspect-[4/5]" // MODIFIED HERE: aspect-square to aspect-[4/5]
              >
                  <img
                    src={vehicle.image_url || vehicle.imageUrl || vehicle.image || DEFAULT_IMAGE_URL}
                    alt={vehicle.name || 'Vehicle image'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 -z-0" 
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE_URL; }}
                  />
                
                <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-3 sm:p-4 
                                bg-gradient-to-t from-black/90 via-black/75 bg-transparent z-10">
                  <div className="flex items-end justify-start w-full gap-x-3 sm:gap-x-4">
                    <Link to={`/booking/${vehicle.id}`} className="group/pricebtn flex-shrink-0" aria-label={`Book ${vehicle.name}`}>
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
                      <p className="text-white w-full font-bold text-sm sm:text-base md:text-lg truncate" title={vehicle.name || vehicle.brand}>
                        {vehicle.name || vehicle.brand || 'Unnamed Vehicle'}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 text-amber-400 text-[10px] sm:text-xs min-w-0">
                        <span title="Passengers" className="flex items-center whitespace-nowrap">
                          <Users size={14} className="mr-0.5 sm:mr-1 text-amber-500" strokeWidth={2} />
                          {vehicle.number_of_doors || '4'}
                        </span>
                        <span title="Transmission" className="flex items-center whitespace-nowrap">
                          <Settings2 size={14} className="mr-0.5 sm:mr-1 text-amber-500" strokeWidth={2} />
                          {vehicle.transmission || 'Automatic'}
                        </span>
                        <span title="Luggage Capacity" className="flex items-center whitespace-nowrap">
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
        ) : (
          !loadingVehicles && !errorVehicles && displayedVehicles.length === 0 && (
            <p className="text-center text-gray-400 col-span-full py-10">
              {vehicles.length === 0 && activeFilter === 'All'
                ? 'No vehicles available at the moment.'
                : `No vehicles found for the "${activeFilter}" filter.`}
            </p>
          )
        )}

        
      </div>
    </div>
  );
};

export default VehicleFleet;