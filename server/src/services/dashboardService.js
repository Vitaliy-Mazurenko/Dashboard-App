import { User, Company } from '../db/models/index.js';
import { Op } from 'sequelize';

const getAdminStats = async () => {
  const totalUsers = await User.count();
  const totalCompanies = await Company.count();
  const companies = await Company.findAll({ attributes: ['id', 'name', 'capital', 'service', 'ownerId'] });
  return { totalUsers, totalCompanies, companies };
};

const getSuperAdminStats = async () => {
  const adminStats = await getAdminStats();
  const admins = await User.findAll({ where: { role: 'Admin' }, attributes: ['id', 'name', 'email', 'createdAt'] });
  return { ...adminStats, admins };
};

const getUserStats = async (userId) => {
  const companies = await Company.findAll({ where: { ownerId: userId }, attributes: ['id', 'name', 'capital', 'service', 'createdAt'] });
  return { companies };
};

export default { getAdminStats, getSuperAdminStats, getUserStats }; 