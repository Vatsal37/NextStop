import React, { useEffect, useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

function CancellationModal({ isOpen, onClose, bookingData, onConfirm }) {
  const [selectedTickets, setSelectedTickets] = useState([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setSelectedTickets([])
      setShowConfirmation(false)
      setIsProcessing(false)
      setError('')
    }
  }, [isOpen, bookingData])

  if (!isOpen || !bookingData) return null

  const { tickets, payment, booking } = bookingData
  const availableTickets = tickets?.filter(t => t.ticket_status !== 'CANCELLED') || []

  // Calculate refund amounts
  const calculateRefund = () => {
    if (selectedTickets.length === 0) return { total: 0, perTicket: [] }
    
    const perTicket = selectedTickets.map(ticketId => {
      const ticket = availableTickets.find(t => t.ticket_id === ticketId)
      if (!ticket) return { ticketId, amount: 0 }
      
      const ticketTotal = parseFloat(ticket.total_amount || ticket.fare_amount || 0)
      const refundAmount = ticketTotal * 0.9 // 90% refund
      return { ticketId, amount: refundAmount }
    })
    
    const total = perTicket.reduce((sum, item) => sum + item.amount, 0)
    return { total, perTicket }
  }

  const handleTicketToggle = (ticketId) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    )
  }

  const handleProceed = () => {
    if (selectedTickets.length === 0) return
    setError('')
    setShowConfirmation(true)
  }

  const handleConfirm = async () => {
    if (selectedTickets.length === 0) return
    
    setIsProcessing(true)
    setError('')
    try {
      await onConfirm(selectedTickets, calculateRefund())
      // Reset and close on success
      setSelectedTickets([])
      setShowConfirmation(false)
      onClose()
    } catch (error) {
      console.error('Cancellation error:', error)
      setError(
        error?.response?.data?.message || 
        error?.message || 
        'Failed to cancel tickets. Please try again.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const refundInfo = calculateRefund()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Cancel Booking</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showConfirmation ? (
            <>
              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Cancellation Policy
                  </p>
                  <p className="text-sm text-yellow-700">
                    You will receive 90% of the ticket amount as refund. The remaining 10% is a cancellation fee.
                  </p>
                </div>
              </div>

              {/* Passenger List */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Passengers to Cancel
                </h3>
                <div className="space-y-3">
                  {availableTickets.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No tickets available for cancellation
                    </p>
                  ) : (
                    availableTickets.map((ticket) => {
                      const ticketTotal = parseFloat(ticket.total_amount || ticket.fare_amount || 0)
                      const refundAmount = ticketTotal * 0.9
                      const isSelected = selectedTickets.includes(ticket.ticket_id)
                      
                      return (
                        <div
                          key={ticket.ticket_id}
                          onClick={() => handleTicketToggle(ticket.ticket_id)}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleTicketToggle(ticket.ticket_id)}
                                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {ticket.first_name} {ticket.last_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Seat {ticket.seat_number} • Ticket #{ticket.ticket_number}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Ticket Amount</p>
                              <p className="font-semibold text-gray-900">
                                Rs {ticketTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              {isSelected && (
                                <p className="text-sm text-indigo-600 mt-1">
                                  Refund: Rs {refundAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Refund Summary */}
              {selectedTickets.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Total Refund Amount</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      Rs {refundInfo.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Confirmation Screen */
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Confirm Cancellation
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''}?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2">
                  {refundInfo.perTicket.map(({ ticketId, amount }) => {
                    const ticket = availableTickets.find(t => t.ticket_id === ticketId)
                    return (
                      <div key={ticketId} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {ticket?.first_name} {ticket?.last_name}
                        </span>
                        <span className="font-medium text-gray-900">
                          Rs {amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )
                  })}
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-semibold">
                    <span className="text-gray-900">Total Refund</span>
                    <span className="text-indigo-600">
                      Rs {refundInfo.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                The refund will be processed to your original payment method within 5-7 business days.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <p className="text-sm font-medium">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-end gap-3">
          {!showConfirmation ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                disabled={selectedTickets.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Proceed
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowConfirmation(false)
                  setError('')
                }}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  'Yes, Cancel Tickets'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CancellationModal

