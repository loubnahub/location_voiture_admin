import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Car, Users, Award } from 'lucide-react';
import { fetchAgencyInfo } from '../../../services/api'; // Ensure this path is correct

const ExperienceBar = () => {
  // State to hold the dynamically constructed stats data
  const [statsData, setStatsData] = useState([]);
  
  // Hook to trigger animation when the component is visible
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  // Fetch data on component mount
  useEffect(() => {
    const getStats = async () => {
      try {
        const response = await fetchAgencyInfo();
        const info = response.data;

        // Dynamically build the stats array using data from the API
        const newStatsData = [
          {
            icon: <Car size={32} className="tw-text-white" />,
            value: 100, // Fallback to 0 if null
            suffix: '+',
            label: 'Vehicle Models',
          },
          {
            icon: <Users size={32} className="tw-text-white" />,
            value:  200,
            suffix: '+',
            label: 'Clients',
          },
          {
            icon: <Award size={32} className="tw-text-white" />,
            value: info.YearsExperience || 0,
            suffix: '+',
            label: 'Years of Experience',
          },
        ];
        
        setStatsData(newStatsData);
      } catch (error) {
        console.error("Failed to fetch experience bar stats:", error);
      }
    };

    getStats();
  }, []); // The empty array ensures this runs only once

  // If there's no data yet, don't render the component to avoid layout shifts
  if (statsData.length === 0) {
    return null;
  }

  return (
    <div className="tw-w-full tw-bg-[#1b1b1b] tw-font-sans tw-rounded-xl tw-shadow-md tw-shadow-[#E61C1C] tw-z-[1000]">
      <div className="tw-mx-auto tw-m-auto tw-px-4 sm:tw-px-6 tw-rounded-xl lg:tw-px-8">
        <div ref={ref} className="tw-p-8 sm:tw-p-5">
          <div className="tw-grid tw-grid-cols-1 tw-justify-center sm:tw-grid-cols-3 tw-gap-8 tw-m-auto">
            {statsData.map((stat, index) => (
              <div 
                key={index} 
                className="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-center tw-gap-4 tw-p-4"
              >
                <div className="tw-flex-shrink-0">
                  {stat.icon}
                </div>
                <div className="tw-text-center sm:tw-text-left">
                  <p className="tw-text-4xl lg:tw-text-5xl tw-font-bold tw-text-[#ffff]">
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