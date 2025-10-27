import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { ArrowRightLeft, Search, MapPin, Calendar, Users } from 'lucide-react'
import airportsData from '@/data/airports.json'
import { updateSearchField, searchFlightsThunk } from '../store/index.js'

function CompactSearchSection() {
    const dispatch = useDispatch()
    const searchData = useSelector(state => state.search)
    const [airports, setAirports] = useState([])
    
    // Seat class options
    const seatClasses = [
      { value: '1', label: 'Economy', code: 'Y' },
      { value: '2', label: 'Premium Economy', code: 'W' },
      { value: '3', label: 'Business', code: 'J' },
      { value: '4', label: 'First Class', code: 'F' }
    ]
    
      const handleInputChange = (name, value) => {
        dispatch(updateSearchField({ field: name, value }))
      }
    
      const handleSearch = (e) => {
        e.preventDefault()
        
        // Validate search data
        if (!searchData.from || !searchData.to || !searchData.departureDate) {
          alert('Please fill in all search fields')
          return
        }

        // Format date to YYYY-MM-DD using local timezone (not UTC)
        const formatDateForAPI = (date) => {
          if (date instanceof Date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
          return date;
        };
        
        const formattedDate = formatDateForAPI(searchData.departureDate)

        // Trigger search
        const searchParams = {
          source: searchData.from,
          destination: searchData.to,
          date: formattedDate,
          classId: searchData.seatClass || '1'
        }
        
        dispatch(searchFlightsThunk(searchParams))
      }
    
      const swapLocations = () => {
        const tempFrom = searchData.from
        dispatch(updateSearchField({ field: 'from', value: searchData.to }))
        dispatch(updateSearchField({ field: 'to', value: tempFrom }))
      }
    
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
    <div className='bg-white border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 md:px-6 py-6'>
        {/* Compact Search Bar */}
        <div className='bg-gray-50 rounded-2xl p-4 shadow-sm border border-gray-200'>
            {/* Single Line Form */}
                <form onSubmit={handleSearch} className='flex items-end gap-3 flex-wrap'>
                    {/* From */}
                    <div className='flex-1 min-w-0'>
                    <label className='text-md font-medium text-gray-600 mb-1 flex items-center gap-1.5'>
                      <MapPin className='w-5 h-5 text-indigo-600' />
                      FROM
                    </label>
                    <Select value={searchData.from} onValueChange={(value) => handleInputChange('from', value)}>
                        <SelectTrigger className="w-full h-10 text-sm rounded-lg border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-600 transition-colors bg-white shadow-sm">
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

                    {/* Swap Button */}
                    <div className='flex-shrink-0'>
                    <div className='h-4'></div>
                    <button
                        type='button'
                        onClick={swapLocations}
                        className='group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-100 hover:from-indigo-700 hover:to-indigo-200 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110'
                        aria-label='Swap From and To'
                    >
                        <ArrowRightLeft className='w-3 h-3 transition-transform duration-300 group-hover:rotate-180' />
                    </button>
                    </div>

                    {/* To */}
                    <div className='flex-1 min-w-0'>
                    <label className='text-md font-medium text-gray-600 mb-1 flex items-center gap-1.5'>
                      <MapPin className='w-5 h-5 text-purple-600' />
                      TO
                    </label>
                    <Select value={searchData.to} onValueChange={(value) => handleInputChange('to', value)}>
                        <SelectTrigger className="w-full h-10 text-sm rounded-lg border-2 border-gray-200 hover:border-purple-400 focus:border-purple-600 transition-colors bg-white shadow-sm">
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

                    {/* Departure Date */}
                    <div className='flex-1 min-w-0'>
                    <label className='text-md font-medium text-gray-600 mb-1 flex items-center gap-1.5'>
                      <Calendar className='w-5 h-5 text-indigo-600' />
                      DEPARTURE DATE
                    </label>
                    <DatePicker
                        date={searchData.departureDate}
                        onDateChange={(date) => handleInputChange('departureDate', date)}
                        placeholder="Pick a date"
                        className="w-full h-10 text-sm border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-600 rounded-lg transition-colors"
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                    </div>

                    {/* Seat Class */}
                    <div className='flex-1 min-w-0'>
                    <label className='text-md font-medium text-gray-600 mb-1 flex items-center gap-1.5'>
                      <Users className='w-5 h-5 text-purple-600' />
                      CLASS
                    </label>
                    <Select value={searchData.seatClass || '1'} onValueChange={(value) => handleInputChange('seatClass', value)}>
                        <SelectTrigger className="w-full h-10 text-sm rounded-lg border-2 border-gray-200 hover:border-purple-400 focus:border-purple-600 transition-colors bg-white shadow-sm">
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
                    <div className='flex-1 max-w-fit'>
                    <div className='h-4'></div>
                    <button
                        type='submit'
                        className='group relative w-full px-8 py-4 h-10 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-100 hover:from-indigo-700 hover:to-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex items-center justify-center gap-2'
                    >
                        <div className='absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300'></div>
                        <Search className='w-4 h-4 relative z-10' />
                        <span className='relative z-10 text-sm'>Search</span>
                    </button>
                    </div>
                </form>
        </div>
      </div>
    </div>
  )
}

export default CompactSearchSection