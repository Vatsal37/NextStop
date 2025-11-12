import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import BookingCard from '../components/BookingCard'
import CancellationModal from '../components/CancellationModal'
import { bookingsApi, cancellationsApi, refundsApi } from '../services/api'

function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [cancellationError, setCancellationError] = useState('')
  const navigate = useNavigate()

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await bookingsApi.getMyBookings()
      setBookings(response.data?.data || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(err?.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

    const handleViewDetails = (bookingData) => {
      const pnr = bookingData?.booking?.pnr
      if (!pnr) return
      navigate(`/confirmation?pnr=${encodeURIComponent(pnr)}`)
    }

    const handleCancel = (bookingData) => {
      setSelectedBooking(bookingData)
      setCancellationError('')
      setIsCancellationModalOpen(true)
    }

    return (
      <div className="space-y-4">
        {bookings.map((bookingData, index) => (
          <BookingCard
            key={bookingData.booking?.pnr || index}
            bookingData={bookingData}
            onViewDetails={handleViewDetails}
            onCancel={handleCancel}
          />
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

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={isCancellationModalOpen}
        onClose={() => {
          setIsCancellationModalOpen(false)
          setSelectedBooking(null)
          setCancellationError('')
        }}
        bookingData={selectedBooking}
        onConfirm={async (selectedTicketIds, refundInfo) => {
          if (!selectedBooking) return
          setCancellationError('')

          try {
            const payment = selectedBooking.payment
            if (!payment || !payment.payment_id) {
              throw new Error('Payment information not found. Cannot process refund.')
            }

            const cancellationPromises = selectedTicketIds.map(ticketId =>
              cancellationsApi.cancelTicket({ ticketId, reason: 'User requested cancellation' })
            )

            const cancellationResults = await Promise.all(cancellationPromises)

            const refundPromises = cancellationResults.map((result, index) => {
              const ticketId = selectedTicketIds[index]
              const refundAmount = refundInfo.perTicket.find(t => t.ticketId === ticketId)?.amount || 0

              return refundsApi.processRefund({
                cancellationId: result.data.data.cancellation_id,
                paymentId: payment.payment_id,
                refundAmount,
                refundMethod: 'ORIGINAL_PAYMENT_METHOD'
              })
            })

            await Promise.all(refundPromises)

            setIsCancellationModalOpen(false)
            setSelectedBooking(null)
            await fetchBookings()
          } catch (err) {
            console.error('Cancellation error:', err)
            const message = err?.response?.data?.message || err?.message || 'Failed to cancel tickets. Please try again.'
            setCancellationError(message)
            throw err
          }
        }}
      />

      {/* Error Toast */}
      {cancellationError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md z-50">
          <p className="font-medium">Cancellation Error</p>
          <p className="text-sm mt-1">{cancellationError}</p>
        </div>
      )}
    </div>
  )
}

export default MyBookings
