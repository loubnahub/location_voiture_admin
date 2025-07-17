import React, { useState, useEffect, useRef } from 'react';
import { fetchPublicPartners } from '../../../services/api'; // Ensure this path is correct for your project

const Partners = () => {
  // State to hold the partners fetched from the API
  const [partners, setPartners] = useState([]);
  
  // UseEffect to fetch data when the component mounts
  useEffect(() => {
    const getPartners = async () => {
      try {
        const response = await fetchPublicPartners();
        setPartners(response.data);
      } catch (error) {
        console.error("Failed to fetch partners:", error);
        // If the API fails, the component will just render nothing.
      }
    };
    getPartners();
  }, []); // The empty array ensures this effect runs only once

  // Create a duplicate array from the fetched data for the seamless scroll effect
  const extendedPartners = partners.length > 0 ? [...partners, ...partners] : [];
  
  // All refs and animation logic remain unchanged
  const scrollRef = useRef(null);
  const scrollContainerRef = useRef(null);
  let scrollAnimation = useRef(null);
  
  const startScroll = () => {
    if (scrollContainerRef.current && scrollRef.current) {
      let scrollAmount = scrollContainerRef.current.scrollLeft;
      const speed = 1;
      
      const scroll = () => {
        if (scrollContainerRef.current && scrollRef.current) {
          scrollAmount += speed;
          
          const singleSetWidth = scrollRef.current.scrollWidth / 2; 

          if (scrollAmount >= singleSetWidth) {
            scrollAmount -= singleSetWidth;
          }
          scrollContainerRef.current.scrollLeft = scrollAmount;
          
          scrollAnimation.current = requestAnimationFrame(scroll);
        }
      };
      
      if (scrollAnimation.current) {
        cancelAnimationFrame(scrollAnimation.current);
      }
      scrollAnimation.current = requestAnimationFrame(scroll);
    }
  };
  
  const stopScroll = () => {
    if (scrollAnimation.current) {
      cancelAnimationFrame(scrollAnimation.current);
      scrollAnimation.current = null;
    }
  };
  
  // This effect now depends on the dynamic 'extendedPartners' array
  useEffect(() => {
    // A slight delay to ensure the DOM has updated with the new partner logos
    const timer = setTimeout(() => {
        if (scrollContainerRef.current && scrollRef.current && scrollRef.current.scrollWidth > scrollContainerRef.current.offsetWidth) {
            startScroll();
        }
    }, 100); // 100ms delay
    
    return () => {
      clearTimeout(timer);
      stopScroll();
    };
  }, [extendedPartners]);

  // If there are no partners, don't render anything
  if (partners.length === 0) {
    return null;
  }

  return (
    <div 
      className="tw-w-full tw-bg-[#222222] tw-py-5 tw-overflow-hidden"
      onMouseEnter={stopScroll}
      onMouseLeave={startScroll}
    >
      <div 
        ref={scrollContainerRef}
        className="tw-overflow-x-auto tw-whitespace-nowrap tw-scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div 
          ref={scrollRef}
          className="tw-inline-flex tw-space-x-16 tw-px-8"
        >
          {/* Map over the dynamic 'extendedPartners' array */}
          {extendedPartners.map((partner, index) => (
            <div key={`${partner.id}-${index}`} className="tw-w-28 tw-h-28 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0">
              <img 
                // Use the 'logo_url' and 'name' from the API response
                src={partner.logo_url}
                alt={`${partner.name} logo`}
                className="tw-max-w-full tw-max-h-full tw-object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partners;