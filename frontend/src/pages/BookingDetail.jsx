import React, { useEffect, useState } from 'react';
import api from '../conf/apiClient';
import { useParams } from 'react-router';

export default function BookingDetail() {
	const { pnr } = useParams();
	const [data, setData] = useState(null);

	useEffect(() => {
		(async () => {
			const res = await api.get(`/bookings/${pnr}`);
			setData(res.data.data);
		})();
	}, [pnr]);

	if (!data) return <div className="p-6">Loading...</div>;
	return (
		<div className="max-w-3xl mx-auto p-6 space-y-3">
			<h1 className="text-2xl font-semibold">Booking {pnr}</h1>
			<div className="border p-3 rounded">
				<div>Status: {data.booking.booking_status}</div>
				<div>Total: {data.booking.currency} {data.booking.total_amount}</div>
			</div>
			<div>
				<h2 className="font-medium mb-2">Tickets</h2>
				<div className="space-y-2">
					{data.tickets.map(t => (
						<div key={t.ticket_id} className="border p-3 rounded">
							<div>{t.first_name} {t.last_name}</div>
							<div>Seat: {t.seat_number}</div>
							<div>Status: {t.ticket_status}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

