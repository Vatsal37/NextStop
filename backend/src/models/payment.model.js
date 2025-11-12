import { pool } from '../db/db.js';

export const recordPayment = async ({ bookingId, amount, currency, paymentMethod, transactionId, paymentGateway, gatewayResponse, status }) => {
	// Debug logging
	console.log('[RECORD_PAYMENT] Parameters received:', { bookingId, amount, currency, paymentMethod, transactionId, paymentGateway, status });
	
	// Ensure paymentMethod is not null/undefined
	if (!paymentMethod) {
		console.error('[RECORD_PAYMENT] paymentMethod is null/undefined!');
		throw new Error('paymentMethod is required');
	}
	
	// Map frontend payment method values to database enum values
	// Database enum: 'CREDIT_CARD','DEBIT_CARD','UPI','NET_BANKING','WALLET','CASH'
	const paymentMethodMap = {
		'CARD': 'CREDIT_CARD',  // Map CARD to CREDIT_CARD
		'CREDIT_CARD': 'CREDIT_CARD',
		'DEBIT_CARD': 'DEBIT_CARD',
		'UPI': 'UPI',
		'NETBANKING': 'NET_BANKING',  // Map NETBANKING to NET_BANKING
		'NET_BANKING': 'NET_BANKING',
		'WALLET': 'WALLET',
		'CASH': 'CASH'
	};
	
	const mappedPaymentMethod = paymentMethodMap[paymentMethod.toUpperCase()] || paymentMethod.toUpperCase();
	console.log('[RECORD_PAYMENT] Mapped payment method:', { original: paymentMethod, mapped: mappedPaymentMethod });
	
	const [res] = await pool.execute(
		`INSERT INTO payments (booking_id, amount, currency, payment_method, payment_status, transaction_id, payment_gateway, gateway_response, payment_date)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
		[bookingId, amount, currency || 'USD', mappedPaymentMethod, status || 'COMPLETED', transactionId || null, paymentGateway || null, gatewayResponse || null]
	);
	
	console.log('[RECORD_PAYMENT] Insert result:', { insertId: res.insertId, affectedRows: res.affectedRows });
	return { payment_id: res.insertId };
};

export const getPaymentsByBooking = async (bookingId) => {
	const [rows] = await pool.execute(`SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC`, [bookingId]);
	return rows;
};









