import React from 'react';

// Simplified SVG Icons (you can replace these with more detailed SVGs or an icon library)
const EffortlessBookingIcon = ({ className }) => (
  <img src="\images\Icons\Bokking.png" alt="" />
);

const DiverseFleetIcon = ({ className }) => (
    <img src="\images\Icons\Car.png" alt="" />
);

const SupportIcon = ({ className }) => (
  // Simplified headset with 24/7 text
  <img src="\images\Icons\24-7.png" alt="" />
);

const featureData = [
  {
    Icon: EffortlessBookingIcon,
    title: "Effortless Booking",
    description: "User-friendly online reservations with instant confirmation.",
    iconColor: "#443E27", // Dark olive for the icon
  },
  {
    Icon: DiverseFleetIcon,
    title: "Diverse Fleet",
    description: "A wide range of well-maintained vehicles  to suit every preference.",
    iconColor: "#443E27",
  },
  {
    Icon: SupportIcon,
    title: "24/7 Customer Support",
    description: "Our dedicated team is available around the clock to assist you with any inquiries or issues.",
    iconColor: "#443E27", // This icon's text part will use this color too
  },
];

const WhyChooseUsSection = () => {
  // Inline style for the radial gradient background of the icon circle
 

  return (
    <div className="bg-[#1B1B1B]  py-16 sm:py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Why Choose Us
          </h2>
          <p className="text-base sm:text-lg text-white leading-relaxed">
            Experience seamless car rentals tailored to your needs. We combine
            professionalism with personalized service to ensure your journey starts smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-10">
          {featureData.map((feature, index) => (
            <div key={index} className="text-center flex flex-col items-center">
              <div className="mb-5 sm:mb-6">
                {/* Outer darker ring for the icon */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full  p-[7px] sm:p-[7px] flex items-center justify-center shadow-xl">
                  {/* Inner gradient circle */}
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    
                  >
                    <feature.Icon className={`w-12 h-12 sm:w-14 sm:h-14`}  />
                  </div>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed px-2 sm:px-0 max-w-xs mx-auto">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUsSection;