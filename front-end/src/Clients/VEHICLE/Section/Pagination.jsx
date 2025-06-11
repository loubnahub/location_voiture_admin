// src/components/Pagination.jsx (or wherever you keep components)
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ carsPerPage, totalCars, paginate, currentPage, nextPage, prevPage }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalCars / carsPerPage);

  // Logic for displaying a limited set of page numbers with ellipsis
  let startPage, endPage;
  if (totalPages <= 5) {
    // Less than or equal to 5 total pages, show all
    startPage = 1;
    endPage = totalPages;
  } else {
    // More than 5 total pages, calculate start and end pages
    if (currentPage <= 3) {
      startPage = 1;
      endPage = 5;
    } else if (currentPage + 1 >= totalPages) { // Adjusted from currentPage + 2 to currentPage + 1 for better end range
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

  if (totalPages === 0 || totalPages === 1) return null; // Don't render if no pages or only one page

  return (
    <nav aria-label="Pagination" className="tw-flex tw-justify-center tw-items-center tw-space-x-2 sm:tw-space-x-3 tw-mt-10 md:tw-mt-16">
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className={`tw-w-10 tw-h-10 sm:tw-w-11 sm:tw-h-11 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-transition-colors
                    ${currentPage === 1 
                      ? 'tw-bg-[#2A2A30] tw-text-gray-600 tw-cursor-not-allowed' 
                      : 'tw-bg-[#2A2A30] tw-text-gray-300 hover:tw-bg-[#383841] hover:tw-text-white'}`}
        aria-label="Previous Page"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Show first page and ellipsis if needed */}
      {startPage > 1 && ( 
        <>
          <button 
            onClick={() => paginate(1)} 
            className="tw-w-10 tw-h-10 sm:tw-w-11 sm:tw-h-11 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-[#2A2A30] tw-text-gray-300 hover:tw-bg-[#383841] hover:tw-text-white tw-transition-colors tw-text-sm tw-font-medium"
            aria-label="Go to page 1"
          >
            1
          </button>
          {startPage > 2 && <span className="tw-text-gray-500 tw-px-1">...</span>}
        </>
      )}

      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={`tw-w-10 tw-h-10 sm:tw-w-11 sm:tw-h-11 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-transition-colors tw-text-sm tw-font-medium
                      ${currentPage === number 
                        ? 'tw-bg-[#FFA500] tw-text-black' 
                        : 'tw-bg-[#2A2A30] tw-text-gray-300 hover:tw-bg-[#383841] hover:tw-text-white'}`}
          aria-current={currentPage === number ? "page" : undefined}
          aria-label={`Go to page ${number}`}
        >
          {number}
        </button>
      ))}

      {/* Show last page and ellipsis if needed */}
      {endPage < totalPages && ( 
         <>
          {endPage < totalPages - 1 && <span className="tw-text-gray-500 tw-px-1">...</span>}
          <button 
            onClick={() => paginate(totalPages)} 
            className="tw-w-10 tw-h-10 sm:tw-w-11 sm:tw-h-11 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-[#2A2A30] tw-text-gray-300 hover:tw-bg-[#383841] hover:tw-text-white tw-transition-colors tw-text-sm tw-font-medium"
            aria-label={`Go to page ${totalPages}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className={`tw-w-10 tw-h-10 sm:tw-w-11 sm:h-11 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-transition-colors
                    ${currentPage === totalPages 
                      ? 'tw-bg-[#2A2A30] tw-text-gray-600 tw-cursor-not-allowed' 
                      : 'tw-bg-[#2A2A30] tw-text-gray-300 hover:tw-bg-[#383841] hover:tw-text-white'}`}
        aria-label="Next Page"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;