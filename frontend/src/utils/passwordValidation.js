/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters long
 * - Include a number
 * - Include a special character
 * 
 * @param {string} password - The password to validate
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
	const errors = [];
	
	if (!password) {
		return { isValid: false, errors: ['Password is required'] };
	}
	
	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long');
	}
	
	if (!/[0-9]/.test(password)) {
		errors.push('Password must include a number');
	}
	
	if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
		errors.push('Password must include a special character');
	}
	
	return {
		isValid: errors.length === 0,
		errors
	};
};

/**
 * Checks if two passwords match
 * @param {string} password - The password
 * @param {string} confirmPassword - The confirmation password
 * @returns {boolean}
 */
export const passwordsMatch = (password, confirmPassword) => {
	return password === confirmPassword;
};

