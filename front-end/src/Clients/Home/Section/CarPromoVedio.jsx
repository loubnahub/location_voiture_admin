import React, { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react'; // Assuming you have lucide-react installed

const CarPromoSection = () => {
  // --- State for Modal ---
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // --- Configuration ---
  // Replace with your actual background image path (if in public folder, start with '/')
  const backgroundImageUrl = '/images/Cars/CarPromoVedio.jpg';
  // Replace with your YouTube Video ID

  const youtubeVideoId = '1LxcTt1adfY';
  // --- Event Handlers ---
  const openVideoModal = () => {
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  // Optional: Close modal on 'Escape' key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        closeVideoModal();
      }
    };
    if (isVideoModalOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isVideoModalOpen]);

  // Optional: Prevent body scroll when modal is open
  useEffect(() => {
    if (isVideoModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset'; // Cleanup on component unmount
    };
  }, [isVideoModalOpen]);


  return (
    <>
      <div
        className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[500px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        aria-labelledby="promo-heading"
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4">
          <span className="text-amber-400 uppercase tracking-wider text-xs sm:text-sm font-medium mb-1 sm:mb-2">
            Explore
          </span>
          <h2 id="promo-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
            Car Promo Video
          </h2>
          <button
            onClick={openVideoModal} // Changed to openVideoModal
            aria-label="Play car promo video"
            className="group w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400 
                       flex items-center justify-center text-amber-400
                       hover:bg-amber-400/10 hover:border-amber-300 transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black/60"
          >
            <Play
              size={28}
              className="transition-transform duration-300 group-hover:scale-110 border-fill-amber-400"
            />
          </button>
        </div>
      </div>

      {/* --- Video Modal --- */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          onClick={closeVideoModal} // Click outside to close
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative bg-black p-1 sm:p-2 rounded-lg shadow-xl w-full max-w-2xl lg:max-w-3xl aspect-video"
            onClick={(e) => e.stopPropagation()} // Prevent click inside from closing
          >
            {/* Close Button for the Modal */}
            <button
              onClick={closeVideoModal}
              className="absolute -top-3 -right-3 sm:top-0 sm:right-0 sm:-translate-y-1/2 sm:translate-x-1/2 
                         bg-white text-black rounded-full p-1 hover:bg-gray-200 transition z-20
                         focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close video player"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            {/* YouTube Iframe */}
            <iframe
              className="w-full h-full rounded"
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
              title="Car Promo Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default CarPromoSection;