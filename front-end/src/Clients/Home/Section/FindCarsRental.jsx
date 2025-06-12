import React from 'react';
import ExperienceBar from './ExperienceBar';

// Icons are not used in this specific snippet of the hero's top part,
// but keeping the import if you re-add the search bar section that might use them.
// import { MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const CarRentalHero = () => {
  return (
    // Added overflow-x-hidden to prevent horizontal scrollbars
    <div className="tw-min-h-screen tw-bg-[#1B1B1B] tw-text-white  tw-flex tw-flex-col tw-justify-between tw-overflow-x-hidden tw-py-10">
      {/* Top Section: Hero Content + Car Image */}
      <div className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-pt-12 sm:tw-pt-16 lg:tw-pt-20 tw-flex-grow">
        <div className="lg:tw-grid lg:tw-grid-cols-2 lg:tw-gap-8 tw-items-center">
          {/* Left Column: Text Content */}
          <div className="tw-mb-12 lg:tw-mb-0">
            <h1 className="tw-text-4xl sm:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-leading-tight">
              Find, book and <br />
              rent a car{' '}
              <span className="tw-relative tw-text-[#1572D3] tw-inline-block">
                <p>Easily</p>
                <img
                  src="/images/Vectors/BorderBlue.png" // Assuming image is in public/images/Vectors/
                  alt="" // Decorative image, alt can be empty
                  className="tw-absolute tw-left-0 tw-w-full tw-h-auto" // Position and scale underline
                />
               
              </span>
            </h1>
            <p className="tw-mt-6 tw-text-lg sm:tw-text-xl tw-text-gray-300 tw-max-w-lg">
              Get a car wherever and whenever you need it with your IOS and Android device.
            </p>
            <div className="tw-mt-8 tw-flex tw-flex-col sm:tw-flex-row sm:tw-space-x-4 tw-space-y-4 sm:tw-space-y-0">
              <a
                href="#" // Replace with your actual Google Play link
                className="tw-flex tw-items-center tw-justify-center sm:tw-justify-start"
                aria-label="Get it on Google Play"
              >
                <img
                  src="/images/Vectors/Googleplay.png"
                  alt="Google Play"
                  className="tw-h-10 tw-mr-3"
                />
              </a>
              <a
                href="#" // Replace with your actual App Store link
                className="tw-rounded-lg tw-flex tw-items-center tw-justify-center sm:tw-justify-start"
                aria-label="Download on the App Store"
              >
                <img
                  src="/images/Vectors/Appstore.png"
                  alt="App Store" // Added alt text for App Store image
                  className="tw-h-10 tw-mr-3"
                />
              </a>
            </div>
          </div>

          {/* Right Column: Car Image */}
          <div className="tw-relative tw-mt-10 lg:tw-mt-0">
            <img
              src="/images/Cars/Aston.png" // Assuming image is in public/images/Cars/
              alt="Aston Martin car"
              className="
                tw-w-full tw-h-auto tw-object-contain
                lg:tw-scale-125 xl:tw-scale-140
                lg:tw-translate-x-10 xl:tw-translate-x-16
                tw-origin-left
              "
            />
          </div>
        </div>
      </div>
      <ExperienceBar />
    </div>
  );
};

export default CarRentalHero;