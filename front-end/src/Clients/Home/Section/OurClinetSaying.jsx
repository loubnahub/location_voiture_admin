import React, { useState, useEffect } from 'react'; // Added useState, useEffect
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

// import required modules
import { Pagination, Autoplay } from 'swiper/modules';

import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'; // For stars
import { ImQuotesLeft } from "react-icons/im";

// API Endpoint
const API_AVIS_ENDPOINT = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api') + '/avis';

// Accent color
const ACCENT_COLOR = 'text-amber-400';

const TestimonialCard = ({ testimonial }) => {
  // testimonial object is expected to have: id, name, avatarUrl (optional), rating, comment (as text)
  // and carName (as title, optional)

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0 && (rating - fullStars >= 0.5); // Check if half star is significant

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${testimonial.id}-${i}`} className={`w-5 h-5 ${ACCENT_COLOR}`} />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key={`half-${testimonial.id}`} className={`w-5 h-5 ${ACCENT_COLOR}`} />);
    }
    const currentStarsCount = stars.length;
    for (let i = 0; i < (5 - currentStarsCount); i++) {
      stars.push(<FaRegStar key={`empty-${testimonial.id}-${i}`} className="w-5 h-5 text-gray-500" />);
    }
    return stars;
  };

  return (
    <div className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 p-6 md:p-8 rounded-xl shadow-xl h-full flex flex-col relative border border-neutral-700 min-h-[300px] sm:min-h-[320px]">
      <ImQuotesLeft className="absolute top-5 right-5 sm:top-6 sm:right-6 text-4xl sm:text-5xl text-neutral-600 opacity-50" />

      <div className="flex items-center mb-4"> {/* Reduced bottom margin slightly */}
        {testimonial.avatarUrl ? (
          <img
            src={testimonial.avatarUrl}
            alt={testimonial.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mr-4 border-2 border-neutral-700 object-cover"
          />
        ) : (
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full mr-4 ${ACCENT_COLOR.replace('text-', 'bg-')}/30 flex items-center justify-center text-2xl ${ACCENT_COLOR}`}>
            {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
        <div>
          <h4 className="font-semibold text-white text-lg sm:text-xl">{testimonial.name}</h4>
          {/* Display carName as a subtitle if available */}
          {testimonial.carName && <p className="text-xs text-neutral-400 mt-0.5">{testimonial.carName}</p>}
        </div>
      </div>

      {/* Star Rating Display */}
      <div className="flex mb-3"> {/* Added margin-bottom */}
        {renderStars(testimonial.rating)}
      </div>

      <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-6 flex-grow">
        {testimonial.comment} {/* Use 'comment' field from API */}
      </p>
    </div>
  );
};

const OurClinetSaying = () => {
  const [avisList, setAvisList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch only approved avis, usually for public display
        const response = await fetch(`${API_AVIS_ENDPOINT}?approved=true&per_page=9`); // Fetch e.g., 9 latest approved
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        // The API returns a paginated response. We need result.data.
        // Map API data to the structure TestimonialCard expects
        const formattedAvis = (result.data || []).map(avi => ({
          id: avi.id,
          name: avi.name,
          // Use ui-avatars.com for dynamic avatars based on name if no avatarUrl is in your DB
          avatarUrl: avi.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(avi.name)}&background=2A2A2A&color=FFA600&bold=true`,
          rating: parseFloat(avi.rating) || 0, // Ensure rating is a number
          comment: avi.comment,
          carName: avi.carName || avi.car_name || null, // Handle both potential casings from API
        }));
        setAvisList(formattedAvis);
      } catch (e) {
        console.error("Failed to fetch avis:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvis();
  }, []); // Empty dependency array means this effect runs once on mount

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 bg-[#1B1B1B]">
        <div className="container mx-auto px-4 text-center text-neutral-400">
          Loading testimonials...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-20 bg-[#1B1B1B]">
        <div className="container mx-auto px-4 text-center text-red-400">
          Could not load testimonials: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-[#1B1B1B]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl font-medium text-white mb-3">
            What Our <span className="text-[#1572D3]">Clients Saying</span>
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg">
            Trusted by Elite Travelers Worldwide
          </p>
        </div>

        {avisList.length > 0 ? (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            loop={avisList.length > 2} // Loop only if enough slides for it to make sense
            centeredSlides={false}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              el: '.custom-swiper-pagination-clients', // Use a unique class
            }}
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 30 },
              768: { slidesPerView: 2, spaceBetween: 30 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
            }}
            className="!pb-12 sm:!pb-16" // Add padding-bottom for pagination dots
          >
            {avisList.map((avi) => (
              <SwiperSlide key={avi.id} className="self-stretch">
                <TestimonialCard testimonial={avi} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center text-neutral-500 text-xl">No testimonials available at the moment.</p>
        )}
        <div className="custom-swiper-pagination-clients text-center mt-8"></div> {/* Unique class for pagination */}
      </div>
    </section>
  );
};

export default OurClinetSaying;