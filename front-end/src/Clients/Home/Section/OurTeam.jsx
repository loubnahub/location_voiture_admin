import React, { useState, useEffect } from 'react';
import { fetchPublicTeamMembers } from '../../../services/api'; // Ensure path is correct

// A helper function to get initials from a name
const getInitials = (name) => {
  if (!name) return '?';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.substring(0, 2).toUpperCase();
};

const TeamMemberCard = ({ member }) => {
  return (
    <div className="tw-w-[80vw] sm:tw-w-[45vw] md:tw-w-[30vw] lg:tw-w-[22vw] tw-flex-shrink-0 tw-px-4">
      <div className="tw-relative tw-rounded-3xl tw-overflow-hidden tw-aspect-[4/5] 
                     tw-bg-[#1b1b1b]/60 tw-backdrop-blur-lg 
                     tw-border tw-border-white/10">
        
        {/* ✅ CONDITIONAL RENDERING FOR THE IMAGE ✅ */}
        {member.image_url ? (
          // If image_url exists, show the image
          <img
            src={member.image_url} 
            alt={member.name}
            className="tw-w-full tw-h-full tw-object-cover"
          />
        ) : (
          // If no image, show a placeholder with initials
          <div className="tw-w-full tw-h-full tw-bg-gray-800 tw-flex tw-items-center tw-justify-center">
            <span className="tw-text-5xl tw-font-bold tw-text-gray-500">
              {getInitials(member.name)}
            </span>
          </div>
        )}
        
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="tw-absolute tw-bottom-6 tw-left-6 tw-right-6 tw-text-white">
          <h3 className="tw-text-xl lg:tw-text-2xl tw-font-bold tw-mb-1">
            {member.name}
          </h3>
          <p className="tw-text-amber-400 tw-text-sm tw-font-medium">
            {member.role}
          </p>
        </div>
      </div>
    </div>
  );
};

const OurTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const getTeamMembers = async () => {
      try {
        const response = await fetchPublicTeamMembers();
        setTeamMembers(response.data);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };
    getTeamMembers();
  }, []);

  if (teamMembers.length === 0) {
    return null;
  }

  return (
    <section className="tw-bg-[#1b1b1b] tw-py-16 sm:tw-py-20 md:tw-py-24">
      <div className="tw-container tw-mx-auto tw-max-w-7xl tw-px-4">
        <div className="tw-text-center tw-mb-12 sm:tw-mb-16">
          <p className="tw-text-amber-500 tw-text-lg sm:tw-text-xl tw-font-semibold tw-uppercase tw-tracking-wide tw-mb-2">
            Our Team
          </p>
          <h2 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-bold tw-text-white tw-mb-4">
            Meet Our Experts
          </h2>
          <p className="tw-text-gray-400 tw-max-w-2xl tw-mx-auto tw-text-base sm:tw-text-lg">
            Professional car rental specialists dedicated to providing you with exceptional service.
          </p>
        </div>
      </div>

      <div className="tw-relative tw-flex group tw-overflow-hidden">
        <div className="tw-flex tw-animate-marquee group-hover:[animation-play-state:paused]">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
          {teamMembers.map((member) => (
            <TeamMemberCard key={`duplicate-${member.id}`} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;