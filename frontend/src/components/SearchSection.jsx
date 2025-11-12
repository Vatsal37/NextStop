import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { ArrowRightLeft, Search, Plane, MapPin, Calendar, Sparkles, Users } from 'lucide-react'
import { searchCoverImage, searchCoverClouds, searchCoverPlane } from '@/assets/images'
import airportsData from '@/data/airports.json'
import { setSearchData } from '../store/index.js'

function SearchSection() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchData, setLocalSearchData] = useState({
    from: '',
    to: '',
    departureDate: null,
    seatClass: '1' // Default to Economy
  })

  const handleInputChange = (name, value) => {
    setLocalSearchData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    
    // Check if required fields are filled
    if (!searchData.from || !searchData.to || !searchData.departureDate) {
      alert('Please fill in all required fields (From, To, and Departure Date)')
      return
    }
    
    // Dispatch search data to Redux store
    dispatch(setSearchData(searchData))
    
    // Navigate to search page
    navigate('/search')
  }

  const swapLocations = () => {
    setLocalSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }))
  }

  const [airports, setAirports] = useState([])

  // Seat class options
  const seatClasses = [
    { value: '1', label: 'Economy', code: 'Y' },
    { value: '2', label: 'Premium Economy', code: 'W' },
    { value: '3', label: 'Business', code: 'J' },
    { value: '4', label: 'First Class', code: 'F' }
  ]

  useEffect(() => {
    // Load airports from JSON file
    const mapped = airportsData.map((a) => ({
      value: a.airport_code,
      label: `${a.city}, ${a.country}`,
      code: a.airport_code
    }))
    setAirports(mapped)
  }, [])

  return (
    <section className='relative h-screen px-4 md:px-6 py-8 md:py-12 overflow-hidden flex items-center'>
      {/* Enhanced animated background with indigo gradients */}
      {/* <div className='pointer-events-none absolute inset-0'>
        <div className='absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50' />
        <div className='absolute -top-32 -left-32 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse' />
        <div className='absolute top-48 -right-24 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse' style={{ animationDelay: '2s' }} />
        <div className='absolute -bottom-24 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse' style={{ animationDelay: '4s' }} />
      </div> */}

      <div className='relative z-10 w-full max-w-4xl mx-auto'>
        {/* Compact Headings */}
        <div className='text-center mb-6 md:mb-8'>
          <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-200 shadow-sm mb-3'>
            <Sparkles className='w-3.5 h-3.5 text-indigo-600' />
            <span className='text-xs font-semibold text-indigo-900 tracking-wide uppercase'>Ready to Fly</span>
          </div>
          
          <h1 className='text-3xl md:text-5xl lg:text-5xl font-extrabold leading-tight mb-2'>
            <span className='bg-clip-text text-transparent tracking-tight bg-gray-800'>
              PLAN YOUR JOURNEY
            </span>
          </h1>
          
          <p className='text-base md:text-lg text-gray-400 max-w-2xl mx-auto'>
            Easily search and book your flight with{' '}
            <span className='font-bold gradient-text'>NextStop</span>
          </p>
        </div>

        <img 
          src={searchCoverPlane} 
          alt="Plane image" 
          className='absolute top-32 left-1/5 scale-60 -translate-x-1/2 z-50'
        />

        {/* Compact Search Card */}
        <div className='relative'>
          {/* Glow effect */}
          <div className='absolute -inset-1 bg-gradient-to-r from-grey-600 via-grey-200 to-grey-600 rounded-3xl blur-xl opacity-20'></div>
          
          {/* Main Card */}
          <div className='relative rounded-3xl border border-white/60 bg-white/80 backdrop-blur-2xl shadow-2xl overflow-hidden'>
            {/* Decorative gradient bar */}
            <div className='h-1.5 w-full bg-gradient-to-r from-indigo-600 via-indigo-100 to-indigo-600 rounded-t-3xl' />


            <div className='p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6'>
              {/* Image section */}
              <div className='relative lg:col-span-2 rounded-2xl overflow-hidden border border-indigo-100 shadow-lg'>
                <img 
                  src={searchCoverClouds} 
                  alt="Search cover" 
                  className='w-full h-full object-cover aspect-square'
                />
              </div>

              {/* Compact Form */}
              <form onSubmit={handleSearch} className='lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 content-start'>
                {/* From */}
                <div className='group'>
                  <label className='flex items-center gap-1.5 text-md font-semibold text-gray-700 uppercase tracking-wide mb-1.5'>
                    <MapPin className='w-5 h-5 text-indigo-600' />
                    From
                  </label>
                  <Select value={searchData.from} onValueChange={(value) => handleInputChange('from', value)}>
                    <SelectTrigger className="w-full h-10 text-sm rounded-xl border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-600 transition-colors bg-white shadow-sm">
                      <SelectValue placeholder="Select departure" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map((airport) => (
                        <SelectItem key={airport.value} value={airport.value}>
                          <div className='flex items-center justify-between gap-3'>
                            <span>{airport.label}</span>
                            <span className='text-xs text-gray-500 font-mono'>{airport.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* To */}
                <div className='group'>
                  <label className='flex items-center gap-1.5 text-md font-semibold text-gray-700 uppercase tracking-wide mb-1.5'>
                    <MapPin className='w-5 h-5 text-purple-600' />
                    To
                  </label>
                  <Select value={searchData.to} onValueChange={(value) => handleInputChange('to', value)}>
                    <SelectTrigger className="w-full h-10 text-sm rounded-xl border-2 border-gray-200 hover:border-purple-400 focus:border-purple-600 transition-colors bg-white shadow-sm">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map((airport) => (
                        <SelectItem key={airport.value} value={airport.value}>
                          <div className='flex items-center justify-between gap-3'>
                            <span>{airport.label}</span>
                            <span className='text-xs text-gray-500 font-mono'>{airport.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Swap Button */}
                <div className='sm:col-span-2 flex items-center justify-center my-1'>
                  <button
                    type='button'
                    onClick={swapLocations}
                    className='group relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-100 hover:from-indigo-700 hover:to-indigo-200 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110'
                    aria-label='Swap From and To'
                  >
                    <ArrowRightLeft className='w-4 h-4 transition-transform duration-300 group-hover:rotate-180' />
                    <div className='absolute inset-0 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300'></div>
                  </button>
                </div>

                {/* Departure Date */}
                <div className='group'>
                  <label className='flex items-center gap-1.5 text-md font-semibold text-gray-700 uppercase tracking-wide mb-1.5'>
                    <Calendar className='w-5 h-5 text-indigo-600' />
                    Departure Date
                  </label>
                  <DatePicker
                    date={searchData.departureDate}
                    onDateChange={(date) => handleInputChange('departureDate', date)}
                    placeholder="Pick a date"
                    className="w-full h-10 text-sm border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-600 rounded-xl transition-colors"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </div>

                {/* Seat Class */}
                <div className='group'>
                  <label className='flex items-center gap-1.5 text-md font-semibold text-gray-700 uppercase tracking-wide mb-1.5'>
                    <Users className='w-5 h-5 text-purple-600' />
                    Class
                  </label>
                  <Select value={searchData.seatClass || '1'} onValueChange={(value) => handleInputChange('seatClass', value)}>
                    <SelectTrigger className="w-full h-10 text-sm rounded-xl border-2 border-gray-200 hover:border-purple-400 focus:border-purple-600 transition-colors bg-white shadow-sm">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {seatClasses.map((seatClass) => (
                        <SelectItem key={seatClass.value} value={seatClass.value}>
                          <div className='flex items-center justify-between gap-3'>
                            <span>{seatClass.label}</span>
                            <span className='text-xs text-gray-500 font-mono'>{seatClass.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <div className='sm:col-span-2 mt-1'>
                  <button
                    type='submit'
                    className='group relative w-full h-11 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-100 hover:from-indigo-700 hover:to-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex items-center justify-center gap-2'
                  >
                    <div className='absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300'></div>
                    <Search className='w-4 h-4 relative z-10' />
                    <span className='relative z-10 text-sm'>Search Flights</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Compact Bottom info bar */}
            <div className='px-4 md:px-6 lg:px-8 pb-3 md:pb-4'>
              <div className='flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600 pt-3 border-t border-gray-200'>
                <div className='flex items-center gap-1.5'>
                  <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></div>
                  <span>Real-time updates</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <div className='w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse' style={{ animationDelay: '1s' }}></div>
                  <span>Best price</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <div className='w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse' style={{ animationDelay: '2s' }}></div>
                  <span>Secure booking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Popular Destinations */}
        <div className='mt-6 text-center'>
          <p className='text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide'>Trending</p>
          <div className='flex flex-wrap justify-center gap-2'>
            {[
              { city: 'Leh–Ladakh', flag: '🏔️' },
              { city: 'Rishikesh', flag: '🧘' },
              { city: 'Jaipur', flag: '🏰' },
              { city: 'Goa', flag: '🏖️' },
              { city: 'Kerala Backwaters', flag: '🚤' }
            ].map((dest) => (
              <button
                key={dest.city}
                className='group px-3 py-1.5 bg-white/60 backdrop-blur-sm hover:bg-white border-2 border-indigo-100 hover:border-indigo-300 rounded-full text-xs font-medium text-gray-700 hover:text-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5'
              >
                <span className='text-sm group-hover:scale-110 transition-transform duration-200'>{dest.flag}</span>
                <span>{dest.city}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SearchSection