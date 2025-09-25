import { pool } from '../db/db.js';

export const recordPayment = async ({ bookingId, amount, currency, paymentMethod, transactionId, paymentGateway, gatewayResponse, status }) => {
	const [res] = await pool.execute(
		`INSERT INTO payments (booking_id, amount, currency, payment_method, payment_status, transaction_id, payment_gateway, gateway_response, payment_date)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
		[bookingId, amount, currency || 'USD', paymentMethod, status || 'COMPLETED', transactionId || null, paymentGateway || null, gatewayResponse || null]
	);
	return { payment_id: res.insertId };
};

export const getPaymentsByBooking = async (bookingId) => {
	const [rows] = await pool.execute(`SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC`, [bookingId]);
	return rows;
};









