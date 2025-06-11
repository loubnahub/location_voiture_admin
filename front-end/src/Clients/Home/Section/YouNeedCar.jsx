import React from 'react';
import { Car, Shield, Clock } from 'lucide-react'; // Assuming lucide-react is installed

const YouNeedCar = () => {
  const features = [
    {
      icon: <Car size={22} className="tw-text-white" />, // Icon size can also be responsive if needed: sm:size={24} etc.
      title: 'Over 500 Cars Available',
      description: 'Choose from economy, premium, or luxury models all well-maintained and ready to go.',
    },
    {
      icon: <Shield size={22} className="tw-text-white" />,
      title: 'Trusted by Thousands',
      description: 'Our reputation is built on reliability, customer satisfaction, and honest service.',
    },
    {
      icon: <Clock size={22} className="tw-text-white" />,
      title: 'Drive Away in Minutes',
      description: 'Quick approval, easy pickup, and 24/7 support make your rental experience stress-free.',
    },
  ];

  return (
    <div className="tw-bg-[#1b1b1b] tw-text-white tw-py-12 md:tw-py-20 lg:tw-py-24 "> {/* Main section background and vertical padding */}
      <div className="tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-w-[95%]"> {/* Centered container with padding */}
        
        <div className="tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-gap-10 ">
          {/* Image Section */}
          {/* Note: lg:w-4/3 is an unusual Tailwind width, ensure it's intended or a custom utility. */}
          {/* If it was a typo for e.g. lg:w-3/4 or lg:w-2/3, the visual might differ from expectation. */}
          <div className="lg:tw-w-4/3 tw-w-full tw-order-2 lg:tw-order-1"> {/* Image takes width on large screens, full on small. Order changes on lg. */}
            <img
              src="/images/Cars/Needcars.png" // Corrected path for public folder
              alt="Selection of available rental cars"
              // Note: 'bg-rd' is not a standard Tailwind class. If it's custom, prefixing is fine. If a typo, it won't apply.
              className="tw-w-full tw-h-auto tw-object-contain tw-bg-rd tw-max-h-[400px] sm:tw-max-h-[500px] lg:tw-max-h-[800px] tw-mx-auto" // Responsive max height and centered
            />
          </div>
         
          {/* Features Section */}
          <div className="lg:tw-w-1/2 tw-w-full lg:tw--ml-52 lg:tw--mt-60 tw-space-y-8 sm:tw-space-y-10 md:tw-space-y-12 tw-order-1 lg:tw-order-2"> {/* Features take half width on large. Order changes on lg. */}
            {features.map((feature, index) => (
              <div key={index} className="tw-flex tw-items-start tw-space-x-4 sm:tw-space-x-5">
                <div className="tw-flex-shrink-0 tw-border-[#1572D3] tw-bg-[#1b1b1b] tw-border tw-p-2.5 sm:tw-p-3 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-w-11 tw-h-11 sm:tw-w-12 sm:tw-h-12 tw-shadow-md">
                  {/* Icon is passed as a component, no need to wrap it again unless for specific styling */}
                  {feature.icon}
                </div>
                <div>
                  <h3 className="tw-text-lg sm:tw-text-xl tw-font-semibold tw-text-[#1572D3] tw-mb-1 sm:tw-mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="tw-text-gray-300 tw-text-sm sm:tw-text-base tw-leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default YouNeedCar;