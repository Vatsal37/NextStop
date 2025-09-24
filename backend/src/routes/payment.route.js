import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { validateBody, schemas } from '../middlewares/validate.middleware.js';
import { addPayment, paymentStatus } from '../controllers/payment.controller.js';

const router = Router();

router.post('/', authMiddleware, validateBody(schemas.addPayment), addPayment);
router.get('/:bookingId', authMiddleware, paymentStatus);

export default router;




