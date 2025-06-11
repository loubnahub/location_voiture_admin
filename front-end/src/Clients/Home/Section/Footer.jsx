// src/components/Footer.jsx
import React from 'react';
import { Phone, Mail, MapPin, ChevronUp, Youtube, Facebook, MessageSquare } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', href: '/home' },
    { name: 'About Us', href: '#' }, // Corrected "Aboute"
    { name: 'Services', href: '#' }, // Corrected "Servicex"
    { name: 'Vehicle Fleet', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  // Assuming you might want a different set of links for the third column or just repeat
  const moreLinks = [
    { name: 'Privacy Policy', href: '/PrivacyPolicy' },
    { name: 'FAQs', href: '/FAQs' },
    { name: 'Blog', href: '/Blog' },
  ];


  const socialLinks = [
    { icon: <MessageSquare size={20} className="tw-text-gray-900" />, href: '#', ariaLabel: 'WhatsApp' },
    { icon: <Facebook size={20} className="tw-text-gray-900" />, href: '#', ariaLabel: 'Facebook' },
    { icon: <Youtube size={20} className="tw-text-gray-900" />, href: '#', ariaLabel: 'YouTube' },
  ];

  const contactInfo = [
    {
      icon: <Phone size={24} className="tw-text-gray-900" />,
      title: 'Call us',
      detail: [  '+212 060604405'],
    },
    {
      icon: <Mail size={24} className="tw-text-gray-900" />,
      title: 'Write to us',
      detail: 'Contact@Recalo.com', // Updated example email

    },
    {
      icon: <MapPin size={24} className="tw-text-gray-900" />,
      title: 'Address',
      detail: 'Oujda ,Lazaret Street , Morocco',
    },
  ];

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="tw-bg-[#1B1B1B]">
      {/* Scroll to Top Button - Positioned absolutely relative to the footer */}
     

      <div className="tw-container tw-mx-auto"> {/* Added tw-container for consistent max-width and centering */}
        {/* Top Contact Section - Line below this section */}
        <div className="tw-py-8 tw-px-4 sm:tw-px-6 lg:tw-px-8 md:tw-py-12 tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8 tw-border-b tw-border-gray-700">
          {contactInfo.map((item, index) => (
            <div key={index} className="tw-flex tw-items-center tw-space-x-4">
              <div className="tw-flex-shrink-0 tw-w-12 tw-h-12 tw-bg-amber-500 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                {item.icon}
              </div>
              <div>
                <h4 className="tw-font-semibold tw-text-white">{item.title}</h4>
                <p className="tw-text-sm tw-text-gray-400">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Content Section */}
        <div className="tw-py-8 tw-px-4 sm:tw-px-6 lg:tw-px-8 md:tw-py-12 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8 md:tw-gap-12">
          {/* RENAX Info */}
          <div>
    <h3 className="tw-text-3xl tw-font-bold tw-mb-4">
                <span className="tw-text-amber-500">RE</span>
                <span className="tw-text-white">CALO</span>
              </h3>
            <p className="tw-text-sm tw-mb-6 tw-leading-relaxed tw-text-gray-400">
              Rent a car imperdiet sapien porttito the bibendum ellentesue the commodo erat nesuen.
            </p>
            <div className="tw-flex tw-space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.ariaLabel}
                  className="tw-w-10 tw-h-10 tw-bg-amber-500 tw-rounded-full tw-flex tw-items-center tw-justify-center hover:tw-bg-amber-600 tw-transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="tw-text-xl tw-font-semibold tw-text-white tw-mb-5">Quick Links</h4>
            <ul className="tw-space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:tw-text-amber-500 tw-text-white tw-transition-colors tw-text-sm tw-flex tw-items-center">
                    <span className="tw-w-1.5 tw-h-1.5 tw-bg-amber-500 tw-rounded-full tw-mr-3"></span> {/* Removed tw-text-white from bullet as bg covers it */}
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links / Subscribe Placeholder */}
          <div>
            <h4 className="tw-text-xl tw-font-semibold tw-text-white tw-mb-5">More</h4> {/* Changed title */}
            <ul className="tw-space-y-3">
              {moreLinks.map((link) => ( // Using a different link set for variety
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

        <div className="tw-py-6 tw-md:py-8 tw-border-t tw-border-gray-700 tw-flex tw-flex-col sm:tw-flex-row tw-justify-center tw-items-center tw-text-sm">
          <p className="tw-text-gray-500 tw-mb-4 sm:mb-0">
            ©{new Date().getFullYear()} <a href="#" className="tw-text-amber-500 hover:tw-underline">RECALO</a>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;