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
        const bookingId = ticketRows[0].booking_id;
		// Insert cancellation record - auto-approve user-initiated cancellations
		const [res] = await conn.execute(
			`INSERT INTO cancellations (ticket_id, requested_by, cancellation_reason, cancellation_status, processed_at)
			 VALUES (?, ?, ?, 'APPROVED', NOW())`,
			[ticketId, requestedBy, reason || null]
		);
        // Free the seat but keep ticket history: mark ticket as CANCELLED (seat becomes available via queries that ignore CANCELLED)
        await conn.execute(
            `UPDATE tickets SET ticket_status = 'CANCELLED' WHERE ticket_id = ?`,
            [ticketId]
        );

        // If all tickets for this booking are cancelled, mark booking as cancelled
        const [remainingTickets] = await conn.execute(
            `SELECT COUNT(*) AS remaining FROM tickets WHERE booking_id = ? AND ticket_status != 'CANCELLED'`,
            [bookingId]
        );

        if ((remainingTickets[0]?.remaining || 0) === 0) {
            await conn.execute(
                `UPDATE bookings SET booking_status = 'CANCELLED', updated_at = NOW() WHERE booking_id = ?`,
                [bookingId]
            );
        }
		await conn.commit();
		return { cancellation_id: res.insertId };
	} catch (e) {
		await conn.rollback();
		throw e;
	} finally {
		conn.release();
	}
};




