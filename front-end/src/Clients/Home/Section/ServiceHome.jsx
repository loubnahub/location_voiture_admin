// src/components/OurServiceSection.jsx

import React from 'react';
import { motion } from 'framer-motion'; // Import Framer Motion
import { LayoutGrid, Laptop, ShieldCheck, Clock } from 'lucide-react';

const carImageUrl = '/images/Cars/carourservices.png';

// --- Animation Variants ---

// This container will trigger the animations when it comes into view.
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger the title, list, and image
    },
  },
};

// Animation for the "Our Service" title
const titleVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// This container will stagger the animation of each service item.
const serviceListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // A slight delay between each service item
      delayChildren: 0.2,    // Wait for the title animation to start
    },
  },
};

// Animation for each individual service item (slide in from the left).
const serviceItemVariants = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Animation for the car image (slide in from the right).
const carImageVariants = {
  hidden: { x: 100, opacity: 0, scale: 0.9 },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};


const OurServiceSection = () => {
  
    const services = [
      {
        icon: <LayoutGrid size={24} className="tw-text-white" />,
        title: 'Formules de location flexibles',
        description: 'Choisissez une location à la journée, à la semaine ou au mois selon vos besoins et votre budget.',
      },
      {
        icon: <Laptop size={24} className="tw-text-white" />,
        title: 'Réservation en ligne facile',
        description: 'Réservez votre véhicule rapidement via notre site web ou application intuitive.',
      },
      {
        icon: <ShieldCheck size={24} className="tw-text-white" />,
        title: 'Véhicules entièrement assurés',
        description: 'Roulez en toute sécurité grâce à nos véhicules couverts par une assurance complète.',
      },
      {
        icon: <Clock size={24} className="tw-text-white" />,
        title: 'Support client 24h/24',
        description: 'Notre équipe est disponible à tout moment pour répondre à vos questions et vous accompagner.',
      },
    ];

  return (
    // This motion.div will trigger animations when it enters the viewport
    <motion.div
      className="tw-bg-[#1B1B1B] tw-text-white tw-overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      // `viewport` settings ensure the animation runs once when 20% of the section is visible
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="tw-mx-auto tw-py-12 sm:tw-py-10 tw-px-4 sm:tw-px-12 lg:tw-px-8">
        <motion.h2
          className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-bold tw-text-center md:tw-text-left tw-mb-10 md:tw-mb-12"
          variants={titleVariants}
        >
          Our Service
        </motion.h2>

        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-10 md:tw-gap-12 lg:tw-gap-16 tw-items-center">
          
          {/* Left Column: Services List - The container orchestrates the stagger */}
          <motion.div
            className="tw-space-y-6 sm:tw-space-y-8 tw-order-2 md:tw-order-1"
            variants={serviceListVariants}
          >
            {services.map((service, index) => (
              // Each item gets its own animation variant
              <motion.div
                key={index}
                className="tw-flex tw-items-start tw-space-x-4"
                variants={serviceItemVariants}
              >
                <div className="tw-flex-shrink-0 tw-bg-gray-700/60 tw-p-3 tw-rounded-full tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center">
                  {service.icon}
                </div>
                <div>
                  <h3 className="tw-text-lg sm:tw-text-xl tw-font-semibold tw-text-white tw-mb-1">
                    {service.title}
                  </h3>
                  <p className="tw-text-gray-300 tw-text-sm sm:tw-text-base tw-leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Column: Car Image - Changed to motion.div */}
          <motion.div
            className="tw-relative tw-order-1 md:tw-order-2 lg:-tw-mt-36"
            variants={carImageVariants}
          >
            <img
              src={carImageUrl}
              alt="Luxury Sports Car"
              className="tw-relative tw-z-10 tw-w-full tw-h-auto tw-max-w-md tw-mx-auto
                         md:tw-h-[850px] md:tw-max-w-none md:tw-w-auto md:mx-0
                         tw-drop-shadow-[0_20px_25px_rgba(0,0,0,0.3)]"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default OurServiceSection;