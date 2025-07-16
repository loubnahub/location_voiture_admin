// src/components/YouNeedCar.jsx (or wherever the file is located)
import React from 'react';
import { Car, Shield, Clock } from 'lucide-react';
// --- ANIMATION START ---
// 1. Import the 'motion' component from framer-motion
import { motion } from 'framer-motion';
// --- ANIMATION END ---

const YouNeedCar = () => {
  const features = [
    {
      icon: <Car size={22} className="tw-text-white" />,
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

  // --- ANIMATION START ---
  // 2. Define animation variants for different parts of the component.
  // This makes the animation logic clean and reusable.
  
  // Animation for the image: slide in from the left and fade in.
  const imageVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: 'easeOut' }
    },
  };

  // Parent container for features. It will orchestrate the stagger effect.
  const featuresContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Each child will animate 0.2s after the previous one
        delayChildren: 0.3,   // Wait 0.3s after the container starts animating before the children begin
      },
    },
  };

  // Animation for each individual feature item: slide in from the right and fade in.
  const featureItemVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
  };
  // --- ANIMATION END ---


  return (
    <div className="tw-bg-[#1b1b1b] tw-text-white tw-py-12 md:tw-py-20 lg:tw-py-24 tw-overflow-x-hidden"> {/* Added overflow-x-hidden to prevent horizontal scrollbars during animation */}
      <div className="tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-w-[95%]">
        
        {/* --- ANIMATION START --- */}
        {/* 3. Convert the main flex container to a motion.div. */}
        {/*    We use `whileInView` to trigger the animation when the component scrolls into view. */}
        <motion.div 
          className="tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // `once: true` ensures animation runs only once. `amount: 0.2` triggers when 20% is visible.
        >
          {/* Image Section */}
          {/* 4. Apply the image animation variants to the image's wrapper div. */}
          <motion.div 
            className="lg:tw-w-4/3 tw-w-full tw-order-2 lg:tw-order-1"
            variants={imageVariants}
          >
            <img
              src="/images/Cars/Needcars.png"
              alt="Selection of available rental cars"
              className="tw-w-full tw-h-auto tw-object-contain tw-bg-rd tw-max-h-[400px] sm:tw-max-h-[500px] lg:tw-max-h-[800px] tw-mx-auto"
            />
          </motion.div>
         
          {/* Features Section */}
          {/* 5. Apply the container variants to the features wrapper div. */}
          <motion.div 
            className="lg:tw-w-1/2 tw-w-full lg:tw--ml-52 lg:tw--mt-60 tw-space-y-8 sm:tw-space-y-10 md:tw-space-y-12 tw-order-1 lg:tw-order-2"
            variants={featuresContainerVariants}
          >
            {features.map((feature, index) => (
              // 6. Apply the item variants to each feature block inside the map.
              <motion.div 
                key={index} 
                className="tw-flex tw-items-start tw-space-x-4 sm:tw-space-x-5"
                variants={featureItemVariants}
              >
                <div className="tw-flex-shrink-0 tw-border-[#1572D3] tw-bg-[#1b1b1b] tw-border tw-p-2.5 sm:tw-p-3 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-w-11 tw-h-11 sm:tw-w-12 sm:tw-h-12 tw-shadow-md">
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
              </motion.div>
            ))}
          </motion.div>
        {/* --- ANIMATION END --- */}
        </motion.div>
      </div>
    </div>
  );
};

export default YouNeedCar;