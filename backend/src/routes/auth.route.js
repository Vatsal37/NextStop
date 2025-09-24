import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { validateBody, schemas } from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/register', validateBody(schemas.authRegister), register);
router.post('/login', validateBody(schemas.authLogin), login);

export default router;




