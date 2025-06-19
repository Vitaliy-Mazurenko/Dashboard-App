import { User } from '../models/index.js';

const getAll = async () => {
  return User.findAll({ attributes: { exclude: ['password'] } });
};

const getById = async (id) => {
  return User.findByPk(id, { attributes: { exclude: ['password'] } });
};

const update = async (id, data) => {
  await User.update(data, { where: { id } });
  return getById(id);
};

const remove = async (id) => {
  return User.destroy({ where: { id } });
};

export default { getAll, getById, update, remove }; 