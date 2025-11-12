import React, { useState } from 'react'
import { 
  AirbusA320, 
  routeIcon,
  Ahmedabad, Bengaluru, Bhubaneswar, Chandigarh, Chennai, Delhi, Goa, Guwahati,
  Hyderabad, Jaipur, Kochi, Kolkata, Lucknow, Mumbai, Nagpur, Patna, Pune,
  Srinagar, Surat, Thiruvananthapuram, Varanasi, dehradun
} from '../assets/images'

// City to image mapping
const cityImageMap = {
  'Ahmedabad': Ahmedabad,
  'Bengaluru': Bengaluru,
  'Bhubaneshwar': Bhubaneswar,
  'Bhubaneswar': Bhubaneswar,
  'Chandigarh': Chandigarh,
  'Chennai': Chennai,
  'Dehradun': dehradun,
  'Delhi': Delhi,
  'Goa': Goa,
  'Guwahati': Guwahati,
  'Hyderabad': Hyderabad,
  'Jaipur': Jaipur,
  'Kochi': Kochi,
  'Kolkata': Kolkata,
  'Lucknow': Lucknow,
  'Mumbai': Mumbai,
  'Nagpur': Nagpur,
  'Patna': Patna,
  'Pune': Pune,
  'Srinagar': Srinagar,
  'Surat': Surat,
  'Thiruvananthapuram': Thiruvananthapuram,
  'Varanasi': Varanasi,
}

// City to landmark mapping
const cityLandmarkMap = {
  'Ahmedabad': 'Sidi Saiyyed Mosque',
  'Bengaluru': 'Visvesvaraya Industrial and Technological Museum',
  'Bhubaneshwar': 'Udaygiri Caves',
  'Bhubaneswar': 'Udaygiri Caves',
  'Chandigarh': 'Rock Garden',
  'Chennai': 'Kapaleeswarar Temple',
  'Dehradun': 'Sahastradhara Heights',
  'Delhi': 'Red Fort',
  'Goa': 'Cola Beach',
  'Guwahati': 'Kamakhya Devi Temple',
  'Hyderabad': 'Charminar',
  'Jaipur': 'Hawa Mahal',
  'Kochi': 'Bolgatty Palace',
  'Kolkata': 'Victoria Memorial Hall',
  'Lucknow': 'Chota Imambara',
  'Mumbai': 'Marine Drive',
  'Nagpur': 'Deekshabhoomi Stupa',
  'Patna': 'Buddha Smriti Park',
  'Pune': 'Shaniwar Wada',
  'Srinagar': 'Dal Lake',
  'Surat': 'Diamond Bourse',
  'Thiruvananthapuram': 'Padmanabhaswamy Temple',
  'Varanasi': 'Kashi Vishwanath Temple',
}

