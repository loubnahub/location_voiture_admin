import React, { useState } from 'react';

// SVG Icons
const CheckIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const PlayIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.935-1.374 1.674-.915l11.394 6.33c.735.408.735 1.422 0 1.83l-11.394 6.33c-.739.46-1.674-.059-1.674-.915V5.653z" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const CarRentalSection = () => {
  const [isVideoModalOpen, setVideoModalOpen] = useState(false);
  // Vedio for about
  const videoEmbedUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";

  const openVideoModal = () => setVideoModalOpen(true);
  const closeVideoModal = () => setVideoModalOpen(false);

  return (
    <>
      <div className="tw-bg-[#1B1B1B] tw-text-white tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-4 tw--mt-52 lg:tw--mt-20 ">
        <div className="tw-container tw-mx-auto tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-gap-8 lg:tw-gap-16 tw-px-8 tw-py-12 lg:tw-py-20 ">
          <div className="lg:tw-w-1/2 tw-space-y-6 lg:tw-mb-52 lg:tw-text-left">
            <h1 className="tw-text-3xl md:tw-text-3xl tw-font-bold">
              We Are More Than
            </h1>
            <h2 className="tw-text-4xl tw-text-[#FFA600] md:tw-text-5xl tw-font-bold tw--mt-2">
              A Car Rental Company
            </h2>
            <p className="tw-text-gray-400 tw-text-sm tw-leading-relaxed">
              Car repair quisque sodales dui ut varius vestibulum drana tortor turpis porttitor tellus
              eu euismod nisl massa nutodio in the miss volume place urna lacinia eros nunta urna
              mauris vehicula rutrum in the miss an volume interdum.
            </p>
            <p className="tw-text-gray-400 tw-text-sm tw-leading-relaxed">
              Lorem ipsum potenti fringilla pretium ipsum non blandit vivamus eget nisl non mi iacu
              lis iaculis imperia quiseros sevin elentesque habitant farmen.Lorem ipsum potenti
              fringilla pretium ipsum non blandit vivamus eget nisl non mi iaculis iaculis imperie
              quiseros sevin elentesque habitant farmen.
            </p>
            <ul className="tw-space-y-3 tw-pt-4">
              <li className="tw-flex tw-items-center tw-justify-center lg:tw-justify-start tw-space-x-3">
                <span className="tw-flex-shrink-0 tw-w-6 tw-h-6 tw-rounded-full tw-border-2 tw-border-[#FFA600] tw-flex tw-items-center tw-justify-center">
                  <CheckIcon className="tw-w-3.5 tw-h-3.5 tw-text-[#FFA600]" />
                </span>
                <span className="tw-text-sm tw-font-medium">We offer multiple services</span>
              </li>
              <li className="tw-flex tw-items-center tw-justify-center lg:tw-justify-start tw-space-x-3">
                <span className="tw-flex-shrink-0 tw-w-6 tw-h-6 tw-rounded-full tw-border-2 tw-border-[#FFA600] tw-flex tw-items-center tw-justify-center">
                  <CheckIcon className="tw-w-3.5 tw-h-3.5 tw-text-[#FFA600]" />
                </span>
                <span className="tw-text-sm tw-font-medium">Multiple car repair locations</span>
              </li>
            </ul>
          </div>


          <div className="lg:tw-w-1/2 tw-w-full tw-mt-8 lg:tw-mt-0 tw-relative">
            <img
              src="/images/Vectors/about.png"
              alt="Woman in front of a car in a dealership"
              className="tw-rounded-xl tw-w-full tw-h-auto tw-object-cover"
              style={{ aspectRatio: '' }}
            />
            <button
              onClick={openVideoModal}
              aria-label="Play video"
              className="tw-absolute tw-bottom-6 tw-left-6 md:tw-bottom-10 md:tw-left-10 tw-bg-transparent  tw-w-16 tw-h-16 md:tw-w-20 md:tw-h-20 tw-rounded-full tw-border-2 tw-border-[#FFA600] tw-flex tw-items-center tw-justify-center tw-bg-opacity-30 hover:tw-bg-opacity-50 tw-transition-all tw-duration-300 tw-group focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-custom-orange focus:tw-ring-opacity-50"
            >
              <PlayIcon className="tw-w-6 tw-h-6 md:tw-w-8 md:tw-h-8 tw-text-[#FFA600] group-hover:tw-text-custom-orange tw-transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Video  */}
      {isVideoModalOpen && (
        <div
          className="tw-fixed tw-inset-0 tw-bg-transparent tw-bg-opacity-75 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4"
          onClick={closeVideoModal}
        >
          <div
            className="tw-bg-[#121212] tw-p-3 md:tw-p-4 tw-rounded-lg tw-shadow-xl tw-relative tw-max-w-3xl tw-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideoModal}
              aria-label="Close video player"
              className="tw-absolute tw--top-3 tw--right-3 md:tw-top-2 md:tw-right-2 tw-bg-custom-orange tw-text-white tw-rounded-full tw-p-1.5 hover:tw-bg-orange-600 tw-transition-colors tw-z-10"
            >
              <CloseIcon className="tw-w-5 tw-h-5 md:tw-w-6 md:tw-h-6" />
            </button>

            <div className="tw-aspect-video">
              <iframe
                className="tw-w-full tw-h-full tw-rounded"
                src={videoEmbedUrl + "?autoplay=1&rel=0"}
                title="Video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarRentalSection;