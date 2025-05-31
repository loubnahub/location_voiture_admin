import React from 'react';
import { Car, Shield, Clock } from 'lucide-react'; // Assuming lucide-react is installed

const YouNeedCar = () => {
  const features = [
    {
      icon: <Car size={22} className="text-white" />, // Icon size can also be responsive if needed: sm:size={24} etc.
      title: 'Over 500 Cars Available',
      description: 'Choose from economy, premium, or luxury models all well-maintained and ready to go.',
    },
    {
      icon: <Shield size={22} className="text-white" />,
      title: 'Trusted by Thousands',
      description: 'Our reputation is built on reliability, customer satisfaction, and honest service.',
    },
    {
      icon: <Clock size={22} className="text-white" />,
      title: 'Drive Away in Minutes',
      description: 'Quick approval, easy pickup, and 24/7 support make your rental experience stress-free.',
    },
  ];

  return (
    <div className="bg-[#1b1b1b] text-white py-12 md:py-20 lg:py-24"> {/* Main section background and vertical padding */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 w-[95%]"> {/* Centered container with padding */}
        
       

        <div className="flex flex-col lg:flex-row items-center gap-10 ">
          {/* Image Section */}
          <div className="lg:w-4/3 w-full order-2 lg:order-1"> {/* Image takes half width on large screens, full on small. Order changes on lg. */}
            <img
              src="/images/Cars/Needcars.png" // Corrected path for public folder
              alt="Selection of available rental cars"
              className="w-full h-auto object-contain bg-rd max-h-[400px] sm:max-h-[500px] lg:max-h-[800px] mx-auto" // Responsive max height and centered
            />
          </div>
         
          {/* Features Section */}
          <div className="lg:w-1/2 w-full  lg:-ml-52 lg:-mt-60 space-y-8 sm:space-y-10 md:space-y-12 order-1 lg:order-2"> {/* Features take half width on large. Order changes on lg. */}
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 sm:space-x-5">
                <div className="flex-shrink-0 border-[#1572D3] bg-[#1b1b1b] border p-2.5 sm:p-3 rounded-lg flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 shadow-md">
                  {/* Icon is passed as a component, no need to wrap it again unless for specific styling */}
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#1572D3] mb-1 sm:mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
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