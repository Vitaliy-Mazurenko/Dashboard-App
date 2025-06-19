import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
const router = express.Router();

router.get('/user', authMiddleware, (req, res) => {
  res.json({ message: `Hello, user #${req.user.id} with role ${req.user.role}` });
});

router.get('/admin', authMiddleware, roleMiddleware('Admin', 'SuperAdmin'), (req, res) => {
  res.json({ message: `Hello, admin #${req.user.id} with role ${req.user.role}` });
});

export default router; 