import { ApiError } from '../utils/ApiError.js';

const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

const adminGuard = (req, res, next) => {
	const email = req.user?.email?.toLowerCase();
	if (!email || !adminEmails.includes(email)) {
		return next(new ApiError(403, 'Admin access required'));
	}
	return next();
};

export default adminGuard;


