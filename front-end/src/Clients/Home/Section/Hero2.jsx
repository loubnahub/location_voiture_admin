// src/components/HeroSection2.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../Header/Nav'; // Ensure this path is correct for your project
import ExperienceBar from './ExperienceBar'; // Ensure this path is correct for your project
import { fetchAgencyInfo } from '../../../services/api'; // Ensure this path is correct for your project

// --- Animation Variants Definition (Unchanged) ---
const contentContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.5,
      staggerChildren: 0.3,
    },
  },
};

const itemSlideUpVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const sidebarVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 1, delay: 1.2, ease: 'circOut' },
  },
};

const footerVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, delay: 1.5, ease: 'easeOut' },
  },
};

const HeroSection2 = () => {
    // --- STATE FOR DYNAMIC CONTENT ---
    const [agencyInfo, setAgencyInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA ON COMPONENT MOUNT ---
    useEffect(() => {
        const getInfo = async () => {
            try {
                const response = await fetchAgencyInfo();
                setAgencyInfo(response.data);
            } catch (error) {
                console.error("Failed to fetch agency info for Hero Section:", error);
                // If API fails, the component will gracefully use the default name.
            } finally {
                setLoading(false);
            }
        };

        getInfo();
    }, []); // Empty dependency array ensures this runs only once

    // --- GRACEFUL NAME HANDLING ---
    // Use the fetched name if available, otherwise default to "Recalo".
    // This prevents errors and visual glitches during loading.
    const agencyName = loading || !agencyInfo ? 'Recalo' : agencyInfo.agency_name;

    return (
        <motion.div initial="hidden" animate="visible">
            <div
                className="tw-relative tw-flex tw-h-screen tw-w-full tw-flex-col tw-border-b-2 tw-border-[#E61C1C] tw-bg-cover tw-bg-center tw-text-white"
                style={{ backgroundImage: "url('/images/Cars/HeroSection.png')" }}
            >
                <motion.div
                    className="tw-absolute tw-inset-0 tw-bg-black/45"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                ></motion.div>

                {/* Header component */}
                <Header />

                {/* Animated sidebar (NOW DYNAMIC) */}
                <motion.aside
                    className="tw-absolute tw-left-0 tw-top-1/2 tw-hidden tw-h-72 tw--translate-y-1/2 lg:tw-flex"
                    variants={sidebarVariants}
                >
                    <div className="tw-absolute tw-left-0 tw-bottom-0 tw-h-full tw-w-8 tw-bg-red-600/30 tw-backdrop-blur-sm"></div>
                    <div className="tw-relative tw-flex tw-h-full tw-items-center">
                        <div className="tw-flex tw-items-center tw-gap-4 tw--rotate-90">
                            <div className="tw-h-px tw-w-16 tw-bg-[#E61C1C]"></div>
                            <p className="tw-text-sm tw-font-bold tw-tracking-[0.2em]">{agencyName.toUpperCase()}</p>
                            <div className="tw-h-px tw-w-16 tw-bg-[#E61C1C]"></div>
                        </div>
                    </div>
                </motion.aside>

                {/* Main Content (NOW DYNAMIC) */}
                <main className="tw-relative tw-z-10 tw-flex tw-w-full tw-flex-grow tw-items-center tw-px-4 sm:tw-px-8">
                    <motion.div
                        className="tw-w-full tw-max-w-md tw-text-center md:tw-max-w-xl md:tw-text-right md:tw-ml-auto md:tw-mr-16 lg:tw-mr-48 [text-shadow:_2px_2px_8px_rgb(0_0_0_/_50%)]"
                        variants={contentContainerVariants}
                    >
                        <motion.h1
                            className="tw-text-5xl tw-font-extrabold tw-uppercase tw-tracking-[15px] tw-text-white lg:tw-text-8xl md:tw-tracking-[25px]"
                            variants={itemSlideUpVariants}
                        >
                            {agencyName}
                        </motion.h1>
                        
                        <motion.div
                            className="tw-flex tw-items-end tw-justify-center tw-py-5 md:tw-justify-end md:tw-mr-9"
                            variants={itemSlideUpVariants}
                        >
                            <div className="tw-flex tw-gap-2.5 tw-mr-3">
                                <div className="tw-h-2 tw-w-8 tw-bg-[#E61C1C] tw-rounded-xl"></div>
                                <div className="tw-h-2 tw-w-8 tw-bg-[#E61C1C] tw-rounded-xl"></div>
                            </div>
                            <div>
                                <h2 className="tw-text-3xl tw-font-bold tw-tracking-[.2em] tw-text-[#E61C1C] md:tw-text-4xl">CARS</h2>
                                <div className="tw-mt-2 tw-h-2 tw-w-full tw-bg-[#E61C1C] tw-rounded-xl"></div>
                            </div>
                        </motion.div>
                        
                        <motion.p
                            className="tw-mx-auto tw-max-w-lg tw-px-4 tw-text-center md:tw-mx-0 md:tw-ml-auto md:tw-max-w-xl md:tw-px-1 md:tw-text-left"
                            variants={itemSlideUpVariants}
                        >
                            Planning a trip, running errands, or just need a car for the day? We’ve got you covered.
                            Choose from a variety of reliable, clean, and comfortable vehicles at great rates. With quick booking,
                            flexible pickup options, and friendly support, renting a car has never been easier.
                        </motion.p>

                        <motion.div
                            role="button"
                            className="tw-mt-8 tw-flex tw-cursor-pointer tw-items-center tw-justify-center tw-font-bold tw-pt-10 md:tw-justify-end"
                            variants={itemSlideUpVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="tw-bg-[linear-gradient(to_right,_#E61C1C_65%,_transparent_65%)] tw-text-white tw-rounded-tl-xl tw-rounded-bl-xl tw-px-6 tw-py-3 tw-text-base tw-tracking-[10px] tw-uppercase md:tw-text-lg md:tw-tracking-[15px]">
                                RESERVE
                            </span>
                        </motion.div>

                    </motion.div>
                </main>
            </div>

            {/* Animated footer */}
            <motion.footer
                className='tw-relative tw-z-20 tw-w-[90%] lg:tw-w-[85%] tw-mx-auto -tw-mt-20 tw-drop-shadow-glow-white-lg'
                variants={footerVariants}
            >
                <ExperienceBar />
            </motion.footer>
        </motion.div>
    );
};

export default HeroSection2;