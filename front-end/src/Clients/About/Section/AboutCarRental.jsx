import React, { useState } from 'react';
// 1. Import motion and AnimatePresence from Framer Motion
import { motion, AnimatePresence } from 'framer-motion';

// SVG Icons (re-included for completeness)
const CheckIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
const PlayIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.935-1.374 1.674-.915l11.394 6.33c.735.408.735 1.422 0 1.83l-11.394 6.33c-.739.46-1.674-.059-1.674-.915V5.653z" /></svg>;
const CloseIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

// 2. Define animation variants for reusability
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Animate children with a 0.2s delay between them
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalContentVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.8 },
};


const CarRentalSection = () => {
  const [isVideoModalOpen, setVideoModalOpen] = useState(false);
  const videoEmbedUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";

  const openVideoModal = () => setVideoModalOpen(true);
  const closeVideoModal = () => setVideoModalOpen(false);

  return (
    <>
      <div className="tw-bg-[#1B1B1B] tw-text-white tw-flex tw-items-center tw-justify-center tw-py-12 sm:tw-py-16">
        <div className="container tw-mx-auto tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-gap-10 lg:tw-gap-16 tw-px-4 sm:tw-px-6">
          
          {/* 3. Animate the text content container */}
          <motion.div
            className="lg:tw-w-1/2 tw-text-center lg:tw-text-left tw-space-y-4"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }} // Animate when 30% of the element is in view, and only once
          >
            {/* 4. Animate each individual text element */}
            <motion.h1 variants={itemVariants} className="tw-text-3xl md:tw-text-4xl tw-font-bold">
              We Are More Than
            </motion.h1>
            <motion.h2 variants={itemVariants} className="tw-text-4xl tw-text-[#FFA600] md:tw-text-5xl tw-font-bold">
              A Car Rental Company
            </motion.h2>
            <motion.p variants={itemVariants} className="tw-text-gray-400 tw-text-sm sm:tw-text-base tw-leading-relaxed">
              Car repair quisque sodales dui ut varius vestibulum drana tortor turpis porttitor tellus
              eu euismod nisl massa nutodio in the miss volume place urna lacinia eros nunta urna
              mauris vehicula rutrum in the miss an volume interdum.
            </motion.p>
            <motion.ul variants={itemVariants} className="tw-space-y-3 tw-pt-4 tw-inline-flex tw-flex-col tw-items-start tw-mx-auto lg:tw-mx-0">
              <li className="tw-flex tw-items-center tw-space-x-3">
                <span className="tw-flex-shrink-0 tw-w-6 tw-h-6 tw-rounded-full tw-border-2 tw-border-[#FFA600] tw-flex tw-items-center tw-justify-center">
                  <CheckIcon className="tw-w-3.5 tw-h-3.5 tw-text-[#FFA600]" />
                </span>
                <span className="tw-text-sm sm:tw-text-base tw-font-medium">We offer multiple services</span>
              </li>
              <li className="tw-flex tw-items-center tw-space-x-3">
                <span className="tw-flex-shrink-0 tw-w-6 tw-h-6 tw-rounded-full tw-border-2 tw-border-[#FFA600] tw-flex tw-items-center tw-justify-center">
                  <CheckIcon className="tw-w-3.5 tw-h-3.5 tw-text-[#FFA600]" />
                </span>
                <span className="tw-text-sm sm:tw-text-base tw-font-medium">Multiple car repair locations</span>
              </li>
            </motion.ul>
          </motion.div>

          {/* 5. Animate the image container */}
          <motion.div
            className="lg:tw-w-1/2 tw-w-full tw-relative"
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <img
              src="/images/Vectors/about.png"
              alt="Woman in front of a car"
              className="tw-rounded-xl tw-w-full tw-h-auto tw-object-cover"
            />
            {/* 6. Add pulse and hover animations to the play button */}
            <motion.button
              onClick={openVideoModal}
              aria-label="Play video"
              className="tw-absolute md:tw-bottom-6 tw-left-0 tw-bottom-0 md:tw-left-6 tw-w-16 tw-h-16 md:tw-w-20 md:tw-h-20 tw-rounded-full tw-border-2 tw-border-[#FFA600] tw-flex tw-items-center tw-justify-center tw-bg-black/30 hover:tw-bg-black/50 tw-transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                scale: [1, 1.05, 1],
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <PlayIcon className="tw-w-6 tw-h-6 md:tw-w-8 md:tw-h-8 tw-text-[#FFA600]" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* 7. Wrap the modal with AnimatePresence for enter/exit animations */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            className="tw-fixed tw-inset-0 tw-bg-black/80 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4"
            onClick={closeVideoModal}
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden" // This matches the initial="hidden" for a fade out
          >
            {/* 8. Animate the modal content itself */}
            <motion.div
              className="tw-bg-[#121212] tw-p-2 tw-rounded-lg tw-shadow-xl tw-relative tw-max-w-4xl tw-w-full"
              onClick={(e) => e.stopPropagation()}
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit" // Uses the specific exit variant we defined
            >
              <button
                onClick={closeVideoModal}
                aria-label="Close video player"
                className="tw-absolute tw-top-2 md:tw-right-2 tw-bg-[#FFA600] tw-text-white tw-rounded-full tw-p-1.5 hover:tw-bg-orange-600 tw-transition-colors tw-z-10"
              >
                <CloseIcon className="tw-w-5 tw-h-5" />
              </button>
              <div className="tw-aspect-video">
                <iframe
                  className="tw-w-full tw-h-full tw-rounded-md"
                  src={`${videoEmbedUrl}?autoplay=1&rel=0`}
                  title="Video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
 
export default CarRentalSection;