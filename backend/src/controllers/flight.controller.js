import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createFlightSchedule, getAvailableSeatsForInstance, getFlightStatus, searchFlights } from '../models/flight.model.js';
import { emitFlightScheduled } from '../utils/realtime.js';

export const addFlight = asyncHandler(async (req, res) => {
	const { airlineId, routeId, aircraftId, flightNumber, departureTime, arrivalTime, frequency, validFrom, validUntil } = req.body;
	if (!airlineId || !routeId || !aircraftId || !flightNumber || !departureTime || !arrivalTime || !frequency || !validFrom || !validUntil) {
		throw new ApiError(400, 'Missing required fields');
	}
	const created = await createFlightSchedule({ airlineId, routeId, aircraftId, flightNumber, departureTime, arrivalTime, frequency, validFrom, validUntil });
	try { emitFlightScheduled({ scheduleId: created?.schedule_id || created?.id || null, flightNumber, routeId, airlineId, departureTime, arrivalTime, frequency, validFrom, validUntil }); } catch {}
	return res.status(201).json(new ApiResponse(201, created, 'Flight schedule created'));
});

export const search = asyncHandler(async (req, res) => {
	const { source, destination, date, page = 1, limit = 20, classId = 1 } = req.query;
	if (!source || !destination || !date) {
		throw new ApiError(400, 'source, destination and date are required');
	}
	const rows = await searchFlights({ sourceCode: source, destinationCode: destination, date, page: Number(page), limit: Number(limit), classId: Number(classId) });
	return res.json(new ApiResponse(200, { items: rows, page: Number(page), limit: Number(limit) }));
});

export const seats = asyncHandler(async (req, res) => {
	const { id } = req.params; // schedule id
	const { date } = req.query;
	if (!date) {
		throw new ApiError(400, 'date is required');
	}
	const data = await getAvailableSeatsForInstance({ scheduleId: Number(id), date });
	return res.json(new ApiResponse(200, data));
});

export const status = asyncHandler(async (req, res) => {
	const { id } = req.params; // schedule id
	const { date } = req.query;
	if (!date) {
		throw new ApiError(400, 'date is required');
	}
	const row = await getFlightStatus({ scheduleId: Number(id), date });
	return res.json(new ApiResponse(200, row || {}));
});





