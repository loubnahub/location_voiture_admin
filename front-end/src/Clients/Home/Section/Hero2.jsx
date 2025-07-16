// src/components/HeroSection2.jsx

import React from 'react';
import { motion } from 'framer-motion'; // Import Framer Motion
import Header from '../../Header/Nav';
import ExperienceBar from './ExperienceBar';

// --- Animation Variants Definition ---
// We define animation states here to keep the JSX clean.

// A container variant to orchestrate staggered animations for its children.
const contentContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.5, // Wait a moment before starting
      staggerChildren: 0.3, // Animate each child 0.3s after the previous one
    },
  },
};

// A simple "slide up and fade in" animation for individual text elements.
const itemSlideUpVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Animation for the sidebar to slide in from the left.
const sidebarVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 1, delay: 1.2, ease: 'circOut' },
  },
};

// Animation for the footer bar to slide up from the bottom.
const footerVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, delay: 1.5, ease: 'easeOut' },
  },
};


const HeroSection2 = () => {
    return (
        // The main container that triggers the initial animations on load.
        <motion.div initial="hidden" animate="visible">
            <div
                className="tw-relative tw-flex tw-h-screen tw-w-full tw-flex-col tw-border-b-2 tw-border-[#E61C1C] tw-bg-cover tw-bg-center tw-text-white"
                style={{ backgroundImage: "url('/images/Cars/HeroSection.png')" }}
            >
                {/* The overlay fades in for a smoother background reveal */}
                <motion.div
                    className="tw-absolute tw-inset-0 tw-bg-black/45"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                ></motion.div>

                {/* Header component (remains static) */}
                <Header />

                {/* Animated sidebar */}
                <motion.aside
                    className="tw-absolute tw-left-0 tw-top-1/2 tw-hidden tw-h-72 tw--translate-y-1/2 lg:tw-flex"
                    variants={sidebarVariants}
                >
                    <div className="tw-absolute tw-left-0 tw-bottom-0 tw-h-full tw-w-8 tw-bg-red-600/30 tw-backdrop-blur-sm"></div>
                    <div className="tw-relative tw-flex tw-h-full tw-items-center">
                        <div className="tw-flex tw-items-center tw-gap-4 tw--rotate-90">
                            <div className="tw-h-px tw-w-16 tw-bg-[#E61C1C]"></div>
                            <p className="tw-text-sm tw-font-bold tw-tracking-[0.2em]">RECALO</p>
                            <div className="tw-h-px tw-w-16 tw-bg-[#E61C1C]"></div>
                        </div>
                    </div>
                </motion.aside>

                {/* Main Content */}
                <main className="tw-relative tw-z-10 tw-flex tw-w-full tw-flex-grow tw-items-center tw-px-4 sm:tw-px-8">
                    {/* This motion.div orchestrates the staggered animations for the content inside */}
                    <motion.div
                        className="tw-w-full tw-max-w-md tw-text-center md:tw-max-w-xl md:tw-text-right md:tw-ml-auto md:tw-mr-16 lg:tw-mr-48 [text-shadow:_2px_2px_8px_rgb(0_0_0_/_50%)]"
                        variants={contentContainerVariants}
                    >
                        {/* Each element below will use the `itemSlideUpVariants` */}
                        <motion.h1
                            className="tw-text-5xl tw-font-extrabold tw-uppercase tw-tracking-[15px] tw-text-white lg:tw-text-8xl md:tw-tracking-[25px]"
                            variants={itemSlideUpVariants}
                        >
                            Recalo
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
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                            Sedeiusmod tempor incididunt ut labore et dolore exercitation.
                        </motion.p>

                        <motion.div
                            role="button"
                            className="tw-mt-8 tw-flex tw-cursor-pointer tw-items-center tw-justify-center tw-font-bold tw-pt-10 md:tw-justify-end"
                            variants={itemSlideUpVariants}
                            // Add interactive animations for hover and tap
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
                className='tw-relative tw-z-20 tw-w-[90%] lg:tw-w-[85%] tw-mx-auto  -tw-mt-20 tw-drop-shadow-glow-white-lg'
                variants={footerVariants}
            >
                <ExperienceBar />
            </motion.footer>
        </motion.div>
    );
};

export default HeroSection2;