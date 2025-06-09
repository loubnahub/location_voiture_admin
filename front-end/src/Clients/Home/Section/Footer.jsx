// src/components/Footer.jsx
import React from 'react';
import { Phone, Mail, MapPin, ChevronUp, Youtube, Facebook, MessageSquare } from 'lucide-react'; // Removed ArrowRight

const Footer = () => {
  const quickLinks = [
    { name: 'Home', href: '#' },
    { name: 'Aboute', href: '#' },
    { name: 'Servicex', href: '#' },
    { name: 'Vehicle Fleet', href: '#' },
    { name: 'Contact', href: '#' },
  ];
 


  const socialLinks = [
    { icon: <MessageSquare size={20} className="text-gray-900" />, href: '#', ariaLabel: 'WhatsApp' },
    { icon: <Facebook size={20} className="text-gray-900" />, href: '#', ariaLabel: 'Facebook' },
    { icon: <Youtube size={20} className="text-gray-900" />, href: '#', ariaLabel: 'YouTube' },
  ];

  const contactInfo = [
    {
      icon: <Phone size={24} className="text-gray-900" />,
      title: 'Call us',
      detail: ['+212 0674811990' ,  '+212 060604405'],
    },
    {
      icon: <Mail size={24} className="text-gray-900" />,
      title: 'Write to us',
      detail: 'contact@Reaclo.com',
    },
    {
      icon: <MapPin size={24} className="text-gray-900" />,
      title: 'Address',
      detail: 'lazaret oujda, Recalo',
    },
  ];

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1B1B1B] ">
      <div className=" mx-auto ">
        {/* Top Contact Section - Line below this section */}
        <div className="  py-8 px-10 md:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 border-b border-gray-700">
          {contactInfo.map((item, index) => (
            <div key={index} className="flex items-center space-x-4 ">
              <div className="flex-shrink-0 w-12 h-12  bg-amber-500 rounded-full flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <h4 className="font-semibold text-white">{item.title}</h4>
                <p className="text-sm text-gray-400">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Content Section */}
        <div className="py-8 m-auto  md:py-12 grid grid-cols-1 px-10 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {/* RENAX Info */}
          <div>
            <h3 className="text-3xl font-bold mb-4">
              <span className="text-amber-500">RE</span>
              <span className="text-white">CALO</span>
            </h3>
            <p className="text-sm mb-6 leading-relaxed text-gray-400">
              Rent a car imperdiet sapien porttito the bibendum ellentesue the commodo erat nesuen.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.ariaLabel}
                  className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-amber-500 text-white transition-colors text-sm flex items-center">
                    <span className="w-1.5 h-1.5 bg-amber-500 text-white rounded-full mr-3"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe - Input removed */}
          <div>
          <h4 className="text-xl font-semibold text-white mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-amber-500 text-white transition-colors text-sm flex items-center">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full text-white mr-3"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Scroll to Top - Line above this section */}
        <div className="py-6 md:py-8 border-t border-gray-700 flex flex-col sm:flex-row justify-center items-center text-sm">
          <p className="text-gray-500 mb-4 sm:mb-0">
            ©{new Date().getFullYear()} <a href="#" className="text-amber-500 hover:underline">RECALO</a>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;