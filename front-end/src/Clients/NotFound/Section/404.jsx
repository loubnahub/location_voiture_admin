import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router for navigation

const NotFound404 = () => {
  return (
    <div className=" bg-[#1B1B1B] flex flex-col items-center justify-center text-center  sm:p-6">
      {/* The large "404" text */}
      <h1
        className="text-custom-404 font-bold text-[#2B2B2B] leading-none tracking-tighter
                   text-[10rem] sm:text-14xl md:text-16xl lg:text-20xl
                   " // Negative margin to pull text up
        aria-hidden="true" // Decorative, screen readers will read the text below
      >
        404
      </h1>

      {/* Main error message */}
      <p className="text-2xl sm:text-3xl md:text-4xl text-white font-bold text-custom-sorry-text mt-4 z-10">
        Sorry, We Can't Find That Page!
      </p>

      {/* Explanatory sub-text */}
      <p className="text-base sm:text-lg text-custom-subtext text-[#959595] mt-3 max-w-sm sm:max-w-md md:max-w-lg z-10">
        The page you are looking for was moved, removed, renamed or never existed.
      </p>

      {/* Optional: Button to go back home */}
      <Link
        to="/home" // Link to your home page
        className="mt-8 px-6 py-3 bg-custom-orange text-white text-base font-semibold rounded-lg shadow-md 
                   hover:bg-[#1572D3] focus:outline-none focus:ring-2 focus:ring-custom-orange 
                   focus:ring-opacity-60 transition-colors duration-300 z-10"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound404;