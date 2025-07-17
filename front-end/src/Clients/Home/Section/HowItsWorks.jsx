import React from 'react';
// --- ANIMATION START ---
// 1. Import the 'motion' component from framer-motion
import { motion } from 'framer-motion';
// --- ANIMATION END ---

// Dummy data for the steps - replace with your actual data
const stepsData = [
  {
    title: "Choose Your Car",
    description: "Browse our selection of vehicles and pick the one that suits your trip—compact, SUV, or luxury, we have it all."
  },
  {
    title: "Pick Your Dates",
    description: "Select the pickup and return dates that fit your schedule. Enjoy full flexibility with daily, weekly, or monthly rentals."
  },
  {
    title: "Book Online",
    description: "Reserve your vehicle in just a few clicks with our quick and secure online booking system."
  },
  {
    title: "Pick Up Your Car",
    description: "Head to your selected pickup location and drive away—your car will be clean, fueled, and ready to go."
  },
  {
    title: "Return the Car",
    description: "Drop off the car at the agreed location. It's simple, quick, and hassle-free."
  },
];


const jeepImageUrl = "/images/Cars/Howitsworks.png";

// --- ANIMATION START ---
// 2. Define animation variants for a clean, reusable animation logic.

// Animation for the image: slide in from the left and fade in.
const imageVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.05, 0.01, 0.9], // A nice easing curve
    },
  },
};

// A container variant to orchestrate the staggered animation of the list items.
const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Each list item will animate 0.2s after the previous one.
      delayChildren: 0.4,   // Wait 0.4s after the container starts animating before the children begin.
    },
  },
};

// Animation for each individual list item: slide in from the right and fade in.
const listItemVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};
// --- ANIMATION END ---


const HowItWorksSection = () => {
  return (
    <div className="tw-bg-[#1B1B1B] tw-text-white tw-py-16 sm:tw-py-20 md:tw-py-24 tw-overflow-x-hidden">
      <div className="tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
        <div className='tw-w-1/2 tw-m-auto'>
            <h2 className="tw-text-3xl sm:tw-text-4xl tw-font-bold tw-mb-4 tw-text-center ">
              How its works
            </h2>
            <p className="tw-text-howitworks-subtext tw-mb-10 tw-text-center tw-text-base sm:tw-text-lg tw-leading-relaxed tw-mx-auto lg:tw-mx-0">
              Renting a luxury car has never been easier. Our streamlined process makes it simple for you to book and confirm your vehicle of choice online.
            </p>
        </div>

        {/* --- ANIMATION START --- */}
        {/* 3. Convert the main flex container to a motion.div. */}
        {/*    This will trigger the animations for its children when it scrolls into view. */}
        <motion.div
          className="tw-flex tw-flex-col lg:tw-flex-row tw-items-center lg:tw-gap-x-16 xl:tw-gap-x-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }} // Animation triggers when 25% of the element is visible, and only runs once.
        >
          
          {/* 4. Convert the image's wrapper div to a motion.div and apply the imageVariants. */}
          <motion.div
            className="lg:tw-w-1/2 tw-w-full lg:tw-mb-0 tw-relative"
            variants={imageVariants}
          >
            <img
              src={jeepImageUrl}
              alt="Luxury Jeep rental process"
              className="tw-w-full tw-mx-auto lg:tw-max-w-none lg:tw-w-[100%] xl:tw-w-[115%] 
                         lg:tw--ml-12 xl:tw--ml-10 2xl:tw--ml-20 
                         tw-object-cover"
            />
          </motion.div>

          {/* Text Content Column */}
          {/* 5. Convert the text content's wrapper div to a motion.div. */}
          {/*    This will act as the container for the staggered list animation. */}
          <motion.div
            className="lg:tw-w-1/2 tw-w-full"
            variants={listContainerVariants}
          >
            
            <ul className="tw-space-y-6">
              {stepsData.map((step, index) => (
                <motion.li
                  key={index}
                  className="tw-flex tw-items-start"
                  variants={listItemVariants}
                >
                  <span 
                    className="tw-flex-shrink-0 tw-w-2.5 tw-h-2.5 tw-bg-blue-200 tw-rounded-full tw-mt-[7px] tw-mr-3 sm:tw-mr-4" 
                    aria-hidden="true"
                  ></span>
                  <div>
                    <h3 className="tw-font-semibold tw-text-md sm:tw-text-lg tw-text-howitworks-list-title">{step.title}</h3>
                    <p className="tw-text-howitworks-subtext tw-text-sm tw-mt-1 tw-w-10/12 tw-leading-relaxed">{step.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default  HowItWorksSection