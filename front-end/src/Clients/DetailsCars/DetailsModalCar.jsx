// src/pages/CarDetailPage.jsx
import React, { useState, useEffect } from 'react';



import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft, X, Camera,
  Orbit,
  CarFront,
  FileText, Users, CalendarDays, Fuel, Settings2,
  GaugeCircle, Baby, Navigation, Wifi, CircleDollarSign, ChevronDown, ChevronUp,
  Shapes, Disc3, Feather, Tag, DoorOpen, Armchair, Route,
  MapPin, Briefcase,
} from 'lucide-react';
import { Link } from 'react-router-dom';






const CarDetailPage = () => {
const navigate = useNavigate();


  const scrollbarStyles = `
    .custom-detail-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-detail-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 3px; }
    .custom-detail-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 3px; }
    .custom-detail-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.4); }
    .custom-detail-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.2) rgba(0,0,0,0.05); }
  `;

  const activeViewClasses = "p-2 bg-white text-black rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center";
  const inactiveViewClasses = "p-1.5 sm:p-2 text-white hover:bg-neutral-500/50 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center";

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-white/[0.5] backdrop-blur-sm flex items-center justify-center z-[999] p-2 sm:p-4 font-sans">
        <div className="bg-[#FFFFFF90] text-neutral-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl xl:max-w-7xl max-h-[95vh] flex flex-col relative">
          {/* Top Navigation and Close Buttons */}
          <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-700/60 backdrop-blur-sm p-1 sm:p-1.5 rounded-full shadow">
              <button
                className={activeViewClasses}
                title="Details"
              >
                <CarFront size={18} />
              </button>
              <Link to="/fleet/details/3d">
              <button
                className={inactiveViewClasses}
                title="3D View"
              >
                <Orbit size={18} />
              </button>
              </Link>
              <button
                className={inactiveViewClasses}
                title="Gallery / AR View"
              >
                <Camera size={18} />
              </button>
            </div>
          </div>
          <button

            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 text-neutral-600 hover:text-neutral-800 bg-white/70 hover:bg-white p-1.5 rounded-full"
            aria-label="Close details"
          > <X size={20} />
          </button>
          <button
            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 text-neutral-800 bg-white shadow-md p-1.5 rounded-lg items-center justify-center flex"
            aria-label="Back"
          > <ArrowLeft size={20} />
          </button>

          <div className="flex-grow overflow-y-auto custom-detail-scrollbar pt-16 sm:pt-20 pb-6 px-4 sm:px-6 md:px-8">
            <div className="md:flex md:gap-6 lg:gap-8">
              {/* Left Column: Name, Description, Image, Specs */}
              <div className="md:w-[60%] lg:w-[62%] flex flex-col">
                <div className="md:flex md:gap-4 lg:gap-6 mb-5 sm:mb-6">
                  <div className="md:w-1/2 lg:w-[45%]">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">Bently</h1>
                    <p className="text-md text-neutral-700 mb-3 sm:mb-4">Car Type</p>
                    <div className="mb-4 sm:mb-5">
                      <h2 className="flex items-center text-lg font-semibold text-neutral-900 mb-1.5 sm:mb-2">
                        <FileText size={20} className="mr-2 text-neutral-700" />Description
                      </h2>
                      <p className="text-sm text-neutral-700 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ad quos maiores, harum veritatis in unde minima voluptas architecto dolor voluptatem nostrum quae enim consequuntur facilis doloribus quisquam, molestias voluptate.</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      {/* "Rent Now" button is now hooked up */}
                      <Link to="/booking/1">
                      <button
                        className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2.5 px-4 sm:px-6 rounded-lg text-sm flex-1 transition-colors"
                      >
                        Rent Now
                      </button></Link>
                      <button className="bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 font-semibold py-2.5 px-4 sm:px-6 rounded-lg text-sm flex-1 transition-colors">
                        Review
                      </button>
                    </div>
                  </div>
                  <div className="md:w-1/2 lg:w-[55%] -mr-72 mt-4 md:mt-0 flex items-center justify-center">
                    <div className="w-[900px] -mr-72">
                      <img
                        src="\images\Cars\Toyota.png"
                        alt={` main view`}
                        className="w-full h-auto max-h-[300px] sm:max-h-[350px] md:max-h-[400px] object-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-2 sm:gap-2.5 text-sm -mt-5 ">

                  <div className="bg-white text-neutral-800 px-3 py-2 rounded-md flex items-center shadow-sm">
                    <Shapes size={18} className="mr-2 text-neutral-600 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-neutral-500">type</span>
                      <span className="block font-semibold text-sm"> Electric Sedan</span>
                    </div>
                  </div>
                  <div className="bg-white text-neutral-800 px-3 py-2 rounded-md flex items-center shadow-sm">
                    <Disc3 size={18} className="mr-2 text-neutral-600 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-neutral-500">Brand</span>
                      <span className="block font-semibold text-sm">Tesla</span>
                    </div>
                  </div>
                  <div className="bg-white text-neutral-800 px-3 py-2 rounded-md flex items-center shadow-sm">
                    <CalendarDays size={18} className="mr-2 text-neutral-600 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-neutral-500">Year</span>
                      <span className="block font-semibold text-sm">2023</span>
                    </div>
                  </div>
                  <div className="bg-white text-neutral-800 px-3 py-2 rounded-md flex items-center shadow-sm">
                    <Feather size={18} className="mr-2 text-neutral-600 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-neutral-500">Model</span>
                      <span className="block font-semibold text-sm">Model S Plaid</span>
                    </div>
                  </div>

                  <div className="bg-white text-neutral-800 px-3 py-2 rounded-md flex items-center shadow-sm">
                    <Tag size={18} className="mr-2 text-neutral-600 flex-shrink-0" />
                    <div>

                      <span className="block text-xs text-neutral-500">Price per day</span>
                      <span className="block font-semibold text-sm">400</span>
                    </div>
                  </div><div className="bg-white text-neutral-800 px-3 py-2 rounded-md flex items-center shadow-sm">
                    <Fuel size={18} className="mr-2 text-neutral-600 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-neutral-500">Fuel type</span>
                      <span className="block font-semibold text-sm">Electric</span>
                    </div>
                  </div><div className="bg-white text-neutral-800 px-3 py-2 rounded-md flex items-center shadow-sm">
                    <DoorOpen size={18} className="mr-2 text-neutral-600 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-neutral-500">Droos</span>
                      <span className="block font-semibold text-sm">4</span>
                    </div>
                  </div><div className="bg-white text-neutral-800 px-3 py-2 rounded-md flex items-center shadow-sm">
                    <Armchair size={18} className="mr-2 text-neutral-600 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-neutral-500">Seats</span>
                      <span className="block font-semibold text-sm">5</span>
                    </div>
                  </div><div className="bg-white text-neutral-800 px-3 py-2 rounded-md flex items-center shadow-sm">
                    <Settings2 size={18} className="mr-2 text-neutral-600 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-neutral-500">Transmission</span>
                      <span className="block font-semibold text-sm">Automatic</span>
                    </div>
                  </div>
                  <div className="bg-white text-neutral-800 px-3 py-2 rounded-md flex items-center shadow-sm">
                    <Route size={18} className="mr-2 text-neutral-600 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-neutral-500">Mileage</span>
                      <span className="block font-semibold text-sm">8,000 km</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Features & Extras */}
              <div className="md:w-[40%] lg:w-[38%] mt-8 md:mt-0 md:pt-0">
                <div className="bg-white/90 p-4 sm:p-5 rounded-lg shadow-lg text-neutral-800 sticky top-4">
                  {/* Features Section */}
                  <div className="mb-6">
                    <div className="flex-col justify-between items-center mb-2 cursor-pointer" >
                      <div className='flex justify-between items-center '>
                        <h2 className="text-xl font-semibold text-neutral-900">Features</h2>
                        <div className="flex items-center">
                          <select
                            value='Technology'
                            className="text-xs bg-neutral-700 text-white px-3 py-1.5 rounded-full flex items-center mr-2 shadow-sm hover:bg-neutral-600 transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                          >
                            <option key="Technology" value="Technology">Technology</option>
                          </select>

                          <ChevronUp size={20} className="text-neutral-500" />
                        </div>
                      </div>
                      <p className='border-b border-neutral-300 w-full mt-2 mb-1'></p>
                    </div>

                    <div className="space-y-2 sm:space-y-2.5 mt-2 max-h-60 overflow-y-auto custom-detail-scrollbar pr-1">
                      <div className="bg-neutral-100 p-2.5 sm:p-3 rounded-md shadow-sm">
                        <p className="text-xs text-neutral-600">Autopilot</p>
                        <p className="text-sm text-neutral-800 font-medium">Enhanced Autopilot</p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-2.5 mt-2 max-h-60 overflow-y-auto custom-detail-scrollbar pr-1">
                        <div className="bg-neutral-100 p-2.5 sm:p-3 rounded-md shadow-sm">
                          <p className="text-xs text-neutral-600">Range</p>
                          <p className="text-sm text-neutral-800 font-medium">390+ miles (EPA est.) </p>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2 cursor-pointer" >
                          <h2 className="text-xl font-semibold text-neutral-900">Possible Extras</h2>
                          <ChevronUp size={20} className="text-neutral-500" />
                        </div>                     
                         <p className='border-b border-neutral-300 w-full mt-2 mb-1'></p>
                        <div className="space-y-2 sm:space-y-2.5 mt-2 max-h-60 overflow-y-auto custom-detail-scrollbar pr-1">
                        <div className="bg-neutral-100 p-2.5 sm:p-3 rounded-md flex items-start shadow-sm">
                            <div>
                              <p className="text-sm text-neutral-800 font-medium">Full Self-Driving (Supervised)</p>
                              <p className="text-xs text-neutral-600">10.00 $</p>
                            </div>                          
                        </div>
                        <div className="bg-neutral-100 p-2.5 sm:p-3 rounded-md flex items-start shadow-sm">
                            <div>
                              <p className="text-sm text-neutral-800 font-medium">Full Self-Driving (Supervised)</p>
                              <p className="text-xs text-neutral-600">13.00 $</p>
                            </div>                          
                        </div><div className="bg-neutral-100 p-2.5 sm:p-3 rounded-md flex items-start shadow-sm">
                            <div>
                              <p className="text-sm text-neutral-800 font-medium">Full Self-Driving (Supervised)</p>
                              <p className="text-xs text-neutral-600">25.00 $</p>
                            </div>                          
                        </div>
                        </div>
                    
                      </div>
                  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};


export default CarDetailPage;