import dashboardService from '../services/dashboardService.js';
import userService from '../services/userService.js';
import companyService from '../services/companyService.js';
import historyService from '../services/historyService.js';

export const getDashboard = async (req, res) => {
  try {
    let stats;
    if (req.user.role === 'SuperAdmin') {
      stats = await dashboardService.getSuperAdminStats();
    } else if (req.user.role === 'Admin') {
      stats = await dashboardService.getAdminStats();
    } else {
      stats = await dashboardService.getUserStats(req.user.id);
    }
    res.json(stats);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getAll();
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'User') {
      filter.userId = req.user.id;
    }
    const history = await historyService.getAll(filter);
    res.json(history);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createCompany = async (req, res) => {
  try {
    const data = { ...req.body, ownerId: req.user.id };
    const company = await companyService.create(data);
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