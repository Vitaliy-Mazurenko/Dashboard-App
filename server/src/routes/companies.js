import express from 'express';
import { getAllCompanies, getCompanyById, createCompany, updateCompany, deleteCompany, uploadLogo, deleteLogo } from '../controllers/companyController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { historyLogger } from '../middlewares/historyLogger.js';
import { upload } from '../middlewares/upload.js';
const router = express.Router();

router.get('/', authMiddleware, getAllCompanies);

router.get('/:id', authMiddleware, getCompanyById);

router.post('/', authMiddleware, historyLogger('create', 'company'), createCompany);

router.put('/:id', authMiddleware, historyLogger('update', 'company'), updateCompany);

router.patch('/:id/logo', authMiddleware, upload.single('logo'), uploadLogo);

router.delete('/:id/logo', authMiddleware, deleteLogo);

router.delete('/:id', authMiddleware, historyLogger('delete', 'company'), deleteCompany);

export default router; 