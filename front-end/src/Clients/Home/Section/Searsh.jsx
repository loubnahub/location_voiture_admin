import React, { useState } from 'react'; // Added useState
import { MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const CarSearchSection = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // State for form inputs
  const [location, setLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('Tue 15 Feb, 09:00'); // Default or empty
  const [returnDate, setReturnDate] = useState('Thu 16 Feb, 11:00'); // Default or empty

  // --- Your color and style constants remain the same ---
  const iconColor = "text-[#1572D3]";
  const labelColor = "text-[#1572D3]";
  const valueColor = "text-white";
  const placeholderColor = "text-gray-400";
  const placeholderOpacity = "placeholder-opacity-75";
  const mobileDividerColor = "border-[#1B1B1B]";
  const lgDividerColor = "lg:border-[#1B1B1B]";
  const searchButtonBgColor = "bg-[#1572D3]";
  const searchButtonHoverBgColor = "hover:bg-[#115ea5]";

  const handleSearch = (e) => {
    e.preventDefault(); // Prevent default form submission if it were a form

    // Basic validation (optional, but good practice)
    if (!location.trim()) {
      alert("Please enter a location.");
      return;
    }
    // You might want more sophisticated date parsing/validation here
    // For now, we'll pass them as strings

    const queryParams = new URLSearchParams();
    if (location.trim()) queryParams.append('location', location.trim());
    if (pickupDate.trim()) queryParams.append('pickup', pickupDate.trim()); // You might want to format this to YYYY-MM-DD
    if (returnDate.trim()) queryParams.append('return', returnDate.trim()); // You might want to format this to YYYY-MM-DD

    // Navigate to /fleet with query parameters
    navigate(`/fleet?${queryParams.toString()}`);
  };

  return (
    <div className="w-full bg-[#1B1B1B] py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-4 sm:p-6 rounded-xl border-[#1572D3] border`}>
          {/* Changed outer div to a form element for semantics, though button type is "button" */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_2fr_2fr_minmax(140px,1.5fr)] gap-x-4 items-center">
            
            {/* Location Input Group */}
            <div className="flex items-center space-x-3">
              <MapPinIcon className={`h-8 w-8 shrink-0 ${iconColor}`} />
              <div className="w-full">
                <label htmlFor="location" className={`block text-md font-medium ${labelColor}`}>
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Search your location"
                  value={location} // Controlled input
                  onChange={(e) => setLocation(e.target.value)} // Update state
                  className={`bg-transparent text-sm ${valueColor} ${placeholderColor} ${placeholderOpacity} outline-none w-full pt-0.5`}
                /> 
              </div>
            </div>

            {/* Pickup Date Input Group */}
            <div className={`flex items-center space-x-3 
                             pt-4 border-t ${mobileDividerColor}
                             md:pt-0 md:border-t-0
                             lg:pt-0 lg:border-t-0 lg:border-l ${lgDividerColor} lg:pl-4`}
            >
              <CalendarDaysIcon className={`h-8 w-8 shrink-0 ${iconColor}`} />
              <div className="w-full">
                <label htmlFor="pickup-date" className={`block text-md font-medium ${labelColor}`}>
                  Pickup date
                </label>
                {/* For actual date pickers, you'd use type="date" or a library */}
                <input
                  type="text" // Keeping as text for now to match your defaultValue format
                  id="pickup-date"
                  name="pickup-date"
                  value={pickupDate} // Controlled input
                  onChange={(e) => setPickupDate(e.target.value)} // Update state
                  placeholder="Select pickup date & time"
                  className={`bg-transparent text-sm ${valueColor} ${placeholderColor} ${placeholderOpacity} focus:outline-none w-full pt-0.5`}
                />
              </div>
            </div>
            
            {/* Return Date Input Group */}
            <div className={`flex items-center space-x-3 
                             pt-4 border-t ${mobileDividerColor}
                             md:pt-4 md:border-t ${mobileDividerColor}
                             lg:pt-0 lg:border-t-0 lg:border-l ${lgDividerColor} lg:pl-4`}
            >
              <CalendarDaysIcon className={`h-8 w-8 shrink-0 ${iconColor}`} />
              <div className="w-full">
                <label htmlFor="return-date" className={`block text-md font-medium ${labelColor}`}>
                  Return date
                </label>
                <input
                  type="text" // Keeping as text for now
                  id="return-date"
                  name="return-date"
                  value={returnDate} // Controlled input
                  onChange={(e) => setReturnDate(e.target.value)} // Update state
                  placeholder="Select return date & time"
                  className={`bg-transparent text-sm ${valueColor} ${placeholderColor} ${placeholderOpacity} focus:outline-none w-full pt-0.5`}
                />
              </div>
            </div>

            {/* Search Button */}
            <div className={`pt-4 border-t ${mobileDividerColor}
                             md:pt-4 md:border-t-0
                             lg:pt-0 lg:border-t-0`}
            >
              <button
                type="submit" // Changed to submit to trigger form's onSubmit
                className={`w-full ${searchButtonBgColor} ${searchButtonHoverBgColor} text-white font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2D2D2D] focus:ring-[#1572D3]`}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CarSearchSection;