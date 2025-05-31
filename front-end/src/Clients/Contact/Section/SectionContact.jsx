import React from 'react';
import Header from '../../Header/Nav';

const ContactSection = () => {
  // IMPORTANT: Replace this with your actual hero image for services
  const heroBackgroundImage = '/images/Cars/ContactUs.jpg';

  return (
    <div className="bg-[#1B1B1B] min-h-screen text-white">
      <Header />
      
      <div
        className="relative h-[50vh] sm:h-[60vh] md:h-96 lg:h-[690px] flex items-center justify-start bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div> {/* Dark overlay */}
        <div className="relative z-10 text-left px-8 md:px-16 max-w-4xl">
          <p className="text-amber-400 uppercase tracking-wider text-sm font-semibold mb-2 sm:mb-3">
          GET  IN  TOUCH
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Contact <span className="text-amber-400">Us</span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;