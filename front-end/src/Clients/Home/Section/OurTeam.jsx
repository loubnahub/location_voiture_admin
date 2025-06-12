import React from 'react';

// Data for the team members
const teamMembersData = [
  {
    id: 1,
    name: "Lahyane Oussama",
    role: "Fleet Manager",
    imageUrl: "/images/Teams/Oussma.jpg",
  },
  {
    id: 2,
    name: "Messoussi Loubna",
    role: "Lead Mechanic",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
  },
  {
    id: 3,
    name: "Gouiss Youssef",
    role: "Customer Success Manager",
    imageUrl: "/images/Teams/yousef.jpg",
  },
  {
    id: 4,
    name: "Marcus Chen",
    role: "Marketing Head",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
  },
  {
    id: 5,
    name: "Aisha Khan",
    role: "Operations Director",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
  },
];

const TeamMemberCard = ({ member }) => {
  return (
    // The card wrapper defines its size in the scrolling container and prevents shrinking
    <div className="tw-w-[80vw] sm:tw-w-[45vw] md:tw-w-[30vw] lg:tw-w-[22vw] tw-flex-shrink-0 tw-px-4">
      <div className="tw-relative tw-rounded-3xl tw-overflow-hidden tw-aspect-[4/5] 
                     tw-bg-[#1b1b1b]/60 tw-backdrop-blur-lg 
                     tw-border tw-border-white/10">
        
        <img
          src={member.imageUrl}
          alt={member.name}
          className="tw-w-full tw-h-full tw-object-cover"
        />
        
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
  // All state and scroll logic has been removed for a much cleaner component.
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

      {/* 
        MARQUEE CONTAINER:
        - group is used to pause the animation on hover.
        - overflow-hidden hides the duplicated content.
      */}
      <div className="tw-relative tw-flex group tw-overflow-hidden">
        {/* The animating track. It pauses when the container above is hovered. */}
        <div className="tw-flex tw-animate-marquee group-hover:[animation-play-state:paused]">
          {/* We render the list of cards */}
          {teamMembersData.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
          {/* We render it a second time to create the infinite loop effect */}
          {teamMembersData.map((member) => (
            <TeamMemberCard key={`duplicate-${member.id}`} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;