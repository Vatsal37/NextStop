import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { validateBody, schemas } from '../middlewares/validate.middleware.js';
import { createBooking, getBooking } from '../controllers/booking.controller.js';

const router = Router();

router.post('/', authMiddleware, validateBody(schemas.createBooking), createBooking);
router.get('/:pnr', getBooking);

export default router;




