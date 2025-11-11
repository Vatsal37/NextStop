import { pool } from '../db/db.js';
import { ApiError } from '../utils/ApiError.js';
import { formatDatesInObject } from '../utils/date.util.js';

export const createFlightSchedule = async ({ airlineId, routeId, aircraftId, flightNumber, departureTime, arrivalTime, frequency, validFrom, validUntil }) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.execute(
            `INSERT INTO flight_schedules (airline_id, route_id, aircraft_id, flight_number, departure_time, arrival_time, frequency, valid_from, valid_until)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [airlineId, routeId, aircraftId, flightNumber, departureTime, arrivalTime, frequency, validFrom, validUntil]
        );
        const scheduleId = result.insertId;

        // Seed default fares for all seat classes if present
        // Defaults can be adjusted as needed
        const defaultPricingByClassCode = {
            Y: { base: 120.00, tax: 20.00 }, // Economy
            W: { base: 200.00, tax: 30.00 }, // Premium Economy
            J: { base: 400.00, tax: 50.00 }, // Business
            F: { base: 800.00, tax: 80.00 }  // First
        };

        const [classes] = await connection.execute(
            `SELECT class_id, class_code FROM seat_classes`
        );

        for (const cls of classes) {
            const pricing = defaultPricingByClassCode[cls.class_code] || { base: 150.00, tax: 25.00 };
            await connection.execute(
                `INSERT INTO fares (schedule_id, class_id, base_price, tax_amount, currency, valid_from, valid_until, is_active)
                 VALUES (?, ?, ?, ?, 'USD', ?, ?, 1)`,
                [scheduleId, cls.class_id, pricing.base, pricing.tax, validFrom, validUntil]
            );
        }

        await connection.commit();
        return { schedule_id: scheduleId };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

export const searchFlights = async ({ sourceCode, destinationCode, date, page = 1, limit = 20, classId = 1 }) => {
	// Find route via airport codes, then schedules valid for date and frequency
    const pageInt = Math.max(1, parseInt(page, 10) || 1);
    const limitInt = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offsetInt = (pageInt - 1) * limitInt;
    
    // Get seat class info
    const classIdNum = parseInt(classId, 10);
    
    // Convert date to day of week for frequency matching
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // Map JavaScript day to day name patterns
    const dayNameMapping = {
      0: 'SUN', // Sunday
      1: 'MON', // Monday
      2: 'TUE', // Tuesday
      3: 'WED', // Wednesday
      4: 'THU', // Thursday
      5: 'FRI', // Friday
      6: 'SAT'  // Saturday
    };
    
    const dayName = dayNameMapping[dayOfWeek];
    
    const sql = `SELECT fs.*, fr.route_id, 
                sa.airport_code AS source_code, sa.city AS source_city,
                da.airport_code AS destination_code, da.city AS destination_city,
                a.airline_name, ac.aircraft_model AS aircraft_type,
                f.base_price, f.tax_amount, f.total_price, f.currency,
                sc.class_name, sc.class_code
         FROM flight_schedules fs
         JOIN flight_routes fr ON fs.route_id = fr.route_id
         JOIN airports sa ON fr.source_airport_id = sa.airport_id
         JOIN airports da ON fr.destination_airport_id = da.airport_id
         JOIN airlines a ON a.airline_id = fs.airline_id
         JOIN aircraft ac ON ac.aircraft_id = fs.aircraft_id
         LEFT JOIN fares f ON fs.schedule_id = f.schedule_id 
           AND f.class_id = ? AND ? BETWEEN f.valid_from AND f.valid_until AND f.is_active = 1
         LEFT JOIN seat_classes sc ON sc.class_id = ?
         WHERE sa.airport_code = ? AND da.airport_code = ?
           AND ? BETWEEN fs.valid_from AND fs.valid_until
           AND fs.is_active = 1
           AND (
             fs.frequency = 'DAILY'
             OR fs.frequency LIKE ?
             OR fs.frequency LIKE ?
           )
         LIMIT ${limitInt} OFFSET ${offsetInt}`;
    
    // Search patterns: 'WEEKLY_MON', 'WEEKLY_MON,WUE,FRI', etc.
    const pattern1 = `WEEKLY_${dayName}`;
    const pattern2 = `%${dayName}%`;
    
    const [rows] = await pool.execute(sql, [
      classIdNum, date, classIdNum, 
      sourceCode, destinationCode, date,
      pattern1, pattern2
    ]);
	
	// Format all date fields in the results
	return formatDatesInObject(rows);
};

export const getAvailableSeatsForInstance = async ({ scheduleId, date }) => {
	// Ensure a flight_instance exists; if not, create SCHEDULED instance
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();
		const [instRows] = await conn.execute(
			`SELECT fi.instance_id, fi.status FROM flight_instances fi WHERE fi.schedule_id = ? AND fi.flight_date = ? FOR UPDATE`,
			[scheduleId, date]
		);
		let instanceId;
		if (instRows.length === 0) {
			const [ins] = await conn.execute(
				`INSERT INTO flight_instances (schedule_id, flight_date, status) VALUES (?, ?, 'SCHEDULED')`,
				[scheduleId, date]
			);
			instanceId = ins.insertId;
		} else {
			instanceId = instRows[0].instance_id;
		}
		// Seats of aircraft - seats already ticketed for this instance
		const [aircraftRows] = await conn.execute(`SELECT aircraft_id FROM flight_schedules WHERE schedule_id = ?`, [scheduleId]);
		const aircraftId = aircraftRows[0]?.aircraft_id;
		if (!aircraftId) {
			throw new ApiError(404, 'Schedule not found or has no aircraft');
		}
        const [seats] = await conn.execute(
            `SELECT 
               s.seat_id,
               s.seat_number,
               s.class_id,
               (
                 SELECT f.base_price FROM fares f
                 WHERE f.schedule_id = ? AND f.class_id = s.class_id
                   AND ? BETWEEN f.valid_from AND f.valid_until
                   AND f.is_active = 1
                 ORDER BY f.valid_from DESC
                 LIMIT 1
               ) AS base_price,
               (
                 SELECT f.tax_amount FROM fares f
                 WHERE f.schedule_id = ? AND f.class_id = s.class_id
                   AND ? BETWEEN f.valid_from AND f.valid_until
                   AND f.is_active = 1
                 ORDER BY f.valid_from DESC
                 LIMIT 1
               ) AS tax_amount,
               (
                 SELECT f.total_price FROM fares f
                 WHERE f.schedule_id = ? AND f.class_id = s.class_id
                   AND ? BETWEEN f.valid_from AND f.valid_until
                   AND f.is_active = 1
                 ORDER BY f.valid_from DESC
                 LIMIT 1
               ) AS total_price,
               (
                 SELECT f.currency FROM fares f
                 WHERE f.schedule_id = ? AND f.class_id = s.class_id
                   AND ? BETWEEN f.valid_from AND f.valid_until
                   AND f.is_active = 1
                 ORDER BY f.valid_from DESC
                 LIMIT 1
               ) AS currency
             FROM seats s
             WHERE s.aircraft_id = ? AND s.is_active = 1
               AND s.seat_id NOT IN (
                 SELECT seat_id FROM tickets
                 WHERE instance_id = ? AND ticket_status != 'CANCELLED'
               )`,
            [
              scheduleId, date,
              scheduleId, date,
              scheduleId, date,
              scheduleId, date,
              aircraftId,
              instanceId
            ]
        );
		await conn.commit();
		// Format date fields in seats data
		return { instanceId, seats: formatDatesInObject(seats) };
	} catch (e) {
		await conn.rollback();
		throw e;
	} finally {
		conn.release();
	}
};

export const getFlightStatus = async ({ scheduleId, date }) => {
	const [rows] = await pool.execute(
		`SELECT * FROM flight_instances WHERE schedule_id = ? AND flight_date = ? LIMIT 1`,
		[scheduleId, date]
	);
	const result = rows[0] || null;
	return result ? formatDatesInObject(result) : null;
};





