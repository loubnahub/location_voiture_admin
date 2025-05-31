import React from 'react';
import CarSearchSection from './Searsh';
// Icons are not used in this specific snippet of the hero's top part,
// but keeping the import if you re-add the search bar section that might use them.
// import { MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const CarRentalHero = () => {
  return (
    // Added overflow-x-hidden to prevent horizontal scrollbars
    <div className="min-h-screen bg-[#1B1B1B] text-white flex flex-col justify-between overflow-x-hidden py-10">
      {/* Top Section: Hero Content + Car Image */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 flex-grow">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Column: Text Content */}
          <div className="mb-12 lg:mb-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Find, book and <br />
              rent a car{' '}
              <span className="relative text-[#1572D3] inline-block">
                Easily
                {/* Using the image for the underline */}
                <img
                  src="/images/Vectors/BorderBlue.png" // Assuming image is in public/images/Vectors/
                  alt="" // Decorative image, alt can be empty
                  className="absolute left-0 w-full   h-auto" // Position and scale underline
                />
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-lg">
            Get a car wherever and whenever you need it with your IOS and Android device.         
               </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <a
                href="#" // Replace with your actual Google Play link
                className="flex items-center justify-center sm:justify-start"
                aria-label="Get it on Google Play"
              >
                <img
                  src="/images/Vectors/Googleplay.png"
                  alt="Google Play"
                  className="h-10 mr-3"
                />
              </a>
              <a
                href="#" // Replace with your actual App Store link
                className="   rounded-lg flex items-center justify-center sm:justify-start"
                aria-label="Download on the App Store"
              >
                <img
                  src="/images/Vectors/Appstore.png"
                  className="h-10 mr-3 "
                />
              </a>
            </div>
          </div>

          {/* Right Column: Car Image */}
          <div className="relative mt-10 lg:mt-0">
            <img
              src="/images/Cars/Aston.png" // Assuming image is in public/images/Cars/
              alt="Aston Martin car"
              className="
                w-full h-auto object-contain 
                lg:scale-125 xl:scale-140     
                lg:translate-x-10 xl:translate-x-16   
                origin-left                    
              "
            />
          </div>
        </div>
      </div>
      <CarSearchSection />
    </div>
  );
};

export default CarRentalHero;