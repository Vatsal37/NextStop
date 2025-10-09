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
};


