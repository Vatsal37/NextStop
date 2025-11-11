import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generatePNR } from '../utils/pnr.util.js';
import { createBookingWithTickets, getBookingDetails, getUserBookings } from '../models/booking.model.js';

export const createBooking = asyncHandler(async (req, res) => {
	const { scheduleId, flightDate, passengers, fareAmountPerPassenger, contactEmail, contactPhone, seatIds, currency } = req.body;
	if (!scheduleId || !flightDate || !Array.isArray(passengers) || passengers.length === 0 || !fareAmountPerPassenger) {
		throw new ApiError(400, 'scheduleId, flightDate, passengers, fareAmountPerPassenger required');
	}
	const pnr = generatePNR();
	const userId = req.user?.userId || null; // allow anonymous? here enforce auth elsewhere
	const result = await createBookingWithTickets({
		userId,
		contactEmail,
		contactPhone,
		passengers,
		scheduleId,
		flightDate,
		fareAmountPerPassenger,
		currency: currency || 'INR',
		pnr,
		seatIds
	});
	return res.status(201).json(new ApiResponse(201, { pnr, ...result }, 'Booking created'));
});

export const getBooking = asyncHandler(async (req, res) => {
	const { pnr } = req.params;
	const data = await getBookingDetails(pnr);
	if (!data) throw new ApiError(404, 'Booking not found');
	return res.json(new ApiResponse(200, data));
});

export const getMyBookings = asyncHandler(async (req, res) => {
	const userId = req.user?.userId;
	if (!userId) throw new ApiError(401, 'Unauthorized');
	const bookings = await getUserBookings(userId);
	return res.json(new ApiResponse(200, bookings));
});




