import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
if (!process.env.JWT_SECRET) {
	console.warn('[JWT] JWT_SECRET not set in environment; using development default. Set JWT_SECRET in backend/.env');
}

export const signJwt = (payload, options = {}) => {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || '7d',
		...options
	});
};

export const verifyJwt = (token) => {
	return jwt.verify(token, JWT_SECRET);
};


