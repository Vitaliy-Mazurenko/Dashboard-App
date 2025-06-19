import companyService from '../services/companyService.js';
import fs from 'fs';
import path from 'path';

export const getAllCompanies = async (req, res) => {
  try {
    let userFilter = {};
    if (req.user.role === 'User') {
      userFilter.ownerId = req.user.id;
    }
    const result = await companyService.getAll(req.query, userFilter);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const company = await companyService.getById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    if (req.user.role === 'User' && company.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(company);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createCompany = async (req, res) => {
  try {
    const data = { ...req.body, ownerId: req.user.id };
    const company = await companyService.create(data);
    res.locals.newEntityId = company.id;
    res.status(201).json(company);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const company = await companyService.getById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    if (req.user.role === 'User' && company.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const updated = await companyService.update(req.params.id, req.body);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const company = await companyService.getById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    if (req.user.role === 'User' && company.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await companyService.remove(req.params.id);
    res.json({ message: 'Company deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    const company = await companyService.getById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    if (req.user.role === 'User' && company.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Удаляем старый логотип, если есть
    if (company.logo) {
      fs.unlinkSync(path.join(process.cwd(), company.logo));
    }
    await company.update({ logo: req.file.path });
    res.json({ message: 'Logo uploaded', logo: req.file.path });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteLogo = async (req, res) => {
  try {
    const company = await companyService.getById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    if (req.user.role === 'User' && company.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (company.logo) {
      fs.unlinkSync(path.join(process.cwd(), company.logo));
      await company.update({ logo: null });
    }
    res.json({ message: 'Logo deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}; 