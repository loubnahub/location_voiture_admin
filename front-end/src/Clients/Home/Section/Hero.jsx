// src/Clients/Hero.js

import React from 'react';
import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// --- Local Video URLs ---
const videoSources = [
    '/vedio/vediocars.mp4',
    '/vedio/car.mp4'
];

// --- Reusable App Store Button Component ---
const AppStoreButton = ({ storeType, subtext, storeName }) => {
    const isGoogle = storeType === 'google';
    return (
        <button className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-bg-black tw-text-white tw-px-5 tw-py-2 tw-rounded-lg tw-border tw-border-gray-700 hover:tw-bg-gray-800 tw-transition-colors tw-w-full sm:tw-w-auto">
            {isGoogle ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-7 tw-w-7" fill="currentColor" viewBox="0 0 512 512"><path d="M325.2,233.2H260V157H325.2c4.7,0,9.3,0.4,13.8,1.1l-50.4-50.4C281.3,102,271,100,260,100c-44.2,0-83,23.3-104.4,57.9l45.4,35.2C212.5,166.3,234.8,150,260,150c18.1,0,34.4,5.9,47.2,15.5L325.2,233.2z M450.6,248.6c0-13.3-1.4-26.3-3.9-38.9h-187v76.3h106.4c-4.7,29.3-19.9,54.2-41.5,69.5v51.1h65.8C428.6,373.1,450.6,315.6,450.6,248.6z M155.6,298.1c-3.8-11.8-6.1-24.3-6.1-37.2s2.3-25.4,6.1-37.2V172.5H89.8C75,200.4,68,232.8,68,266s7,65.6,21.8,93.5l65.8-51.4V298.1z M260,422c54.4,0,101.3-19.1,134.8-49.8l-65.8-51.1c-19,12.7-42.3,20.2-69,20.2c-52,0-96.5-35.3-112.1-82.7H47.4C69,376.1,130.1,422,204,422h56V422z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-8 tw-w-8" fill="currentColor" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C39.2 141.6 0 184.2 0 241.2c0 61.6 44.5 108.8 88.5 108.8 28.2 0 54.3-18.7 75.8-18.7 22.3 0 49.6 18.7 78.3 18.7 35.8 0 69.9-21.2 88.5-21.2 1.3 0 5.4-1.2 8.7-2.2zM212.7 85.3c13.2-15.3 24.8-35.5 24.8-56.2 0-21.5-13.3-34.4-33.3-34.4-23.3 0-43.3 14.3-56.7 14.3-12.8 0-28.7-14.3-48.7-14.3-22.3 0-43.3 13.5-56.7 34.4-13.7 21.2-22.3 47.8-13.3 73.3 13.3 35.5 45.8 54.7 69.3 54.7 22.8 0 43.3-17.8 58.7-17.8 14.8 0 38.3 17.8 58.7 17.8 2.7 0 6.7-1.5 10-2.2-1.3-3.3-2.7-6.8-4.3-10.3z" /></svg>
            )}
            <div className="tw-text-left">
                <p className="tw-text-xs tw-uppercase tw-tracking-wider">{subtext}</p>
                <p className="tw-text-lg tw-font-semibold tw-leading-tight">{storeName}</p>
            </div>
        </button>
    );
};

const Hero = () => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    useEffect(() => {
        if (videoSources.length > 1) {
            const timer = setInterval(() => {
                handleNextVideo();
            }, 40000); 
            return () => clearInterval(timer);
        }
    }, [currentVideoIndex]);

    const handleNextVideo = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
    };

    const handlePrevVideo = () => {
        setCurrentVideoIndex((prevIndex) =>
            (prevIndex - 1 + videoSources.length) % videoSources.length
        );
    };

    return (
        <div className="tw-relative tw-w-full tw-h-screen tw-text-white tw-overflow-hidden">
            <video
                key={videoSources[currentVideoIndex]}
                className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-object-cover tw-z-0"
                src={videoSources[currentVideoIndex]}
                autoPlay
                loop
                muted
                playsInline
            />
            <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-bg-black/60 tw-z-10" />

            <div className="tw-relative tw-z-20 tw-flex tw-flex-col tw-h-full tw-p-4 sm:tw-p-8 md:tw-p-12">
                <main className="tw-flex-grow tw-flex tw-items-center tw-relative">
                    <button
                        onClick={handlePrevVideo}
                        className="tw-absolute tw-left-2 sm:tw-left-4 tw-top-1/2 -tw-translate-y-1/2 tw-text-xl sm:tw-text-2xl tw-p-2 sm:tw-p-3 tw-bg-white/10 tw-rounded-full hover:tw-bg-white/20 tw-transition-colors tw-backdrop-blur-sm"
                        aria-label="Previous Video"
                    >
                        <FaChevronLeft />
                    </button>

                    <div className="tw-w-full tw-max-w-md sm:tw-max-w-xl lg:tw-max-w-5xl tw-mx-auto sm:tw-ml-10 md:tw-ml-16 lg:tw-ml-24 tw-text-center sm:tw-text-left">
                        <h1 className="tw-text-4xl sm:tw-text-5xl md:tw-text-6xl lg:tw-text-7xl tw-font-bold tw-leading-tight">
                            Find, book and <br />
                            rent a car
                            <br className="sm:tw-hidden" />
                            <div className="tw-relative tw-inline-block tw-p-6">
                                <span className="tw-text-brand-blue">Easily</span>
                                <img src="/images/Vectors/BorderBlue.png" alt="" className="tw-absolute tw--bottom-1 sm:tw--bottom-3 tw-left-0 tw-w-full" />
                            </div>
                        </h1>
                        <p className="tw-mt-4 sm:tw-mt-6 tw-text-base md:tw-text-lg tw-text-gray-200">
                            Get a car wherever and whenever you need it with your iOS and Android device.
                        </p>
                        <div className="tw-mt-8 tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-justify-center sm:tw-justify-start">
                            <AppStoreButton storeType="google" subtext="GET IT ON" storeName="Google Play" />
                            <AppStoreButton storeType="apple" subtext="Download on the" storeName="App Store" />
                        </div>
                    </div>

                    <button
                        onClick={handleNextVideo}
                        className="tw-absolute tw-right-2 sm:tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-text-xl sm:tw-text-2xl tw-p-2 sm:tw-p-3 tw-bg-white/10 tw-rounded-full hover:tw-bg-white/20 tw-transition-colors tw-backdrop-blur-sm"
                        aria-label="Next Video"
                    >
                        <FaChevronRight />
                    </button>
                </main>
            </div>
        </div>
    );
};
 
export default Hero;