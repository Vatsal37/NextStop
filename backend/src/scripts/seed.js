import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import connectDB, { pool } from '../db/db.js';

const AIRLINES = [
	{ code: 'AI', name: 'Air India' },
	{ code: '6E', name: 'IndiGo' },
	{ code: 'UK', name: 'Vistara' },
	{ code: 'SG', name: 'SpiceJet' },
	{ code: 'QP', name: 'Akasa Air' },
	{ code: 'IX', name: 'Air India Express' }
];

const AIRPORTS = [
	{ code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'CCU', name: 'Netaji Subhash Chandra Bose International', city: 'Kolkata', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'AMD', name: 'Sardar Vallabhbhai Patel International', city: 'Ahmedabad', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'GOI', name: 'Goa International Airport', city: 'Goa', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'GAU', name: 'Lokpriya Gopinath Bordoloi International', city: 'Guwahati', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'BBI', name: 'Biju Patnaik International Airport', city: 'Bhubaneswar', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'LKO', name: 'Chaudhary Charan Singh International', city: 'Lucknow', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'TRV', name: 'Trivandrum International Airport', city: 'Thiruvananthapuram', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'PAT', name: 'Jay Prakash Narayan Airport', city: 'Patna', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'NAG', name: 'Dr. Babasaheb Ambedkar International', city: 'Nagpur', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'VNS', name: 'Lal Bahadur Shastri International', city: 'Varanasi', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'IXC', name: 'Chandigarh Airport', city: 'Chandigarh', country: 'India', tz: 'Asia/Kolkata' },
	{ code: 'SXR', name: 'Srinagar International Airport', city: 'Srinagar', country: 'India', tz: 'Asia/Kolkata' }
];

