import express from 'express';
import { getHistory } from '../controllers/historyController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.get('/', authMiddleware, getHistory);

export default router; 