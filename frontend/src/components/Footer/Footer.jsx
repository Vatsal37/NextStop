import React from 'react';

export default function Footer() {
	return (
		<footer className="mt-12 border-t">
			<div className="max-w-6xl mx-auto p-6 text-sm text-gray-600 flex items-center justify-between">
				<div>© {new Date().getFullYear()} NextStop</div>
				<a href="/" className="hover:underline">Home</a>
			</div>
		</footer>
	);
}

