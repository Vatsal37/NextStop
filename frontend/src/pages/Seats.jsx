import React, { useEffect, useState } from 'react';
import api from '../conf/apiClient';

export default function Seats() {
	const params = new URLSearchParams(location.search);
	const scheduleId = params.get('s');
	const date = params.get('d');
	const [seats, setSeats] = useState([]);
	const [selected, setSelected] = useState([]);

	useEffect(() => {
		(async () => {
			const { data } = await api.get(`/flights/${scheduleId}/seats`, { params: { date } });
			setSeats(data.data.seats || data.data || []);
		})();
	}, [scheduleId, date]);

	const toggleSeat = (seat) => {
		setSelected((prev) => prev.find((s) => s.seat_id === seat.seat_id) ? prev.filter(s=>s.seat_id!==seat.seat_id) : [...prev, seat]);
	};

	const proceed = () => {
		const seatIds = selected.map(s=>s.seat_id);
		window.location.href = `/booking?s=${scheduleId}&d=${date}&seatIds=${seatIds.join(',')}`;
	};

	return (
		<div className="max-w-5xl mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Select seats</h1>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{seats.map((seat) => (
					<button key={seat.seat_id} onClick={()=>toggleSeat(seat)} className={`border rounded p-3 text-left ${selected.find(s=>s.seat_id===seat.seat_id)?'border-black':'border-gray-300'}`}>
						<div className="font-medium">{seat.seat_number}</div>
						<div className="text-sm text-gray-600">Class {seat.class_id}</div>
						<div className="text-sm">{seat.currency || 'INR'} {seat.total_price ?? 'N/A'}</div>
					</button>
				))}
			</div>
			{selected.length>0 && (
				<div className="mt-4 flex items-center justify-between">
					<div>{selected.length} seat(s) selected</div>
					<button onClick={proceed} className="bg-black text-white px-4 py-2 rounded">Continue</button>
				</div>
			)}
		</div>
	);
}

