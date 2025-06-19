import express from 'express';
import { register, login, refresh } from '../controllers/authController.js';
const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/refresh', refresh);

router.post('/reset-password', (req, res) => {
  res.json({ message: 'Reset password endpoint (to be implemented)' });
});

export default router; 