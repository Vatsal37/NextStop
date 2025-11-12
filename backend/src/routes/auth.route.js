import { Router } from 'express';
import { login, register, me, updateMe, verifyEmail, resendOTP, forgotPassword, verifyForgotPasswordOTP, resetPassword } from '../controllers/auth.controller.js';
import { validateBody, schemas } from '../middlewares/validate.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validateBody(schemas.authRegister), register);
router.post('/login', validateBody(schemas.authLogin), login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOTP);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, me);
router.put('/me', authMiddleware, updateMe);

export default router;




