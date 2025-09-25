import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from './Layout.jsx';

const Login = React.lazy(() => import('./pages/auth/Login.jsx'));
const Register = React.lazy(() => import('./pages/auth/Register.jsx'));
const Search = React.lazy(() => import('./pages/Search.jsx'));
const Seats = React.lazy(() => import('./pages/Seats.jsx'));
const Booking = React.lazy(() => import('./pages/Booking.jsx'));
const BookingDetail = React.lazy(() => import('./pages/BookingDetail.jsx'));
const AdminAddFlight = React.lazy(() => import('./pages/admin/AddFlight.jsx'));

const router = createBrowserRouter([
	{
		path: '/',
		element: <Layout />,
		children: [
			{ index: true, element: <Search /> },
			{ path: 'login', element: <Login /> },
			{ path: 'register', element: <Register /> },
			{ path: 'seats', element: <Seats /> },
			{ path: 'booking', element: <Booking /> },
			{ path: 'booking/:pnr', element: <BookingDetail /> },
			{ path: 'admin/flights/new', element: <AdminAddFlight /> },
		],
	},
]);

export default function App() {
	return (
		<Suspense fallback={<div className="p-6">Loading...</div>}>
			<RouterProvider router={router} />
		</Suspense>
	);
}
