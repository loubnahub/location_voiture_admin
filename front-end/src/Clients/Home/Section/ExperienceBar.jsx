import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Car, Users, Award } from 'lucide-react'; // Importing icons

// The data is now more structured, including icons and the raw number for counting
const statsData = [
  {
    icon: <Car size={32} className="tw-text-white" />,
    value: 50,
    suffix: '+',
    label: 'Vehicle Models',
  },
  {
    icon: <Users size={32} className="tw-text-white" />,
    value: 1298,
    suffix: '+',
    label: 'Clients',
  },
  {
    icon: <Award size={32} className="tw-text-white" />,
    value: 20,
    suffix: '+',
    label: 'Years of Experience',
  },
];

const ExperienceBar = () => {
  // This hook will tell us when the component is visible
  const { ref, inView } = useInView({
    triggerOnce: true, // The animation will only trigger once
    threshold: 0.3,    // Trigger when 30% of the component is visible
  });

  return (
    <div className="tw-w-full tw-bg-[#222222]/40  tw-font-sans ">
      <div className=" tw-mx-auto tw-m-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
        {/* The ref is attached here. The animation starts when this div is in view. */}
        <div ref={ref} className="tw-p-8 sm:tw-p-5 ">
          
          <div className="tw-grid tw-grid-cols-1 tw-justify-center sm:tw-grid-cols-3 tw-gap-8  tw-m-auto">
            
            {statsData.map((stat, index) => (
              // Each stat is now in its own self-contained div
              <div 
                key={index} 
                className="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-center tw-gap-4 tw-p-4"
              >
                {/* Icon */}
                <div className="tw-flex-shrink-0">
                  {stat.icon}
                </div>

                {/* Stat Text */}
                <div className="tw-text-center sm:tw-text-left">
                  <p className="tw-text-4xl lg:tw-text-5xl tw-font-bold tw-text-[#FFA600]">
                    {inView ? (
                      <CountUp 
                        start={0} 
                        end={stat.value} 
                        duration={2.5} 
                        suffix={stat.suffix} 
                      />
                    ) : (
                      `0${stat.suffix}` // Show 0 before animation starts
                    )}
                  </p>
                  <p className="tw-mt-1 tw-text-sm tw-text-gray-400 tw-tracking-wide">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceBar;