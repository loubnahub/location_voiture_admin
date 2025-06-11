import React from 'react';
import Header from '../../Header/Nav'; // Ensure this path is correct

const ContactSection = () => {
  const heroBackgroundImage = '/images/Cars/ContactUs.jpg'; // Ensure this path is correct in your public folder

  return (
    <div className="tw-bg-[#1B1B1B] tw-min-h-screen tw-text-white">
      <Header />
      
      <div
        className="tw-relative tw-h-[50vh] sm:tw-h-[60vh] md:tw-h-96 lg:tw-h-[690px] tw-flex tw-items-center tw-justify-start tw-bg-cover tw-bg-center tw-bg-fixed" // Added tw-bg-fixed
        style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      >
        <div className="tw-absolute tw-inset-0 tw-bg-black tw-opacity-40"></div> {/* Dark overlay */}
        <div className="tw-relative tw-z-10 tw-text-left tw-px-8 md:tw-px-16 tw-max-w-4xl">
          <p className="tw-text-amber-400 tw-uppercase tw-tracking-wider tw-text-sm tw-font-semibold tw-mb-2 sm:tw-mb-3">
            GET IN TOUCH {/* Corrected spacing for readability, doesn't affect rendering */}
          </p>
          <h1 className="tw-text-3xl sm:tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-leading-tight">
            Contact <span className="tw-text-amber-400">Us</span>
          </h1>
        </div>
      </div>

     
    </div>
  );
};

export default ContactSection;