import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { bookingConfirmationCoverImage, logo, routeIcon } from '../assets/images';
import { bookingsApi } from '../services/api';

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pnr = searchParams.get('pnr');
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      if (!pnr) {
        setError('PNR not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await bookingsApi.getByPnr(pnr);
        const data = response.data?.data || null;
        setBookingData(data);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err?.response?.data?.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [pnr]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      });
    } catch {
      // If dateStr is in format like "27JUN20", parse it manually
      if (typeof dateStr === 'string' && dateStr.match(/^\d{2}[A-Z]{3}\d{2}$/)) {
        const day = dateStr.slice(0, 2);
        const month = dateStr.slice(2, 5);
        const year = '20' + dateStr.slice(5, 7);
        const monthMap = {
          'JAN': 'Jan', 'FEB': 'Feb', 'MAR': 'Mar', 'APR': 'Apr',
          'MAY': 'May', 'JUN': 'Jun', 'JUL': 'Jul', 'AUG': 'Aug',
          'SEP': 'Sep', 'OCT': 'Oct', 'NOV': 'Nov', 'DEC': 'Dec'
        };
        return `${day} ${monthMap[month] || month} ${year}`;
      }
      return dateStr;
    }
  };

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr && !timeStr) return 'N/A';
    
    let datePart = '';
    let timePart = '';
    
    if (dateStr) {
      try {
        const date = new Date(dateStr);
        datePart = date.toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short',
          weekday: 'short'
        });
      } catch {
        datePart = dateStr;
      }
    }
    
    if (timeStr) {
      if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
        timePart = timeStr.slice(0, 5); // Get HH:mm
      } else {
        timePart = timeStr;
      }
    }
    
    if (datePart && timePart) {
      return `${datePart}, ${timePart}`;
    }
    return datePart || timePart || 'N/A';
  };

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

  const getClassName = (classId) => {
    const classMap = {
      1: 'Economy',
      2: 'Premium Economy',
      3: 'Business',
      4: 'First Class'
    };
    return classMap[classId] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f2543] relative">
        <button
          onClick={() => navigate('/bookings')}
          className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 backdrop-blur-sm border border-white/20"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-white text-xl">Loading booking details...</div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f2543] relative">
        <button
          onClick={() => navigate('/bookings')}
          className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 backdrop-blur-sm border border-white/20"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="bg-white rounded-lg border border-red-200 p-6 text-center text-red-600 max-w-md">
          <p className="text-lg font-medium mb-2">Error Loading Booking</p>
          <p className="text-sm">{error || 'Booking not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const { booking, tickets, flightDetails, payment, refunds } = bookingData;
  const firstTicket = tickets && tickets.length > 0 ? tickets[0] : null;
  const refundsList = Array.isArray(refunds) ? refunds : [];
  
  // Format payment method for display
  const getPaymentMethodDisplay = (paymentMethod) => {
    if (!paymentMethod) return 'N/A';
    const methodMap = {
      'CARD': 'Card Payment',
      'CREDIT_CARD': 'Card Payment',
      'DEBIT_CARD': 'Debit Card Payment',
      'UPI': 'UPI Payment',
      'NETBANKING': 'NetBanking Payment',
      'NET_BANKING': 'NetBanking Payment',
      'WALLET': 'Wallet Payment',
      'CASH': 'Cash Payment'
    };
    return methodMap[paymentMethod] || paymentMethod;
  };

  const getTicketStatusLabel = (status) => {
    if (!status) return '';
    const normalized = status.toUpperCase();
    if (normalized === 'CANCELLED') return 'Cancelled';
    if (normalized === 'CONFIRMED') return 'Confirmed';
    if (normalized === 'PENDING') return 'Pending';
    return normalized.charAt(0) + normalized.slice(1).toLowerCase();
  };

  const formatCurrency = (amount) => {
    const numericAmount = Number.isFinite(amount) ? amount : 0;
    const prefix = booking.currency === 'INR' ? 'Rs' : '$';
    const currencyCode = booking.currency || 'USD';
    return `${prefix} ${numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode}`;
  };

  const getRefundStatusLabel = (status) => {
    if (!status) return 'N/A';
    const normalized = status.toUpperCase();
    const statusMap = {
      'PENDING': 'Pending',
      'PROCESSED': 'Processed',
      'FAILED': 'Failed',
      'COMPLETED': 'Completed'
    };
    return statusMap[normalized] || normalized.charAt(0) + normalized.slice(1).toLowerCase();
  };

  const getRefundMethodLabel = (method) => {
    if (!method) return 'N/A';
    const methodMap = {
      'ORIGINAL_PAYMENT_METHOD': 'Original Payment Method',
      'BANK_TRANSFER': 'Bank Transfer',
      'WALLET': 'Wallet',
      'CHEQUE': 'Cheque'
    };
    return methodMap[method] || method;
  };

  const priceSummary = (tickets || []).reduce(
    (acc, ticket) => {
      const base = parseFloat(ticket.fare_amount || 0);
      const tax = parseFloat(ticket.tax_amount || 0);
      acc.base += base;
      acc.tax += tax;
      acc.total += base + tax;
      return acc;
    },
    { base: 0, tax: 0, total: 0 }
  );

  const totalAmountValue =
    priceSummary.total > 0
      ? priceSummary.total
      : parseFloat(booking.total_amount || 0);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f2543]">

      {/* Header */}
      <div className="relative px-6 pt-12 pb-40 sm:pt-16 sm:pb-8 min-h-[360px] sm:min-h-[480px] text-white overflow-hidden">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0" aria-hidden="true">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${bookingConfirmationCoverImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1e36]/90 via-[#0f2543]/80 to-[#0f2543]/95" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl flex items-center justify-between">
          {/* Brand to mirror image */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <img src={logo} alt="NextStop Logo" className="object-contain w-full h-full" />
            </div>
            <span className="text-white text-4xl font-bold">NextStop</span>
          </div>
          {/* Close Button */}
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 backdrop-blur-sm border border-white/20"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Booking Card (clone of image) */}
      <div className="relative z-10 -mt-72 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="bg-white rounded-md shadow-xl overflow-hidden">
            {/* Route header */}
            <div className="px-6 py-5">
              <div className='flex justify-between items-center w-full'>
                <div className='flex flex-col'>
                  <p className='text-md text-gray-500 mb-2'>{flightDetails?.source_city || 'Source'}</p>
                  <h1 className='text-3xl font-semibold leading-none tracking-tight mb-2'>
                    {flightDetails?.source_code || 'N/A'}
                  </h1>
                  <p className='text-md text-gray-500'>
                    {flightDetails ? formatDateTime(flightDetails.flight_date, flightDetails.departure_time) : 'N/A'}
                  </p>
                </div>
                <div className='relative'>
                  <img src={routeIcon} alt='routeIcon' className='w-fit h-10' />
                  <p className='text-md text-gray-500 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2'>
                    {flightDetails ? calculateDuration(flightDetails.departure_time, flightDetails.arrival_time) : 'N/A'}
                  </p>
                </div>
                <div className='flex flex-col text-right'>
                  <p className='text-md text-gray-500 mb-2'>{flightDetails?.destination_city || 'Destination'}</p>
                  <h1 className='text-3xl font-semibold leading-none tracking-tight mb-2'>
                    {flightDetails?.destination_code || 'N/A'}
                  </h1>
                  <p className='text-md text-gray-500'>
                    {flightDetails ? formatDateTime(flightDetails.flight_date, flightDetails.arrival_time) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Thin divider */}
            <div className="h-px bg-gray-200" />

            {/* Details grid - Show first ticket or all tickets if multiple */}
            {tickets && tickets.length > 0 && (
              <div className="grid grid-cols-4 gap-4 px-6 py-5">
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Flight</div>
                  <div className="text-[13px] font-semibold text-gray-900">
                    {flightDetails?.flight_number || flightDetails?.airline_name || 'N/A'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Passenger</div>
                  <div className="text-[13px] font-semibold text-gray-900">
                    {tickets.length === 1 ? (
                      <span className="inline-flex items-center gap-2">
                        <span>{`${firstTicket.first_name} ${firstTicket.last_name}`.toUpperCase()}</span>
                        {firstTicket?.ticket_status && (
                          <span
                            className={`text-[11px] font-medium ${firstTicket.ticket_status === 'CANCELLED' ? 'text-red-500' : 'text-green-600'}`}
                          >
                            ({getTicketStatusLabel(firstTicket.ticket_status)})
                          </span>
                        )}
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-xs">
                        {tickets.map((ticket) => (
                          <span key={ticket.ticket_id || `${ticket.ticket_number}`} className="inline-flex items-center gap-2">
                            <span>{`${ticket.first_name} ${ticket.last_name}`.toUpperCase()}</span>
                            {ticket.ticket_status && (
                              <span
                                className={`text-[11px] font-medium ${ticket.ticket_status === 'CANCELLED' ? 'text-red-500' : 'text-green-600'}`}
                              >
                                ({getTicketStatusLabel(ticket.ticket_status)})
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Class</div>
                  <div className="text-[13px] font-semibold text-gray-900">
                    {firstTicket ? getClassName(firstTicket.class_id).toUpperCase() : 'N/A'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Seat{tickets.length > 1 ? 's' : ''}</div>
                  <div className="text-[13px] font-semibold text-gray-900">
                    {tickets.length === 1 
                      ? firstTicket.seat_number 
                      : tickets.map(t => t.seat_number).join(', ')
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation strip */}
            <div className="px-6 py-3 bg-[#e8f1fb] flex items-center justify-center gap-10">
              <div className="text-[10px] text-gray-600 uppercase tracking-wider">Confirmation Number</div>
              <div className="text-[13px] font-bold text-[#1e3a5f] tracking-wide">{booking.pnr || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Section */}
      <div className="relative z-10 px-4 sm:px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="bg-white rounded-md shadow-xl overflow-hidden">
            <div className="px-6 py-5">
              <div className="text-[18px] font-semibold text-[#0f2543] mb-3">Flight Receipt</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ticket#:</span>
                  <span className="text-gray-900 font-medium">
                    {firstTicket ? firstTicket.ticket_number : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Method of Payment</span>
                  <span className="text-gray-900 font-medium">
                    {payment ? getPaymentMethodDisplay(payment.payment_method) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(booking.booking_date || booking.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-gray-900 font-medium">
                    {booking.currency === 'INR' ? 'Rs' : '$'} {parseFloat(booking.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {booking.currency || 'USD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Charges */}
            <div className="px-6 py-5">
              <div className="text-[12px] font-bold text-gray-800 uppercase tracking-wider mb-2">Price Breakdown</div>
              
              {/* Show all passengers first */}
              {tickets && tickets.map((ticket, index) => {
                const basePrice = parseFloat(ticket.fare_amount || 0);
                const taxAmount = parseFloat(ticket.tax_amount || 0);
                const ticketTotal = basePrice + taxAmount;
                const className = getClassName(ticket.class_id);
                
                return (
                  <div key={ticket.ticket_id || index} className="mb-4">
                    <div className="bg-gray-100 text-gray-800 text-[13px] font-medium px-4 py-3 mb-2 rounded-sm flex items-center gap-2 flex-wrap">
                      <span>{tickets.length > 1 ? `Passenger ${index + 1}: ` : ''}{className} Class</span>
                      {ticket.ticket_status && (
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${ticket.ticket_status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}
                        >
                          {getTicketStatusLabel(ticket.ticket_status)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[13px] px-4 py-3 border-b border-gray-100">
                      <span className="text-gray-800 flex items-center gap-2">
                        <span>{ticket.first_name} {ticket.last_name} - Seat {ticket.seat_number}</span>
                        {ticket.ticket_status && (
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ticket.ticket_status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}
                          >
                            {getTicketStatusLabel(ticket.ticket_status)}
                          </span>
                        )}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(ticketTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Price Details - shown after all passengers */}
              {tickets && tickets.length > 0 && (
                <>
                  <div className="bg-gray-100 text-gray-800 text-[13px] font-medium px-4 py-3 mt-5 mb-2 rounded-sm">Price Details</div>
                  <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex-1 text-[13px] pr-4">
                      <div className="font-medium text-gray-800 mb-1">Base Fare</div>
                      <div className="text-xs text-gray-600 leading-snug">Sum of base fares for all passengers</div>
                    </div>
                    <span className="text-[13px] text-gray-900 font-medium ml-4">
                      {formatCurrency(priceSummary.base)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex-1 text-[13px] font-medium text-gray-800">Tax Amount</div>
                    <span className="text-[13px] text-gray-900 font-medium ml-4">
                      {formatCurrency(priceSummary.tax)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex-1 text-[13px] font-medium text-gray-800">Total Fare</div>
                    <span className="text-[13px] text-gray-900 font-medium ml-4">
                      {formatCurrency(priceSummary.total)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between px-4 py-5 mt-2.5 bg-white text-[15px] font-bold text-[#1e3a5f] border-t-2 border-gray-200">
                <span>Total Amount</span>
                <span>
                  {formatCurrency(totalAmountValue)}
                </span>
              </div>
            </div>

            {/* Refund Details */}
            {refundsList && refundsList.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-200">
                <div className="text-[12px] font-bold text-gray-800 uppercase tracking-wider mb-2">Refund Details</div>
                
                {refundsList.map((refund, index) => {
                  const refundAmount = parseFloat(refund.refund_amount || 0);
                  const processingFee = parseFloat(refund.processing_fee || 0);
                  const netRefund = parseFloat(refund.net_refund_amount || refundAmount - processingFee);
                  
                  return (
                    <div key={refund.refund_id || index} className="mb-4 last:mb-0">
                      <div className="bg-gray-100 text-gray-800 text-[13px] font-medium px-4 py-3 mb-2 rounded-sm">
                        Refund {refundsList.length > 1 ? `#${index + 1}` : ''}
                        {refund.refund_status && (
                          <span
                            className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${
                              refund.refund_status === 'COMPLETED' || refund.refund_status === 'PROCESSED'
                                ? 'bg-green-100 text-green-600'
                                : refund.refund_status === 'FAILED'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-yellow-100 text-yellow-600'
                            }`}
                          >
                            {getRefundStatusLabel(refund.refund_status)}
                          </span>
                        )}
                      </div>
                      
                      {refund.refund_transaction_id && (
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                          <span className="text-[13px] text-gray-600">Transaction ID</span>
                          <span className="text-[13px] text-gray-900 font-medium">{refund.refund_transaction_id}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                        <span className="text-[13px] text-gray-600">Refund Method</span>
                        <span className="text-[13px] text-gray-900 font-medium">{getRefundMethodLabel(refund.refund_method)}</span>
                      </div>
                      
                      <div className="flex items-start justify-between px-4 py-2 border-b border-gray-100">
                        <div className="flex-1 text-[13px] pr-4">
                          <div className="font-medium text-gray-800 mb-1">Refund Amount</div>
                          <div className="text-xs text-gray-600 leading-snug">Gross refund amount</div>
                        </div>
                        <span className="text-[13px] text-gray-900 font-medium ml-4">
                          {formatCurrency(refundAmount)}
                        </span>
                      </div>
                      
                      {processingFee > 0 && (
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                          <span className="text-[13px] text-gray-600">Processing Fee</span>
                          <span className="text-[13px] text-gray-900 font-medium">
                            {formatCurrency(processingFee)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between px-4 py-3 mt-2 bg-gray-50 text-[13px] font-semibold text-gray-900 border-t border-gray-200">
                        <span>Net Refund Amount</span>
                        <span>
                          {formatCurrency(netRefund)}
                        </span>
                      </div>
                      
                      {refund.processed_at && (
                        <div className="flex items-center justify-between px-4 py-2 mt-2">
                          <span className="text-[12px] text-gray-500">Processed On</span>
                          <span className="text-[12px] text-gray-600">
                            {formatDate(refund.processed_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {refundsList.length > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 mt-4 bg-gray-50 text-[13px] font-semibold text-gray-900 border-t-2 border-gray-200">
                    <span>Total Refund Amount</span>
                    <span>
                      {formatCurrency(
                        refundsList.reduce((sum, refund) => {
                          const netRefund = parseFloat(refund.net_refund_amount || refund.refund_amount || 0);
                          return sum + netRefund;
                        }, 0)
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-10 bg-[#0f2543] text-center text-white">
        <p className="text-base">Looking forward to flying with you!</p>
      </div>
    </div>
  );
}