const AIRCRAFT_MODELS = [
	{ model: 'Airbus A320', manufacturer: 'Airbus', seats: 180 },
	{ model: 'Boeing 737-800', manufacturer: 'Boeing', seats: 180 }
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
	await connectDB();
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();

		// Airlines
		for (const a of AIRLINES) {
			await conn.execute(
				`INSERT IGNORE INTO airlines (airline_code, airline_name, country, is_active) VALUES (?, ?, 'India', 1)`,
				[a.code, a.name]
			);
		}

		// Airports
		for (const ap of AIRPORTS) {
			await conn.execute(
				`INSERT IGNORE INTO airports (airport_code, airport_name, city, country, timezone, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
				[ap.code, ap.name, ap.city, ap.country, ap.tz]
			);
		}

		// Map airline ids
		const [airlineRows] = await conn.query(`SELECT airline_id, airline_code FROM airlines WHERE airline_code IN (${AIRLINES.map(()=>'?').join(',')})`, AIRLINES.map(a=>a.code));
		const codeToAirlineId = Object.fromEntries(airlineRows.map(r => [r.airline_code, r.airline_id]));

		// Aircraft (2 per airline)
		for (const a of AIRLINES) {
			const airlineId = codeToAirlineId[a.code];
			for (let i = 0; i < 2; i++) {
				const model = AIRCRAFT_MODELS[i % AIRCRAFT_MODELS.length];
				await conn.execute(
					`INSERT INTO aircraft (airline_id, aircraft_model, registration_number, manufacturer, total_seats, is_active)
					 VALUES (?, ?, ?, ?, ?, 1)`,
					[airlineId, model.model, `${a.code}-${100 + i}`, model.manufacturer, model.seats]
				);
			}
		}

		// Routes: connect top metros pairwise (subset)
		const major = ['DEL','BOM','BLR','HYD','MAA','CCU'];
		const [apRows] = await conn.query(`SELECT airport_id, airport_code FROM airports WHERE airport_code IN (${major.map(()=>'?').join(',')})`, major);
		const codeToAirportId = Object.fromEntries(apRows.map(r => [r.airport_code, r.airport_id]));
		const routes = [];
		for (let i=0;i<major.length;i++) {
			for (let j=i+1;j<major.length;j++) {
				const s = codeToAirportId[major[i]], d = codeToAirportId[major[j]];
				routes.push([s,d]);
			}
		}
		for (const [s,d] of routes) {
			await conn.execute(
				`INSERT INTO flight_routes (source_airport_id, destination_airport_id, distance_km, estimated_duration_minutes, is_active)
				 VALUES (?, ?, ?, ?, 1)`,
				[s, d, randomInt(500, 1800), randomInt(60, 180)]
			);
		}

	// Seat Classes (must be seeded before seats)
	const SEAT_CLASSES = [
		{ name: 'Economy', code: 'Y', baggage: 20, meal: 0, priority: 0, pitch: 30, legroom: 0 },
		{ name: 'Premium Economy', code: 'W', baggage: 25, meal: 1, priority: 0, pitch: 34, legroom: 1 },
		{ name: 'Business', code: 'J', baggage: 35, meal: 1, priority: 1, pitch: 42, legroom: 1 },
		{ name: 'First Class', code: 'F', baggage: 50, meal: 1, priority: 1, pitch: 60, legroom: 1 }
	];
	
	// Check if seat_classes already exist
	const [classExists] = await conn.query(`SELECT COUNT(*) as c FROM seat_classes`);
	if (classExists[0].c === 0) {
		for (const sc of SEAT_CLASSES) {
			await conn.execute(
				`INSERT INTO seat_classes (class_name, class_code, baggage_allowance_kg, meal_service, priority_boarding, seat_pitch_inches, extra_legroom, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
				[sc.name, sc.code, sc.baggage, sc.meal, sc.priority, sc.pitch, sc.legroom]
			);
		}
		console.log('Seat classes seeded');
	}

	// Fetch aircraft ids
	const [aircraftRows] = await conn.query(`SELECT aircraft_id, airline_id FROM aircraft`);
	const [routeRows] = await conn.query(`SELECT route_id FROM flight_routes`);

		// Schedules: mix of DAILY and specific weekdays per airline across routes
		const today = new Date();
		const sixMonthsLater = new Date(today.getTime()); sixMonthsLater.setMonth(sixMonthsLater.getMonth()+6);
		const toISO = (d)=> d.toISOString().slice(0,10);
		let scheduleCount = 0;
		for (const a of AIRLINES) {
			const airlineId = codeToAirlineId[a.code];
			const aircraftForAirline = aircraftRows.filter(x => x.airline_id === airlineId);
			for (let k=0;k<Math.min(3, routeRows.length) && k<aircraftForAirline.length; k++) {
				const routeId = routeRows[(scheduleCount + k) % routeRows.length].route_id;
				const aircraftId = aircraftForAirline[k].aircraft_id;
				const depH = randomInt(6, 22).toString().padStart(2,'0');
				const arrH = ((Number(depH)+2)%24).toString().padStart(2,'0');
				// 60% DAILY, 40% selected weekdays (e.g., MON/WED/FRI)
				const pattern = Math.random() < 0.6 ? 'DAILY' : 'WEEKLY_MWF';
				if (pattern === 'DAILY') {
					await conn.execute(
						`INSERT INTO flight_schedules (airline_id, route_id, aircraft_id, flight_number, departure_time, arrival_time, frequency, valid_from, valid_until, is_active)
						 VALUES (?, ?, ?, ?, ?, ?, 'DAILY', ?, ?, 1)`,
						[airlineId, routeId, aircraftId, `${a.code}${100 + k}`, `${depH}:00:00`, `${arrH}:30:00`, toISO(today), toISO(sixMonthsLater)]
					);
					scheduleCount++;
				} else {
					const days = ['WEEKLY_MON','WEEKLY_WED','WEEKLY_FRI'];
					for (let di=0; di<days.length; di++) {
						await conn.execute(
							`INSERT INTO flight_schedules (airline_id, route_id, aircraft_id, flight_number, departure_time, arrival_time, frequency, valid_from, valid_until, is_active)
							 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
							[airlineId, routeId, aircraftId, `${a.code}${100 + k}${di+1}`, `${depH}:00:00`, `${arrH}:30:00`, days[di], toISO(today), toISO(sixMonthsLater)]
						);
						scheduleCount++;
					}
				}
			}
		}

		// Seats for each aircraft (if not existing)
		const [seatExists] = await conn.query(`SELECT COUNT(*) as c FROM seats`);
		if (seatExists[0].c === 0) {
			for (const ac of aircraftRows) {
				// 30 rows × 6 columns (A-F) with different classes:
				// First Class: rows 1-2 (class_id 4)
				// Business: rows 3-5 (class_id 3)
				// Premium Economy: rows 6-8 (class_id 2)
				// Economy: rows 9-30 (class_id 1)
				for (let row=1; row<=30; row++) {
					for (const col of ['A','B','C','D','E','F']) {
						let classId;
						if (row <= 2) classId = 4; // First Class
						else if (row <= 5) classId = 3; // Business
						else if (row <= 8) classId = 2; // Premium Economy
						else classId = 1; // Economy
						
						await conn.execute(
							`INSERT INTO seats (aircraft_id, class_id, seat_number, seat_row, seat_column, is_window, is_aisle, is_middle, is_active)
							 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
							[
								ac.aircraft_id,
								classId,
								`${row}${col}`,
								row,
								col,
								col==='A' || col==='F' ? 1 : 0,
								col==='C' || col==='D' ? 1 : 0,
								col==='B' || col==='E' ? 1 : 0
							]
						);
					}
				}
			}
		}

		// Fares: per schedule for all seat classes
		const [schedules] = await conn.query(`SELECT schedule_id FROM flight_schedules`);
		for (const s of schedules) {
			const baseEco = randomInt(2500, 6500);
			const basePrem = baseEco * 1.5;
			const baseBiz = baseEco * 2.5;
			const baseFirst = baseEco * 4;
			
			// Economy (class_id 1)
			await conn.execute(
				`INSERT INTO fares (schedule_id, class_id, base_price, tax_amount, currency, valid_from, valid_until, is_active)
				 VALUES (?, 1, ?, 400.00, 'INR', ?, ?, 1)
				 ON DUPLICATE KEY UPDATE base_price=VALUES(base_price), tax_amount=VALUES(tax_amount), is_active=1`,
				[s.schedule_id, baseEco, toISO(today), toISO(sixMonthsLater)]
			);
			
			// Premium Economy (class_id 2)
			await conn.execute(
				`INSERT INTO fares (schedule_id, class_id, base_price, tax_amount, currency, valid_from, valid_until, is_active)
				 VALUES (?, 2, ?, 500.00, 'INR', ?, ?, 1)
				 ON DUPLICATE KEY UPDATE base_price=VALUES(base_price), tax_amount=VALUES(tax_amount), is_active=1`,
				[s.schedule_id, basePrem, toISO(today), toISO(sixMonthsLater)]
			);
			
			// Business (class_id 3)
			await conn.execute(
				`INSERT INTO fares (schedule_id, class_id, base_price, tax_amount, currency, valid_from, valid_until, is_active)
				 VALUES (?, 3, ?, 800.00, 'INR', ?, ?, 1)
				 ON DUPLICATE KEY UPDATE base_price=VALUES(base_price), tax_amount=VALUES(tax_amount), is_active=1`,
				[s.schedule_id, baseBiz, toISO(today), toISO(sixMonthsLater)]
			);
			
			// First Class (class_id 4)
			await conn.execute(
				`INSERT INTO fares (schedule_id, class_id, base_price, tax_amount, currency, valid_from, valid_until, is_active)
				 VALUES (?, 4, ?, 1200.00, 'INR', ?, ?, 1)
				 ON DUPLICATE KEY UPDATE base_price=VALUES(base_price), tax_amount=VALUES(tax_amount), is_active=1`,
				[s.schedule_id, baseFirst, toISO(today), toISO(sixMonthsLater)]
			);
		}

		await conn.commit();
		console.log('Seeding completed successfully');
	} catch (e) {
		await conn.rollback();
		console.error('Seeding failed:', e);
		process.exit(1);
	} finally {
		conn.release();
		process.exit(0);
	}
}

seed();