function BookingCard({ bookingData, onViewDetails, onCancel }) {
  const [isHovered, setIsHovered] = useState(false)
  
  if (!bookingData) return null

  const { booking, flightDetails, tickets } = bookingData
  if (!booking || !flightDetails) return null

  // Get destination city and image (case-insensitive matching)
  const destinationCity = flightDetails.destination_city || ''
  const cityKey = Object.keys(cityImageMap).find(
    key => key.toLowerCase() === destinationCity.toLowerCase()
  ) || 'Delhi'
  const destinationImage = cityImageMap[cityKey] || Delhi
  const landmark = cityLandmarkMap[cityKey] || ''

  // Helper function to format date and time together
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr && !timeStr) return '';
    
    let datePart = '';
    let timePart = '';
    
    if (dateStr) {
      if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
        const date = new Date(dateStr);
        datePart = date.toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short' 
        });
      } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
        const date = new Date(dateStr);
        datePart = date.toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short' 
        });
      }
    }
    
    if (timeStr) {
      if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
        timePart = timeStr.slice(0, 5);
      } else if (typeof timeStr === 'string' && timeStr.includes('T')) {
        const date = new Date(timeStr);
        timePart = date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
    }
    
    if (datePart && timePart) {
      return `${datePart}, ${timePart}`;
    } else if (datePart) {
      return datePart;
    } else if (timePart) {
      return timePart;
    }
    
    return '';
  };

  // Helper function to calculate duration
  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return '';
    
    if (typeof departureTime === 'string' && departureTime.match(/^\d{2}:\d{2}:\d{2}$/) &&
        typeof arrivalTime === 'string' && arrivalTime.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const depMins = parseTime(departureTime);
      const arrMins = parseTime(arrivalTime);
      const diffMins = arrMins - depMins;
      const totalMins = diffMins >= 0 ? diffMins : diffMins + (24 * 60);
      
      const hours = Math.floor(totalMins / 60);
      const minutes = totalMins % 60;
      return `${hours}h ${minutes}m`;
    }
    
    return '';
  };

  // Get first ticket for seat and class info
  const firstTicket = tickets && tickets.length > 0 ? tickets[0] : null
  const seatNumber = firstTicket?.seat_number || 'N/A'
  const classId = firstTicket?.class_id || null

  // Map class_id to class name
  const getClassName = (classId) => {
    const classMap = {
      1: 'Economy',
      2: 'Premium Economy',
      3: 'Business',
      4: 'First Class'
    }
    return classMap[classId] || 'Economy'
  }

  // Determine booking status
  const getStatusBadge = (status) => {
    const statusMap = {
      'CONFIRMED': { text: 'Confirmed', bg: 'bg-green-50', textColor: 'text-green-700', border: 'border-green-100' },
      'PENDING': { text: 'Pending', bg: 'bg-yellow-50', textColor: 'text-yellow-700', border: 'border-yellow-100' },
      'CANCELLED': { text: 'Cancelled', bg: 'bg-red-50', textColor: 'text-red-700', border: 'border-red-100' },
      'COMPLETED': { text: 'Completed', bg: 'bg-gray-50', textColor: 'text-gray-700', border: 'border-gray-100' },
    }
    const statusInfo = statusMap[status] || statusMap['PENDING']
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.textColor} border ${statusInfo.border}`}>
        {statusInfo.text}
      </span>
    )
  }

  // Check if flight is upcoming
  const isUpcoming = () => {
    if (!flightDetails.flight_date) return false
    const flightDate = new Date(flightDetails.flight_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return flightDate >= today
  }

  return (
    <div className='flex flex-col md:flex-row gap-6 max-w-5xl mx-auto p-4 bg-gray-50 rounded-3xl drop-shadow-lg'>
      {/* Left: Destination Image with hover tooltip */}
      <div 
        className='w-2/5 relative'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img 
          src={destinationImage} 
          alt={destinationCity} 
          className='w-full h-full aspect-video object-cover rounded-2xl' 
        />
        {isHovered && landmark && (
          <div className='absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center p-4'>
            <p className='text-white text-center font-semibold text-lg'>{landmark}</p>
          </div>
        )}
      </div>

      {/* Right: Booking Details */}
      <div className='w-full md:w-3/5 flex flex-col gap-6'>
        {/* Top: Airline, Class, PNR, Status */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-300 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200">
              <img src={AirbusA320} alt="aircraft" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {flightDetails.airline_name || 'Airline'}
              </h3>
              <p className="text-sm text-gray-500">
                {getClassName(classId)} • PNR:{' '}
                <span className="font-medium text-gray-700">{booking.pnr}</span>
              </p>
            </div>
          </div>
          {getStatusBadge(booking.booking_status)}
        </div>

        {/* Center: Flight Route */}
        <div className=''>
          <div className='flex items-center justify-between gap-8'>
            <div className='flex flex-col'>
              <p className='text-sm text-gray-500 mb-1'>{flightDetails.source_city || 'Source'}</p>
              <h2 className='text-3xl font-semibold leading-none tracking-tight mb-1'>
                {flightDetails.source_code || 'N/A'}
              </h2>
              <p className='text-sm text-gray-500'>
                {formatDateTime(flightDetails.flight_date, flightDetails.departure_time)}
              </p>
            </div>
            <div className='relative'>
              <img src={routeIcon} alt='route icon' className='w-fit h-10' />
              <p className='text-sm text-gray-500 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2'>
                {calculateDuration(flightDetails.departure_time, flightDetails.arrival_time)}
              </p>
            </div>
            <div className='flex flex-col text-right'>
              <p className='text-sm text-gray-500 mb-1'>{flightDetails.destination_city || 'Destination'}</p>
              <h2 className='text-3xl font-semibold leading-none tracking-tight mb-1'>
                {flightDetails.destination_code || 'N/A'}
              </h2>
              <p className='text-sm text-gray-500'>
                {formatDateTime(flightDetails.flight_date, flightDetails.arrival_time)}
              </p>
            </div>
          </div>
        </div>

        {/* Info Row: Flight No, Seat No, Class */}
        <div className='flex items-center justify-between gap-4'>
          <div className='flex gap-3 items-center bg-white rounded-lg border border-gray-200 p-2'>
            <p className='text-sm text-gray-500'>Flight No.</p>
            <p className='text-sm font-semibold text-gray-900'>
              {flightDetails.flight_number || 'N/A'}
            </p>
          </div>
          <div className='flex gap-3 items-center bg-white rounded-lg border border-gray-200 p-2'>
            <p className='text-sm text-gray-500'>Seat No.</p>
            <p className='text-sm font-semibold text-gray-900'>{seatNumber}</p>
          </div>
          <div className='flex gap-3 items-center bg-white rounded-lg border border-gray-200 p-2'>
            <p className='text-sm text-gray-500'>Class</p>
            <p className='text-sm font-semibold text-gray-900'>{getClassName(classId)}</p>
          </div>
        </div>

        {/* Bottom: Action Buttons */}
        <div className='flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={() => onViewDetails && onViewDetails(bookingData)}
            className='px-4 py-2 border border-gray-400 text-sm font-medium text-primary rounded-md hover:bg-gray-200 hover:cursor-pointer'
          >
            View Details
          </button>
          {booking.booking_status !== 'CANCELLED' && isUpcoming() && (
            <button
              type='button'
              onClick={() => onCancel && onCancel(bookingData)}
              className='px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 hover:cursor-pointer'
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingCard
