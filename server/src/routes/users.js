import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, uploadAvatar, deleteAvatar, createUser } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { historyLogger } from '../middlewares/historyLogger.js';
import { upload } from '../middlewares/upload.js';
const router = express.Router();

router.get('/', authMiddleware, roleMiddleware('Admin', 'SuperAdmin'), getAllUsers);

router.get('/:id', authMiddleware, getUserById);

router.put('/:id', authMiddleware, historyLogger('update', 'user'), updateUser);

router.patch('/:id/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

router.delete('/:id/avatar', authMiddleware, deleteAvatar);

router.delete('/:id', authMiddleware, roleMiddleware('Admin', 'SuperAdmin'), deleteUser);

router.post('/', authMiddleware, roleMiddleware('Admin', 'SuperAdmin'), createUser);

export default router; 