import React, { useEffect, useRef } from 'react';

const Partners = () => {
  const brands = [
    {
      name: "Maserati",
      logoUrl: "images/Logo/maserati.png"
    },
    {
      name: "jeep",
      logoUrl: "/images/Logo/jeep.png"
    },
    {
      name: "bentley",
      logoUrl: "/images/Logo/bentley.png"
    },
    {
      name: "porsche",
      logoUrl: "/images/Logo/porsche.png"
    },
    {
      name: "bmw",
      logoUrl: "/images/Logo/bmw.png"
    },
    {
      name: "Ferrari",
      logoUrl: "/images/Logo/ferrari.png"
    },
    {
      name: "Lamborghini",
      logoUrl: "/images/Logo/Lamborghini.png"
    }
  ];

  // Create a duplicate array to give a seamless continuous scrolling effect
  const extendedBrands = [...brands, ...brands];
  
  const scrollRef = useRef(null);
  const scrollContainerRef = useRef(null);
  let scrollAnimation = useRef(null);
  
  const startScroll = () => {
    if (scrollContainerRef.current && scrollRef.current) { // Added check for scrollRef.current
      let scrollAmount = scrollContainerRef.current.scrollLeft; // Start from current position
      const speed = 1; // Adjusted scroll speed (pixels per frame)
      
      const scroll = () => {
        if (scrollContainerRef.current && scrollRef.current) { // Ensure refs are still valid
          scrollAmount += speed;
          
          // Reset scroll position when reaching the end of the first set of logos
          // scrollRef.current.offsetWidth should be the width of ONE set of logos
          // For this to work perfectly, scrollRef should ideally wrap only the first set.
          // However, with the current structure where scrollRef wraps extendedBrands,
          // this logic needs to be based on half the total width if extendedBrands is exactly 2x brands.
          const singleSetWidth = scrollRef.current.scrollWidth / 2; 

          if (scrollAmount >= singleSetWidth) {
            scrollAmount -= singleSetWidth; // Jump back by the width of one set
          }
          scrollContainerRef.current.scrollLeft = scrollAmount;
          
          scrollAnimation.current = requestAnimationFrame(scroll);
        }
      };
      
      // Clear any existing animation frame before starting a new one
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
  
  useEffect(() => {
    // Ensure the content is wide enough to scroll before starting
    if (scrollContainerRef.current && scrollRef.current && scrollRef.current.scrollWidth > scrollContainerRef.current.offsetWidth) {
      startScroll();
    }
    
    return () => {
      stopScroll();
    };
  }, [extendedBrands]); // Re-run if extendedBrands changes (though it's static here)

  return (
    <div 
      className="tw-w-full tw-bg-[#222222] tw-py-5 tw-overflow-hidden"
      onMouseEnter={stopScroll}
      onMouseLeave={startScroll}
    >
      <div 
        ref={scrollContainerRef}
        className="tw-overflow-x-auto tw-whitespace-nowrap tw-scrollbar-hide" // Use -auto for conditional scroll, whitespace-nowrap for inline-flex behavior
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Keep these for browsers not supporting scrollbar-hide
      >
        <div 
          ref={scrollRef}
          className="tw-inline-flex tw-space-x-16 tw-px-8" // px-8 adds padding inside the scrollable area
        >
          {extendedBrands.map((brand, index) => (
            <div key={index} className="tw-w-28 tw-h-28 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0">
              <img 
                src={brand.logoUrl}
                alt={`${brand.name} logo`}
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