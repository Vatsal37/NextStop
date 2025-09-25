import { pool } from '../db/db.js';

export const findUserByEmail = async (email) => {
	const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
	return rows[0] || null;
};

export const createUser = async ({ email, passwordHash, firstName, lastName, phone, dateOfBirth, gender, nationality }) => {
	const [result] = await pool.execute(
		`INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, gender, nationality)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		[email, passwordHash, firstName, lastName, phone || null, dateOfBirth || null, gender || null, nationality || null]
	);
	return { user_id: result.insertId, email, first_name: firstName, last_name: lastName };
};

export const findUserById = async (userId) => {
	const [rows] = await pool.execute('SELECT user_id, email, first_name, last_name, phone FROM users WHERE user_id = ? LIMIT 1', [userId]);
	return rows[0] || null;
};








