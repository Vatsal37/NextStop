import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { X } from 'lucide-react'
import { AirbusA320, Boeing737, stripedBar, bookedSeatIcon, availableSeatIcon } from '../assets/images'
import { flightsApi, bookingsApi } from '../services/api'
import PassengerInfo from '../components/PassengerInfo'

function SeatSelection() {
  const { flightId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useSelector((state) => state?.auth?.user)
  const token = useSelector((state) => state?.auth?.token)
  const searchResults = useSelector((state) => state?.flights?.searchResults || [])
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const passengerRefs = useRef({})

  const scheduleId = flightId // flightId from route params is the scheduleId
  const date = searchParams.get('date')
  
  // Get flight data from search results to determine aircraft type
  const flight = React.useMemo(() => {
    return searchResults.find(f => f.schedule_id === parseInt(scheduleId))
  }, [searchResults, scheduleId])
  
  // Get aircraft image based on aircraft type (same logic as FlightCard)
  const getAircraftImage = (aircraftType) => {
    if (aircraftType?.toLowerCase().includes('airbus')) {
      return AirbusA320;
    } else if (aircraftType?.toLowerCase().includes('boeing')) {
      return Boeing737;
    }
    return AirbusA320; // default
  };
  
  const aircraftImage = getAircraftImage(flight?.aircraft_type)
  
  // Pre-fill contact information from user data
  useEffect(() => {
    if (user) {
      if (user.email) {
        setContactEmail(prev => prev || user.email)
      }
      if (user.phone) {
        setContactPhone(prev => prev || user.phone)
      }
    }
  }, [user])
  
  // Calculate total price from selected seats
  const totalPrice = React.useMemo(() => {
    return selectedSeats.reduce((sum, seat) => {
      const seatPrice = parseFloat(seat.total_price || seat.base_price || 0)
      return sum + seatPrice
    }, 0)
  }, [selectedSeats])
  
  // Calculate average price per passenger for booking API
  const averagePricePerPassenger = selectedSeats.length > 0 
    ? totalPrice / selectedSeats.length 
    : 0

  useEffect(() => {
    const fetchSeats = async () => {
      if (!scheduleId || !date) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await flightsApi.getSeats(scheduleId, { date })
        setSeats(response.data.data?.seats || [])
      } catch (error) {
        console.error('Error fetching seats:', error)
        setSeats([])
      } finally {
        setLoading(false)
      }
    }

    fetchSeats()
  }, [scheduleId, date])

  // Organize seats into a matrix by row and column
  const seatMatrix = React.useMemo(() => {
    const matrix = {}
    const allSeats = seats

    // Parse seat_number to extract row and column (e.g., "1A" -> row: 1, col: "A")
    const parseSeatNumber = (seatNumber) => {
      const match = seatNumber.match(/^(\d+)([A-F])$/)
      if (match) {
        return { row: parseInt(match[1]), col: match[2] }
      }
      return null
    }

    // Create a map of all possible seats (1-30 rows, A-F columns)
    for (let row = 1; row <= 30; row++) {
      matrix[row] = {}
      const columns = ['A', 'B', 'C', 'D', 'E', 'F']
      columns.forEach(col => {
        const seat = allSeats.find(s => {
          const parsed = parseSeatNumber(s.seat_number)
          return parsed && parsed.row === row && parsed.col === col
        })
        matrix[row][col] = seat || { seat_number: `${row}${col}`, is_booked: true }
      })
    }

    return matrix
  }, [seats])

  const handleSeatClick = (seat) => {
    if (!seat.seat_id || seat.is_booked) return // Can't select booked seats

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.seat_id === seat.seat_id)
      if (isSelected) {
        return prev.filter(s => s.seat_id !== seat.seat_id)
      } else {
        return [...prev, seat]
      }
    })
  }

  const isSeatSelected = (seat) => {
    return selectedSeats.some(s => s.seat_id === seat.seat_id)
  }

  const handleBooking = async () => {
    // Check authentication first
    if (!token) {
      setError('Please login to continue with booking')
      // Redirect to login with return URL
      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      }, 2000)
      return
    }

    // Validate selected seats
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat')
      return
    }

    // Validate contact information
    if (!contactEmail || !contactPhone) {
      setError('Please provide contact email and phone number')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactEmail)) {
      setError('Please enter a valid email address')
      return
    }

    // Validate all passenger forms
    const invalidPassengers = []
    selectedSeats.forEach((seat, index) => {
      const ref = passengerRefs.current[seat.seat_id]
      if (!ref || !ref.isValid()) {
        invalidPassengers.push(index + 1)
      }
    })

    if (invalidPassengers.length > 0) {
      setError(`Please fill all fields for passenger(s): ${invalidPassengers.join(', ')}`)
      return
    }

    // Collect passenger data
    const passengers = selectedSeats.map((seat) => {
      const ref = passengerRefs.current[seat.seat_id]
      return ref.getFormData()
    })

    // Get seat IDs
    const seatIds = selectedSeats.map(seat => seat.seat_id)

    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        scheduleId: parseInt(scheduleId),
        flightDate: date,
        fareAmountPerPassenger: averagePricePerPassenger,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
        passengers: passengers,
        seatIds: seatIds,
        currency: 'INR'
      }

      const response = await bookingsApi.create(payload)
      const pnr = response.data?.data?.pnr
      const bookingId = response.data?.data?.bookingId

      if (pnr && bookingId) {
        // Navigate to payment page with booking details
        navigate(`/payment?bookingId=${bookingId}&amount=${totalPrice}&pnr=${pnr}`)
      } else {
        setError('Booking created but required data not received')
      }
    } catch (err) {
      console.error('Booking error:', err)
      const errorMessage = err?.response?.data?.message || 'Failed to create booking. Please try again.'
      
      // Handle authentication errors specifically
      if (errorMessage.includes('token') || errorMessage.includes('Authentication') || err?.response?.status === 401) {
        setError('Your session has expired. Please login again to continue.')
        // Redirect to login after showing error
        setTimeout(() => {
          navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
        }, 2000)
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Map class_id to class name
  const getClassName = (classId) => {
    const classMap = {
      1: 'Economy',
      2: 'Premium Economy',
      3: 'Business',
      4: 'First Class'
    }
    return classMap[classId] || 'Unknown'
  }

  // Generate tooltip text for seat
  const getSeatTooltip = (seat) => {
    if (!seat || !seat.seat_id) {
      return 'Seat not available'
    }
    
    const seatNumber = seat.seat_number || 'N/A'
    const className = getClassName(seat.class_id)
    const seatPrice = parseFloat(seat.total_price || seat.base_price || 0)
    
    return `${seatNumber} | ${className} | Rs ${seatPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const columns = ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <div className="w-screen h-screen overflow-x-hidden bg-white relative">
      {/* Close Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full z-20 transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-gray-700" />
      </button>

      {/* Title Section */}
      <div className="px-9 pt-9">
        <h1 className="text-4xl font-medium text-gray-900 leading-none tracking-tight">
          CHOOSE SEATS
        </h1>
      </div>

      {/* Responsive Image Container */}
      <div className="relative w-full aspect-[2/1] md:aspect-[6/1]">
        <img
          src={aircraftImage}
          alt={flight?.aircraft_type || 'Aircraft'}
          className={`absolute w-auto h-fit ${aircraftImage === AirbusA320 ? 'top-1/2 left-1/2 transform -translate-x-1/9 -translate-y-3/4' :  '-top-9/10 left-1/2 -translate-x-1/8 -translate-y-1/14 scale-125'}`}
        />
      </div>

      <div className='flex items-center px-8'>
        <div className=' h-fit mx-auto w-full px-4 pt-2 pb-2.5 bg-white rounded-xl border border-gray-200'>
          <div className='flex w-full items-center justify-between mb-2'>
            <h4 className='text-lg font-medium text-gray-900 opacity-0'>Section 1</h4>
            <h4 className={`text-lg font-medium text-gray-900 ${selectedSeats.length > 0 ? 'opacity-100' : 'opacity-0'}`}>Seats selected: {selectedSeats.length}</h4>
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
          <div className='grid grid-cols-[auto_1fr_auto] gap-4'>
            <img src={stripedBar} alt="striped bar" className='w-fit h-74 object-contain' />
            <div className='w-full h-74 bg-gray-100 rounded-2xl overflow-x-auto overflow-y-hidden p-4'>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading seats...</p>
                </div>
              ) : (
                <div className="flex flex-col h-full min-h-0 min-w-fit">
                  {/* Seat rows (6 rows: A-F) */}
                  <div className="flex flex-col gap-0.5 flex-1 min-h-0">
                    {columns.map((col, colIndex) => (
                      <div key={col} className={`flex gap-2.5 items-center flex-1 min-h-0 ${colIndex === 3 ? 'mt-8' : ''}`}>
                        {/* Seats for this row (columns 1-30) */}
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(rowNum => {
                          const seat = seatMatrix[rowNum]?.[col]
                          const isAvailable = seat?.seat_id && !seat.is_booked
                          const isSelected = isSeatSelected(seat)
                          const isBooked = !seat?.seat_id || seat.is_booked
                          const seatNumber = seat?.seat_number || `${rowNum}${col}`
                          const isExitSeat = (col === 'A' || col === 'F') && rowNum === 12
                          const needsSpacing = rowNum === 12 && (col === 'B' || col === 'C' || col === 'D' || col === 'E')

                          return (
                            <React.Fragment key={`${rowNum}${col}`}>
                              {/* EXIT text before seat 12A and 12F */}
                              {isExitSeat && (
                                <div className="text-[9px] font-bold text-red-600 px-1 flex-shrink-0">
                                  EXIT
                                </div>
                              )}
                              {/* Spacing before seats 12B, 12C, 12D, 12E (equivalent to EXIT width) */}
                              {needsSpacing && (
                                <div className="text-[9px] font-bold text-red-600 px-1 flex-shrink-0 opacity-0">
                                  EXIT
                                </div>
                              )}
                              <button
                                onClick={() => handleSeatClick(seat)}
                                disabled={isBooked}
                                className={`relative w-8 h-8 flex-shrink-0 transition-all ${isBooked ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                                title={getSeatTooltip(seat)}
                              >
                                <img 
                                  src={isBooked ? bookedSeatIcon : isSelected ? bookedSeatIcon : availableSeatIcon} 
                                  alt={seatNumber}
                                  className={`w-full h-full rotate-90 object-contain ${isBooked ? 'opacity-80' : ''}`}
                                />
                                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium z-10 ${isBooked ? 'text-gray-900' : isSelected ? 'text-white' : 'text-indigo-700'}`}>
                                  {seatNumber}
                                </span>
                              </button>
                              {/* EXIT text after seat 12A and 12F */}
                              {isExitSeat && (
                                <div className="text-[9px] font-bold text-red-600 px-1 flex-shrink-0">
                                  EXIT
                                </div>
                              )}
                              {/* Spacing after seats 12B, 12C, 12D, 12E (equivalent to EXIT width) */}
                              {needsSpacing && (
                                <div className="text-[9px] font-bold text-red-600 px-1 flex-shrink-0 opacity-0">
                                  EXIT
                                </div>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <img src={stripedBar} alt="striped bar" className='w-fit h-74 object-contain' />
          </div>
        </div>
      </div>
      {selectedSeats.length > 0 && (
        <div className="px-9 py-9">
          <h1 className="text-4xl font-medium text-gray-900 leading-none tracking-tight">
            PASSENGER DETAILS
          </h1>
          
          {/* Contact Information */}
          <div className="mt-6 mb-6">
            <div className='flex items-center px-8'>
              <div className='h-fit mx-auto w-full px-4 pt-2 pb-2.5 bg-white rounded-xl border border-gray-200'>
                <h2 className='text-xl font-medium text-gray-900 leading-none tracking-tight mt-2 mb-4'>
                  Contact Information
                </h2>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="mt-6 mb-4">
            <div className='flex items-center px-8'>
              <div className='h-fit mx-auto w-full px-4 pt-2 pb-2.5 bg-white rounded-xl border border-gray-200'>
                <h2 className='text-xl font-medium text-gray-900 leading-none tracking-tight mt-2 mb-4'>
                  Price Summary
                </h2>
                <div className="space-y-2">
                  {selectedSeats.map((seat, index) => {
                    const seatPrice = parseFloat(seat.total_price || seat.base_price || 0)
                    return (
                      <div key={seat.seat_id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Passenger {index + 1} - Seat {seat.seat_number}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            Rs {seatPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-indigo-600">
                      Rs {totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Forms */}
          <div className="mt-4 space-y-4">
            {selectedSeats.map((seat, index) => (
              <PassengerInfo 
                key={seat.seat_id} 
                ref={(ref) => {
                  if (ref) {
                    passengerRefs.current[seat.seat_id] = ref
                  }
                }}
                passengerNumber={index + 1}
                seatNumber={seat.seat_number}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 px-8">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          {/* Book Now Button */}
          <div className="mt-6 px-8">
            <button
              onClick={handleBooking}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-100 hover:from-indigo-700 hover:to-indigo-200 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : `Book Now - Rs ${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SeatSelection
