import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authApi } from '../services/api.js';

export const loginThunk = createAsyncThunk(
	'auth/login',
	async ({ email, password }, { rejectWithValue }) => {
		try {
			const { data } = await authApi.login({ email, password });
			return data?.data || { token: null };
		} catch (err) {
			const message = err?.response?.data?.message || 'Login failed';
			return rejectWithValue(message);
		}
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState: { token: null, user: null, status: 'idle', error: null },
	reducers: {
		logout(state) {
			state.token = null;
			state.user = null;
			state.status = 'idle';
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginThunk.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(loginThunk.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.token = action.payload?.token || null;
				state.user = action.payload?.user || null;
			})
			.addCase(loginThunk.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload || 'Login failed';
			});
	},
});

export const { logout } = authSlice.actions;

const persistConfig = { key: 'root', storage, whitelist: ['auth'] };

const rootReducer = (state, action) => ({
	auth: authSlice.reducer(state?.auth, action),
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export const persistor = persistStore(store);


