// src/Clients/VedioStart/VedioStart.js
import React, { useEffect, useRef, useState } from 'react'; // Added useState
import { useNavigate } from 'react-router-dom';

const VedioStart = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [showUnmuteButton, setShowUnmuteButton] = useState(false); // New state

  const videoSrc = "/vedio/vediocars.mp4";
  const nextPage = "/home";

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      // Try to play with sound.
      videoElement.muted = false; // Explicitly try to unmute
      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise.then(_ => {
          // Autoplay started with sound or browser muted it.
          // If browser muted it, videoElement.muted will be true.
          if (videoElement.muted) {
            setShowUnmuteButton(true); // Show button if browser forced mute
          }
        }).catch(error => {
          // Autoplay was prevented.
          console.warn("Video autoplay with sound was prevented:", error);
          // Often, if autoplay with sound is blocked, the browser might mute it and play,
          // or not play at all. We'll offer an unmute button as a fallback.
          videoElement.muted = true; // Ensure it's muted
          setShowUnmuteButton(true);
          videoElement.play().catch(e => console.error("Muted play failed too:", e)); // Try playing muted
        });
      }
    }

    const timer = setTimeout(() => {
      navigate(nextPage);
    }, 20000);

    return () => clearTimeout(timer);
  }, [navigate, nextPage]);

  const handleEnableSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setShowUnmuteButton(false); // Hide button after sound is enabled
      // Optionally, try to play again if it wasn't playing
      // videoRef.current.play().catch(e => console.error("Play after unmute failed:", e));
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        // loop
        // Muted state is handled programmatically now
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto z-[1] -translate-x-1/2 -translate-y-1/2 object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

     
    </div>
  );
};

export default VedioStart;