import React from 'react';
import Header from '../../Header/Nav'; // Ensure this path is correct

const NotFoundSection = () => { // Corrected component name from NotFounSection to NotFoundSection
  // IMPORTANT: Replace this with your actual hero image for services
  const heroBackgroundImage = '/images/Cars/NotFound.jpg'; // Ensure this path is correct in your public folder

  return (
    <div className="tw-bg-[#1B1B1B] tw-min-h-screen tw-text-white">

      
      <div
        className="tw-relative tw-h-[100vh] sm:tw-h-[60vh] md:tw-h-96 lg:tw-h-[550px] tw-flex tw-items-center tw-justify-start tw-bg-cover tw-bg-center tw-bg-fixed" // Added tw-bg-fixed
        style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      >
        <div className="tw-absolute tw-inset-0 tw-bg-black tw-opacity-40"></div> {/* Dark overlay */}
        <div className="tw-relative tw-z-10 tw-text-left tw-px-8 md:tw-px-16 tw-max-w-4xl">
          <p className="tw-text-amber-400 tw-uppercase tw-tracking-wider tw-text-sm tw-font-semibold tw-mb-2 sm:tw-mb-3">
            404 PAGE {/* Corrected spacing for readability */}
          </p>
          <h1 className="tw-text-3xl sm:tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-leading-tight">
            Page <span className="tw-text-amber-400">Not Found</span>
          </h1>
        </div>
      </div>

      {/* Additional content for the 404 page */}
      <div className="tw-py-16 tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-text-center">
        <h2 className="tw-text-2xl sm:tw-text-3xl tw-font-semibold tw-mb-4 tw-text-gray-200">
          Oops! It seems you've taken a wrong turn.
        </h2>
        <p className="tw-text-gray-400 tw-mb-8 tw-max-w-lg tw-mx-auto">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <a // Changed from Link to a simple anchor for demonstration, use Link from react-router-dom for SPA navigation
          href="/home" 
          className="tw-inline-block tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-white tw-font-semibold tw-py-3 tw-px-8 tw-rounded-lg tw-transition-colors tw-duration-300 tw-text-lg"
        >
          Go to Homepage
        </a>
      </div>
     
    </div>
  );
};

export default NotFoundSection; // Corrected component name export