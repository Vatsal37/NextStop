import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../conf/apiClient';

const schema = z.object({
	passengers: z.array(z.object({
		first_name: z.string().min(1),
		last_name: z.string().min(1),
		date_of_birth: z.string().min(1),
		gender: z.string().min(1),
		nationality: z.string().min(1),
	})).min(1),
	contactEmail: z.string().email(),
	contactPhone: z.string().min(5),
});

export default function Booking() {
	const params = new URLSearchParams(location.search);
	const scheduleId = Number(params.get('s'));
	const flightDate = params.get('d');
	const seatIds = (params.get('seatIds')||'').split(',').filter(Boolean).map(Number);

	const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
		defaultValues: {
			passengers: [{ first_name: '', last_name: '', date_of_birth: '', gender: 'Male', nationality: 'IN' }],
			contactEmail: '',
			contactPhone: '',
		},
		resolver: zodResolver(schema),
	});
	const { fields, append, remove } = useFieldArray({ control, name: 'passengers' });

	const onSubmit = async (values) => {
		const body = {
			scheduleId,
			flightDate,
			fareAmountPerPassenger: 0, // server can compute or ignore
			contactEmail: values.contactEmail,
			contactPhone: values.contactPhone,
			passengers: values.passengers,
			seatIds,
		};
		const { data } = await api.post('/bookings', body);
		window.location.href = `/booking/${data.data.pnr}`;
	};

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Passenger details</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				{fields.map((field, idx) => (
					<div key={field.id} className="grid md:grid-cols-2 gap-3 border p-3 rounded">
						<input className="border p-2 rounded" placeholder="First name" {...register(`passengers.${idx}.first_name`)} />
						<input className="border p-2 rounded" placeholder="Last name" {...register(`passengers.${idx}.last_name`)} />
						<input type="date" className="border p-2 rounded" {...register(`passengers.${idx}.date_of_birth`)} />
						<select className="border p-2 rounded" {...register(`passengers.${idx}.gender`)}>
							<option value="Male">Male</option>
							<option value="Female">Female</option>
							<option value="Other">Other</option>
						</select>
						<input className="border p-2 rounded" placeholder="Nationality" {...register(`passengers.${idx}.nationality`)} />
						<button type="button" onClick={()=>remove(idx)} className="text-red-600">Remove</button>
					</div>
				))}
				<button type="button" onClick={()=>append({ first_name:'', last_name:'', date_of_birth:'', gender:'Male', nationality:'IN' })} className="text-blue-600">+ Add passenger</button>
				<div className="grid md:grid-cols-2 gap-3">
					<input className="border p-2 rounded" placeholder="Contact email" {...register('contactEmail')} />
					<input className="border p-2 rounded" placeholder="Contact phone" {...register('contactPhone')} />
				</div>
				<button disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded">Confirm booking</button>
			</form>
		</div>
	);
}

