import { pool } from '../db/db.js';

export const requestCancellation = async ({ ticketId, requestedBy, reason }) => {
	const conn = await pool.getConnection();
    try {
		await conn.beginTransaction();
		// Ensure ticket exists and lock it
		const [ticketRows] = await conn.execute(
			`SELECT ticket_id, booking_id, instance_id, seat_id FROM tickets WHERE ticket_id = ? FOR UPDATE`,
			[ticketId]
		);
		if (ticketRows.length === 0) {
			throw new Error('Ticket not found');
		}
        const currentInstanceId = ticketRows[0].instance_id;
		// Insert cancellation record
		const [res] = await conn.execute(
			`INSERT INTO cancellations (ticket_id, requested_by, cancellation_reason, cancellation_status)
			 VALUES (?, ?, ?, 'PENDING')`,
			[ticketId, requestedBy, reason || null]
		);
        // Free the seat but keep ticket history: mark ticket as CANCELLED (seat becomes available via queries that ignore CANCELLED)
        await conn.execute(
            `UPDATE tickets SET ticket_status = 'CANCELLED' WHERE ticket_id = ?`,
            [ticketId]
        );
		await conn.commit();
		return { cancellation_id: res.insertId };
	} catch (e) {
		await conn.rollback();
		throw e;
	} finally {
		conn.release();
	}
};




