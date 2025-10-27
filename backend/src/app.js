import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.route.js';
import flightRouter from './routes/flight.route.js';
import bookingRouter from './routes/booking.route.js';
import paymentRouter from './routes/payment.route.js';
import refundRouter from './routes/refund.route.js';
import cancellationRouter from './routes/cancellation.route.js';
import airportsRouter from './routes/airports.route.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/flights', flightRouter)
app.use('/api/v1/bookings', bookingRouter)
app.use('/api/v1/payments', paymentRouter)
app.use('/api/v1/refunds', refundRouter)
app.use('/api/v1/cancellations', cancellationRouter)
app.use('/api/v1/airports', airportsRouter)

// Error handler
app.use(errorHandler)

export { app };