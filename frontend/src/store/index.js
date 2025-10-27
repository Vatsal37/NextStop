import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authApi, flightsApi } from '../services/api.js';

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

export const searchFlightsThunk = createAsyncThunk(
	'flights/search',
	async ({ source, destination, date, page = 1, limit = 20, classId }, { rejectWithValue }) => {
		try {
			const { data } = await flightsApi.search({ source, destination, date, page, limit, classId });
			
			// Add the search date and class to each flight result
			const items = (data?.data?.items || []).map(item => ({
				...item,
				flight_date: date // Add the search date to each flight
			}));
			return { items, page, limit };
		} catch (err) {
			const message = err?.response?.data?.message || 'Flight search failed';
			return rejectWithValue(message);
		}
	}
);

// Search slice for managing search data
const searchSlice = createSlice({
	name: 'search',
	initialState: {
		from: '',
		to: '',
		departureDate: null,
		seatClass: '1' // Default to Economy
	},
	reducers: {
		setSearchData(state, action) {
			state.from = action.payload.from || '';
			state.to = action.payload.to || '';
			state.departureDate = action.payload.departureDate || null;
			state.seatClass = action.payload.seatClass || '1';
		},
		clearSearchData(state) {
			state.from = '';
			state.to = '';
			state.departureDate = null;
			state.seatClass = '1';
		},
		updateSearchField(state, action) {
			const { field, value } = action.payload;
			state[field] = value;
		}
	}
});

export const { setSearchData, clearSearchData, updateSearchField } = searchSlice.actions;

// Flights slice for managing flight search results
const flightsSlice = createSlice({
	name: 'flights',
	initialState: {
		searchResults: [],
		loading: false,
		error: null,
		lastSearch: null
	},
	reducers: {
		clearSearchResults(state) {
			state.searchResults = [];
			state.error = null;
			state.lastSearch = null;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(searchFlightsThunk.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(searchFlightsThunk.fulfilled, (state, action) => {
				state.loading = false;
				state.searchResults = action.payload.items || [];
				state.lastSearch = action.meta.arg;
			})
			.addCase(searchFlightsThunk.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || 'Flight search failed';
				state.searchResults = [];
			});
	}
});

export const { clearSearchResults } = flightsSlice.actions;

const persistConfig = { key: 'root', storage, whitelist: ['auth'] };

const rootReducer = (state, action) => ({
	auth: authSlice.reducer(state?.auth, action),
	search: searchSlice.reducer(state?.search, action),
	flights: flightsSlice.reducer(state?.flights, action),
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export const persistor = persistStore(store);


