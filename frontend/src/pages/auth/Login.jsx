import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../conf/apiClient';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export default function Login() {
	const dispatch = useDispatch();
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

	const onSubmit = async (values) => {
		const { data } = await api.post('/auth/login', values);
		dispatch(setCredentials({ token: data.data.token }));
		window.location.href = '/';
	};

	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Login</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<input className="w-full border p-2 rounded" placeholder="Email" {...register('email')} />
				{errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
				<input type="password" className="w-full border p-2 rounded" placeholder="Password" {...register('password')} />
				{errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
				<button disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded">Login</button>
			</form>
		</div>
	);
}

