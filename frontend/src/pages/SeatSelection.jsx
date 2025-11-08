import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { AirbusA320, Boeing737, stripedBar, bookedSeatIcon, availableSeatIcon } from '../assets/images'
import { flightsApi } from '../services/api'
import PassengerDetailsSection from '../components/PassengerDetailsSection'
function SeatSelection() {
  const [searchParams] = useSearchParams()
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState([])

  const scheduleId = searchParams.get('scheduleId')
  const date = searchParams.get('date')

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

  const columns = ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <div className="w-screen h-screen overflow-x-hidden bg-white">
      {/* Title Section */}
      <div className="px-9 pt-9">
        <h1 className="text-4xl font-medium text-gray-900 leading-none tracking-tight">
          CHOOSE SEATS
        </h1>
      </div>

      {/* Responsive Image Container */}
      <div className="relative w-full aspect-[2/1] md:aspect-[6/1]">
        <img
          src={AirbusA320}
          alt="Airbus A320"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/9 -translate-y-3/4 w-auto h-fit"
        />
      </div>

      <div className='flex items-center px-8'>
        <div className=' h-fit mx-auto w-full px-4 pt-2 pb-2.5 bg-white rounded-xl border border-gray-200'>
          <div className='flex w-full items-center justify-between mb-2'>
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
                                title={seatNumber}
                              >
                                <img 
                                  src={isBooked ? bookedSeatIcon : availableSeatIcon} 
                                  alt={seatNumber}
                                  className={`w-full h-full rotate-90 object-contain ${isBooked ? 'opacity-80' : isSelected ? 'ring-2 ring-indigo-400' : ''}`}
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
      <PassengerDetailsSection />
    </div>
  )
}

export default SeatSelection
