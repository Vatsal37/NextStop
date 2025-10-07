import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'

function SearchSection() {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departureDate: null
  })

  const handleInputChange = (name, value) => {
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Search data:', searchData)
    // TODO: Implement search functionality
  }

  const swapLocations = () => {
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }))
  }

  // Sample airport data
  const airports = [
    { value: 'tokyo', label: 'Tokyo, Japan' },
    { value: 'berlin', label: 'Berlin, Germany' },
    { value: 'london', label: 'London, UK' },
    { value: 'paris', label: 'Paris, France' },
    { value: 'newyork', label: 'New York, USA' },
    { value: 'dubai', label: 'Dubai, UAE' },
    { value: 'singapore', label: 'Singapore' },
    { value: 'sydney', label: 'Sydney, Australia' }
  ]

  return (
    <div className='h-screen px-6'>
        <h1 className='text-center text-6xl font-bold text-gray-800 mb-4'>Plan Your Journey</h1>
        <h3 className='whitespace-pre-line text-center text-2xl text-gray-700'>
            {`Easily search and book your flight 
            with NextStop`}
        </h3>
        <div className='flex justify-center mt-12'>
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-5xl'>
            {/* Search Form */}
            <form onSubmit={handleSearch} className='flex items-end gap-4'>
              {/* From */}
              <div className='flex-1'>
                <label className='block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2'>
                  From
                </label>
                <Select value={searchData.from} onValueChange={(value) => handleInputChange('from', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tokyo, Japan" />
                  </SelectTrigger>
                  <SelectContent>
                    {airports.map((airport) => (
                      <SelectItem key={airport.value} value={airport.value}>
                        {airport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swap Button */}
              <button
                type='button'
                onClick={swapLocations}
                className='bg-blue-100 hover:bg-blue-200 p-2 -top-0.5 rounded-full transition-colors'
              >
                <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                </svg>
              </button>

              {/* To */}
              <div className='flex-1'>
                <label className='block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2'>
                  To
                </label>
                <Select value={searchData.to} onValueChange={(value) => handleInputChange('to', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Berlin, Germany" />
                  </SelectTrigger>
                  <SelectContent>
                    {airports.map((airport) => (
                      <SelectItem key={airport.value} value={airport.value}>
                        {airport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Departure Date */}
              <div className='flex-1'>
                <label className='block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2'>
                  Departure
                </label>
                <DatePicker
                  date={searchData.departureDate}
                  onDateChange={(date) => handleInputChange('departureDate', date)}
                  placeholder="Pick a date"
                  className="w-full"
                />
              </div>

              {/* Search Button */}
              <button
                type='submit'
                className='bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors'
              >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </button>
            </form>
          </div>
        </div>
    </div>
  )
}

export default SearchSection