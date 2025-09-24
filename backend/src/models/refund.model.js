import { pool } from '../db/db.js';

export const processRefund = async ({ cancellationId, paymentId, refundAmount, refundMethod, processedBy, gatewayResponse }) => {
	const [res] = await pool.execute(
		`INSERT INTO refunds (cancellation_id, payment_id, refund_amount, refund_method, refund_status, processed_by, processed_at, gateway_response)
		 VALUES (?, ?, ?, ?, 'COMPLETED', ?, NOW(), ?)`,
		[cancellationId, paymentId, refundAmount, refundMethod || 'ORIGINAL_PAYMENT_METHOD', processedBy || null, gatewayResponse || null]
	);
	return { refund_id: res.insertId };
};

export const getRefundsByBooking = async (bookingId) => {
	const [rows] = await pool.execute(
		`SELECT r.* FROM refunds r
		 JOIN payments p ON p.payment_id = r.payment_id
		 WHERE p.booking_id = ? ORDER BY r.created_at DESC`,
		[bookingId]
	);
	return rows;
};






