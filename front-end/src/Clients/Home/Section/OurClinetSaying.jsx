// src/components/Sections/OurClientSaying.jsx
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Pagination, Autoplay } from 'swiper/modules';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { ImQuotesLeft } from "react-icons/im";

// --- ANIMATION START ---
// 1. Import the 'motion' component from framer-motion
import { motion } from 'framer-motion';
// --- ANIMATION END ---

const API_AVIS_ENDPOINT = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api') + '/avis';
const ACCENT_COLOR_CLASS = 'tw-text-amber-400';

// --- ANIMATION START ---
// 2. Define animation variants for clean, reusable animation logic.
// This container will orchestrate the animation of its children.
const sectionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Animate each child with a 0.2s delay
      ease: "easeOut",
    },
  },
};

// This variant will be used for individual items like the title, subtitle, and the swiper.
const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};
// --- ANIMATION END ---

const TestimonialCard = ({ testimonial }) => {
  // ... renderStars function remains the same ...
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0 && (rating - fullStars >= 0.5);
    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`full-${testimonial.id}-${i}`} className={`tw-w-5 tw-h-5 ${ACCENT_COLOR_CLASS}`} />);
    if (hasHalfStar) stars.push(<FaStarHalfAlt key={`half-${testimonial.id}`} className={`tw-w-5 tw-h-5 ${ACCENT_COLOR_CLASS}`} />);
    const currentStarsCount = stars.length;
    for (let i = 0; i < (5 - currentStarsCount); i++) stars.push(<FaRegStar key={`empty-${testimonial.id}-${i}`} className="tw-w-5 tw-h-5 tw-text-gray-500" />);
    return stars;
  };

  const avatarPlaceholderBgClass = ACCENT_COLOR_CLASS.replace('tw-text-', 'tw-bg-') + '/30';

  return (
    <div className="tw-bg-gradient-to-br tw-from-neutral-800 tw-via-neutral-900 tw-to-neutral-800 tw-p-6 md:tw-p-8 tw-rounded-xl tw-shadow-xl tw-h-full tw-flex tw-flex-col tw-relative tw-border tw-border-neutral-700 tw-min-h-[300px] sm:tw-min-h-[320px]">
      <ImQuotesLeft className="tw-absolute tw-top-5 tw-right-5 sm:tw-top-6 sm:tw-right-6 tw-text-4xl sm:tw-text-5xl tw-text-neutral-600 tw-opacity-50" />
      <div className="tw-flex tw-items-center tw-mb-4">
        {testimonial.avatarUrl ? (
          <img
            src={testimonial.avatarUrl}
            alt={testimonial.name}
            className="tw-w-14 tw-h-14 sm:tw-w-16 sm:tw-h-16 tw-rounded-full tw-mr-4 tw-border-2 tw-border-neutral-700 tw-object-cover"
          />
        ) : (
          <div className={`tw-w-14 tw-h-14 sm:tw-w-16 sm:tw-h-16 tw-rounded-full tw-mr-4 ${avatarPlaceholderBgClass} tw-flex tw-items-center tw-justify-center tw-text-2xl ${ACCENT_COLOR_CLASS}`}>
            {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
        <div>
          <h4 className="tw-font-semibold tw-text-white tw-text-lg sm:tw-text-xl">{testimonial.name}</h4>
          {testimonial.carName && <p className="tw-text-xs tw-text-neutral-400 tw-mt-0.5">{testimonial.carName}</p>}
        </div>
      </div>
      <div className="tw-flex tw-mb-3">
        {renderStars(testimonial.rating)}
      </div>
      <p className="tw-text-neutral-300 tw-text-sm sm:tw-text-base tw-leading-relaxed tw-mb-6 tw-flex-grow">
        {testimonial.comment}
      </p>
    </div>
  );
};

const OurClientSaying = () => {
  const [avisList, setAvisList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ... fetchAvis logic remains exactly the same ...
    const fetchAvis = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`${API_AVIS_ENDPOINT}?per_page=9`); 
          if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try { const errData = await response.json(); errorMessage = errData.message || errorMessage; } catch (parseError) { /* Ignore */ }
            throw new Error(errorMessage);
          }
          const result = await response.json();
          const itemsToFormat = result.data || [];
  
          if (!Array.isArray(itemsToFormat)) {
              console.error("API did not return an array for avis list:", itemsToFormat);
              throw new Error("Received invalid data format for testimonials.");
          }
  
          const formattedAvis = itemsToFormat.map(avi => ({
            id: avi.id,
            name: avi.name || "Anonymous",
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(avi.name || "User")}&background=2A2A2A&color=FFA600&bold=true`,
            rating: parseFloat(avi.rating) || 0,
            comment: avi.comment || "No comment provided.",
            carName: avi.carName || null, 
          }));
          setAvisList(formattedAvis);
        } catch (e) {
          console.error("Failed to fetch avis:", e);
          setError(e.message || "An unknown error occurred while fetching testimonials.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAvis();
  }, []);

  if (isLoading) { /* ... isLoading JSX is unchanged ... */ }
  if (error) { /* ... error JSX is unchanged ... */ }

  return (
    <section className="tw-py-16 sm:tw-py-20 tw-bg-[#1B1B1B]">
      {/* --- ANIMATION START --- */}
      {/* 3. Wrap the main container in a motion.div to control the scroll-triggered animation. */}
      <motion.div
        className="tw-container tw-mx-auto tw-px-4"
        variants={sectionContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} // Triggers animation when 20% of the section is visible, and only runs once.
      >
        <div className="tw-text-center tw-mb-12 sm:tw-mb-16">
          {/* 4. Animate the title by wrapping it in a motion.h2 and applying itemVariants. */}
          <motion.h2
            variants={itemVariants}
            className="tw-font-serif tw-text-4xl sm:tw-text-5xl tw-font-medium tw-text-white tw-mb-3"
          >
            What Our <span className="tw-text-[#1572D3]">Clients Saying</span>
          </motion.h2>
          {/* 5. Animate the subtitle similarly with motion.p. */}
          <motion.p
            variants={itemVariants}
            className="tw-text-neutral-400 tw-text-base sm:tw-text-lg"
          >
            Trusted by Elite Travelers Worldwide
          </motion.p>
        </div>

        {/* 6. Animate the entire Swiper component block as a single item. */}
        <motion.div variants={itemVariants}>
          {avisList.length > 0 ? (
            <Swiper
              // ... Swiper props remain unchanged ...
              modules={[Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              loop={avisList.length > ((window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 768 ? 2 : 1)) * 2 - 1) && avisList.length > 1}
              centeredSlides={false} 
              autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              pagination={{ clickable: true, el: '.custom-swiper-pagination-clients' }}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 30 },
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              className="!tw-pb-12 sm:!tw-pb-16"
            >
              {avisList.map((avi) => (
                <SwiperSlide key={avi.id} className="tw-self-stretch">
                  <TestimonialCard testimonial={avi} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            !isLoading && <p className="tw-text-center tw-text-neutral-500 tw-text-xl">No testimonials available at the moment.</p>
          )}
          {avisList.length > 0 && <div className="custom-swiper-pagination-clients tw-text-center tw-mt-8"></div>}
        </motion.div>
      </motion.div>
      {/* --- ANIMATION END --- */}
    </section>
  );
};
export default OurClientSaying;