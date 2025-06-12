// src/Clients/VedioStart/VedioStart.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VedioStart = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  // This state now controls if the video is muted. We start it as muted.
  const [isMuted, setIsMuted] = useState(true);

  const videoSrc = "/vedio/Recalo.mp4";
  const nextPage = "/home";

  // This function will run when the user clicks anywhere on the screen.
  const handleScreenClick = () => {
    // We only need to do this once.
    if (isMuted) {
      setIsMuted(false); // This will unmute the video.
    }
  };

  useEffect(() => {
    // Navigate away after 20 seconds, regardless of sound.
    const timer = setTimeout(() => {
      navigate(nextPage);
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate, nextPage]);



  return (

    <div 
      className="tw-relative tw-w-screen tw-h-screen tw-overflow-hidden tw-bg-black tw-cursor-pointer"
      onClick={handleScreenClick}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        // The `muted` property is now directly controlled by our `isMuted` state.
        muted={isMuted} 
        className="tw-absolute tw-top-1/2 tw-left-1/2 tw-min-w-full tw-min-h-full tw-w-auto tw-h-auto tw-z-[1] tw--translate-x-1/2 tw--translate-y-1/2 tw-object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

   
      {isMuted && (
        <div className="tw-absolute tw-inset-0 tw-z-10 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-20">
          <p className="tw-text-white tw-font-semibold tw-text-lg tw-p-4 tw-rounded-lg tw-bg-black tw-bg-opacity-50 tw-backdrop-blur-sm">
            Click anywhere to enable sound
          </p>
        </div>
      )}
    </div>
  );
};

export default VedioStart;