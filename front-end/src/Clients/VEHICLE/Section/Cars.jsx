// src/components/CarCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Settings2, ShoppingBag, ArrowRight } from 'lucide-react';

// Define a default image in case the provided imageUrl is invalid or missing
const DEFAULT_FALLBACK_IMAGE = '/images/Cars/PlaceholderCar.png'; // Make sure this image exists

const CarCard = ({ vehicle }) => {
  // Destructure with defaults to prevent errors if vehicle or its properties are undefined
  const {
    id = 'unknown-id',
    name = 'Unnamed Vehicle',
    type = 'General',
    price = 0,
    imageUrl, // This will come from the vehicle prop
    specs = {}
  } = vehicle || {}; // Provide a default empty object for vehicle if it's null/undefined

  const {
    passengers = 0,
    settingValue = 'N/A', // For transmission
    luggage = 0,
    // checkValue is not used in this card version, but you could add it if needed
  } = specs;

  const displayTransmission = (transmissionString) => {
    if (typeof transmissionString === 'string' && transmissionString.toLowerCase() === 'automatic') {
      return 'Auto';
    }
    return transmissionString || 'N/A';
  };

  const effectiveImageUrl = imageUrl || DEFAULT_FALLBACK_IMAGE;

  return (
    <div
      className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl group bg-[#1B1B1B] border border-transparent hover:border-neutral-700 aspect-[4/5] transition-all duration-300"
      data-testid={`car-card-${id}`} // Good for testing
    >
      <img
        src={effectiveImageUrl}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          // Prevent infinite loop if fallback also fails
          if (e.target.src !== DEFAULT_FALLBACK_IMAGE) {
            e.target.onerror = null; // Stop further error triggers on this element
            e.target.src = DEFAULT_FALLBACK_IMAGE;
          }
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-3.5 pt-12 pb-3 sm:pb-3.5 bg-gradient-to-t from-black/90 via-black/75 to-transparent rounded-b-xl sm:rounded-b-2xl">
        <div className="flex items-end justify-start w-full gap-x-2.5 sm:gap-x-3.5">
          <Link
            to={`/booking/${id}`} // Use dynamic ID for booking link
            className="group/pricebtn flex-shrink-0"
            aria-label={`View details for ${name}`}
          >
            <div
              role="button"
              tabIndex={-1}
              className="bg-zinc-900/80 border-[1.5px] sm:border-2 border-[#FFA500] 
                         w-14 h-14 sm:w-[60px] sm:h-[60px] 
                         rounded-full flex flex-col items-center justify-center text-center shadow-lg
                         relative z-10 overflow-hidden transition-all duration-300 
                         hover:bg-[#FFA500]/10 cursor-pointer"
            >
              <div className="transition-all duration-300 group-hover/pricebtn:translate-x-[-35px] sm:group-hover/pricebtn:translate-x-[-45px] group-hover/pricebtn:opacity-0">
                <span className="font-bold text-[#FFA500] text-xs sm:text-sm leading-none">
                  ${price ? price.toFixed(2) : '0.00'}
                </span>
                <span className="text-[#FFA500] text-[7px] sm:text-[8px] uppercase leading-none pt-0.5">
                  /DAY
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 
                              transition-all duration-300 transform translate-x-7 sm:translate-x-9 
                              group-hover/pricebtn:opacity-100 group-hover/pricebtn:translate-x-0">
                <ArrowRight size={18} className="text-[#FFA500]" strokeWidth={2.5} />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-[#FFA500]
                              opacity-0 scale-90 transition-all duration-300
                              group-hover/pricebtn:opacity-100 group-hover/pricebtn:scale-110 -z-10"></div>
            </div>
          </Link>
          
          <div className='space-y-0.5 flex-grow min-w-0'>
            <h3 className="text-white w-full font-semibold text-sm sm:text-base md:text-md truncate" title={name}>
              {name}
            </h3>
            <p className="text-xs text-gray-400 mb-1 truncate" title={`Type: ${type}`}>
              {type}
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[#A0A0A0] text-[10px] sm:text-[11px] min-w-0">
              <span title={`${passengers} Passengers`} className="flex items-center whitespace-nowrap">
                <Users size={16} className="mr-1 text-[#FFA500]" strokeWidth={2} />
                {passengers}
              </span>
              <span title={`Transmission: ${settingValue}`} className="flex items-center whitespace-nowrap">
                <Settings2 size={16} className="mr-1 text-[#FFA500]" strokeWidth={2} />
                {displayTransmission(settingValue)}
              </span>
              <span title={`${luggage} Luggage Bags`} className="flex items-center whitespace-nowrap">
                <ShoppingBag size={16} className="mr-1 text-[#FFA500]" strokeWidth={2} />
                {luggage}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;