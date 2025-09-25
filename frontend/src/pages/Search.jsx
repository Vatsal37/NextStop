import React, { useState } from 'react';
import api from '../conf/apiClient';

export default function Search() {
	const [source, setSource] = useState('DEL');
	const [destination, setDestination] = useState('BOM');
	const [date, setDate] = useState('2025-09-23');
	const [results, setResults] = useState([]);

	const onSearch = async () => {
		const { data } = await api.get(`/flights/search`, { params: { source, destination, date } });
		setResults(data.data.items || data.data || []);
	};

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Search Flights</h1>
			<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
				<input className="border p-2 rounded" value={source} onChange={(e)=>setSource(e.target.value)} placeholder="Source (IATA)" />
				<input className="border p-2 rounded" value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder="Destination (IATA)" />
				<input type="date" className="border p-2 rounded" value={date} onChange={(e)=>setDate(e.target.value)} />
				<button onClick={onSearch} className="bg-black text-white px-4 py-2 rounded">Search</button>
			</div>
			<div className="space-y-2">
				{results.map((r) => (
					<div key={r.schedule_id} className="border rounded p-3 flex items-center justify-between">
						<div>
							<div className="font-medium">{r.airline_name} {r.flight_number}</div>
							<div className="text-sm text-gray-600">Valid {r.valid_from} to {r.valid_until}</div>
						</div>
						<a className="text-blue-600" href={`/seats?s=${r.schedule_id}&d=${date}`}>View seats</a>
					</div>
				))}
			</div>
		</div>
	);
}

