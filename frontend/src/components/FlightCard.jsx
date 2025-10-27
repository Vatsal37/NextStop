import React from 'react'
import { AirbusA320, Boeing737 } from '../assets/images'
import { routeIcon } from '../assets/images'

function FlightCard({ flight, onViewDetails, onBookNow }) {
  if (!flight) return null;

  // Helper function to format date and time together (e.g., "08 Nov, 12:30")
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr && !timeStr) return '';
    
    let datePart = '';
    let timePart = '';
    
    // Handle date
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
    
    // Handle time
    if (timeStr) {
      if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
        // HH:mm:ss format
        timePart = timeStr.slice(0, 5); // Get HH:mm
      } else if (typeof timeStr === 'string' && timeStr.includes('T')) {
        // ISO string format
        const date = new Date(timeStr);
        timePart = date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
    }
    
    // Combine date and time
    if (datePart && timePart) {
      return `${datePart}, ${timePart}`;
    } else if (datePart) {
      return datePart;
    } else if (timePart) {
      return timePart;
    }
    
    return '';
  };
  
  // Helper function to format just the time (for backward compatibility)
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeString.slice(0, 5); // Return HH:mm
    }
    
    return timeString;
  };

  // Helper function to calculate duration
  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return '';
    
    // If times are in HH:mm:ss format, calculate the difference
    if (typeof departureTime === 'string' && departureTime.match(/^\d{2}:\d{2}:\d{2}$/) &&
        typeof arrivalTime === 'string' && arrivalTime.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes; // Total minutes
      };
      
      const depMins = parseTime(departureTime);
      const arrMins = parseTime(arrivalTime);
      const diffMins = arrMins - depMins;
      
      // Handle overnight flights (arrival < departure time)
      const totalMins = diffMins >= 0 ? diffMins : diffMins + (24 * 60);
      
      const hours = Math.floor(totalMins / 60);
      const minutes = totalMins % 60;
      return `${hours}h ${minutes}m`;
    }
    
    // Otherwise, treat as ISO string
    const dep = new Date(departureTime);
    const arr = new Date(arrivalTime);
    const diffMs = arr - dep;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Get aircraft image based on aircraft type
  const getAircraftImage = (aircraftType) => {
    if (aircraftType?.toLowerCase().includes('airbus')) {
      return AirbusA320;
    } else if (aircraftType?.toLowerCase().includes('boeing')) {
      return Boeing737;
    }
    return AirbusA320; // default
  };

  // Get aircraft name
  const getAircraftName = (aircraftType) => {
    if (aircraftType?.toLowerCase().includes('airbus')) {
      return 'AIRBUS A320';
    } else if (aircraftType?.toLowerCase().includes('boeing')) {
      return 'BOEING 737-800';
    }
    return 'AIRBUS A320'; // default
  };

  return (
    <div className='rounded-3xl bg-gray-50 drop-shadow-lg mt-7 flex flex-col md:flex-row max-w-6xl mx-auto'>
        <div className='md:w-4/5 border-b md:border-r-2 md:border-dashed border-gray-300 px-6 pt-8 pb-10 space-y-4'>
            <div>
                <h1 className='text-2xl font-medium leading-none tracking-tight'>
                  {getAircraftName(flight.aircraft_type)}
                </h1>
                <p className='text-sm text-gray-500'>{flight.airline_name}</p>
            </div>    
            <div className='flex items-center gap-8'>
                <img 
                  src={getAircraftImage(flight.aircraft_type)} 
                  alt={getAircraftName(flight.aircraft_type)} 
                  className='ml-6 w-xs h-full object-cover' 
                />
                <div className='flex justify-between items-center w-full'>
                    <div className='flex flex-col'>
                        <p className='text-md text-gray-500 mb-2'>{flight.source_city || 'Source'}</p>
                        <h1 className='text-3xl font-semibold leading-none tracking-tight mb-2'>
                          {flight.source_code}
                        </h1>
                        <p className='text-md text-gray-500'>
                          {formatDateTime(flight.flight_date, flight.departure_time)}
                        </p>
                    </div>
                    <div className='relative'>
                        <img src={routeIcon} alt='routeIcon' className='w-fit h-10' />
                        <p className='text-md text-gray-500 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2'>
                          {calculateDuration(flight.departure_time, flight.arrival_time)}
                        </p>
                    </div>
                    <div className='flex flex-col text-right'>
                        <p className='text-md text-gray-500 mb-2'>{flight.destination_city || 'Destination'}</p>
                        <h1 className='text-3xl font-semibold leading-none tracking-tight mb-2'>
                          {flight.destination_code}
                        </h1>
                        <p className='text-md text-gray-500'>
                          {formatDateTime(flight.flight_date, flight.arrival_time)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div className='md:w-1/5 p-8 flex md:flex-col justify-between'>
            <div>
                <h1 className='text-2xl font-semibold text-right leading-none tracking-tight'>
                  {flight.total_price ? `Rs ${parseFloat(flight.total_price).toLocaleString('en-IN')}` : 
                   flight.base_price ? `Rs ${parseFloat(flight.base_price).toLocaleString('en-IN')}` : 'NaN'}
                </h1>
                <p className='text-sm text-gray-500 text-right'>
                  {flight.class_name ? flight.class_name : 'Per seat'}
                </p>
                {flight.class_code && (
                  <p className='text-xs text-gray-400 text-right mt-1'>{flight.class_code}</p>
                )}
            </div>
            <div>
                <button 
                  onClick={() => onViewDetails && onViewDetails(flight)}
                  className='w-full border border-gray-400 text-md font-medium hover:bg-gray-200 text-primary px-4 py-2 rounded-md mb-2'
                >
                  View Details
                </button>
                <button 
                  onClick={() => onBookNow && onBookNow(flight)}
                  className='w-full bg-primary text-white text-md font-medium px-4 py-2 rounded-md'
                >
                  Book Now
                </button>
            </div>
        </div>
    </div>
  )
}

export default FlightCard