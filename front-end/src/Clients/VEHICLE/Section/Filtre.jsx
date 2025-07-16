// src/components/FiltersSidebar.jsx
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useCars } from '../../../contexts/CarContext'; // <--- USE THE HOOK

const ScrollableCheckboxList = ({ children, maxHeightClass = "tw-max-h-32" }) => {
  return (
    <div className={`tw-space-y-2.5 tw-overflow-y-auto custom-scrollbar-alt-design ${maxHeightClass} tw-pr-1 tw-py-1`}>
      {children}
    </div>
  );
};

const FilterSection = ({ title, children, isOpen, onToggle }) => (
  <div className="tw-border-b tw-border-[#3D3D47] ">
    <button
      onClick={onToggle}
      className="tw-w-full tw-flex tw-justify-between tw-items-center tw-border-0 tw-bg-transparent tw-py-3"
      aria-expanded={isOpen}
    >
      <h3 className="tw-text-sm tw-font-semibold tw-text-gray-200 hover:tw-text-white tw-transition-colors">
        {title}
      </h3>
      <ChevronDown
        size={18}
        className={`tw-text-gray-400 tw-transition-transform tw-duration-200 ${isOpen ? 'tw-transform tw-rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <div className="tw-pt-1 tw-pb-3 tw-px-1 tw-text-xs">
        {children}
      </div>
    )}
  </div>
);

const CheckboxItem = ({ id, label, checked, onChange }) => (
  <label htmlFor={id} className="tw-flex tw-items-center tw-space-x-2.5 tw-text-gray-300 hover:tw-text-white tw-cursor-pointer tw-group tw-py-1">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="tw-h-3.5 tw-w-3.5 tw-rounded-sm tw-border-gray-500 tw-text-[#FFA500] focus:tw-ring-2 focus:tw-ring-[#FFA500]/40 focus:tw-ring-offset-1 focus:tw-ring-offset-[#2C2C34] tw-bg-[#3D3D47] tw-appearance-none checked:tw-bg-[#FFA500] checked:tw-border-transparent tw-relative"
    />
    <span className="group-hover:tw-text-gray-100 tw-transition-colors tw-select-none">{label}</span>
  </label>
);


const FiltersSidebar = ({ filters, setFilters, onApplyFilters, onResetFilters, toggleSidebar, isSidebarOpen }) => {
  const [openSections, setOpenSections] = useState({
    location: true, category: true, type: true, capacity: true,
    year: true, fuel: true, transmission: true, price: true,
  });
  const { allCarsData } = useCars();
  const priceRangeRef = useRef(null);

  // --- START: MOBILE BEHAVIOR ENHANCEMENTS ---

  useEffect(() => {
    // This effect manages body scroll-locking when the sidebar is open on mobile devices.
    // It also handles window resizing to ensure behavior is correct.
    const checkAndSetScroll = () => {
      if (isSidebarOpen && window.innerWidth < 1024) { // 1024px is Tailwind's default 'lg' breakpoint
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    };

    checkAndSetScroll(); // Run on mount and when isSidebarOpen changes

    window.addEventListener('resize', checkAndSetScroll);

    // Cleanup function to restore scroll and remove listener when component unmounts
    return () => {
      window.removeEventListener('resize', checkAndSetScroll);
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);

  // --- END: MOBILE BEHAVIOR ENHANCEMENTS ---


  const toggleSection = (sectionName) => {
    setOpenSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const handleCheckboxChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const updatePriceTrack = (value, min, max) => {
    if (priceRangeRef.current) {
      const percentage = ((value - min) / (max - min)) * 100;
      priceRangeRef.current.style.setProperty('--track-fill-percentage', `${percentage}%`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    if (name === "price" && priceRangeRef.current) {
      updatePriceTrack(parseInt(value), parseInt(priceRangeRef.current.min), parseInt(priceRangeRef.current.max));
    }
  };

  // --- START: DYNAMIC DATA GENERATION ---
  const availableLocations = [...new Set(allCarsData.map(car => car.location).filter(Boolean))].sort();
  const carCategories = [...new Set(allCarsData.map(car => car.category).filter(Boolean))].sort();
  const carTypes = [...new Set(allCarsData.map(car => car.type).filter(Boolean))].sort();


  const capacities = [...new Set(allCarsData.map(car => car.capacityGroup).filter(Boolean))]
    .sort((a, b) => {
        const numA = parseInt(a.replace('+', ''), 10);
        const numB = parseInt(b.replace('+', ''), 10);
        return numA - numB;
    });

  const carMakeYears = [...new Set(allCarsData.map(car => car.makeYear).filter(Boolean))]
    .sort((a, b) => parseInt(b, 10) - parseInt(a, 10)); // Sort newest year first

  const carFuelTypes = [...new Set(allCarsData.map(car => car.fuelType).filter(Boolean))].sort();
  const carTransmissions = [...new Set(allCarsData.map(car => car.transmission).filter(Boolean))].sort();
  // --- END: DYNAMIC DATA GENERATION ---


  useEffect(() => {
    if (priceRangeRef.current) {
      updatePriceTrack(parseInt(filters.price), parseInt(priceRangeRef.current.min), parseInt(priceRangeRef.current.max));
    }
  }, [filters.price]);

  const sidebarSpecificStyles = `
    /* Main sidebar scrollbar (if entire sidebar scrolls on mobile) */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #3D3D47; border-radius: 3px;}
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #5A5A66; border-radius: 3px;}
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FFA500; }
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #5A5A66 #3D3D47; }

    .custom-scrollbar-alt-design::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar-alt-design::-webkit-scrollbar-track { background: #2C2C34; border-radius: 3px; margin: 3px 0; }
    .custom-scrollbar-alt-design::-webkit-scrollbar-thumb { background: #5A5A66; border-radius: 3px; border: 1px solid #2C2C34; }
    .custom-scrollbar-alt-design::-webkit-scrollbar-thumb:hover { background: #FFA500; }
    .custom-scrollbar-alt-design { scrollbar-width: thin; scrollbar-color: #5A5A66 #2C2C34; }

    .range-slider-track {
      --track-color-filled: #FFA500; --track-color-unfilled: #5A5A66; --thumb-color: #FFA500;
      --thumb-border-color: #2C2C34; --thumb-size: 14px; --track-height: 6px;
      background: linear-gradient(to right, var(--track-color-filled) 0%, var(--track-color-filled) var(--track-fill-percentage, 0%), var(--track-color-unfilled) var(--track-fill-percentage, 0%), var(--track-color-unfilled) 100%);
      height: var(--track-height); border-radius: calc(var(--track-height) / 2);
    }
    .range-slider-track::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none; width: var(--thumb-size); height: var(--thumb-size);
      background: var(--thumb-color); border: 2px solid var(--thumb-border-color);
      border-radius: 50%; cursor: pointer; margin-top: calc((var(--thumb-size) - var(--track-height)) / -2 - 1px);
    }
    .range-slider-track::-moz-range-thumb {
      width: var(--thumb-size); height: var(--thumb-size); background: var(--thumb-color);
      border: 2px solid var(--thumb-border-color); border-radius: 50%; cursor: pointer;
    }
  `;

  return (
    <>
      <style>{sidebarSpecificStyles}</style>
      
      {/* Backdrop Overlay: Shows on mobile, closes sidebar on click */}
      <div
        onClick={toggleSidebar}
        className={`tw-fixed tw-inset-0 tw-bg-black/60 tw-z-20 lg:tw-hidden tw-transition-opacity tw-duration-300 ${isSidebarOpen ? 'tw-opacity-100' : 'tw-opacity-0 tw-pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Sidebar: Uses <aside> for semantic HTML */}
      <aside className={`tw-fixed tw-inset-y-0 tw-left-0 tw-z-30 lg:tw-z-0 tw-w-72 tw-bg-[#2C2C34] tw-transform tw-transition-transform tw-duration-300 tw-ease-in-out lg:tw-relative lg:tw-translate-x-0 lg:tw-h-auto lg:tw-overflow-y-visible ${isSidebarOpen ? 'tw-translate-x-0 tw-shadow-2xl' : 'tw--translate-x-full'} ${isSidebarOpen && 'tw-overflow-y-auto tw-h-full custom-scrollbar'}`}>
        <div className="tw-p-5 tw-h-full tw-flex tw-flex-col">
          {/* Sidebar Header */}
          <div className="tw-flex tw-justify-between tw-items-center tw-mb-4 tw-flex-shrink-0">
            <h2 className="tw-text-lg tw-font-semibold tw-text-white lg:tw-hidden">Filters</h2>
            <p className="tw-text-sm tw-font-bold tw-text-[#FFA600] tw-mb-0 tw-hidden lg:tw-block">WHAT ARE YOU <span className='tw-text-white'>LOOKING FOR</span></p>
            <button onClick={toggleSidebar} className="tw-text-gray-400 hover:tw-text-white lg:tw-hidden">
              <X size={20} />
            </button>
          </div>

          {/* Search Input Section */}
          <div className="tw-flex-shrink-0">
              <p className="tw-text-xs tw-text-gray-400 tw-mb-1 lg:tw-hidden">WHAT ARE YOU LOOKING FOR</p>
              <div className="tw-relative tw-mb-5">
              <input type="text" name="search" placeholder="Search by car name..." value={filters.search} onChange={handleInputChange}
                  className="tw-w-full tw-bg-[#3D3D47] tw-border-0 tw-border-[#5A5A66] tw-text-white tw-placeholder-gray-500 tw-text-sm tw-rounded-lg tw-py-2.5 tw-pl-4 tw-pr-10 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-[#FFA500]" />
              <Search size={18} className="tw-absolute tw-right-3 tw-top-1/2 tw--translate-y-1/2 tw-text-[#FFA500]" />
              </div>
          </div>

          {/* Filter Sections Area */}
          <div className="tw-flex-grow tw-overflow-y-auto custom-scrollbar tw-pr-2 tw--mr-2 tw-space-y-0">
              <FilterSection title="Location" isOpen={openSections.location} onToggle={() => toggleSection('location')}>
                  <div className="tw-relative">
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleInputChange}
                    className="tw-w-full tw-bg-[#3D3D47] tw-border tw-border-[#5A5A66] tw-text-gray-300 tw-text-xs tw-rounded-md tw-py-2 tw-pl-3 tw-pr-8 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-[#FFA500] tw-appearance-none"
                  >
                      <option value="">Select Location</option>
                      {availableLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                  </select>
                  <ChevronDown size={16} className="tw-absolute tw-right-2.5 tw-top-1/2 tw--translate-y-1/2 tw-text-gray-400 tw-pointer-events-none" />
                  </div>
              </FilterSection>

              <FilterSection title="Car Category" isOpen={openSections.category} onToggle={() => toggleSection('category')}>
                  <ScrollableCheckboxList maxHeightClass="tw-max-h-[110px] tw-p-3">
                  {carCategories.map((cat) => (<CheckboxItem key={cat} id={`cat-${cat}`} label={cat} checked={filters.categories.includes(cat)} onChange={() => handleCheckboxChange('categories', cat)} />))}
                  </ScrollableCheckboxList>
              </FilterSection>

              <FilterSection title="Car Type" isOpen={openSections.type} onToggle={() => toggleSection('type')}>
                  <ScrollableCheckboxList maxHeightClass="tw-max-h-[132px] tw-p-3">
                  {carTypes.map(type => (<CheckboxItem key={type} id={`type-${type}`} label={type} checked={filters.types.includes(type)} onChange={() => handleCheckboxChange('types', type)} />))}
                  </ScrollableCheckboxList>
              </FilterSection>

              <FilterSection title="Capacity" isOpen={openSections.capacity} onToggle={() => toggleSection('capacity')}>
                  <ScrollableCheckboxList maxHeightClass="tw-max-h-[110px] tw-p-3">
                  {capacities.map(cap => ( <CheckboxItem key={cap} id={`cap-${cap}`} label={cap} checked={filters.capacities.includes(cap)} onChange={() => handleCheckboxChange('capacities', cap)} /> ))}
                  </ScrollableCheckboxList>
              </FilterSection>

              <FilterSection title="Car Make Year" isOpen={openSections.year} onToggle={() => toggleSection('year')}>
                  <ScrollableCheckboxList maxHeightClass="tw-max-h-[132px] tw-p-3">
                  {carMakeYears.map(year => ( <CheckboxItem key={year} id={`year-${year}`} label={String(year)} checked={filters.years.includes(String(year))} onChange={() => handleCheckboxChange('years', String(year))} /> ))}
                  </ScrollableCheckboxList>
              </FilterSection>

              <FilterSection title="Car Fuel Type" isOpen={openSections.fuel} onToggle={() => toggleSection('fuel')}>
                  <ScrollableCheckboxList maxHeightClass="tw-max-h-[110px] tw-p-3">
                  {carFuelTypes.map(fuel => ( <CheckboxItem key={fuel} id={`fuel-${fuel}`} label={fuel} checked={filters.fuelTypes.includes(fuel)} onChange={() => handleCheckboxChange('fuelTypes', fuel)} /> ))}
                  </ScrollableCheckboxList>
              </FilterSection>

              <FilterSection title="Car Transmission" isOpen={openSections.transmission} onToggle={() => toggleSection('transmission')}>
                  <ScrollableCheckboxList maxHeightClass="tw-max-h-[110px] tw-p-3">
                  {carTransmissions.map(trans => ( <CheckboxItem key={trans} id={`trans-${trans}`} label={trans} checked={filters.transmissions.includes(trans)} onChange={() => handleCheckboxChange('transmissions', trans)} /> ))}
                  </ScrollableCheckboxList>
              </FilterSection>

              <FilterSection title="Price" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
                  <div className="tw-pt-2">
                  <input ref={priceRangeRef} type="range" name="price" min="100" max="1000" step="10" value={filters.price} onChange={handleInputChange} className="tw-w-full tw-h-1.5 tw-rounded-lg tw-appearance-none tw-cursor-pointer tw-bg-transparent range-slider-track" />
                  <div className="tw-flex tw-justify-between tw-text-xs tw-text-gray-400 tw-mt-2">
                      <span>$100</span> <span className="tw-font-semibold tw-text-[#FFA500]">${filters.price}</span> <span>$1000</span>
                  </div>
                  </div>
              </FilterSection>
          </div>

          {/* Footer Buttons */}
          <div className="tw-mt-auto tw-pt-6 tw-space-y-3 tw-flex-shrink-0">
            <button onClick={onApplyFilters} className="tw-w-full tw-border-0 tw-bg-[#FFA500] tw-text-black tw-font-semibold tw-py-3 tw-rounded-md hover:tw-bg-opacity-90 tw-transition-opacity tw-text-sm">Filter Results</button>
            <button onClick={onResetFilters} className="tw-w-full tw-border-0 tw-bg-gray-100 tw-text-[#2C2C34] tw-font-semibold tw-py-3 tw-rounded-md hover:tw-bg-gray-200 tw-transition-colors tw-text-sm">Reset Filter</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default FiltersSidebar;