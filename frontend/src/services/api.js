import axios from 'axios';

const API_BASE_URL = '/api/v1';

export const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: false,
});

api.interceptors.request.use((config) => {
	try {
		// Read token from redux-persist structure
		const rootRaw = localStorage.getItem('persist:root');
		if (rootRaw) {
			const root = JSON.parse(rootRaw);
			// Each slice is stringified inside persist:root
			const authSliceRaw = root?.auth;
			if (authSliceRaw) {
				const authSlice = JSON.parse(authSliceRaw);
				const token = authSlice?.token;
				if (token) {
					config.headers = config.headers || {};
					config.headers.Authorization = `Bearer ${token}`;
				}
			}
		}
	} catch {}
	return config;
});

export const authApi = {
	login: (payload) => api.post('/auth/login', payload),
	register: (payload) => api.post('/auth/register', payload),
	verifyEmail: (payload) => api.post('/auth/verify-email', payload),
	resendOTP: (payload) => api.post('/auth/resend-otp', payload),
	forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
	verifyForgotPasswordOTP: (payload) => api.post('/auth/verify-forgot-password-otp', payload),
	resetPassword: (payload) => api.post('/auth/reset-password', payload),
    me: () => api.get('/auth/me'),
    updateMe: (payload) => api.put('/auth/me', payload),
};


export const airportsApi = {
    list: (params) => api.get('/airports', { params }),
};

export const flightsApi = {
    search: (params) => api.get('/flights/search', { params }),
    getSeats: (id, params) => api.get(`/flights/${id}/seats`, { params }),
    getStatus: (id, params) => api.get(`/flights/${id}/status`, { params }),
};

export const bookingsApi = {
    create: (payload) => api.post('/bookings', payload),
    getByPnr: (pnr) => api.get(`/bookings/${pnr}`),
    getMyBookings: () => api.get('/bookings/my-bookings'),
};

export const paymentsApi = {
    create: (payload) => api.post('/payments', payload),
    getByBookingId: (bookingId) => api.get(`/payments/${bookingId}`),
};


