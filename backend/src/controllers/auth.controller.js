import bcrypt from 'bcrypt';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signJwt } from '../utils/jwt.util.js';
import { createUser, findUserByEmail } from '../models/user.model.js';

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






