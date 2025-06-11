import React, { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';

const CarPromoSection = () => {
  // --- State for Modal ---
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // --- Configuration ---
  const backgroundImageUrl = '/images/Cars/CarPromoVedio.jpg'; // Replace with your actual image
  const youtubeVideoId = '1LxcTt1adfY'; // Replace with your YouTube Video ID

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
      if (event.key === 'Escape' || event.keyCode === 27) {
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
      document.body.style.overflow = 'unset';
    };
  }, [isVideoModalOpen]);


  return (
    <>
      <div
        className="tw-relative tw-w-full tw-h-[50vh] sm:tw-h-[60vh] md:tw-h-[70vh] lg:tw-h-[500px] 
                   tw-bg-cover tw-bg-center tw-bg-no-repeat tw-bg-fixed" // Added tw-bg-fixed
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        aria-labelledby="promo-heading"
      >
        {/* Dark Overlay */}
        <div className="tw-absolute tw-inset-0 tw-bg-black/60"></div>

        {/* Content */}
        <div className="tw-relative tw-z-10 tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-text-center tw-text-white tw-p-4">
          <span className="tw-text-amber-400 tw-uppercase tw-tracking-wider tw-text-xs sm:tw-text-sm tw-font-medium tw-mb-1 sm:tw-mb-2">
            Explore
          </span>
          <h2 id="promo-heading" className="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-bold tw-mb-6 sm:tw-mb-8">
            Car Promo Video
          </h2>
          <button
            onClick={openVideoModal}
            aria-label="Play car promo video"
            className="group tw-w-16 tw-h-16 sm:tw-w-20 sm:tw-h-20 tw-rounded-full 
                       tw-bg-transparent tw-border-2 tw-border-amber-400 
                       tw-flex tw-items-center tw-justify-center tw-text-amber-400
                       hover:tw-bg-amber-400/20 hover:tw-border-amber-300 
                       tw-transition-all tw-duration-300
                       focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-amber-400 focus:tw-ring-offset-2 focus:tw-ring-offset-black/60"
          >
            <Play
              size={28}
              className="tw-transition-transform tw-duration-300 group-hover:tw-scale-110"
            />
          </button>
        </div>
      </div>

      {/* --- Video Modal --- */}
      {isVideoModalOpen && (
        <div
          className="tw-fixed tw-inset-0 tw-bg-black/80 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4 tw-transition-opacity tw-duration-300"
          onClick={closeVideoModal}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="tw-relative tw-bg-black tw-p-1 sm:tw-p-2 tw-rounded-lg tw-shadow-xl tw-w-full tw-max-w-2xl lg:tw-max-w-3xl tw-aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideoModal}
              className="tw-absolute tw--top-3 tw--right-3 sm:tw-top-0 sm:tw-right-0 sm:tw--translate-y-1/2 sm:tw-translate-x-1/2 
                         tw-bg-white hover:tw-bg-neutral-200 tw-text-neutral-700 hover:tw-text-neutral-900 
                         tw-rounded-full tw-p-1.5 tw-shadow-md tw-transition-colors tw-z-20
                         focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-neutral-400 focus:tw-ring-offset-2 focus:tw-ring-offset-black/80"
              aria-label="Close video player"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <iframe
              className="tw-w-full tw-h-full tw-rounded"
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
              title="Car Promo Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Add some dummy content below to enable scrolling and see the effect */}
      {/* <div style={{ height: '100vh', background: 'lightgray', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Scroll down to see the parallax effect on the promo section above.</p>
      </div>
      <div style={{ height: '50vh', background: 'whitesmoke' }}></div> */}
    </>
  );
};

export default CarPromoSection;