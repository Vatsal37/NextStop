import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import CompactSearchSection from '../components/CompactSearchSection'
import FlightCard from '../components/FlightCard'
import FlightDetailsModal from '../components/FlightDetailsModal'
import { searchFlightsThunk, clearSearchResults } from '../store/index.js'

function Search() {
  const dispatch = useDispatch()
  const { searchResults, loading, error, lastSearch } = useSelector(state => state.flights)
  const searchData = useSelector(state => state.search)
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Auto-search when search data changes
  useEffect(() => {
    if (searchData.from && searchData.to && searchData.departureDate) {
      // Format date to YYYY-MM-DD using local timezone
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

      const searchParams = {
        source: searchData.from,
        destination: searchData.to,
        date: formattedDate,
        classId: searchData.seatClass || '1'
      }
      
      // Only search if parameters have changed
      if (!lastSearch || 
          lastSearch.source !== searchParams.source || 
          lastSearch.destination !== searchParams.destination || 
          lastSearch.date !== searchParams.date ||
          lastSearch.classId !== searchParams.classId) {
        dispatch(searchFlightsThunk(searchParams))
      }
    } else {
      // Clear results if search criteria is incomplete
      dispatch(clearSearchResults())
    }
  }, [searchData.from, searchData.to, searchData.departureDate, searchData.seatClass, dispatch, lastSearch])

  const handleViewDetails = (flight) => {
    setSelectedFlight(flight)
    setIsModalOpen(true)
  }

  const handleBookNow = (flight) => {
    console.log('Book now for flight:', flight)
    // TODO: Navigate to booking page
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedFlight(null)
  }

  const renderFlightResults = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for flights...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg border border-red-200 p-6 text-center text-red-600">
          <p className="text-lg font-medium mb-2">Search Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )
    }

    if (searchResults.length === 0) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No flights found</p>
          <p className="text-sm">Try adjusting your search criteria or check back later for new flights.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {searchResults.map((flight, index) => (
          <FlightCard
            key={flight.schedule_id || index}
            flight={flight}
            onViewDetails={handleViewDetails}
            onBookNow={handleBookNow}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CompactSearchSection />
      
      {/* Search Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Available Flights</h1>
          <p className="text-gray-600">
            {searchData.from && searchData.to && searchData.departureDate 
              ? `Showing flights from ${searchData.from} to ${searchData.to}` 
              : 'Search for flights to see results'
            }
          </p>
        </div>

        {renderFlightResults()}
      </div>

      {/* Flight Details Modal */}
      <FlightDetailsModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        flight={selectedFlight}
      />
    </div>
  )
}

export default Search