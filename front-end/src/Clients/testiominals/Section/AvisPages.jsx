// src/components/AvisPages.jsx

import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../../../services/api'; // Make sure this path is correct

// --- StarRating Sub-component (Unchanged) ---
const StarRating = ({ rating }) => {
  return (
    <div className="tw-flex tw-items-center" aria-label={`Rating: ${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? 'tw-text-amber-400' : 'tw-text-gray-600'}
          fill={i < rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
};

// --- NEW "MASONRY" TestimonialCard Sub-component ---
const TestimonialCard = ({ name, car_name, image_url, rating, comment, variants }) => {
  return (
    <motion.div
      variants={variants}
      // This is the key for CSS Column layouts: prevents a card from breaking across columns
      className="tw-break-inside-avoid tw-mb-6" 
    >
      <div className="tw-bg-[#222222] tw-p-6 sm:tw-p-8 tw-rounded-xl tw-shadow-lg tw-flex tw-flex-col tw-h-full tw-ring-1 tw-ring-white/5">
        <Quote size={32} className="tw-text-amber-400/50" />
        <p className="tw-text-gray-300 tw-text-base tw-leading-relaxed tw-mt-4 tw-flex-grow">
          {comment}
        </p>
        <div className="tw-mt-6 tw-pt-6 tw-border-t tw-border-neutral-700 tw-flex tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center">
            {image_url && (
              <img
                src={image_url}
                alt={name}
                className="tw-w-10 tw-h-10 tw-rounded-full tw-object-cover"
              />
            )}
            <div className="tw-ml-3">
              <p className="tw-font-semibold tw-text-white tw-text-sm">{name}</p>
              <p className="tw-text-xs tw-text-gray-400">{car_name}</p>
            </div>
          </div>
          <StarRating rating={rating} />
        </div>
      </div>
    </motion.div>
  );
};


// --- NEW "MASONRY" Main Section Component ---
const AvisPages = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvis = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/avis');
        if (response.data && Array.isArray(response.data.data)) {
          setTestimonials(response.data.data);
        } else if (Array.isArray(response.data)) {
          setTestimonials(response.data);
        } else {
          console.error("API did not return an array of testimonials.");
          setTestimonials([]);
        }
      } catch (err) {
        setError("Could not load customer reviews.");
        console.error("API Error fetching reviews:", err);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAvis();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (loading) {
    return <div className="tw-bg-[#1B1B1B] tw-text-center tw-py-24 tw-text-white">Loading Reviews...</div>;
  }

  if (error) {
    return <div className="tw-bg-[#1B1B1B] tw-text-center tw-py-24 tw-text-red-400">{error}</div>;
  }

  return (
    <section className="tw-bg-[#1B1B1B] tw-py-16 sm:tw-py-24">
      <div className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
        <div className="tw-max-w-2xl tw-mx-auto tw-text-center tw-mb-12">
          <h2 className="tw-text-3xl sm:tw-text-4xl tw-font-bold tw-text-white">
          Testimonials
          </h2>
          <p className="tw-mt-4 tw-text-gray-400">
            Real stories from clients who chose us for their journey.
          </p>
        </div>

        <motion.div
          // This is the core of the masonry layout!
          className="tw-columns-1 md:tw-columns-2 lg:tw-columns-2 tw-gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }} // Animation triggers when it enters the viewport
        >
          {Array.isArray(testimonials) && testimonials.length > 0 ? (
            testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                name={testimonial.name}
                car_name={testimonial.car_name}
                image_url={testimonial.image_url}
                rating={testimonial.rating}
                comment={testimonial.comment}
                variants={itemVariants}
              />
            ))
          ) : (
            <div className="tw-col-span-full tw-text-center tw-text-gray-400">
              No reviews have been submitted yet.
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default AvisPages;