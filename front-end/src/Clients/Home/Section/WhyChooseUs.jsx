import React from 'react';

// Simplified SVG Icons (you can replace these with more detailed SVGs or an icon library)
// Ensure these image paths are correct relative to your public folder.
const EffortlessBookingIcon = ({ className }) => (
  <img src="/images/Icons/Bokking.png" alt="Effortless Booking Icon" className={className} />
);

const DiverseFleetIcon = ({ className }) => (
    <img src="/images/Icons/Car.png" alt="Diverse Fleet Icon" className={className} />
);

const SupportIcon = ({ className }) => (
  // Simplified headset with 24/7 text
  <img src="/images/Icons/24-7.png" alt="24/7 Support Icon" className={className} />
);

const featureData = [
  {
    Icon: EffortlessBookingIcon,
    title: "Effortless Booking",
    description: "User-friendly online reservations with instant confirmation.",
    // iconColor is not used in this version since icons are images, but kept for data structure consistency
    iconColor: "#443E27", 
  },
  {
    Icon: DiverseFleetIcon,
    title: "Diverse Fleet",
    description: "A wide range of well-maintained vehicles to suit every preference.",
    iconColor: "#443E27",
  },
  {
    Icon: SupportIcon,
    title: "24/7 Customer Support",
    description: "Our dedicated team is available around the clock to assist you with any inquiries or issues.",
    iconColor: "#443E27",
  },
];

const WhyChooseUsSection = () => {
  // Inline style for the radial gradient background of the icon circle
  // Removed iconCircleStyle as it wasn't used with image icons.
  // The background for the icon circle will be handled by Tailwind classes if needed.

  return (
    <div className="tw-bg-[#1B1B1B] tw-py-16 sm:tw-py-20 md:tw-py-24">
      <div className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
        <div className="tw-text-center tw-max-w-2xl tw-mx-auto tw-mb-12 md:tw-mb-16">
          <h2 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-bold tw-text-white tw-mb-4 tw-tracking-tight">
            Why Choose Us
          </h2>
          <p className="tw-text-base sm:tw-text-lg tw-text-white tw-leading-relaxed">
            Experience seamless car rentals tailored to your needs. We combine
            professionalism with personalized service to ensure your journey starts smoothly.
          </p>
        </div>

        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-x-8 tw-gap-y-12 md:tw-gap-y-10">
          {featureData.map((feature, index) => (
            <div key={index} className="tw-text-center tw-flex tw-flex-col tw-items-center">
              <div className="tw-mb-5 sm:tw-mb-6">
                {/* Outer darker ring for the icon - if you want a bg color, add it here e.g., tw-bg-neutral-800 */}
                <div className="tw-w-28 tw-h-28 sm:tw-w-32 sm:tw-h-32  tw-p-[7px] sm:tw-p-[7px] tw-flex tw-items-center tw-justify-center ">
                  {/* Inner circle - if you want a bg color for the icon container, add it here e.g., tw-bg-neutral-700 */}
                  <div
                    className="tw-w-full tw-h-full    tw-flex tw-items-center tw-justify-center"
                  >
                    {/* Pass the Tailwind classes for sizing to the image icon component */}
                    <feature.Icon className={`tw-w-20 tw-h-20 sm:tw-w-20 sm:tw-h-20 tw-object-contain`} />
                  </div>
                </div>
              </div>
              <h3 className="tw-text-lg sm:tw-text-xl tw-font-semibold tw-text-gray-100 tw-mb-2">
                {feature.title}
              </h3>
              <p className="tw-text-sm tw-text-gray-500 tw-leading-relaxed tw-px-2 sm:tw-px-0 tw-max-w-xs tw-mx-auto">
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