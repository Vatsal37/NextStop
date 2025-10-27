import React, { useState } from 'react'
import { AirbusA320, Boeing737 } from '../assets/images'

function SeatSelection() {
  const [selectedSection, setSelectedSection] = useState(1)
  return (
    <div className="w-screen bg-white">
      {/* Title Section */}
      <div className="px-10 pt-10">
        <h1 className="text-4xl font-medium text-gray-900 leading-none tracking-tight">
          CHOOSE SEATS
        </h1>
      </div>

      {/* Responsive Image Container */}
      <div className="relative w-full aspect-[2/1] md:aspect-[5/1]">
        <img
          src={AirbusA320}
          alt="Airbus A320"
          className="absolute top-0 left-1/2 transform -translate-x-1/9 -translate-y-1/3 w-auto h-fit"
        />
      </div>

      {/* Content Section */}
      <div className="px-10 py-6">
        <div className="flex items-center gap-2">
          <p className="text-md font-medium text-gray-800">Sections</p>
          <div className='flex items-center gap-2 rounded-full bg-gray-100 px-3.5 py-2.5'>
            <button 
              onClick={() => setSelectedSection(1)}
              className={`rounded-full w-fit h-fit px-6 py-1 text-md text-center ${
                selectedSection === 1 
                  ? 'text-white bg-primary' 
                  : 'text-gray-900 bg-white'
              }`}
            >
              1
            </button>
            <button 
              onClick={() => setSelectedSection(2)}
              className={`rounded-full w-fit h-fit px-6 py-1 text-md text-center ${
                selectedSection === 2 
                  ? 'text-white bg-primary' 
                  : 'text-gray-900 bg-white'
              }`}
            >
              2
            </button>
            <button 
              onClick={() => setSelectedSection(3)}
              className={`rounded-full w-fit h-fit px-6 py-1 text-md text-center ${
                selectedSection === 3 
                  ? 'text-white bg-primary' 
                  : 'text-gray-900 bg-white'
              }`}
            >
              3
            </button>
          </div>
        </div>
      </div>
      <div className='flex items-center px-8'>
        <div className=' h-fit mx-auto w-full px-4 py-2 bg-white rounded-xl border border-gray-200'>
          <div className='flex w-full items-center justify-between'>
            <h4 className='text-lg font-medium text-gray-900'>Section 1</h4>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-indigo-600 rounded-full'></div>
                <p className='text-sm text-gray-500'>Available</p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                <p className='text-sm text-gray-500'>Booked</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeatSelection
