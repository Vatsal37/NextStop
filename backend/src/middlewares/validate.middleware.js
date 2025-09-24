import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';

export const validateBody = (schema) => (req, res, next) => {
	const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
	if (error) return next(new ApiError(400, error.message));
	req.body = value;
	return next();
};

export const validateQuery = (schema) => (req, res, next) => {
	const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
	if (error) return next(new ApiError(400, error.message));
    // In Express 5, req.query is a getter-only property. Merge instead of reassigning.
    Object.assign(req.query, value);
	return next();
};

export const schemas = {
	authLogin: Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required()
	}),
	authRegister: Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required(),
		firstName: Joi.string().required(),
		lastName: Joi.string().required(),
		phone: Joi.string().optional(),
		dateOfBirth: Joi.string().optional(),
		gender: Joi.string().valid('Male','Female','Other').optional(),
		nationality: Joi.string().optional()
	}),
	flightSearch: Joi.object({
		source: Joi.string().length(3).required(),
		destination: Joi.string().length(3).required(),
		date: Joi.string().isoDate().required(),
		page: Joi.number().integer().min(1).default(1),
		limit: Joi.number().integer().min(1).max(100).default(20)
	}),
	addFlight: Joi.object({
		airlineId: Joi.number().integer().required(),
		routeId: Joi.number().integer().required(),
		aircraftId: Joi.number().integer().required(),
		flightNumber: Joi.string().required(),
		departureTime: Joi.string().required(),
		arrivalTime: Joi.string().required(),
		frequency: Joi.string().required(),
		validFrom: Joi.string().isoDate().required(),
		validUntil: Joi.string().isoDate().required()
	}),
	createBooking: Joi.object({
		scheduleId: Joi.number().integer().required(),
		flightDate: Joi.string().isoDate().required(),
		fareAmountPerPassenger: Joi.number().positive().required(),
		contactEmail: Joi.string().email().required(),
		contactPhone: Joi.string().required(),
		passengers: Joi.array().items(Joi.object({
			first_name: Joi.string().required(),
			last_name: Joi.string().required(),
			date_of_birth: Joi.string().isoDate().required(),
			gender: Joi.string().valid('Male','Female','Other').required(),
			nationality: Joi.string().required(),
			email: Joi.string().email().optional(),
			phone: Joi.string().optional(),
			passport_number: Joi.string().optional()
		})).min(1).required(),
		seatIds: Joi.array().items(Joi.number().integer()).optional()
	}),
	addPayment: Joi.object({
		bookingId: Joi.number().integer().required(),
		amount: Joi.number().positive().required(),
		currency: Joi.string().default('USD'),
		paymentMethod: Joi.string().required(),
		transactionId: Joi.string().optional(),
		paymentGateway: Joi.string().optional()
	}),
	refund: Joi.object({
		cancellationId: Joi.number().integer().required(),
		paymentId: Joi.number().integer().required(),
		refundAmount: Joi.number().positive().required(),
		refundMethod: Joi.string().optional()
	})
};



