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
    <div className="tw-bg-[#1B1B1B] tw-text-white tw-py-16 sm:tw-py-20 md:tw-py-24 tw-overflow-x-hidden"> {/* Key: overflow-x-hidden to prevent horizontal scroll */}
      <div className="tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
        <div className='tw-w-1/2 tw-m-auto'>
        <h2 className="tw-text-3xl sm:tw-text-4xl tw-font-bold tw-mb-4 tw-text-center ">
              How its works
            </h2>
            {/* Note: 'text-howitworks-subtext' and 'text-howitworks-list-title' are custom class names. */}
            {/* If these are defined in your global CSS or via Tailwind plugins, they will work. */}
            {/* If they are meant to be Tailwind utility classes, their names are not standard. */}
            {/* I am prefixing them assuming they are custom classes you want Tailwind to potentially process or ignore gracefully. */}
            <p className="tw-text-howitworks-subtext tw-mb-10 tw-text-center tw-text-base sm:tw-text-lg tw-leading-relaxed tw-mx-auto lg:tw-mx-0">
              Renting a luxury car has never been easier. Our streamlined process makes it simple for you to book and confirm your vehicle of choice online.
            </p>
        </div>
        <div className="tw-flex tw-flex-col lg:tw-flex-row tw-items-center lg:tw-gap-x-16 xl:tw-gap-x-24">
          
          {/* Image Column - Designed for overflow effect */}
          <div className="lg:tw-w-1/2 tw-w-full lg:tw-mb-0 tw-relative"> {/* Parent relative if needed for absolute positioning inside */}
            <img
              src={jeepImageUrl}
              alt="Luxury Jeep rental process"
              className="tw-w-full tw-mx-auto lg:tw-max-w-none lg:tw-w-[100%] xl:tw-w-[115%] 
                         lg:tw--ml-12 xl:tw--ml-10 2xl:tw--ml-20 
                         tw-object-cover"
              // w-[120%] makes image wider than its column
              // -ml-* pulls the oversized image to the left, creating the overflow effect
              // object-cover ensures the image covers the area without distortion if height is constrained
            />
          </div>

          {/* Text Content Column */}
          <div className="lg:tw-w-1/2 tw-w-full">
            
            <ul className="tw-space-y-6">
              {stepsData.map((step, index) => (
                <li key={index} className="tw-flex tw-items-start">
                  <span 
                    className="tw-flex-shrink-0 tw-w-2.5 tw-h-2.5 tw-bg-blue-200 tw-rounded-full tw-mt-[7px] tw-mr-3 sm:tw-mr-4" 
                    aria-hidden="true"
                  ></span>
                  <div>
                    <h3 className="tw-font-semibold tw-text-md sm:tw-text-lg tw-text-howitworks-list-title">{step.title}</h3>
                    <p className="tw-text-howitworks-subtext tw-text-sm tw-mt-1 tw-w-10/12 tw-leading-relaxed">{step.description}</p>
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