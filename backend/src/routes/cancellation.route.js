import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { cancelTicket } from '../controllers/cancellation.controller.js';

const router = Router();

router.post('/', authMiddleware, cancelTicket);

export default router;








