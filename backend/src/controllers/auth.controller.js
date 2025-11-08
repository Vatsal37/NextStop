import bcrypt from 'bcrypt';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signJwt } from '../utils/jwt.util.js';
import { createUser, findUserByEmail, findUserById, updateUserById } from '../models/user.model.js';

export const register = asyncHandler(async (req, res) => {
	const { email, password, firstName, lastName, phone, dateOfBirth, gender, nationality } = req.body;
	if (!email || !password || !firstName || !lastName) {
		throw new ApiError(400, 'email, password, firstName, lastName are required');
	}
	const existing = await findUserByEmail(email);
	if (existing) {
		throw new ApiError(409, 'Email already registered');
	}
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await createUser({ email, passwordHash, firstName, lastName, phone, dateOfBirth, gender, nationality });
	return res.status(201).json(new ApiResponse(201, { user } , 'User registered'));
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








