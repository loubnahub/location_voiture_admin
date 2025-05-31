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
    if (scrollContainerRef.current) {
      let scrollAmount = 0;
      const speed = 3; // Adjust scroll speed
      
      const scroll = () => {
        if (scrollContainerRef.current) {
          scrollAmount += speed;
          scrollContainerRef.current.scrollLeft = scrollAmount;
          
          // Reset scroll position when reaching the first set of logos
          if (scrollAmount >= scrollRef.current.offsetWidth) {
            scrollAmount = 0;
          }
          
          scrollAnimation.current = requestAnimationFrame(scroll);
        }
      };
      
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
    startScroll();
    
    return () => {
      stopScroll();
    };
  }, []);

  return (
    <div 
      className="w-full bg-[#222222] py-5 overflow-hidden"
      onMouseEnter={stopScroll}
      onMouseLeave={startScroll}
    >
      <div 
        ref={scrollContainerRef}
        className="overflow-x-scroll  scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div 
          ref={scrollRef}
          className="inline-flex space-x-16 px-8"
        >
          {extendedBrands.map((brand, index) => (
            <div key={index} className="w-28 h-28 flex items-center justify-center flex-shrink-0">
              <img 
                src={brand.logoUrl}
                alt={`${brand.name} logo`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partners;