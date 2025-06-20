import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

const getAll = async () => {
  return User.findAll({ attributes: { exclude: ['password'] } });
};

const getById = async (id) => {
  return User.findByPk(id, { attributes: { exclude: ['password'] } });
};

const update = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  await User.update(data, { where: { id } });
  return getById(id);
};

const remove = async (id) => {
  return User.destroy({ where: { id } });
};

export default { getAll, getById, update, remove }; 