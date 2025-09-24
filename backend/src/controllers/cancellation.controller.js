import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requestCancellation } from '../models/cancellation.model.js';

export const cancelTicket = asyncHandler(async (req, res) => {
	const { ticketId, reason } = req.body;
	if (!ticketId) throw new ApiError(400, 'ticketId required');
	const requestedBy = req.user?.userId;
	const rec = await requestCancellation({ ticketId, requestedBy, reason });
	return res.status(201).json(new ApiResponse(201, rec, 'Cancellation requested'));
});






