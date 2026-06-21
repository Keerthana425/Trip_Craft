import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);

export default router;
