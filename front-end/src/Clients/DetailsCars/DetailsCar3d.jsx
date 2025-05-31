import React, { useState, useEffect } from 'react';

import { 
    CarFront, Orbit, Camera, X, ArrowLeft,
    Box, RefreshCw, Aperture 
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeftIcon as ChevronLeftHero,
  ChevronRightIcon as ChevronRightHero,
} from '@heroicons/react/24/outline';

const colors = [
  { name: 'White', value: '#FFFFFF', tailwindBg: 'bg-white' },
  { name: 'Black', value: '#374151', tailwindBg: 'bg-gray-700' },
  { name: 'Red', value: '#EF4444', tailwindBg: 'bg-red-500' },
  { name: 'Blue', value: '#3B82F6', tailwindBg: 'bg-blue-500' },
] 

   

export default function CarDetails3d() { 


  const commonTopButtonClasses = "p-1.5 sm:p-2 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-colors shadow-sm";
  const activeViewClasses = `${commonTopButtonClasses} bg-white text-black`;
  const inactiveViewClasses = `${commonTopButtonClasses} text-white hover:bg-neutral-500/50`;




  return (
    <div className="fixed inset-0 bg-white/[0.5]  backdrop-blur-sm flex items-center justify-center z-[997] p-2 sm:p-4 font-sans">
      <div className="bg-[#FFFFFF90] text-neutral-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl xl:max-w-7xl max-h-[95vh] flex flex-col relative overflow-hidden">
        {/* Top Bar */}
        <button
          className="absolute top-4 left-4 z-20 text-neutral-800 bg-white hover:bg-gray-200/90 p-2.5 rounded-lg items-center justify-center flex shadow"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-1.5 sm:gap-2 bg-neutral-700/60 backdrop-blur-sm p-1 sm:p-1.5 rounded-full shadow-lg">
        <Link to="/fleet/details">  <button  className={inactiveViewClasses} title="Details"><CarFront size={16} /></button></Link>
            <Link to="/fleet/details/3d"> <button  className={activeViewClasses} title="3D View"><Orbit size={16}  /></button> </Link>
            <Link to="/fleet/details/ar">    <button  className={inactiveViewClasses} title="Gallery / AR"><Camera size={16}  /></button></Link>
        </div>
        
        <button
          
            className="absolute top-4 right-4 z-20 text-neutral-500 hover:text-neutral-700 p-1.5"
            aria-label="Close"
        > <X size={22} />
        </button>

        <div className="flex-grow grid grid-cols-12 gap-4 sm:gap-6 items-stretch pt-20 pb-6 px-4 sm:px-8">
            <div className="col-span-12 lg:col-span-4 flex flex-col justify-between">
                <div>
                    <h1 className="text-xl sm:text-4xl font-semibold text-gray-800 tracking-tight">
                        Bently
                    </h1>
                    <p className="text-sm lg:text-lg text-gray-500 mt-1">Sedan (type)</p>
                </div>
                <div className="bg-gray-100 rounded-xl shadow-md mt-4 sm:mt-6 mb-4 sm:mb-6 flex flex-col items-center justify-center p-2">
                    <div className="p-3 sm:p-4 w-full max-w-xs aspect-[4/3] flex flex-col items-center justify-center">
                        <img 
                            src="\images\Cars\Toyota.png"
                            alt={`3D spin representation`}
                            className="max-w-full max-h-[70%] object-contain"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">3D car presentation 360 spin</p>
                </div>
                <div className="flex justify-center space-x-5 sm:space-x-6 pt-2 sm:pt-4">
                    <button className="text-gray-500 hover:text-blue-600 transition-colors" title="3D Model"><Box size={20} /></button>
                    <button className="text-gray-500 hover:text-blue-600 transition-colors" title="360 Spin"><RefreshCw size={20} /></button>
                    <button className="text-gray-500 hover:text-blue-600 transition-colors" title="More Views"><Aperture size={20} /></button>
                </div>
            </div>

            <div className="col-span-12 lg:col-span-7  flex flex-col items-center justify-center relative -mt-4 lg:mt-0"> {/* Removed pl-10 */}
                <div className="w-full aspect-[16/9] sm:aspect-[16/10] mb-3 sm:mb-2 flex items-center justify-center">
                <img
                    src="\images\Cars\Toyota.png"
                    alt=""
                    className="max-w-full max-h-full object-contain transition-all duration-300 ease-in-out"
                />
                </div>
                    <div className="flex items-center space-x-2 sm:space-x-4 px-4 py-1.5  backdrop-blur-sm ml-20 mt-1">
                        <button className="p-1.5 sm:p-2 rounded-full  hover:bg-gray-300/50 transition-colors text-gray-600" aria-label="Previous"><ChevronLeftHero className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                        <div className="flex space-x-1.5 sm:space-x-2 overflow-hidden p-2"> {/* Add overflow-x-auto if many thumbnails */}
                            <button  
                                className={`w-20 h-16 p-2 bg-white sm:w-16 sm:h-11 md:w-[100px] md:h-[70px] rounded-md border-2 transition-all overflow-hidden hover:opacity-80 `} >
                                <img src="\images\Cars\Toyota.png" alt="" className="w-full h-full object-cover" />
                            </button> 
                        </div>
                        <button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-300/50 transition-colors text-gray-600" aria-label="Next"><ChevronRightHero className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    </div>
                
            </div>

            <div className="lg:col-span-1 flex lg:flex-col justify-center lg:justify-start items-center space-x-2 lg:space-x-0 lg:space-y-4 pt-4 lg:pt-24">
                {colors.map((color) => (
                <button
                    key={color.name}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 transition-all
                   
                    ${color.tailwindBg}
                    ${color.value === '#FFFFFF' ? 'border-gray-400' : ''} 
                    `}
                    aria-label={`Select ${color.name} color`}
                    style={{ backgroundColor: color.value }}
                >
                    {color.value === '#FFFFFF' && (
                    <svg className="w-4 h-4 text-blue-600 m-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    )}
                </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}