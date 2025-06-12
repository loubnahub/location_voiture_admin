// src/components/ProfielSection.js

import React from 'react';

// You can name this component whatever you like, e.g., ProfileHero, ProfileHeader
const ProfielSection = () => {
  // Path to your hero image
  const heroBackgroundImage = '/images/Cars/NotFound.jpg';

  return (
    // The main container div
    <div className="tw-bg-brand-bg tw-min-h-screen tw-text-white">
      
      {/* The hero section with the background image */}
      <div
        className="tw-relative tw-h-[50vh] sm:tw-h-[60vh] md:tw-h-96 lg:tw-h-[550px] tw-flex tw-items-center tw-justify-start tw-bg-cover tw-bg-center"
        style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      >
        {/* Dark overlay for better text readability */}
        <div className="tw-absolute tw-inset-0 tw-bg-black tw-opacity-40"></div>
        
        {/* The content on top of the hero section */}
        <div className="tw-relative tw-z-10 tw-text-left tw-px-8 md:tw-px-16 tw-max-w-4xl">
          <p className="tw-text-brand-amber tw-uppercase tw-tracking-wider tw-text-sm tw-font-semibold tw-mb-2 sm:tw-mb-3">
            P R O F I L E
          </p>
          <h1 className="tw-text-3xl sm:tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-leading-tight">
             <span className="tw-text-brand-amber">Profile</span> Page
          </h1>
        </div>
      </div>

      {/* You can add the rest of your page content here */}
      <div className="tw-p-8">
        {/* Other profile sections go here */}
      </div>
    </div>
  );
};

export default ProfielSection;