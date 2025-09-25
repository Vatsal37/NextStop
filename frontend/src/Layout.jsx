import React, { Suspense } from 'react';
import { Outlet } from 'react-router';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

export default function Layout() {
	return (
		<>
			<Header />
			<Suspense fallback={<div className="p-6">Loading...</div>}>
				<Outlet />
			</Suspense>
			<Footer />
		</>
	);
}

