import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { validateBody } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations/authValidation.js';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validateBody(updateProfileSchema), updateProfile);

export default router;

