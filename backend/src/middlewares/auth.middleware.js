import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

const authMiddleware = (req, res, next) => {
	try {
		const authHeader = req.headers['authorization'] || '';
		const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
		if (!token) {
			throw new ApiError(401, 'Authentication token missing');
		}
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = payload;
		return next();
	} catch (err) {
		return next(new ApiError(401, 'Invalid or expired token'));
	}
};

export default authMiddleware;





