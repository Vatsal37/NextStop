import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

export default function Header() {
	const token = useSelector(s=>s.auth.token);
	const dispatch = useDispatch();
	return (
		<header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
			<div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
				<a href="/" className="font-semibold text-lg">NextStop</a>
				<nav className="hidden md:flex gap-4 text-sm">
					<a href="/" className="hover:underline">Search</a>
					<a href="/booking" className="hover:underline">Booking</a>
					<a href="/admin/flights/new" className="hover:underline">Admin</a>
				</nav>
				<div className="flex gap-2">
					{token ? (
						<button onClick={()=>dispatch(logout())} className="px-3 py-1.5 border rounded">Logout</button>
					) : (
						<>
							<a href="/login" className="px-3 py-1.5 border rounded">Login</a>
							<a href="/register" className="px-3 py-1.5 bg-black text-white rounded">Sign up</a>
						</>
					)}
				</div>
			</div>
		</header>
	);
}

