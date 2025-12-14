import { Router } from 'express';
import { register, login, getMe, refresh, logoutUser, requestReset, verifyReset, resetPasswordHandler } from '../../modules/auth/controller/authController';
import { requireAuth } from '../../middleware/auth';
import { authLimiter, registrationLimiter } from '../../middleware/rateLimit';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema, requestPasswordResetSchema, verifyResetTokenSchema, resetPasswordSchema } from '../../modules/validation/schemas';

const router = Router();

// Apply validation middleware along with rate limiting
router.post('/register', registrationLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', requireAuth, logoutUser);
router.get('/me', requireAuth, getMe);

// Password reset endpoints
router.post('/forgot-password', authLimiter, validate(requestPasswordResetSchema), requestReset);
router.post('/verify-reset-token', authLimiter, validate(verifyResetTokenSchema), verifyReset);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPasswordHandler);

export default router;
