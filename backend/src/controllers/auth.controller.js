import bcrypt from 'bcrypt';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signJwt } from '../utils/jwt.util.js';
import { createUser, findUserByEmail, findUserById, updateUserById, verifyUserEmail, updateUserPasswordByEmail } from '../models/user.model.js';
import { generateOTP, storeOTP, verifyOTP, checkOTP, canResendOTP } from '../models/otp.model.js';
import { sendOTPEmail, sendForgotPasswordOTPEmail } from '../utils/email.util.js';

export const register = asyncHandler(async (req, res) => {
	const { email, password, firstName, lastName, phone, dateOfBirth, gender, nationality } = req.body;
	if (!email || !password || !firstName || !lastName) {
		throw new ApiError(400, 'email, password, firstName, lastName are required');
	}
	const existing = await findUserByEmail(email);
	if (existing) {
		// Check if user is unverified
		if (!existing.email_verified) {
			// Return special response indicating user should go to verification page
			return res.status(200).json(new ApiResponse(200, { 
				redirectToVerification: true,
				email,
				message: 'Email already registered but not verified. Please verify your email.' 
			}, 'Please verify your email'));
		}
		// User is verified, throw error
		throw new ApiError(409, 'Email already registered');
	}
	const passwordHash = await bcrypt.hash(password, 10);
	// Create user with email_verified = false
	const user = await createUser({ email, passwordHash, firstName, lastName, phone, dateOfBirth, gender, nationality, emailVerified: false });
	
	// Generate and store OTP
	const otpCode = generateOTP();
	await storeOTP(email, otpCode, 10); // OTP expires in 10 minutes
	
	// Send OTP email
	try {
		await sendOTPEmail(email, otpCode, firstName);
	} catch (error) {
		console.error('[REGISTER] Failed to send OTP email:', error);
		// Don't fail registration if email fails, but log it
		// In production, you might want to handle this differently
	}
	
	return res.status(201).json(new ApiResponse(201, { user, message: 'Registration successful. Please check your email for OTP verification.' }, 'User registered. Please verify your email.'));
});

export const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		throw new ApiError(400, 'email and password are required');
	}
	const user = await findUserByEmail(email);
	if (!user) {
		throw new ApiError(401, 'Invalid credentials');
	}
	const ok = await bcrypt.compare(password, user.password_hash);
	if (!ok) {
		throw new ApiError(401, 'Invalid credentials');
	}
	// Check if email is verified
	if (!user.email_verified) {
		throw new ApiError(403, 'Please verify your email before logging in. Check your inbox for the OTP code.');
	}
	const token = signJwt({ userId: user.user_id, email: user.email });
	return res.json(new ApiResponse(200, { token }, 'Login successful'));
});

export const me = asyncHandler(async (req, res) => {
    const userId = req?.user?.userId;
    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    const user = await findUserById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    
    // date_of_birth is already formatted as YYYY-MM-DD string from the SQL query
    // No additional formatting needed
    
    
    return res.json(new ApiResponse(200, { user }, 'Current user'));
});

export const verifyEmail = asyncHandler(async (req, res) => {
	const { email, otp } = req.body;
	if (!email || !otp) {
		throw new ApiError(400, 'email and otp are required');
	}
	
	// Verify OTP
	const isValid = await verifyOTP(email, otp);
	if (!isValid) {
		throw new ApiError(400, 'Invalid or expired OTP code');
	}
	
	// Verify user email in database
	const verified = await verifyUserEmail(email);
	if (!verified) {
		throw new ApiError(404, 'User not found');
	}
	
	return res.json(new ApiResponse(200, { message: 'Email verified successfully' }, 'Email verified successfully'));
});

export const resendOTP = asyncHandler(async (req, res) => {
	const { email } = req.body;
	if (!email) {
		throw new ApiError(400, 'email is required');
	}
	
	const user = await findUserByEmail(email);
	if (!user) {
		throw new ApiError(404, 'User not found');
	}
	
	if (user.email_verified) {
		throw new ApiError(400, 'Email is already verified');
	}
	
	// Check if OTP was sent within the last minute
	const { canResend, remainingSeconds } = await canResendOTP(email, 1);
	if (!canResend) {
		const error = new ApiError(429, `Please wait ${remainingSeconds} seconds before requesting a new OTP`, { remainingSeconds });
		error.remainingSeconds = remainingSeconds;
		throw error;
	}
	
	// Generate and store new OTP
	const otpCode = generateOTP();
	await storeOTP(email, otpCode, 10);
	
	// Send OTP email
	try {
		await sendOTPEmail(email, otpCode, user.first_name);
	} catch (error) {
		console.error('[RESEND_OTP] Failed to send OTP email:', error);
		throw new ApiError(500, 'Failed to send OTP email. Please try again later.');
	}
	
	return res.json(new ApiResponse(200, { message: 'OTP sent successfully' }, 'OTP sent to your email'));
});

