import React from 'react';
import {
  Car,              
  CarFront,         
  MountainSnow,    
  Gem,              // Luxury
  PlaneTakeoff,     // Airport Rentals
  CalendarClock,    // Long-Term
  Edit3,            // Flexible Booking
  Wrench,           // Roadside Support / Maintenance
  ShieldCheck,      // Could be for reliability or premium
  Users,            // For Vans/Minibuses (if included)
  // Add any other icons you might want
} from 'lucide-react';
import Header from '../../Header/Nav'; // Ensure this path is correct

// Updated servicesData focused on car rentals
const rentalServicesData = [
  {
    title: 'Economy & Compact Cars',
    description: 'Perfect for city driving and budget-conscious travelers. Fuel-efficient and easy to park.',
    icon: CarFront,
    link: '/rentals/economy', // Example link
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
    icon: MountainSnow, // Or use Car if preferred and style it
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
    icon: Wrench, // Or ShieldAlert
    link: '/support/roadside-assistance',
  },
];

const RentalCarsPage = () => {
  // IMPORTANT: Replace this with your actual hero image for rental cars
  // For example: 'public/images/banners/rental-hero.jpg' or an Unsplash URL
  const heroBackgroundImage = '/images/Cars/ServicesPages.jpg'; // Placeholder image

  return (
    <div className="bg-[#1B1B1B] min-h-screen text-white">
      <Header />

      {/* Hero Section */}
      <div
        className="relative h-[50vh] sm:h-[60vh] md:h-[450px] lg:h-[690px] flex items-center justify-left text-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div> {/* Dark overlay */}
        <div className="relative z-10 text-left px-4">
          <p className="text-amber-400 uppercase  tracking-wider pl-2 text-sm font-semibold mb-2 sm:mb-3 ">
          WHAT WE DO  
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Our <span className="text-amber-400">Services</span>
          </h1>
        </div>
      </div>

      {/* Services Grid Section - Introduction */}
      <div className="bg-[#1B1B1B] py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">
              The Keys to Your Next Journey
            </h2>
            <p className="mt-3 sm:mt-4 text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Discover convenience, flexibility, and the right car for any purpose with our comprehensive rental services.
              We offer a wide array of premium rental vehicles designed to meet your every need.
            </p>
          </div>

          {/* Rental Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {rentalServicesData.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="bg-[#242424] p-6 rounded-lg shadow-xl flex flex-col text-center items-center
                             transform transition-all duration-300 hover:scale-105 hover:shadow-amber-500/30 group"
                >
                  <div className="mb-5 p-4 rounded-full bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors duration-300">
                    <IconComponent size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-amber-400 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                    {service.description}
                  </p>
                 
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Choose Us / Features Section */}
      <div className="bg-[#1B1B1B] py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-amber-400 mb-4">
            Why Rent With Us?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 sm:mb-12 lg:mb-16 text-sm sm:text-base">
            We are committed to providing an exceptional car rental experience with benefits that set us apart.
          </p>
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {[
              { title: "Wide Vehicle Selection", description: "From compact cars to luxury SUVs, find the perfect vehicle for your needs from our diverse and modern fleet.", icon: Car /* Or use a 'List' icon */ },
              { title: "Competitive & Transparent Pricing", description: "Enjoy affordable rates with no hidden fees. Get the best value for your money every time you rent.", icon: ShieldCheck /* Or a 'DollarSign' icon */ },
              { title: "Easy Online Booking", description: "Our user-friendly platform allows you to reserve your car in minutes, anytime, anywhere.", icon: Edit3 },
              { title: "Excellent Customer Support", description: "Our friendly team is here to assist you at every step, ensuring a smooth and hassle-free rental.", icon: Users /* Or 'Smile' icon */ },
              { title: "Flexible Rental Terms", description: "We offer various rental durations and options to suit your specific travel plans and budget.", icon: CalendarClock },
              { title: "Well-Maintained Vehicles", description: "All our cars are regularly serviced and cleaned to ensure your safety and comfort on the road.", icon: Wrench },
            ].map((feature, idx) => (
              <div key={idx} className="bg-[#1F1F1F] p-6 rounded-lg flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <feature.icon className="h-7 w-7 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
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