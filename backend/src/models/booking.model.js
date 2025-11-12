import { pool } from '../db/db.js';
import { formatDatesInObject, formatDateOnly } from '../utils/date.util.js';
import { getPaymentsByBooking } from './payment.model.js';
import { getRefundsByBooking } from './refund.model.js';

export const createBookingWithTickets = async ({ userId, contactEmail, contactPhone, passengers, scheduleId, flightDate, fareAmountPerPassenger, currency, pnr, seatIds: requestedSeatIds }) => {
	// passengers: [{ first_name, last_name, passport_number?, date_of_birth, gender, nationality }]
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();
		// Ensure instance
		const [instRows] = await conn.execute(`SELECT instance_id FROM flight_instances WHERE schedule_id = ? AND flight_date = ? FOR UPDATE`, [scheduleId, flightDate]);
		let instanceId;
		if (instRows.length === 0) {
			const [ins] = await conn.execute(`INSERT INTO flight_instances (schedule_id, flight_date, status) VALUES (?, ?, 'SCHEDULED')`, [scheduleId, flightDate]);
			instanceId = ins.insertId;
		} else {
			instanceId = instRows[0].instance_id;
		}
		const totalPassengers = passengers.length;
		const totalAmount = totalPassengers * fareAmountPerPassenger;
		const [bookingRes] = await conn.execute(
			`INSERT INTO bookings (user_id, pnr, booking_status, total_passengers, total_amount, currency, contact_email, contact_phone)
			 VALUES (?, ?, 'CONFIRMED', ?, ?, ?, ?, ?)`,
			[userId, pnr, totalPassengers, totalAmount, currency || 'USD', contactEmail, contactPhone]
		);
		const bookingId = bookingRes.insertId;
		// Get aircraft seats
		const [aircraftRows] = await conn.execute(`SELECT aircraft_id FROM flight_schedules WHERE schedule_id = ?`, [scheduleId]);
		const aircraftId = aircraftRows[0].aircraft_id;
        let seatIds;
        if (requestedSeatIds && Array.isArray(requestedSeatIds)) {
            if (requestedSeatIds.length !== totalPassengers) {
                throw new Error('seatIds must match passengers length');
            }
            // Validate requested seats: belong to aircraft, active, and not already taken for the instance
            const placeholders = requestedSeatIds.map(() => '?').join(',');
            const params = [aircraftId, instanceId, ...requestedSeatIds];
            const [validRows] = await conn.execute(
                `SELECT s.seat_id FROM seats s
                 WHERE s.aircraft_id = ? AND s.is_active = 1
                   AND s.seat_id NOT IN (
                     SELECT seat_id FROM tickets WHERE instance_id = ? AND ticket_status != 'CANCELLED'
                   )
                   AND s.seat_id IN (${placeholders})`,
                params
            );
            if (validRows.length !== requestedSeatIds.length) {
                throw new Error('One or more requested seats are unavailable');
            }
            seatIds = requestedSeatIds;
        } else {
            const [availableSeats] = await conn.execute(
                `SELECT s.seat_id FROM seats s
                 WHERE s.aircraft_id = ? AND s.is_active = 1
                   AND s.seat_id NOT IN (
                     SELECT seat_id FROM tickets WHERE instance_id = ? AND ticket_status != 'CANCELLED'
                   )
                 LIMIT ?`,
                [aircraftId, instanceId, totalPassengers]
            );
            if (availableSeats.length < totalPassengers) {
                throw new Error('Not enough seats available');
            }
            seatIds = availableSeats.map(s => s.seat_id);
        }
		const ticketIds = [];
		for (let i = 0; i < passengers.length; i++) {
			const p = passengers[i];
			let passengerId;
			// Try to find existing passenger by passport or else create
			if (p.passport_number) {
				const [pr] = await conn.execute(`SELECT passenger_id FROM passengers WHERE passport_number = ? LIMIT 1`, [p.passport_number]);
				if (pr.length > 0) passengerId = pr[0].passenger_id;
			}
			if (!passengerId) {
				// Format date_of_birth to YYYY-MM-DD format for MySQL DATE column
				const formattedDateOfBirth = formatDateOnly(p.date_of_birth);
				const [insP] = await conn.execute(
					`INSERT INTO passengers (first_name, last_name, passport_number, date_of_birth, gender, nationality, email, phone)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
					[p.first_name, p.last_name, p.passport_number || null, formattedDateOfBirth, p.gender, p.nationality, p.email || null, p.phone || null]
				);
				passengerId = insP.insertId;
			}
			const seatId = seatIds[i];
			const ticketNumber = `${pnr}-${i + 1}`;
			const [tRes] = await conn.execute(
				`INSERT INTO tickets (booking_id, passenger_id, instance_id, seat_id, ticket_number, fare_amount, tax_amount)
				 VALUES (?, ?, ?, ?, ?, ?, 0)`,
				[bookingId, passengerId, instanceId, seatId, ticketNumber, fareAmountPerPassenger]
			);
			ticketIds.push(tRes.insertId);
		}
		await conn.commit();
		return { bookingId, instanceId, seatIds, ticketIds };
	} catch (e) {
		await conn.rollback();
		throw e;
	} finally {
		conn.release();
	}
};

export const getBookingByPNR = async (pnr) => {
	const [rows] = await pool.execute(`SELECT * FROM bookings WHERE pnr = ? LIMIT 1`, [pnr]);
	return rows[0] || null;
};

export const getBookingDetails = async (pnr) => {
	const [bookingRows] = await pool.execute(`SELECT * FROM bookings WHERE pnr = ? LIMIT 1`, [pnr]);
	const booking = bookingRows[0];
	if (!booking) return null;
	
	// Get tickets with passenger and seat info
	const [tickets] = await pool.execute(
		`SELECT t.*, p.first_name, p.last_name, p.passport_number, s.seat_number, s.class_id
		 FROM tickets t
		 JOIN passengers p ON p.passenger_id = t.passenger_id
		 JOIN seats s ON s.seat_id = t.seat_id
		 WHERE t.booking_id = ?`,
		[booking.booking_id]
	);
	
	// Get flight details from the first ticket's instance
	let flightDetails = null;
	if (tickets.length > 0) {
		const instanceId = tickets[0].instance_id;
		const [instanceRows] = await pool.execute(
			`SELECT fi.instance_id, fi.schedule_id, fi.flight_date, fi.status
			 FROM flight_instances fi
			 WHERE fi.instance_id = ?`,
			[instanceId]
		);
		
		if (instanceRows.length > 0) {
			const instance = instanceRows[0];
			const [scheduleRows] = await pool.execute(
				`SELECT fs.*, 
				 sa.airport_code AS source_code, sa.city AS source_city,
				 da.airport_code AS destination_code, da.city AS destination_city,
				 a.airline_name
				 FROM flight_schedules fs
				 JOIN flight_routes fr ON fs.route_id = fr.route_id
				 JOIN airports sa ON fr.source_airport_id = sa.airport_id
				 JOIN airports da ON fr.destination_airport_id = da.airport_id
				 JOIN airlines a ON a.airline_id = fs.airline_id
				 WHERE fs.schedule_id = ?`,
				[instance.schedule_id]
			);
			
			if (scheduleRows.length > 0) {
				flightDetails = {
					...scheduleRows[0],
					flight_date: instance.flight_date
				};
			}
		}
	}
	
	// Get payment information
	const payments = await getPaymentsByBooking(booking.booking_id);
	const payment = payments && payments.length > 0 ? payments[0] : null; // Get the most recent payment
	
	// Get refunds information
	const refunds = await getRefundsByBooking(booking.booking_id);
	
	// Format all date fields before returning
	const formattedBooking = formatDatesInObject(booking);
	const formattedTickets = formatDatesInObject(tickets);
	const formattedFlightDetails = flightDetails ? formatDatesInObject(flightDetails) : null;
	const formattedPayment = payment ? formatDatesInObject(payment) : null;
	const formattedRefunds = formatDatesInObject(refunds);
	
	return { 
		booking: formattedBooking, 
		tickets: formattedTickets,
		flightDetails: formattedFlightDetails,
		payment: formattedPayment,
		refunds: formattedRefunds
	};
};

export const getUserBookings = async (userId) => {
	const [bookingRows] = await pool.execute(
		`SELECT b.* FROM bookings b WHERE b.user_id = ? ORDER BY b.booking_date DESC`,
		[userId]
	);
	
	const bookings = [];
	for (const booking of bookingRows) {
		const bookingDetails = await getBookingDetails(booking.pnr);
		if (bookingDetails) {
			bookings.push(bookingDetails);
		}
	}
	
	return bookings;
};




