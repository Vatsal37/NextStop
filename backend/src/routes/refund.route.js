import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { validateBody, schemas } from '../middlewares/validate.middleware.js';
import { refund, refundStatus } from '../controllers/refund.controller.js';

const router = Router();

router.post('/', authMiddleware, validateBody(schemas.refund), refund);
router.get('/:bookingId', authMiddleware, refundStatus);

export default router;




