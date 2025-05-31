import React from 'react';
import { LayoutGrid, Laptop, ShieldCheck, Clock } from 'lucide-react';
// Assuming the car image is in your public/images/Cars/ directory
const carImageUrl = '/images/Cars/carourservices.png'; 

const OurServiceSection = () => {
  const services = [
    {
      icon: <LayoutGrid size={24} className="text-white" />,
      title: 'Daily, Weekly & Monthly Rentals',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore e magna aliqua. Ut enim ad minim',
    },
    {
      icon: <Laptop size={24} className="text-white" />,
      title: 'Easy Online Booking',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore e magna aliqua. Ut enim ad minim',
    },
    {
      icon: <ShieldCheck size={24} className="text-white" />,
      title: 'Fully Insured Vehicles',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore e magna aliqua. Ut enim ad minim',
    },
    {
      icon: <Clock size={24} className="text-white" />,
      title: '24/7 Support',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore e magna aliqua. Ut enim ad minim',
    },
  ];

  return (
    <div className="bg-[#1B1B1B]  text-white  overflow-hidden">
      <div className=" mx-auto ">
        <h2 className="text-3xl pl-11 sm:text-4xl lg:text-5xl font-bold  text-center md:text-left">
          Our Service
        </h2>
        <div className="grid grid-cols-1 pl-10 pb-5 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center">
          {/* Left Column: Services List */}
          <div className="space-y-6 sm:space-y-8 order-2 md:order-1">
            {services.map((service, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-gray-700/60 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  {service.icon}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
                    {service.title}
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Car Image and Decorative Elements - Now with overflow */}
          <div className="relative  order-1 md:order-2 overflow-x">
            {/* This inner div allows content to be wider and establishes scrollable width */}
            <div className="relative "> {/* w-max makes it as wide as its content */}   
           
              <img
                src={carImageUrl}
                alt="Luxury Sports Car"
                className="relative z-10 h-[850px] max-w-none 
                  drop-shadow-[0_20px_25px_rgba(0,0,0,0.3)]"
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServiceSection;