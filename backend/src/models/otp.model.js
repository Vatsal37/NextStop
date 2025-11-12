import { pool } from '../db/db.js';

// Generate a 6-digit OTP
export const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in database
export const storeOTP = async (email, otpCode, expiresInMinutes = 10) => {
	const expiresAt = new Date();
	expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

	// Delete any existing OTPs for this email
	await pool.execute('DELETE FROM email_otps WHERE email = ?', [email]);

	// Insert new OTP
	const [result] = await pool.execute(
		'INSERT INTO email_otps (email, otp_code, expires_at) VALUES (?, ?, ?)',
		[email, otpCode, expiresAt]
	);

	return result.insertId;
};

// Check OTP without deleting it
export const checkOTP = async (email, otpCode) => {
	const [rows] = await pool.execute(
		'SELECT * FROM email_otps WHERE email = ? AND otp_code = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
		[email, otpCode]
	);

	return rows.length > 0;
};

// Verify OTP
export const verifyOTP = async (email, otpCode) => {
	const [rows] = await pool.execute(
		'SELECT * FROM email_otps WHERE email = ? AND otp_code = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
		[email, otpCode]
	);

	if (rows.length === 0) {
		return false;
	}

	// Delete the used OTP
	await pool.execute('DELETE FROM email_otps WHERE email = ? AND otp_code = ?', [email, otpCode]);

	return true;
};

// Get the last OTP creation time for an email
export const getLastOTPCreatedAt = async (email) => {
	const [rows] = await pool.execute(
		'SELECT created_at FROM email_otps WHERE email = ? ORDER BY created_at DESC LIMIT 1',
		[email]
	);
	return rows.length > 0 ? rows[0].created_at : null;
};

// Check if OTP can be resent (not within last minute) and return remaining seconds
export const canResendOTP = async (email, cooldownMinutes = 1) => {
	const lastCreated = await getLastOTPCreatedAt(email);
	if (!lastCreated) {
		return { canResend: true, remainingSeconds: 0 }; // No previous OTP, can send
	}
	
	const lastCreatedDate = new Date(lastCreated);
	const now = new Date();
	const diffSeconds = (now - lastCreatedDate) / 1000;
	const cooldownSeconds = cooldownMinutes * 60;
	const remainingSeconds = Math.ceil(cooldownSeconds - diffSeconds);
	
	return {
		canResend: remainingSeconds <= 0,
		remainingSeconds: remainingSeconds > 0 ? remainingSeconds : 0
	};
};

// Clean up expired OTPs (can be called periodically)
export const cleanupExpiredOTPs = async () => {
	const [result] = await pool.execute('DELETE FROM email_otps WHERE expires_at < NOW()');
	return result.affectedRows;
};

