import { Company } from '../db/models/index.js';
import { Op } from 'sequelize';

const getAll = async (query = {}, userFilter = {}) => {
  const {
    name,
    service,
    capitalMin,
    capitalMax,
    createdAtMin,
    createdAtMax,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = query;

  const where = { ...userFilter };
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (service) where.service = { [Op.iLike]: `%${service}%` };
  if (capitalMin || capitalMax) {
    where.capital = {};
    if (capitalMin) where.capital[Op.gte] = capitalMin;
    if (capitalMax) where.capital[Op.lte] = capitalMax;
  }
  if (createdAtMin || createdAtMax) {
    where.createdAt = {};
    if (createdAtMin) where.createdAt[Op.gte] = createdAtMin;
    if (createdAtMax) where.createdAt[Op.lte] = createdAtMax;
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { rows, count } = await Company.findAndCountAll({
    where,
    order: [[sortBy, sortOrder.toUpperCase()]],
    offset,
    limit: parseInt(limit),
  });
  return { companies: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
};

const getById = async (id) => {
  return Company.findByPk(id);
};

const create = async (data) => {
  return Company.create(data);
};

const update = async (id, data) => {
  await Company.update(data, { where: { id } });
  return getById(id);
};

const remove = async (id) => {
  return Company.destroy({ where: { id } });
};

export default { getAll, getById, create, update, remove }; 