import { Router } from 'express';
import { login, register, me, updateMe } from '../controllers/auth.controller.js';
import { validateBody, schemas } from '../middlewares/validate.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validateBody(schemas.authRegister), register);
router.post('/login', validateBody(schemas.authLogin), login);
router.get('/me', authMiddleware, me);
router.put('/me', authMiddleware, updateMe);

export default router;




