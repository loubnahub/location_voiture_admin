import React from 'react';
import {
  Car,              
  CarFront,         
  MountainSnow,    
  Gem,             
  PlaneTakeoff,     
  CalendarClock,    
  Edit3,            
  Wrench,           
  ShieldCheck,      
  Users,            
} from 'lucide-react';
import Header from '../../Header/Nav'; // Ensure this path is correct

const rentalServicesData = [
  // ... (data remains unchanged)
  {
    title: 'Economy & Compact Cars',
    description: 'Perfect for city driving and budget-conscious travelers. Fuel-efficient and easy to park.',
    icon: CarFront,
    link: '/rentals/economy',
  },
  {
    title: 'Sedans & Family Cars',
    description: 'Comfortable and spacious sedans ideal for families, business trips, or longer journeys.',
    icon: Car,
    link: '/rentals/sedans',
  },
  {
    title: 'SUVs & 4x4 Adventure',
    description: 'Explore with confidence. Our SUVs offer ample space, power, and versatility for any terrain.',
    icon: MountainSnow,
    link: '/rentals/suvs',
  },
  {
    title: 'Luxury & Premium Rides',
    description: 'Travel in style. Indulge in our selection of high-end vehicles for an exceptional driving experience.',
    icon: Gem,
    link: '/rentals/luxury',
  },
  {
    title: 'Airport Car Rentals',
    description: 'Convenient airport pickup and drop-off services to get you on the road as soon as you land.',
    icon: PlaneTakeoff,
    link: '/rentals/airport',
  },
  {
    title: 'Long-Term Leasing',
    description: 'Flexible and cost-effective solutions for those needing a vehicle for an extended period.',
    icon: CalendarClock,
    link: '/rentals/long-term',
  },
  {
    title: 'Flexible Booking Online',
    description: 'Easy-to-use online booking system with options for modifications and hassle-free cancellations.',
    icon: Edit3,
    link: '/booking',
  },
  {
    title: '24/7 Roadside Assistance',
    description: 'Drive with peace of mind knowing our dedicated support team is available around the clock.',
    icon: Wrench,
    link: '/support/roadside-assistance',
  },
];

const RentalCarsPage = () => {
  const heroBackgroundImage = '/images/Cars/ServicesPages.jpg';

  return (
    <div className="tw-bg-[#1B1B1B] tw-min-h-screen tw-text-white">
      <Header />

      {/* Hero Section */}
      <div
        // --- UPDATED FOR MOBILE ---
        // Centered on mobile, left on larger screens.
        // Disabled fixed background on mobile for performance.
        className="tw-relative tw-h-[50vh] sm:tw-h-[60vh] md:tw-h-[450px] lg:tw-h-[690px] tw-flex tw-items-center tw-justify-center sm:tw-justify-start tw-bg-cover tw-bg-center md:tw-bg-fixed"
        style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      >
        <div className="tw-absolute tw-inset-0 tw-bg-black/40"></div> {/* Dark overlay */}
        {/* --- UPDATED FOR MOBILE ---
            Text centered on mobile, left on larger screens.
            Adjusted padding for smaller devices.
        */}
        <div className="tw-relative tw-z-10 tw-text-center sm:tw-text-left tw-px-4 sm:tw-px-8 md:tw-px-16 tw-max-w-4xl">
          <p className="tw-text-amber-400 tw-uppercase tw-tracking-wider tw-text-sm tw-font-semibold tw-mb-2 sm:tw-mb-3">
            WHAT WE DO  
          </p>
          <h1 className="tw-text-3xl sm:tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-leading-tight">
            Our <span className="tw-text-amber-400">Services</span>
          </h1>
        </div>
      </div>

      {/* Services Grid Section - Introduction */}
      {/* Adjusted vertical padding for mobile */}
      <div className="tw-bg-[#1B1B1B] tw-py-12 sm:tw-py-20 lg:tw-py-24">
        <div className="container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
          <div className="tw-text-center tw-mb-12 lg:tw-mb-16">
            <h2 className="tw-text-3xl sm:tw-text-4xl tw-font-semibold tw-text-white">
              The Keys to Your Next Journey
            </h2>
            <p className="tw-mt-3 sm:tw-mt-4 tw-text-gray-400 tw-max-w-2xl tw-mx-auto tw-text-sm sm:tw-text-base">
              Discover convenience, flexibility, and the right car for any purpose with our comprehensive rental services.
            </p>
          </div>

          {/* Rental Services Grid (Already mobile-friendly) */}
          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6 md:tw-gap-8">
            {rentalServicesData.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="tw-bg-[#242424] tw-p-6 tw-rounded-lg tw-shadow-xl tw-flex tw-flex-col tw-text-center tw-items-center
                             tw-transform tw-transition-all tw-duration-300 hover:tw-scale-105 hover:tw-shadow-amber-500/30 group"
                >
                  <div className="tw-mb-5 tw-p-4 tw-rounded-full tw-bg-amber-500/10 tw-text-amber-400 group-hover:tw-bg-amber-500/20 tw-transition-colors tw-duration-300">
                    <IconComponent size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="tw-text-xl tw-font-semibold tw-text-white tw-mb-3 group-hover:tw-text-amber-400 tw-transition-colors tw-duration-300">
                    {service.title}
                  </h3>
                  <p className="tw-text-gray-400 tw-text-sm tw-leading-relaxed tw-mb-6 tw-flex-grow">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Choose Us / Features Section */}
      <div className="tw-bg-[#1F1F1F] tw-py-12 sm:tw-py-20 lg:tw-py-24">
        <div className="container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-text-center">
          <h2 className="tw-text-3xl sm:tw-text-4xl tw-font-semibold tw-text-amber-400 tw-mb-4">
            Why Rent With Us?
          </h2>
          <p className="tw-text-gray-400 tw-max-w-2xl tw-mx-auto tw-mb-10 sm:tw-mb-12 lg:tw-mb-16 tw-text-sm sm:tw-text-base">
            We are committed to providing an exceptional car rental experience with benefits that set us apart.
          </p>
          {/* Feature list grid (Already mobile-friendly) */}
          <div className="tw-max-w-4xl tw-mx-auto tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8 tw-text-left">
            {[
              { title: "Wide Vehicle Selection", description: "From compact cars to luxury SUVs, find the perfect vehicle for your needs from our diverse and modern fleet.", icon: Car },
              { title: "Competitive & Transparent Pricing", description: "Enjoy affordable rates with no hidden fees. Get the best value for your money every time you rent.", icon: ShieldCheck },
              { title: "Easy Online Booking", description: "Our user-friendly platform allows you to reserve your car in minutes, anytime, anywhere.", icon: Edit3 },
              { title: "Excellent Customer Support", description: "Our friendly team is here to assist you at every step, ensuring a smooth and hassle-free rental.", icon: Users },
              { title: "Flexible Rental Terms", description: "We offer various rental durations and options to suit your specific travel plans and budget.", icon: CalendarClock },
              { title: "Well-Maintained Vehicles", description: "All our cars are regularly serviced and cleaned to ensure your safety and comfort on the road.", icon: Wrench },
            ].map((feature, idx) => (
              <div key={idx} className="tw-bg-[#242424] tw-p-6 tw-rounded-lg tw-flex tw-items-start tw-space-x-4">
                <div className="tw-flex-shrink-0 tw-mt-1">
                  <feature.icon className="tw-h-7 tw-w-7 tw-text-amber-400" />
                </div>
                <div>
                  <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-1">{feature.title}</h3>
                  <p className="tw-text-gray-400 tw-text-sm tw-leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalCarsPage;