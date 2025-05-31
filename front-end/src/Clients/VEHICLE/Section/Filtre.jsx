// src/components/FiltersSidebar.jsx (or your path to it)
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import allCarsData from './Cars/CarsCardFiltre'; 

const ScrollableCheckboxList = ({ children, maxHeightClass = "max-h-32" }) => {
  return (
    <div className={`space-y-2.5 overflow-y-auto custom-scrollbar-alt-design ${maxHeightClass} pr-1 py-1`}>
      {children}
    </div>
  );
};

const FilterSection = ({ title, children, isOpen, onToggle }) => (
  <div className="border-b border-[#3D3D47]">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center py-3.5 px-1 text-left focus:outline-none"
      aria-expanded={isOpen}
    >
      <h3 className="text-sm font-semibold text-gray-200 hover:text-white transition-colors">
        {title}
      </h3>
      <ChevronDown
        size={18}
        className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <div className="pt-1 pb-3 px-1 text-xs">
        {children}
      </div>
    )}
  </div>
);

const CheckboxItem = ({ id, label, checked, onChange }) => (
  <label htmlFor={id} className="flex items-center space-x-2.5 text-gray-300 hover:text-white cursor-pointer group py-1">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-3.5 w-3.5 rounded-sm border-gray-500 text-[#FFA500] focus:ring-2 focus:ring-[#FFA500]/40 focus:ring-offset-1 focus:ring-offset-[#2C2C34] bg-[#3D3D47] appearance-none checked:bg-[#FFA500] checked:border-transparent relative"
    />
    <span className="group-hover:text-gray-100 transition-colors select-none">{label}</span>
  </label>
);


const FiltersSidebar = ({ filters, setFilters, onApplyFilters, onResetFilters, toggleSidebar, isSidebarOpen }) => {
  const [openSections, setOpenSections] = useState({
    location: true, category: true, type: true, capacity: true,
    year: true, fuel: true, transmission: true, price: true,
  });

  const priceRangeRef = useRef(null);

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
  // --- END DYNAMIC GENERATION ---


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
    <div className='px-10 '>
      <style>{sidebarSpecificStyles}</style>
      <div className={`fixed inset-y-0 left-0 z-30 lg:z-0 w-72 bg-[#2C2C34] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:h-auto lg:overflow-y-visible ${isSidebarOpen ? 'translate-x-0 shadow-2xl overflow-y-auto h-full custom-scrollbar' : '-translate-x-full overflow-y-auto h-full custom-scrollbar'}`}>
        <div className="p-5 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-white lg:hidden">Filters</h2>
            <p className="text-sm font-bold text-[#FFA600] mb-0 hidden lg:block">WHAT ARE YOU <span className='text-white'>LOOKING FOR</span></p>
            <button onClick={toggleSidebar} className="text-gray-400 hover:text-white lg:hidden">
              {isSidebarOpen ? <X size={20} /> : <SlidersHorizontal size={20} />}
            </button>
          </div>
          
          <div className="flex-shrink-0">
              <p className="text-xs text-gray-400 mb-1 lg:hidden">WHAT ARE YOU LOOKING FOR</p>
              <div className="relative mb-5">
              <input type="text" name="search" placeholder="Search by car name..." value={filters.search} onChange={handleInputChange}
                  className="w-full bg-[#3D3D47] border border-[#5A5A66] text-white placeholder-gray-500 text-sm rounded-lg py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-[#FFA500]" />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FFA500]" />
              </div>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-0">
              <FilterSection title="Location" isOpen={openSections.location} onToggle={() => toggleSection('location')}>
                  <div className="relative">
                  <select 
                    name="location" 
                    value={filters.location} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#3D3D47] border border-[#5A5A66] text-gray-300 text-xs rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-[#FFA500] appearance-none"
                  >
                      <option value="">Select Location</option>
                      {availableLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
              </FilterSection>
              
              <FilterSection title="Car Category" isOpen={openSections.category} onToggle={() => toggleSection('category')}>
                  <ScrollableCheckboxList maxHeightClass="max-h-[110px] p-3">
                  {carCategories.map((cat) => (<CheckboxItem key={cat} id={`cat-${cat}`} label={cat} checked={filters.categories.includes(cat)} onChange={() => handleCheckboxChange('categories', cat)} />))}
                  </ScrollableCheckboxList>
              </FilterSection>

              <FilterSection title="Car Type" isOpen={openSections.type} onToggle={() => toggleSection('type')}>
                  <ScrollableCheckboxList maxHeightClass="max-h-[132px] p-3">
                  {carTypes.map(type => (<CheckboxItem key={type} id={`type-${type}`} label={type} checked={filters.types.includes(type)} onChange={() => handleCheckboxChange('types', type)} />))}
                  </ScrollableCheckboxList>
              </FilterSection>
              
              <FilterSection title="Capacity" isOpen={openSections.capacity} onToggle={() => toggleSection('capacity')}>
                  <ScrollableCheckboxList maxHeightClass="max-h-[110px] p-3">
                  {capacities.map(cap => ( <CheckboxItem key={cap} id={`cap-${cap}`} label={cap} checked={filters.capacities.includes(cap)} onChange={() => handleCheckboxChange('capacities', cap)} /> ))}
                  </ScrollableCheckboxList>
              </FilterSection>

              <FilterSection title="Car Make Year" isOpen={openSections.year} onToggle={() => toggleSection('year')}>
                  <ScrollableCheckboxList maxHeightClass="max-h-[132px] p-3">
                  {carMakeYears.map(year => ( <CheckboxItem key={year} id={`year-${year}`} label={year} checked={filters.years.includes(year)} onChange={() => handleCheckboxChange('years', year)} /> ))}
                  </ScrollableCheckboxList>
              </FilterSection>

              <FilterSection title="Car Fuel Type" isOpen={openSections.fuel} onToggle={() => toggleSection('fuel')}>
                  <ScrollableCheckboxList maxHeightClass="max-h-[110px] p-3">
                  {carFuelTypes.map(fuel => ( <CheckboxItem key={fuel} id={`fuel-${fuel}`} label={fuel} checked={filters.fuelTypes.includes(fuel)} onChange={() => handleCheckboxChange('fuelTypes', fuel)} /> ))}
                  </ScrollableCheckboxList>
              </FilterSection>

              <FilterSection title="Car Transmission" isOpen={openSections.transmission} onToggle={() => toggleSection('transmission')}>
                  <ScrollableCheckboxList maxHeightClass="max-h-[110px] p-3">
                  {carTransmissions.map(trans => ( <CheckboxItem key={trans} id={`trans-${trans}`} label={trans} checked={filters.transmissions.includes(trans)} onChange={() => handleCheckboxChange('transmissions', trans)} /> ))}
                  </ScrollableCheckboxList>
              </FilterSection>

              <FilterSection title="Price" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
                  <div className="pt-2">
                  <input ref={priceRangeRef} type="range" name="price" min="100" max="1000" step="10" value={filters.price} onChange={handleInputChange} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-transparent range-slider-track" />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>$100</span> <span className="font-semibold text-[#FFA500]">${filters.price}</span> <span>$1000</span>
                  </div>
                  </div>
              </FilterSection>
          </div>

          <div className="mt-auto pt-6 space-y-3 border-t border-[#3D3D47] flex-shrink-0">
            <button onClick={onApplyFilters} className="w-full bg-[#FFA500] text-black font-semibold py-3 rounded-md hover:bg-opacity-90 transition-opacity text-sm">Filter Results</button>
            <button onClick={onResetFilters} className="w-full bg-gray-100 text-[#2C2C34] font-semibold py-3 rounded-md hover:bg-gray-200 transition-colors text-sm">Reset Filter</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;