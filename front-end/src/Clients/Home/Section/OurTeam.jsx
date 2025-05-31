// src/components/OurTeam.jsx
import React from 'react';

// Car rental team data
const teamMembersData = [
  {
    id: 1,
    name: "Lahyane Oussama" ,
    role: "Fleet Manager",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
  },
  {
    id: 2,
    name: "Messoussi Loubna", 
    role: "Fleet Manager",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
  },
  {
    id: 3,
    name: "Oliva White",
    role: "Customer Success Manager", 
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
  },
];

const TeamMemberCard = ({ member }) => {
  return (
    <div className="relative group cursor-pointer ">
      {/* Card Container */}
      <div className="relative bg-gray-200 rounded-3xl overflow-hidden aspect-[4/5] group-hover:scale-105 transition-transform duration-300">
        
        {/* Background Image */}
        <img
          src={member.imageUrl}
          alt={member.name}
          className="w-full h-full object-cover"
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Content positioned at bottom */}
        <div className="absolute bottom-6 left-6 text-white">
          <h3 className="text-xl font-bold mb-1">
            {member.name}
          </h3>
          <p className="text-orange-400 text-sm font-medium">
            {member.role}
          </p>
        </div>
        
       
        
      </div>
    </div>
  );
};

const OurTeam = () => {
  return (
    <section className="bg-[#1b1b1b]  py-16 px-4 -mt-16">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-orange-400 text-xl font-semibold uppercase tracking-wide mb-2">
            Our Team
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Meet Our Experts
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Professional car rental specialists dedicated to providing you with exceptional service.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembersData.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;