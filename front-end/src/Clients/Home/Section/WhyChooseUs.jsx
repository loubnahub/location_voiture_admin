import React from 'react';
import { motion } from 'framer-motion'; // Import Framer Motion

// --- Image Icon Components (Unchanged) ---
const EffortlessBookingIcon = ({ className }) => (
  <img src="/images/Icons/Bokking.png" alt="Effortless Booking Icon" className={className} />
);

const DiverseFleetIcon = ({ className }) => (
    <img src="/images/Icons/Car.png" alt="Diverse Fleet Icon" className={className} />
);

const SupportIcon = ({ className }) => (
  <img src="/images/Icons/24-7.png" alt="24/7 Support Icon" className={className} />
);


// --- Animation Variants ---

// Container for the entire section to orchestrate animations
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Stagger the header and the grid
    },
  },
};

// Animation for the header block (Title + Paragraph)
const headerVariants = {
  hidden: { y: -30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Container for the grid, used to stagger the cards inside
const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2, // Each card animates 0.2s after the previous
    },
  },
};

// Animation for each individual feature card
const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};


const featureData = [
  {
    Icon: EffortlessBookingIcon,
    title: "Effortless Booking",
    description: "User-friendly online reservations with instant confirmation.",
  },
  {
    Icon: DiverseFleetIcon,
    title: "Diverse Fleet",
    description: "A wide range of well-maintained vehicles to suit every preference.",
  },
  {
    Icon: SupportIcon,
    title: "24/7 Customer Support",
    description: "Our dedicated team is available around the clock to assist you with any inquiries or issues.",
  },
];

const WhyChooseUsSection = () => {
  return (
    // Main motion container that triggers animations on scroll
    <motion.div
      className="tw-bg-[#1B1B1B] tw-py-16 sm:tw-py-20 md:tw-py-24"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
        
        {/* Animated header section */}
        <motion.div
          className="tw-text-center tw-max-w-2xl tw-mx-auto tw-mb-12 md:tw-mb-16"
          variants={headerVariants}
        >
          <h2 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-bold tw-text-white tw-mb-4 tw-tracking-tight">
            Why Choose Us
          </h2>
          <p className="tw-text-base sm:tw-text-lg tw-text-white tw-leading-relaxed">
            Experience seamless car rentals tailored to your needs. We combine
            professionalism with personalized service to ensure your journey starts smoothly.
          </p>
        </motion.div>

        {/* Animated grid container for staggering cards */}
        <motion.div
          className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-x-8 tw-gap-y-12 md:tw-gap-y-10"
          variants={gridVariants}
        >
          {featureData.map((feature, index) => (
            // Each card is now a motion.div with its own animation
            <motion.div
              key={index}
              className="tw-text-center tw-flex tw-flex-col tw-items-center"
              variants={cardVariants}
            >
              <div className="tw-mb-5 sm:tw-mb-6">
                <div className="tw-w-28 tw-h-28 sm:tw-w-32 sm:tw-h-32  tw-p-[7px] sm:tw-p-[7px] tw-flex tw-items-center tw-justify-center ">
                  <div className="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center">
                    <feature.Icon className={`tw-w-20 tw-h-20 sm:tw-w-20 sm:tw-h-20 tw-object-contain`} />
                  </div>
                </div>
              </div>
              <h3 className="tw-text-lg sm:tw-text-xl tw-font-semibold tw-text-gray-100 tw-mb-2">
                {feature.title}
              </h3>
              <p className="tw-text-sm tw-text-gray-500 tw-leading-relaxed tw-px-2 sm:tw-px-0 tw-max-w-xs tw-mx-auto">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WhyChooseUsSection;