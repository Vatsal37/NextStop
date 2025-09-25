import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../conf/apiClient';

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
});

export default function Register() {
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

	const onSubmit = async (values) => {
		await api.post('/auth/register', values);
		window.location.href = '/login';
	};

	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Register</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<input className="w-full border p-2 rounded" placeholder="Email" {...register('email')} />
				{errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
				<input type="password" className="w-full border p-2 rounded" placeholder="Password" {...register('password')} />
				{errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
				<input className="w-full border p-2 rounded" placeholder="First name" {...register('firstName')} />
				{errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
				<input className="w-full border p-2 rounded" placeholder="Last name" {...register('lastName')} />
				{errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
				<button disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded">Create account</button>
			</form>
		</div>
	);
}

