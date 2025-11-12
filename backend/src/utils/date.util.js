/**
 * Format date values from MySQL to consistent ISO 8601 format
 * Handles DATE, DATETIME, and TIMESTAMP fields
 */

export const formatDateForResponse = (dateValue) => {
	if (!dateValue) return null;
	
	// If it's already a string in YYYY-MM-DD format, return as is
	if (typeof dateValue === 'string') {
		// Check if it's a date string (YYYY-MM-DD)
		if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
			return dateValue;
		}
		// Check if it's a datetime string (YYYY-MM-DD HH:MM:SS)
		if (dateValue.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
			// Convert to ISO 8601 format
			return dateValue.replace(' ', 'T') + '.000Z';
		}
		// If it's already an ISO string, return as is
		if (dateValue.includes('T') || dateValue.includes('Z')) {
			return dateValue;
		}
	}
	
	// If it's a Date object, convert to ISO string
	if (dateValue instanceof Date) {
		return dateValue.toISOString();
	}
	
	// Try to parse as date
	try {
		const date = new Date(dateValue);
		if (!isNaN(date.getTime())) {
			return date.toISOString();
		}
	} catch (e) {
		// Ignore parsing errors
	}
	
	return dateValue;
};

/**
 * Format a date-only value (no time component) as YYYY-MM-DD
 */
export const formatDateOnly = (dateValue) => {
	if (!dateValue) return null;
	
	if (typeof dateValue === 'string') {
		// If it's already YYYY-MM-DD, return as is
		if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
			return dateValue;
		}
		// If it's a datetime string, extract just the date part
		if (dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
			return dateValue.split(' ')[0].split('T')[0];
		}
	}
	
	if (dateValue instanceof Date) {
		const year = dateValue.getFullYear();
		const month = String(dateValue.getMonth() + 1).padStart(2, '0');
		const day = String(dateValue.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
	
	try {
		const date = new Date(dateValue);
		if (!isNaN(date.getTime())) {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		}
	} catch (e) {
		// Ignore parsing errors
	}
	
	return dateValue;
};

/**
 * Format time-only value as HH:MM:SS
 */
export const formatTimeOnly = (timeValue) => {
	if (!timeValue) return null;
	
	if (typeof timeValue === 'string') {
		// If it's already HH:MM:SS, return as is
		if (timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
			return timeValue;
		}
		// If it's a datetime string, extract just the time part
		if (timeValue.match(/\d{2}:\d{2}:\d{2}/)) {
			const match = timeValue.match(/(\d{2}:\d{2}:\d{2})/);
			return match ? match[1] : timeValue;
		}
	}
	
	if (timeValue instanceof Date) {
		const hours = String(timeValue.getHours()).padStart(2, '0');
		const minutes = String(timeValue.getMinutes()).padStart(2, '0');
		const seconds = String(timeValue.getSeconds()).padStart(2, '0');
		return `${hours}:${minutes}:${seconds}`;
	}
	
	return timeValue;
};

/**
 * Recursively format all date fields in an object
 */
export const formatDatesInObject = (obj, dateFields = []) => {
	if (!obj || typeof obj !== 'object') return obj;
	
	if (Array.isArray(obj)) {
		return obj.map(item => formatDatesInObject(item, dateFields));
	}
	
	const formatted = { ...obj };
	
	// Common date field names
	const commonDateFields = [
		'date', 'date_of_birth', 'birth_date', 'dob',
		'created_at', 'updated_at', 'booking_date', 'expiry_time',
		'flight_date', 'valid_from', 'valid_until',
		'issued_at', 'check_in_time', 'boarding_time',
		'issued_at', 'departure_date', 'arrival_date'
	];
	
	// Combine common fields with provided fields
	const allDateFields = [...new Set([...commonDateFields, ...dateFields])];
	
	for (const key in formatted) {
		// Check if this field should be formatted as date
		if (allDateFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
			// Format as date-only (YYYY-MM-DD)
			formatted[key] = formatDateOnly(formatted[key]);
		}
		// Check if it's a datetime/timestamp field
		else if (key.toLowerCase().includes('_at') || 
		         key.toLowerCase().includes('_time') ||
		         key.toLowerCase().includes('timestamp')) {
			// Format as ISO 8601 datetime
			formatted[key] = formatDateForResponse(formatted[key]);
		}
		// Recursively format nested objects
		else if (typeof formatted[key] === 'object' && formatted[key] !== null) {
			formatted[key] = formatDatesInObject(formatted[key], dateFields);
		}
	}
	
	return formatted;
};












