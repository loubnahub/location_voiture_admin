import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { FaCalendarAlt, FaEuroSign, FaArrowRight } from 'react-icons/fa';
import { fetchUserBookings } from '../../services/api';

// Helper function to map API status to the French display names. (No changes needed here)
const mapApiStatusToFrench = (apiStatus) => {
  if (!apiStatus) return 'Inconnu';
  const statusValue = typeof apiStatus === 'object' ? apiStatus.value : apiStatus;
  switch (statusValue) {
    case 'confirmed':
    case 'pending_confirmation':
      return 'À venir';
    case 'active':
      return 'En cours';
    case 'completed':
      return 'Terminée';
    case 'cancelled_by_user':
    case 'cancelled_by_platform':
      return 'Annulée';
    default:
      return 'Inconnu';
  }
};

// --- THE UPDATED Mybooking COMPONENT ---
const Mybooking = () => {
  const { user_id } = useParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Toutes');

  useEffect(() => {
    // If you use a static route like "/my-bookings", you might get the user_id from auth context instead.
    // For now, we'll keep the useParams logic.
    if (!user_id) {
        // You can decide to fallback to a default user or show a more permanent error.
        const default_user_id = 'your-default-user-id'; // Example: get from auth context
        console.warn(`User ID is missing from URL, falling back to default or showing error.`);
        if (!default_user_id) {
            setError("User ID is missing. Cannot load bookings.");
            setLoading(false);
            return;
        }
    }

    const loadUserBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the user_id from the URL or a fallback if your logic allows
        const response = await fetchUserBookings(user_id);
        
        // **UPDATED**: The mapping now includes the rawId for linking
        const formattedBookings = response.data.data.map(apiBooking => ({
          id: `RECA-${apiBooking.id.substring(0, 4)}`, // The short, display ID
          rawId: apiBooking.id, // The full, original ID for the link
          carName: apiBooking.vehicle_display,
          startDate: new Date(apiBooking.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
          endDate: new Date(apiBooking.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
          totalCost: `${Number(apiBooking.final_price).toFixed(2).replace('.', ',')}€`,
          status: mapApiStatusToFrench(apiBooking.status),
        }));

        setBookings(formattedBookings);
      } catch (err) {
        console.error("Failed to fetch user bookings:", err);
        setError("Impossible de charger vos réservations. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    loadUserBookings();
  }, [user_id]);

  const filteredBookings =
    activeFilter === 'Toutes'
      ? bookings
      : bookings.filter((booking) => booking.status === activeFilter);

  const getStatusClasses = (status) => {
    switch (status) {
      case 'À venir':
        return 'tw-bg-blue-500/20 tw-text-blue-300';
      case 'En cours':
        return 'tw-bg-green-500/20 tw-text-green-300';
      case 'Annulée':
        return 'tw-bg-red-500/20 tw-text-red-300';
      case 'Terminée':
      default:
        return 'tw-bg-gray-600/20 tw-text-gray-400';
    }
  };
      
  return (
    <div className="tw-bg-brand-bg tw-min-h-screen tw-p-4 sm:tw-p-8">
      <div className='tw-mt-28'>
          {/* Spacing for a fixed header */}
      </div>
      <div className="tw-max-w-4xl tw-mx-auto">

        {/* Filter Buttons Section */}
       

        {/* Conditional Rendering Logic */}
        {loading && (
          <div className="tw-text-center tw-py-16">
            <p className="tw-text-gray-300 tw-text-lg">Loading your bookings...</p>
          </div>
        )}
        
        {error && (
          <div className="tw-text-center tw-py-16 tw-px-6 tw-bg-red-900/20 tw-text-red-300 tw-rounded-lg">
            <p className="tw-font-semibold">An error occurred</p>
            <p className="tw-text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="tw-flex tw-flex-col tw-gap-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                // --- Booking Card ---
                <div key={booking.id} className="tw-bg-brand-card tw-rounded-xl tw-border tw-border-gray-700 tw-p-5 tw-transition-all tw-duration-300 hover:tw-border-brand-amber/60 hover:tw-shadow-xl hover:tw-shadow-brand-amber/5">
                  
                  {/* Card Header: Title & Status */}
                  <div className="tw-flex tw-justify-between tw-items-start tw-gap-4">
                    <div>
                      <h2 className="tw-text-white tw-text-lg sm:tw-text-xl tw-font-bold">{booking.carName}</h2>
                      <p className="tw-text-gray-400 tw-text-xs sm:tw-text-sm">Booking {booking.id}</p>
                    </div>
                    <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-whitespace-nowrap ${getStatusClasses(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Card Body: Booking Details */}
                  <div className="tw-border-t tw-border-gray-700 tw-mt-4 tw-pt-4">
                    <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-gap-4 sm:tw-gap-8">
                      <div className="tw-flex tw-items-center tw-gap-3 tw-text-gray-300">
                        <FaCalendarAlt className="tw-text-gray-500 tw-text-lg" />
                        <span className="tw-text-sm">{booking.startDate} - {booking.endDate}</span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-3 tw-text-gray-300">
                        <FaEuroSign className="tw-text-gray-500 tw-text-lg" />
                        <span className="tw-font-semibold tw-text-white tw-text-sm">{booking.totalCost}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Action Button */}
                  <div className="tw-border-t tw-border-gray-700 tw-mt-4 tw-pt-4 tw-flex">
                    {/* **UPDATED**: This is now a Link that navigates to the details page */}
                    <Link
                      to={`/bookings/${booking.rawId}`}
                      className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-brand-amber tw-text-black tw-font-bold tw-rounded-lg hover:tw-bg-yellow-400 tw-transition-colors tw-text-sm"
                    >
                      <FaArrowRight />
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // This message shows if there are no bookings for the selected filter
              <div className="tw-text-center tw-py-16 tw-px-6 tw-bg-brand-card tw-rounded-lg">
                  <p className="tw-text-gray-400">No bookings found for this status.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mybooking;