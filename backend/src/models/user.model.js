import { pool } from '../db/db.js';

export const findUserByEmail = async (email) => {
	const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
	return rows[0] || null;
};

export const createUser = async ({ email, passwordHash, firstName, lastName, phone, dateOfBirth, gender, nationality, emailVerified = false }) => {
	const [result] = await pool.execute(
		`INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, gender, nationality, email_verified)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[email, passwordHash, firstName, lastName, phone || null, dateOfBirth || null, gender || null, nationality || null, emailVerified]
	);
	return { user_id: result.insertId, email, first_name: firstName, last_name: lastName, email_verified: emailVerified };
};

export const verifyUserEmail = async (email) => {
	const [result] = await pool.execute(
		'UPDATE users SET email_verified = TRUE WHERE email = ?',
		[email]
	);
	return result.affectedRows > 0;
};

export const findUserById = async (userId) => {
	// Use DATE_FORMAT to return date as string (YYYY-MM-DD) without time component
	// This prevents timezone conversion issues
	const [rows] = await pool.execute(
		`SELECT user_id, email, first_name, last_name, phone, gender, email_verified,
		 DATE_FORMAT(date_of_birth, '%Y-%m-%d') as date_of_birth, nationality 
		 FROM users WHERE user_id = ? LIMIT 1`, 
		[userId]
	);
	return rows[0] || null;
};

export const updateUserById = async (userId, { firstName, lastName, phone, dateOfBirth, gender, nationality }) => {
    const fields = [];
    const values = [];

    if (firstName !== undefined) { fields.push('first_name = ?'); values.push(firstName); }
    if (lastName !== undefined) { fields.push('last_name = ?'); values.push(lastName); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone || null); }
    if (dateOfBirth !== undefined) { fields.push('date_of_birth = ?'); values.push(dateOfBirth || null); }
    if (gender !== undefined) { fields.push('gender = ?'); values.push(gender || null); }
    if (nationality !== undefined) { fields.push('nationality = ?'); values.push(nationality || null); }

    if (fields.length === 0) return;

    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
    values.push(userId);
    await pool.execute(sql, values);
    return await findUserById(userId);
}

export const updateUserPasswordByEmail = async (email, passwordHash) => {
	const [result] = await pool.execute(
		'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
		[passwordHash, email]
	);
	return result.affectedRows > 0;
}








