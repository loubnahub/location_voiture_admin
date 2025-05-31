// src/components/Pagination.jsx (or wherever you keep components)
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ carsPerPage, totalCars, paginate, currentPage, nextPage, prevPage }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalCars / carsPerPage);

  
  let startPage, endPage;
  if (totalPages <= 5) {
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage <= 3) {
      startPage = 1;
      endPage = 5;
    } else if (currentPage + 1 >= totalPages) {
      startPage = totalPages - 4;
      endPage = totalPages;
    } else {
      startPage = currentPage - 2;
      endPage = currentPage + 2;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (totalPages === 0) return null; 

  return (
    <nav aria-label="Pagination" className="flex justify-center items-center space-x-2 sm:space-x-3 mt-10 md:mt-16">
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-colors
                    ${currentPage === 1 
                      ? 'bg-[#2A2A30] text-gray-600 cursor-not-allowed' 
                      : 'bg-[#2A2A30] text-gray-300 hover:bg-[#383841] hover:text-white'}`}
        aria-label="Previous Page"
      >
        <ChevronLeft size={20} />
      </button>

      {startPage > 1 && ( 
        <>
          <button onClick={() => paginate(1)} className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-[#2A2A30] text-gray-300 hover:bg-[#383841] hover:text-white transition-colors text-sm font-medium">1</button>
          {startPage > 2 && <span className="text-gray-500 px-1">...</span>}
        </>
      )}

      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-colors text-sm font-medium
                      ${currentPage === number 
                        ? 'bg-[#FFA500] text-black' 
                        : 'bg-[#2A2A30] text-gray-300 hover:bg-[#383841] hover:text-white'}`}
          aria-current={currentPage === number ? "page" : undefined}
        >
          {number}
        </button>
      ))}

      {endPage < totalPages && ( 
         <>
          {endPage < totalPages - 1 && <span className="text-gray-500 px-1">...</span>}
          <button onClick={() => paginate(totalPages)} className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-[#2A2A30] text-gray-300 hover:bg-[#383841] hover:text-white transition-colors text-sm font-medium">{totalPages}</button>
        </>
      )}

      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-colors
                    ${currentPage === totalPages 
                      ? 'bg-[#2A2A30] text-gray-600 cursor-not-allowed' 
                      : 'bg-[#2A2A30] text-gray-300 hover:bg-[#383841] hover:text-white'}`}
        aria-label="Next Page"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;