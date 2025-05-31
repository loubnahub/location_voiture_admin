import React from 'react';

// Dummy data for the steps - replace with your actual data
const stepsData = [
  {
    title: "Choose Your Car",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim"
  },
  {
    title: "Pick Your Dates",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim"
  },
  {
    title: "Book Online",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim"
  },
  {
    title: "Pick Up Your Car",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim"
  },
  {
    title: "Return the Car",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim"
  },
];

// Replace with your actual Jeep image URL
const jeepImageUrl = "/images/Cars/Howitsworks.png";
// A slightly different Jeep image that might match the angle better if you have one from the prompt.
// const jeepImageUrlFromPromptLike = "https://images.unsplash.com/photo-1617094544983-120006093058?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdyYXklMjBqZWVwJTIwd3JhbmdsZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1200&q=80";


const HowItWorksSection = () => {
  return (
    <div className="bg-[#1B1B1B] text-white py-16 sm:py-20 md:py-24 overflow-x-hidden"> {/* Key: overflow-x-hidden to prevent horizontal scroll */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className='w-1/2 m-auto'>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center ">
              How its works
            </h2>
            <p className="text-howitworks-subtext mb-10 text-center  text-base sm:text-lg leading-relaxed  mx-auto lg:mx-0">
              Renting a luxury car has never been easier. Our streamlined process makes it simple for you to book and confirm your vehicle of choice online.
            </p>
        </div>
        <div className="flex flex-col lg:flex-row items-center lg:gap-x-16 xl:gap-x-24">
          
          {/* Image Column - Designed for overflow effect */}
          <div className="lg:w-1/2 w-full  lg:mb-0 relative"> {/* Parent relative if needed for absolute positioning inside */}
            <img
              src={jeepImageUrl}
              alt="Luxury Jeep rental process"
              className="w-full  mx-auto lg:max-w-none lg:w-[100%] xl:w-[115%] 
                         lg:-ml-12 xl:-ml-10 2xl:-ml-20 
                          object-cover"
              // w-[120%] makes image wider than its column
              // -ml-* pulls the oversized image to the left, creating the overflow effect
              // object-cover ensures the image covers the area without distortion if height is constrained
            />
          </div>

          {/* Text Content Column */}
          <div className="lg:w-1/2 w-full">
            
            <ul className="space-y-6">
              {stepsData.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span 
                    className="flex-shrink-0 w-2.5 h-2.5 bg-blue-200 rounded-full mt-[7px] mr-3 sm:mr-4" 
                    aria-hidden="true"
                  ></span>
                  <div>
                    <h3 className="font-semibold text-md sm:text-lg text-howitworks-list-title">{step.title}</h3>
                    <p className="text-howitworks-subtext text-sm mt-1 w-10/12 leading-relaxed">{step.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;