import React from 'react';
import { bookingConfirmationCoverImage, logo, routeIcon } from '../assets/images';

export default function BookingConfirmation() {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      });
    } catch {
      // If dateStr is in format like "27JUN20", parse it manually
      if (typeof dateStr === 'string' && dateStr.match(/^\d{2}[A-Z]{3}\d{2}$/)) {
        const day = dateStr.slice(0, 2);
        const month = dateStr.slice(2, 5);
        const year = '20' + dateStr.slice(5, 7);
        const monthMap = {
          'JAN': 'Jan', 'FEB': 'Feb', 'MAR': 'Mar', 'APR': 'Apr',
          'MAY': 'May', 'JUN': 'Jun', 'JUL': 'Jul', 'AUG': 'Aug',
          'SEP': 'Sep', 'OCT': 'Oct', 'NOV': 'Nov', 'DEC': 'Dec'
        };
        return `${day} ${monthMap[month] || month} ${year}`;
      }
      return dateStr;
    }
  };
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f2543]">

      {/* Header */}
      <div className="relative px-6 pt-12 pb-40 sm:pt-16 sm:pb-8 min-h-[360px] sm:min-h-[480px] text-white overflow-hidden">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0" aria-hidden="true">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${bookingConfirmationCoverImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1e36]/90 via-[#0f2543]/80 to-[#0f2543]/95" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl flex items-center justify-between">
          {/* Brand to mirror image */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <img src={logo} alt="NextStop Logo" className="object-contain w-full h-full" />
            </div>
            <span className="text-white text-4xl font-bold">NextStop</span>
          </div>
        </div>
      </div>

      {/* Booking Card (clone of image) */}
      <div className="relative z-10 -mt-72 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="bg-white rounded-md shadow-xl overflow-hidden">
            {/* Route header */}
            <div className="px-6 py-5">
              <div className='flex justify-between items-center w-full'>
                <div className='flex flex-col'>
                  <p className='text-md text-gray-500 mb-2'>Detroit</p>
                  <h1 className='text-3xl font-semibold leading-none tracking-tight mb-2'>
                    DTW
                  </h1>
                  <p className='text-md text-gray-500'>
                    FRI, JUL 10 8:52 AM
                  </p>
                </div>
                <div className='relative'>
                  <img src={routeIcon} alt='routeIcon' className='w-fit h-10' />
                  <p className='text-md text-gray-500 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2'>
                    2h 0m
                  </p>
                </div>
                <div className='flex flex-col text-right'>
                  <p className='text-md text-gray-500 mb-2'>New York</p>
                  <h1 className='text-3xl font-semibold leading-none tracking-tight mb-2'>
                    JFK
                  </h1>
                  <p className='text-md text-gray-500'>
                    FRI, JUL 10 10:52 AM
                  </p>
                </div>
              </div>
            </div>

            {/* Thin divider */}
            <div className="h-px bg-gray-200" />

            {/* Details grid */}
            <div className="grid grid-cols-4 gap-4 px-6 py-5">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Flight</div>
                <div className="text-[13px] font-semibold text-gray-900">DELTA 945</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Passenger</div>
                <div className="text-[13px] font-semibold text-gray-900">TIANYI QI</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Class</div>
                <div className="text-[13px] font-semibold text-gray-900">BASIC ECONOMY (E)</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Seat</div>
                <div className="text-[13px] font-semibold text-gray-900">12B</div>
              </div>
            </div>

            {/* Confirmation strip */}
            <div className="px-6 py-3 bg-[#e8f1fb] flex items-center justify-center gap-10">
              <div className="text-[10px] text-gray-600 uppercase tracking-wider">Confirmation Number</div>
              <div className="text-[13px] font-bold text-[#1e3a5f] tracking-wide">GXPUBG</div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Section */}
      <div className="relative z-10 px-4 sm:px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="bg-white rounded-md shadow-xl overflow-hidden">
            <div className="px-6 py-5">
              <div className="text-[18px] font-semibold text-[#0f2543] mb-3">Flight Receipt</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ticket#:</span>
                  <span className="text-gray-900 font-medium">001234459000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Method of Payment</span>
                  <span className="text-gray-900 font-semibold">Amount</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="text-gray-900 font-medium">{formatDate('27JUN20')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">CA***************1234</span>
                  <span className="text-gray-900 font-medium">$98.10 USD</span>
                </div>
              </div>
            </div>

            {/* Charges */}
            <div className="px-6 py-5">
              <div className="text-[12px] font-bold text-gray-800 uppercase tracking-wider mb-2">Price Breakdown</div>
              <div className="bg-gray-100 text-gray-800 text-[13px] font-medium px-4 py-3 mb-2 rounded-sm">Class Information</div>
              <div className="flex items-center justify-between text-[13px] px-4 py-3 border-b border-gray-100">
                <span className="text-gray-800">BASIC ECONOMY Class (Code: E)</span>
                <span className="text-gray-900 font-medium">$98.10 USD</span>
              </div>

              <div className="bg-gray-100 text-gray-800 text-[13px] font-medium px-4 py-3 mt-5 mb-2 rounded-sm">Price Details</div>
              <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex-1 text-[13px] pr-4">
                  <div className="font-medium text-gray-800 mb-1">Base Price</div>
                  <div className="text-xs text-gray-600 leading-snug">Base fare for the selected seat class</div>
                </div>
                <span className="text-[13px] text-gray-900 font-medium ml-4">$88.00 USD</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex-1 text-[13px] font-medium text-gray-800">Tax Amount</div>
                <span className="text-[13px] text-gray-900 font-medium ml-4">$10.10 USD</span>
              </div>

              <div className="flex items-center justify-between px-4 py-5 mt-2.5 bg-white text-[15px] font-bold text-[#1e3a5f] border-t-2 border-gray-200">
                <span>Ticket Total Amount</span>
                <span>$98.10 USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-10 bg-[#0f2543] text-center text-white">
        <p className="text-base">Looking forward to flying with you!</p>
      </div>
    </div>
  );
}