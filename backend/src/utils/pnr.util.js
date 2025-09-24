import { randomUUID } from 'crypto';

export const generatePNR = () => {
	// 6-character alphanumeric PNR derived from UUID
	const base = randomUUID().replace(/-/g, '').toUpperCase();
	return base.slice(0, 6);
};





