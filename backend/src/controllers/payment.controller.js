import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getBookingByPNR } from '../models/booking.model.js';
import { getPaymentsByBooking, recordPayment } from '../models/payment.model.js';

export const addPayment = asyncHandler(async (req, res) => {
	const { bookingId, amount, currency, paymentMethod, transactionId, paymentGateway } = req.body;
	
	// Debug logging
	console.log('[PAYMENT] Received payment data:', { bookingId, amount, currency, paymentMethod, transactionId, paymentGateway });
	console.log('[PAYMENT] Full req.body:', req.body);
	
	if (!bookingId || !amount || !paymentMethod) {
		console.error('[PAYMENT] Validation failed:', { bookingId, amount, paymentMethod });
		throw new ApiError(400, 'bookingId, amount, paymentMethod required');
	}
	
	const record = await recordPayment({ bookingId, amount, currency, paymentMethod, transactionId, paymentGateway, status: 'COMPLETED' });
	return res.status(201).json(new ApiResponse(201, record, 'Payment recorded'));
});

export const paymentStatus = asyncHandler(async (req, res) => {
	const { bookingId } = req.params;
	const payments = await getPaymentsByBooking(Number(bookingId));
	return res.json(new ApiResponse(200, { items: payments }));
});





