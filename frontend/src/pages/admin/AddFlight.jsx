import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../../conf/apiClient';

export default function AddFlight() {
	const { register, handleSubmit, formState: { isSubmitting } } = useForm();
	const onSubmit = async (values) => {
		await api.post('/flights', values);
		alert('Flight created');
	};
	return (
		<div className="max-w-xl mx-auto p-6 space-y-3">
			<h1 className="text-2xl font-semibold">Add Flight</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<input className="border p-2 rounded w-full" placeholder="airlineId" {...register('airlineId')} />
				<input className="border p-2 rounded w-full" placeholder="routeId" {...register('routeId')} />
				<input className="border p-2 rounded w-full" placeholder="aircraftId" {...register('aircraftId')} />
				<input className="border p-2 rounded w-full" placeholder="flightNumber" {...register('flightNumber')} />
				<input className="border p-2 rounded w-full" placeholder="departureTime (HH:MM:SS)" {...register('departureTime')} />
				<input className="border p-2 rounded w-full" placeholder="arrivalTime (HH:MM:SS)" {...register('arrivalTime')} />
				<select className="border p-2 rounded w-full" {...register('frequency')}>
					<option value="DAILY">DAILY</option>
					<option value="WEEKLY_MON">WEEKLY_MON</option>
					<option value="WEEKLY_WED">WEEKLY_WED</option>
					<option value="WEEKLY_FRI">WEEKLY_FRI</option>
				</select>
				<input type="date" className="border p-2 rounded w-full" placeholder="validFrom" {...register('validFrom')} />
				<input type="date" className="border p-2 rounded w-full" placeholder="validUntil" {...register('validUntil')} />
				<button disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded">Create</button>
			</form>
		</div>
	);
}

