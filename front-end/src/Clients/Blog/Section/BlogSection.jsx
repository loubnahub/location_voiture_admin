import React from 'react';
import Header from '../../Header/Nav'; // Ensure this path is correct

const BlogSection = () => {
  // Background image for the section
  const heroBackgroundImage = '/images/Cars/Bmw.jpg'; // Ensure this path is correct in your public folder

  return (
    <div className="tw-bg-[#1B1B1B] tw-min-h-screen tw-text-white">
      {/* Assuming Header is already mobile-friendly */}
      <Header />
      
      <div
        // --- UPDATED CLASSES ---
        // 1. Justify-center for mobile, justify-start for larger screens.
        // 2. Disabled fixed background on mobile for better performance, enabled on medium screens and up.
        className="tw-relative tw-h-[50vh] sm:tw-h-[60vh] md:tw-h-96 lg:tw-h-[690px] tw-flex tw-items-center tw-justify-center sm:tw-justify-start tw-bg-cover tw-bg-center md:tw-bg-fixed"
        style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      >
        <div className="tw-absolute tw-inset-0 tw-bg-black tw-opacity-40"></div> {/* Dark overlay */}
        
        {/* --- UPDATED CLASSES --- */}
        {/* 1. Text-center for mobile, text-left for larger screens. */}
        {/* 2. Adjusted padding for a better mobile layout. */}
        <div className="tw-relative tw-z-10 tw-text-center sm:tw-text-left tw-px-4 sm:tw-px-8 md:tw-px-16 tw-max-w-4xl">
          <p className="tw-text-amber-400 tw-uppercase tw-tracking-wider tw-text-sm tw-font-semibold tw-mb-2 sm:tw-mb-3">
            BLOG & NEWS
          </p>
          <h1 className="tw-text-3xl sm:tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-leading-tight">
            Latest <span className="tw-text-amber-400">News</span>
          </h1>
        </div>
      </div>

      {/* The rest of your blog content would go here */}
     
    </div>
  );
};

export default BlogSection;