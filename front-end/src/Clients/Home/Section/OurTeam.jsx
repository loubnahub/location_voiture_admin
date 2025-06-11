import React from 'react';

// Car rental team data
const teamMembersData = [
  {
    id: 1,
    name: "Lahyane Oussama",
    role: "Fleet Manager",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
  },
  {
    id: 2,
    name: "Messoussi Loubna",
    role: "Lead Developer", // Example role change
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
  },
  {
    id: 3,
    name: "Oliva White", // Name kept as per original
    role: "Customer Success Manager",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80", // Different image for variety
  },
];

const TeamMemberCard = ({ member }) => {
  return (
    <div className="tw-relative group tw-cursor-pointer">
      {/* Card Container */}
      <div className="tw-relative tw-bg-neutral-800 tw-rounded-3xl tw-overflow-hidden tw-aspect-[4/5] group-hover:tw-scale-105 tw-transition-transform tw-duration-300 tw-shadow-2xl"> {/* Changed bg, added shadow */}
        
        {/* Background Image */}
        <img
          src={member.imageUrl}
          alt={member.name}
          className="tw-w-full tw-h-full tw-object-cover"
        />
        
        {/* Dark Gradient Overlay */}
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-t from-black/80 via-black/30 to-transparent" /> {/* Slightly stronger gradient */}
        
        {/* Content positioned at bottom */}
        <div className="tw-absolute tw-bottom-6 tw-left-6 tw-right-6 tw-text-white"> {/* Added right-6 for safety with long names */}
          <h3 className="tw-text-xl lg:tw-text-2xl tw-font-bold tw-mb-1"> {/* Responsive text size */}
            {member.name}
          </h3>
          <p className="tw-text-amber-400 tw-text-sm tw-font-medium"> {/* Changed to amber for consistency */}
            {member.role}
          </p>
        </div>
      </div>
    </div>
  );
};

const OurTeam = () => {
  return (
    <section className="tw-bg-[#1b1b1b] tw-py-16 sm:tw-py-20 md:tw-py-24 tw-px-4"> {/* Adjusted py, added sm/md responsive py */}
      <div className="tw-container tw-mx-auto tw-max-w-6xl"> {/* Added tw-container */}
        
        {/* Header */}
        <div className="tw-text-center tw-mb-12 sm:tw-mb-16"> {/* Responsive mb */}
          <p className="tw-text-amber-500 tw-text-lg sm:tw-text-xl tw-font-semibold tw-uppercase tw-tracking-wide tw-mb-2"> {/* Changed color, responsive text size */}
            Our Team
          </p>
          <h2 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-bold tw-text-white tw-mb-4"> {/* Responsive text size */}
            Meet Our Experts
          </h2>
          <p className="tw-text-gray-400 tw-max-w-2xl tw-mx-auto tw-text-base sm:tw-text-lg"> {/* Responsive text size */}
            Professional car rental specialists dedicated to providing you with exceptional service.
          </p>
        </div>

        {/* Team Grid */}
        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8 md:tw-gap-10"> {/* Added sm grid, responsive gap */}
          {teamMembersData.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;