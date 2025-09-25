import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import connectDB, { pool } from '../db/db.js';

// This script converts a subset of DAILY schedules to weekday-specific ones (MON/WED/FRI)
// without deleting others. It appends digits to flight_number to avoid unique collisions.

async function run() {
	await connectDB();
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();
		// Pick up to 15 DAILY schedules randomly
		const [daily] = await conn.query(
			`SELECT schedule_id, airline_id, route_id, aircraft_id, flight_number, departure_time, arrival_time, valid_from, valid_until
			 FROM flight_schedules
			 WHERE frequency = 'DAILY' AND is_active = 1
			 ORDER BY RAND()
			 LIMIT 15`
		);
		for (const s of daily) {
			// Deactivate the DAILY schedule
			await conn.execute(`UPDATE flight_schedules SET is_active = 0 WHERE schedule_id = ?`, [s.schedule_id]);
			// Insert 3 weekly schedules (Mon/Wed/Fri)
			const days = ['WEEKLY_MON','WEEKLY_WED','WEEKLY_FRI'];
			for (let i=0;i<days.length;i++) {
				await conn.execute(
					`INSERT INTO flight_schedules (airline_id, route_id, aircraft_id, flight_number, departure_time, arrival_time, frequency, valid_from, valid_until, is_active)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
					[s.airline_id, s.route_id, s.aircraft_id, `${s.flight_number}${i+1}`, s.departure_time, s.arrival_time, days[i], s.valid_from, s.valid_until]
				);
			}
		}
		await conn.commit();
		console.log('Updated some DAILY schedules to WEEKLY (MON/WED/FRI)');
	} catch (e) {
		await conn.rollback();
		console.error('Update failed:', e);
		process.exit(1);
	} finally {
		conn.release();
		process.exit(0);
	}
}

run();





