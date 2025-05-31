// src/pages/CarProductPage.jsx
import React, { useState, useEffect } from 'react';



import { useNavigate, useParams } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'; 
import { 
   Camera, Orbit, CarFront, X, ArrowLeft
} from 'lucide-react';


const  colors = [
    { name: 'White', value: '#FFFFFF', tailwindBg: 'bg-white' },
    { name: 'Black', value: '#333333', tailwindBg: 'bg-gray-800' },
    { name: 'Red', value: '#FF0000', tailwindBg: 'bg-red-600' },
    { name: 'Blue', value: '#0052FF', tailwindBg: 'bg-blue-600' },
  ]

export default function CarProductPage() {
  const navigate = useNavigate();
  const handleClose = () => navigate('/');

  const commonButtonClasses = "p-1.5 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-colors shadow";
  const activeViewClasses = `${commonButtonClasses} bg-white text-black`;
  const inactiveViewClasses = `${commonButtonClasses} text-white hover:bg-neutral-500/50`;

  

  return (
    <div className="flex justify-center items-center min-h-screen bg-white/[0.5] p-4">
      <div className="bg-[#FFFFFF90] rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-7xl max-h-[95vh] font-sans relative overflow-hidden flex flex-col">

        <button
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 text-neutral-800 bg-white shadow-md p-1.5 rounded-lg items-center justify-center flex"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-1.5 sm:gap-2 bg-neutral-700/60 backdrop-blur-sm p-1 sm:p-1.5 rounded-full shadow">
            <button
              className={inactiveViewClasses}
              title="Details View"
            >
              <CarFront size={18} />
            </button>
            <button
              className={inactiveViewClasses}
              title="3D View"
            >
              <Orbit size={18} />
            </button>
            <button
               className={activeViewClasses}
               title="Gallery / AR View"
            >
               <Camera size={18} />
            </button>
        </div>
        
        <button
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 text-neutral-600 hover:text-neutral-800 bg-white/70 hover:bg-white p-1.5 rounded-full"
            aria-label="Close details"
        >
            <X size={20} />
        </button>

        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-16 lg:mt-20 overflow-y-auto pr-2">
            <div className="lg:col-span-4 space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Bently
                </h1>
                <p className="text-gray-500">Car (type)</p>
                <div className="flex items-start space-x-2 text-gray-700">
                <DocumentTextIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">Description</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sequi officiis dolore in distinctio vitae. Corrupti.
                </p>
                <div className="flex space-x-3 pt-2">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Rent Now
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Review
                </button>
                </div>
            </div>

            <div className="lg:col-span-7 flex flex-col items-center relative">
                <div className="w-full aspect-[16/10] mb-4">
                <img
                    src="\images\Cars\Toyota.png"
                    className="w-full h-full object-contain rounded-lg"
                />
                </div>
                    <div className="flex items-center space-x-1 sm:space-x-3 p-2 -mt-10 z-10 bg-white/50 ">
                        <button
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors shadow-md border border-gray-200"
                            aria-label="Previous image"
                        >
                            <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        </button>
                            <button
                            
                            className={`w-12 h-10 sm:w-20 sm:h-14 md:w-24 md:h-16 rounded-md border-2 transition-all overflow-hidden 
                                `}
                            >
                            <img
                                src="\images\Cars\Toyota.png"
                                alt=""
                                className="w-full h-full p-2 object-cover rounded-sm"
                            />
                            </button>
                      
                        <button
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors shadow-md border border-gray-200"
                            aria-label="Next image"
                        >
                            <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        </button>
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
                    { color.value === '#FFFFFF' && (
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