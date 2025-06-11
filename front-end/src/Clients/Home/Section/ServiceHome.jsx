import React from 'react';
import { LayoutGrid, Laptop, ShieldCheck, Clock } from 'lucide-react';
// Assuming the car image is in your public/images/Cars/ directory
const carImageUrl = '/images/Cars/carourservices.png'; 

const OurServiceSection = () => {
  
    const services = [
      {
        icon: <LayoutGrid size={24} className="tw-text-white" />,
        title: 'Formules de location flexibles',
        description: 'Choisissez une location à la journée, à la semaine ou au mois selon vos besoins et votre budget.',
      },
      {
        icon: <Laptop size={24} className="tw-text-white" />,
        title: 'Réservation en ligne facile',
        description: 'Réservez votre véhicule rapidement via notre site web ou application intuitive.',
      },
      {
        icon: <ShieldCheck size={24} className="tw-text-white" />,
        title: 'Véhicules entièrement assurés',
        description: 'Roulez en toute sécurité grâce à nos véhicules couverts par une assurance complète.',
      },
      {
        icon: <Clock size={24} className="tw-text-white" />,
        title: 'Support client 24h/24',
        description: 'Notre équipe est disponible à tout moment pour répondre à vos questions et vous accompagner.',
      },
    ];

  

  return (
    <div className="tw-bg-[#1B1B1B] tw-text-white tw-overflow-hidden">
      <div className="tw-mx-auto ">
        <h2 className="tw-text-3xl tw-pl-11 sm:tw-text-4xl lg:tw-text-5xl tw-font-bold tw-text-center md:tw-text-left">
          Our Service
        </h2>
        <div className="tw-grid tw-grid-cols-1 tw-pl-10 tw-pb-5 md:tw-grid-cols-2 tw-gap-10 md:tw-gap-12 lg:tw-gap-16 tw-items-center">
          {/* Left Column: Services List */}
          <div className="tw-space-y-6 sm:tw-space-y-8 tw-order-2 md:tw-order-1">
            {services.map((service, index) => (
              <div key={index} className="tw-flex tw-items-start tw-space-x-4">
                <div className="tw-flex-shrink-0 tw-bg-gray-700/60 tw-p-3 tw-rounded-full tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center">
                  {service.icon}
                </div>
                <div>
                  <h3 className="tw-text-lg sm:tw-text-xl tw-font-semibold tw-text-white tw-mb-1">
                    {service.title}
                  </h3>
                  <p className="tw-text-gray-300 tw-text-sm sm:tw-text-base tw-leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Car Image and Decorative Elements - Now with overflow */}
          {/* Note: 'overflow-x' is not a standard Tailwind class. It should be 'overflow-x-auto' or 'overflow-x-scroll' or 'overflow-x-hidden' or 'overflow-x-visible' */}
          {/* I will assume you meant 'overflow-x-auto' or similar for scrolling if content overflows. If not, it won't apply. */}
          {/* If it was a custom class, prefixing would be 'tw-overflow-x'. */}
          <div className="tw-relative tw-order-1 md:tw-order-2 tw-overflow-x-hidden"> {/* Changed to tw-overflow-x-auto for potential scroll */}
            {/* This inner div allows content to be wider and establishes scrollable width */}
            <div className="tw-relative "> {/* w-max makes it as wide as its content */}   
           
              <img
                src={carImageUrl}
                alt="Luxury Sports Car"
                className="tw-relative tw-z-10 tw-h-[850px] tw-max-w-none 
                  tw-drop-shadow-[0_20px_25px_rgba(0,0,0,0.3)]"
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServiceSection;