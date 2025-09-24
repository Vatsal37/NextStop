import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminGuard from '../middlewares/admin.middleware.js';
import { validateQuery, validateBody, schemas } from '../middlewares/validate.middleware.js';
import { addFlight, search, seats, status } from '../controllers/flight.controller.js';

const router = Router();

// Admin protected creation - for now use auth middleware placeholder
router.post('/', authMiddleware, adminGuard, validateBody(schemas.addFlight), addFlight);
router.get('/search', validateQuery(schemas.flightSearch), search);
router.get('/:id/seats', seats);
router.get('/:id/status', status);

export default router;




