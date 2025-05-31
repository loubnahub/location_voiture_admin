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
      <div className="bg-[#1B1B1B] text-white min-h-screen flex items-center justify-center p-4 -mt-52 lg:-mt-20 ">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16 px-8 py-12 lg:py-20 ">
          <div className="lg:w-1/2 space-y-6 lg:mb-52 lg:text-left">
            <h1 className="text-3xl md:text-3xl font-bold">
              We Are More Than
            </h1>
            <h2 className="text-4xl text-[#FFA600] md:text-5xl font-bold  -mt-2">
              A Car Rental Company
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Car repair quisque sodales dui ut varius vestibulum drana tortor turpis porttitor tellus
              eu euismod nisl massa nutodio in the miss volume place urna lacinia eros nunta urna
              mauris vehicula rutrum in the miss an volume interdum.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Lorem ipsum potenti fringilla pretium ipsum non blandit vivamus eget nisl non mi iacu
              lis iaculis imperia quiseros sevin elentesque habitant farmen.Lorem ipsum potenti
              fringilla pretium ipsum non blandit vivamus eget nisl non mi iaculis iaculis imperie
              quiseros sevin elentesque habitant farmen.
            </p>
            <ul className="space-y-3 pt-4">
              <li className="flex items-center justify-center lg:justify-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-[#FFA600] flex items-center justify-center">
                  <CheckIcon className="w-3.5 h-3.5 text-[#FFA600]" />
                </span>
                <span className="text-sm font-medium">We offer multiple services</span>
              </li>
              <li className="flex items-center justify-center lg:justify-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-[#FFA600] flex items-center justify-center">
                  <CheckIcon className="w-3.5 h-3.5 text-[#FFA600]" />
                </span>
                <span className="text-sm font-medium">Multiple car repair locations</span>
              </li>
            </ul>
          </div>

         
          <div className="lg:w-1/2 w-full mt-8 lg:mt-0 relative">
            <img
              src="/images/Vectors/about.png" 
              alt="Woman in front of a car in a dealership"
              className="rounded-xl  w-full h-auto object-cover"
              style={{ aspectRatio: '' }}
            />
            <button
              onClick={openVideoModal}
              aria-label="Play video"
              className="absolute bottom-6 left-6 md:bottom-10 md:left-10 w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#FFA600] flex items-center justify-center  bg-opacity-30 hover:bg-opacity-50 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-custom-orange focus:ring-opacity-50"
            >
              <PlayIcon className="w-6 h-6 md:w-8 md:h-8 text-[#FFA600] group-hover:text-custom-orange transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Video  */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeVideoModal} 
        >
          <div
            className="bg-[#121212] p-3 md:p-4 rounded-lg shadow-xl relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()} 
          >
            <button
              onClick={closeVideoModal}
              aria-label="Close video player"
              className="absolute -top-3 -right-3 md:top-2 md:right-2 bg-custom-orange text-white rounded-full p-1.5 hover:bg-orange-600 transition-colors z-10"
            >
              <CloseIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            <div className="aspect-video"> 
              <iframe
                className="w-full h-full rounded"
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