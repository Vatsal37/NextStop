import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { loginCover, routeIcon } from '../assets/images';

const OPEN_DURATION_MS = 700;
const CLOSE_DURATION_MS = 800;

const FlightDetailsModal = ({ isOpen, onClose, flight }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef(null);
  const openTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsVisible(false);
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = setTimeout(() => setIsVisible(true), 0);
    } else if (isMounted) {
      setIsVisible(false);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = setTimeout(() => setIsMounted(false), CLOSE_DURATION_MS);
    }
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    };
  }, [isOpen, isMounted]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    };
  }, []);

  const handleCloseWithAnimation = () => {
    setIsVisible(false);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsMounted(false);
      onClose?.();
    }, CLOSE_DURATION_MS);
  };

  useEffect(() => {
    if (isMounted) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isMounted]);

  if (!isMounted || !flight) return null;

  const calculateDuration = (dep, arr) => {
    if (!dep || !arr) return 'N/A';
    if (typeof dep === 'string' && dep.match(/^\d{2}:\d{2}:\d{2}$/) &&
        typeof arr === 'string' && arr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const parseTime = (t) => { const [h,m] = t.split(':').map(Number); return h * 60 + m; };
      const diff = parseTime(arr) - parseTime(dep);
      const total = diff >= 0 ? diff : diff + 1440;
      return `${Math.floor(total/60)}h ${total%60}m`;
    }
    return 'N/A';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

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

  const formatFrequency = (frequency) => {
    if (!frequency) return 'N/A';
    
    // If it's DAILY, return as is
    if (frequency === 'DAILY') return 'Daily';
    
    // If it's in the format WEEKLY_XXX, extract the day name
    if (frequency.startsWith('WEEKLY_')) {
      const dayAbbr = frequency.replace('WEEKLY_', '');
      const dayMap = {
        'MON': 'Monday',
        'TUE': 'Tuesday',
        'WED': 'Wednesday',
        'THU': 'Thursday',
        'FRI': 'Friday',
        'SAT': 'Saturday',
        'SUN': 'Sunday'
      };
      const dayName = dayMap[dayAbbr.toUpperCase()] || dayAbbr;
      return `Every ${dayName}`;
    }
    
    // If it contains multiple days or other format
    if (frequency.includes('MON')) {
      return 'Every Monday';
    } else if (frequency.includes('TUE')) {
      return 'Every Tuesday';
    } else if (frequency.includes('WED')) {
      return 'Every Wednesday';
    } else if (frequency.includes('THU')) {
      return 'Every Thursday';
    } else if (frequency.includes('FRI')) {
      return 'Every Friday';
    } else if (frequency.includes('SAT')) {
      return 'Every Saturday';
    } else if (frequency.includes('SUN')) {
      return 'Every Sunday';
    }
    
    // Return the original if no pattern matches
    return frequency;
  };

  return createPortal(
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
         style={{ transitionDuration: `${isVisible ? OPEN_DURATION_MS : CLOSE_DURATION_MS}ms` }}>
      <div className="absolute inset-0" onClick={handleCloseWithAnimation} style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', transitionProperty: 'opacity', transitionTimingFunction: 'ease-in-out', transitionDuration: `${isVisible ? OPEN_DURATION_MS : CLOSE_DURATION_MS}ms`, willChange: 'opacity', opacity: isVisible ? 1 : 0 }} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
           style={{ transitionDuration: `${isVisible ? OPEN_DURATION_MS : CLOSE_DURATION_MS}ms` }}>
        <button onClick={handleCloseWithAnimation} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full z-20 transition-colors"><X className="w-5 h-5 text-white" /></button>
        <div className="p-0">
          <div className="relative h-48 w-full rounded-t-2xl overflow-hidden">
            <img src={loginCover} alt="Flight in clouds" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-8 right-8">
              <h2 className="text-2xl font-bold text-white mb-1">Flight Details</h2>
              <p className="text-white/90 font-semibold">{flight.flight_number || 'N/A'}</p>
            </div>
          </div>

          <div className="p-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between gap-8">
              <div className="flex flex-col">
                <p className="text-md text-gray-500 mb-2">{flight.source_city || 'Source'}</p>
                <h1 className="text-3xl font-semibold leading-none tracking-tight mb-2">{flight.source_code}</h1>
                <p className="text-md text-gray-500">{formatDateTime(flight.flight_date, flight.departure_time)}</p>
              </div>
              <div className="relative">
                <img src={routeIcon} alt="routeIcon" className="w-fit h-10" />
                <p className="text-md text-gray-500 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2">{calculateDuration(flight.departure_time, flight.arrival_time)}</p>
              </div>
              <div className="flex flex-col text-right">
                <p className="text-md text-gray-500 mb-2">{flight.destination_city || 'Destination'}</p>
                <h1 className="text-3xl font-semibold leading-none tracking-tight mb-2">{flight.destination_code}</h1>
                <p className="text-md text-gray-500">{formatDateTime(flight.flight_date, flight.arrival_time)}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Price Breakdown</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-100 px-6 py-3 flex items-center justify-between text-white">
                <span className="font-semibold">Class</span>
                <span className="font-semibold">Price</span>
              </div>
              <div className="bg-indigo-50 px-6 py-4 flex items-center justify-between border-l-4 border-indigo-600">
                <div>
                  <p className="font-bold text-gray-900">{flight.class_name || 'Economy'} Class</p>
                  <p className="text-xs text-gray-500">Code: {flight.class_code || 'Y'}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{flight.total_price ? `Rs ${parseFloat(flight.total_price).toLocaleString('en-IN')}` : flight.base_price ? `Rs ${parseFloat(flight.base_price).toLocaleString('en-IN')}` : 'NaN'}</p>
                  {flight.base_price && flight.tax_amount && (
                    <p className="text-xs text-gray-500">(Base: Rs {parseFloat(flight.base_price).toLocaleString('en-IN')} + Tax: Rs {parseFloat(flight.tax_amount).toLocaleString('en-IN')})</p>
                  )}
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-600"><span className="font-semibold">Note:</span> Prices shown are for the selected seat class.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Airline</p>
              <p className="font-semibold">{flight.airline_name || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Aircraft</p>
              <p className="font-semibold">{flight.aircraft_type || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Flight Date</p>
              <p className="font-semibold">{formatDate(flight.flight_date)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Frequency</p>
              <p className="font-semibold">{formatFrequency(flight.frequency)}</p>
            </div>
          </div>
          
          <button onClick={handleCloseWithAnimation} className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-100 hover:from-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg">Close</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FlightDetailsModal;
