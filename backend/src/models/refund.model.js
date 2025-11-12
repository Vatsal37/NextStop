import { pool } from '../db/db.js';

export const processRefund = async ({ cancellationId, paymentId, refundAmount, refundMethod, processedBy, gatewayResponse }) => {
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();
		
		// Verify cancellation exists and is approved
		const [cancellationRows] = await conn.execute(
			`SELECT cancellation_id, cancellation_status FROM cancellations WHERE cancellation_id = ? FOR UPDATE`,
			[cancellationId]
		);
		
		if (cancellationRows.length === 0) {
			throw new Error('Cancellation not found');
		}
		
		const cancellation = cancellationRows[0];
		if (cancellation.cancellation_status !== 'APPROVED' && cancellation.cancellation_status !== 'PROCESSED') {
			throw new Error(`Cannot process refund for cancellation with status: ${cancellation.cancellation_status}. Cancellation must be APPROVED or PROCESSED.`);
		}
		
		// Update cancellation status to PROCESSED
		await conn.execute(
			`UPDATE cancellations SET cancellation_status = 'PROCESSED', processed_at = NOW() WHERE cancellation_id = ?`,
			[cancellationId]
		);
		
		// Create refund record
		const [res] = await conn.execute(
			`INSERT INTO refunds (cancellation_id, payment_id, refund_amount, refund_method, refund_status, processed_by, processed_at, gateway_response)
			 VALUES (?, ?, ?, ?, 'COMPLETED', ?, NOW(), ?)`,
			[cancellationId, paymentId, refundAmount, refundMethod || 'ORIGINAL_PAYMENT_METHOD', processedBy || null, gatewayResponse || null]
		);
		
		await conn.commit();
		return { refund_id: res.insertId };
	} catch (e) {
		await conn.rollback();
		throw e;
	} finally {
		conn.release();
	}
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