export const updateMe = asyncHandler(async (req, res) => {
    const userId = req?.user?.userId;
    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    const {
        firstName,
        lastName,
        phone,
        dateOfBirth, // expected 'YYYY-MM-DD'
        gender,      // expected 'Male' | 'Female' | 'Other'
        nationality  // expected two-letter code like 'US'
    } = req.body || {};

    // Basic normalization/sanitization
    let normalizedGender = undefined;
    if (typeof gender === 'string' && gender.trim()) {
        const g = gender.trim().toLowerCase();
        if (g.startsWith('m')) normalizedGender = 'Male';
        else if (g.startsWith('f')) normalizedGender = 'Female';
        else normalizedGender = 'Other';
    }

    let normalizedDob = undefined;
    if (typeof dateOfBirth === 'string' && dateOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
        normalizedDob = dateOfBirth;
    }

    const updated = await updateUserById(userId, {
        firstName,
        lastName,
        phone,
        dateOfBirth: normalizedDob,
        gender: normalizedGender !== undefined ? normalizedGender : undefined,
        nationality,
    });

    return res.json(new ApiResponse(200, { user: updated }, 'Profile updated'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;
	if (!email) {
		throw new ApiError(400, 'email is required');
	}
	
	const user = await findUserByEmail(email);
	if (!user) {
		// Don't reveal if user exists or not for security
		return res.json(new ApiResponse(200, { message: 'If the email exists, an OTP has been sent.' }, 'OTP sent'));
	}
	
	// Check if OTP was sent within the last minute (using prefixed email for password reset)
	const { canResend, remainingSeconds } = await canResendOTP(`reset_${email}`, 1);
	if (!canResend) {
		const error = new ApiError(429, `Please wait ${remainingSeconds} seconds before requesting a new OTP`, { remainingSeconds });
		error.remainingSeconds = remainingSeconds;
		throw error;
	}
	
	// Generate and store OTP with a special prefix to distinguish from email verification OTPs
	const otpCode = generateOTP();
	// Store OTP with a prefix to identify it as a password reset OTP
	await storeOTP(`reset_${email}`, otpCode, 10);
	
	// Send OTP email
	try {
		await sendForgotPasswordOTPEmail(email, otpCode, user.first_name);
	} catch (error) {
		console.error('[FORGOT_PASSWORD] Failed to send OTP email:', error);
		throw new ApiError(500, 'Failed to send OTP email. Please try again later.');
	}
	
	return res.json(new ApiResponse(200, { message: 'OTP sent successfully' }, 'OTP sent to your email'));
});

export const verifyForgotPasswordOTP = asyncHandler(async (req, res) => {
	const { email, otp } = req.body;
	if (!email || !otp) {
		throw new ApiError(400, 'email and otp are required');
	}
	
	// Verify and delete OTP immediately after verification
	const isValid = await verifyOTP(`reset_${email}`, otp);
	if (!isValid) {
		throw new ApiError(400, 'Invalid or expired OTP code');
	}
	
	// Return success - frontend will proceed to password reset step
	return res.json(new ApiResponse(200, { message: 'OTP verified successfully' }, 'OTP verified'));
});

export const resetPassword = asyncHandler(async (req, res) => {
	const { email, newPassword } = req.body;
	if (!email || !newPassword) {
		throw new ApiError(400, 'email and newPassword are required');
	}
	
	// OTP is already verified and deleted in verifyForgotPasswordOTP step
	// Just check if user exists and update password
	const user = await findUserByEmail(email);
	if (!user) {
		throw new ApiError(404, 'User not found');
	}
	
	// Hash new password
	const passwordHash = await bcrypt.hash(newPassword, 10);
	
	// Update password
	const updated = await updateUserPasswordByEmail(email, passwordHash);
	if (!updated) {
		throw new ApiError(500, 'Failed to update password');
	}
	
	return res.json(new ApiResponse(200, { message: 'Password reset successfully' }, 'Password reset successfully'));
});








