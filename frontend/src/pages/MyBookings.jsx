import React, { useState, useEffect } from 'react'
import BookingCard from '../components/BookingCard'
import { bookingsApi } from '../services/api'

function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await bookingsApi.getMyBookings()
        setBookings(response.data?.data || [])
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError(err?.response?.data?.message || 'Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const renderBookings = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg border border-red-200 p-6 text-center text-red-600">
          <p className="text-lg font-medium mb-2">Error loading bookings</p>
          <p className="text-sm">{error}</p>
        </div>
      )
    }

    if (bookings.length === 0) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No bookings yet</p>
          <p className="text-sm">Once you book a flight, it will appear here.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {bookings.map((bookingData, index) => (
          <BookingCard key={bookingData.booking?.pnr || index} bookingData={bookingData} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">
            MY BOOKINGS
          </h1>
          <p className="text-base md:text-md text-gray-500 max-w-2xl mx-auto">
            All your upcoming and past flights at a glance.
            Manage or cancel your bookings anytime.
          </p>
        </div>
        {renderBookings()}
      </div>
    </div>
  )
}

export default MyBookings
