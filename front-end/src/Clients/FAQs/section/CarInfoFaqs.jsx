import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CarInfoSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const accordionItemsData = [
    { 
      id: 1, 
      number: '1.', 
      title: 'Age and responsibility', 
      content: 'Driver must be 25+ years old to drive economy, luxury cars and supercars. Additional age restrictions may apply for specific high-performance vehicles.' 
    },
    { 
      id: 2, 
      number: '2.', 
      title: 'Deposit', 
      content: 'A security deposit is required for all rentals. The amount varies depending on the vehicle category and will be pre-authorized on your credit card.' 
    },
    { 
      id: 3, 
      number: '3.', 
      title: 'Documents', 
      content: 'A valid driver\'s license and a credit card in the main driver\'s name are mandatory. International visitors may need an International Driving Permit.' 
    },
    { 
      id: 4, 
      number: '4.', 
      title: 'Car Delivery', 
      content: 'We offer convenient car delivery and pickup services to your specified location, such as airports, hotels, or residences, subject to availability and potential fees.' 
    },
    { 
      id: 5, 
      number: '5.', 
      title: 'Enquire Now', 
      content: 'Have specific questions or need a custom quote? Click here to send us an enquiry, and our team will get back to you shortly.' 
    },
    { 
      id: 6, 
      number: '6.', 
      title: 'Payment Methodes', // Typo: "Methodes" should likely be "Methods"
      content: 'We accept major credit cards (Visa, MasterCard, American Express) for payments and security deposits. Debit cards may be accepted for payment but typically not for deposits.' 
    },
  ];

  const leftItems = accordionItemsData.slice(0, 3);
  const rightItems = accordionItemsData.slice(3, 6);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const AccordionItem = ({ item, index, isActive, onToggle }) => (
    <div 
      className={`tw-rounded-xl tw-transition-all tw-duration-300 tw-ease-in-out tw-overflow-hidden tw-shadow-lg ${
        isActive ? 'tw-bg-[#FFA600]' : 'tw-bg-[#2a2a2a] hover:tw-bg-[#3a3a3a]'
      }`}
    >
      <button
        onClick={() => onToggle(index)}
        className="tw-w-full tw-p-5 sm:tw-p-6 tw-border-0 tw-bg-transparent tw-flex tw-items-center tw-justify-between focus:tw-outline-none"
        aria-expanded={isActive}
        aria-controls={`accordion-content-${item.id}`}
      >
        <span className={`tw-text-base sm:tw-text-lg tw-font-semibold tw-text-left ${
          isActive ? 'tw-text-black' : 'tw-text-white'
        }`}>
          <span className={`${isActive ? 'tw-text-black/80' : 'tw-text-[#FFA600]'} tw-mr-2`}>{item.number}</span>
          {item.title}
        </span>
        {isActive ? (
          <ChevronUp size={20} className="tw-text-black" strokeWidth={2.5} />
        ) : (
          <ChevronDown size={20} className="tw-text-[#FFA600]" strokeWidth={2.5} />
        )}
      </button>
      {isActive && (
        <div 
          id={`accordion-content-${item.id}`}
          className="tw-px-5 sm:tw-px-6 tw-pb-5 sm:tw-pb-6"
        >
          <p className="tw-text-sm sm:tw-text-base tw-text-black/90 tw-leading-relaxed">
            {item.content}
          </p>
        </div>
      )}
    </div>
  );


  return (
    <section className="tw-bg-[#1b1b1b] tw-py-16 sm:tw-py-24 tw-px-4 sm:tw-px-6 lg:tw-px-8">
      <div className="tw-container tw-mx-auto">
        {/*
          On medium screens and up, the parent grid will align the START of each of its 3 direct children (the two columns of accordions and the image container).
          The image container itself uses flex to center its content (the image).
          The "centered" feel is relative to the heights of the accordion columns.
        */}
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-12 tw-gap-8 sm:tw-gap-12 md:tw-items-center"> {/* Try md:tw-items-center for the grid */}
          
          <div className="md:tw-col-span-4 tw-space-y-4">
            {leftItems.map(item => (
              <AccordionItem
                key={item.id}
                item={item}
                index={item.id}
                isActive={activeIndex === item.id}
                onToggle={toggleAccordion}
              />
            ))}
          </div>

          {/* Image Container - This is the central column */}
          <div className="md:tw-col-span-4 tw-flex tw-justify-center tw-items-center tw-order-first md:tw-order-none">
            {/* 
              The padding-top (md:tw-pt-8 lg:tw-pt-12) was an attempt to visually balance. 
              If you want the image strictly centered within its column, remove this padding.
              The overall vertical centering across the entire component's height (including expanded accordions)
              is hard to achieve with pure CSS grid/flex when column heights are dynamic and different.
            */}
            <img 
              src="/images/Cars/Faqs.png" // Ensure this path is correct (from public folder)
              alt="Car" 
              className="tw-max-w-full tw-h-auto md:tw-max-w-xs lg:tw-max-w-sm xl:tw-max-w-md" // Adjusted max-widths
            />
          </div>

          <div className="md:tw-col-span-4 tw-space-y-4">
            {rightItems.map(item => (
              <AccordionItem
                key={item.id}
                item={item}
                index={item.id}
                isActive={activeIndex === item.id}
                onToggle={toggleAccordion}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default CarInfoSection;