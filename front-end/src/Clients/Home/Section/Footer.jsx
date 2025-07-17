// src/components/Footer.jsx
import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, ChevronUp, Youtube, Facebook, MessageSquare, Instagram, Twitter } from 'lucide-react';
import { fetchAgencyInfo } from '../../../services/api'; // Import the API function

const Footer = () => {
  // --- STATE FOR DYNAMIC AGENCY INFO ---
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATE FOR SCROLL BUTTON VISIBILITY ---
  const [isVisible, setIsVisible] = useState(false);

  // --- EFFECT TO FETCH AGENCY INFO ON MOUNT ---
  useEffect(() => {
    const getAgencyInfo = async () => {
      try {
        const response = await fetchAgencyInfo();
        setInfo(response.data);
      } catch (error) {
        console.error("Could not fetch agency information:", error);
        // If API fails, footer might not render or render with defaults
      } finally {
        setLoading(false);
      }
    };
    getAgencyInfo();
  }, []); // The empty array ensures this effect runs only once

  // --- EFFECT FOR SCROLL TO TOP BUTTON LOGIC ---
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- STATIC LINKS (As per original design) ---
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Vehicle Fleet', href: '/fleet' },
    { name: 'Contact', href: '/contact' },
  ];

  const moreLinks = [
    { name: 'Privacy Policy', href: '/PrivacyPolicy' },
    { name: 'FAQs', href: '/FAQs' },
    { name: 'Blog', href: '/Blog' },
    { name: 'Testimonials', href: '/testimonials' }, // Corrected spelling
  ];
  
  // --- RENDER LOADING STATE ---
  if (loading) {
    return (
        <footer className="tw-bg-[#1B1B1B] tw-py-20">
            <div className="tw-text-center tw-text-gray-400">Loading Footer...</div>
        </footer>
    );
  }

  // --- RENDER NOTHING IF API FAILED AND NO INFO IS AVAILABLE ---
  if (!info) {
    return null; 
  }

  // --- DYNAMICALLY CONSTRUCTED DATA FROM API ---
  // This data is built using the 'info' state fetched from the API
  const contactInfo = [
    { icon: <Phone size={24} className="tw-text-gray-900" />, title: 'Call us', detail: info.phone_number },
    { icon: <Mail size={24} className="tw-text-gray-900" />, title: 'Write to us', detail: info.email },
    { icon: <MapPin size={24} className="tw-text-gray-900" />, title: 'Address', detail: info.address },
  ];

  const socialLinks = [
    { name: 'WhatsApp', href: info.whatsapp_url, icon: <MessageSquare size={20} className="tw-text-gray-900" /> },
    { name: 'Facebook', href: info.facebook_url, icon: <Facebook size={20} className="tw-text-gray-900" /> },
    { name: 'Instagram', href: info.instagram_url, icon: <Instagram size={20} className="tw-text-gray-900" /> },
    { name: 'Twitter', href: info.twitter_url, icon: <Twitter size={20} className="tw-text-gray-900" /> },
    { name: 'Youtube', href: info.youtube_url, icon: <Youtube size={20} className="tw-text-gray-900" /> },
  ];

  return (
    <footer className="tw-bg-[#1B1B1B] tw-relative">
      
      {/* --- SCROLL TO TOP BUTTON --- */}
      {isVisible && (
        <button
          onClick={handleScrollToTop}
          className="tw-fixed tw-bottom-5 tw-right-5 tw-z-50 tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-gray-900 tw-p-3 tw-rounded-full tw-shadow-lg tw-transition-opacity tw-duration-300"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}

      <div className="tw-container tw-mx-auto">
        {/* Top Contact Section (NOW DYNAMIC) */}
        <div className="tw-py-8 tw-px-4 sm:tw-px-6 lg:tw-px-8 md:tw-py-12 tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8 tw-border-b tw-border-gray-700">
          {contactInfo.map((item, index) => (
            // Only render if the detail exists
            item.detail && (
              <div key={index} className="tw-flex tw-items-center tw-space-x-4">
                <div className="tw-flex-shrink-0 tw-w-12 tw-h-12 tw-bg-amber-500 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  {item.icon}
                </div>
                <div>
                  <h4 className="tw-font-semibold tw-text-white">{item.title}</h4>
                  <p className="tw-text-sm tw-text-gray-400">{item.detail}</p>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Middle Content Section */}
        <div className="tw-py-8 tw-px-4 sm:tw-px-6 lg:tw-px-8 md:tw-py-12 tw-grid tw-grid-cols-1 md:tw-grid-cols-3 lg:tw-grid-cols-3 tw-gap-8 md:tw-gap-12">
          {/* Agency Info (NOW DYNAMIC) */}
          <div className="md:tw-col-span-2 lg:tw-col-span-1">
            <h3 className="tw-text-3xl tw-font-bold tw-mb-4">
              <span className="tw-text-amber-500">{info.agency_name.substring(0, 2)}</span>
              <span className="tw-text-white">{info.agency_name.substring(2)}</span>
            </h3>
            <p className="tw-text-sm tw-mb-6 tw-leading-relaxed tw-text-gray-400">
              Rent a car imperdiet sapien porttito the bibendum ellentesue the commodo erat nesuen.
            </p>
            <div className="tw-flex tw-space-x-3">
              {socialLinks.map((social) => (
                // Only render the link if the href from the API is not null or empty
                social.href && (
                  <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name} className="tw-w-10 tw-h-10 tw-bg-amber-500 tw-rounded-full tw-flex tw-items-center tw-justify-center hover:tw-bg-amber-600 tw-transition-colors">
                    {social.icon}
                  </a>
                )
              ))}
            </div>
          </div>

          {/* Quick Links (STATIC) */}
          <div>
            <h4 className="tw-text-xl tw-font-semibold tw-text-white tw-mb-5">Quick Links</h4>
            <ul className="tw-space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:tw-text-amber-500 tw-text-white tw-transition-colors tw-text-sm tw-flex tw-items-center">
                    <span className="tw-w-1.5 tw-h-1.5 tw-bg-amber-500 tw-rounded-full tw-mr-3"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links (STATIC) */}
          <div>
            <h4 className="tw-text-xl tw-font-semibold tw-text-white tw-mb-5">Support</h4>
            <ul className="tw-space-y-3">
              {moreLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:tw-text-amber-500 tw-text-white tw-transition-colors tw-text-sm tw-flex tw-items-center">
                    <span className="tw-w-1.5 tw-h-1.5 tw-bg-amber-500 tw-rounded-full tw-mr-3"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Section (NOW DYNAMIC) */}
        <div className="tw-py-6 md:tw-py-8 tw-border-t tw-border-gray-700 tw-flex tw-flex-col sm:tw-flex-row tw-justify-center tw-items-center tw-text-sm">
          <p className="tw-text-gray-500 tw-mb-4 sm:tw-mb-0">
            ©{new Date().getFullYear()} <a href="/" className="tw-text-amber-500 hover:tw-underline">{info.agency_name}</a>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;