import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getRefundsByBooking, processRefund } from '../models/refund.model.js';

export const refund = asyncHandler(async (req, res) => {
	const { cancellationId, paymentId, refundAmount, refundMethod } = req.body;
	if (!cancellationId || !paymentId || !refundAmount) throw new ApiError(400, 'cancellationId, paymentId, refundAmount required');
	const processedBy = req.user?.userId;
	const rec = await processRefund({ cancellationId, paymentId, refundAmount, refundMethod, processedBy });
	return res.status(201).json(new ApiResponse(201, rec, 'Refund processed'));
});

export const refundStatus = asyncHandler(async (req, res) => {
	const { bookingId } = req.params;
	const rows = await getRefundsByBooking(Number(bookingId));
	return res.json(new ApiResponse(200, { items: rows }));
});





