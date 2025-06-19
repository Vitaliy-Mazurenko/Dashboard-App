import { History, User } from '../models/index.js';

const add = async ({ userId, action, entity, entityId }) => {
  return History.create({ userId, action, entity, entityId, timestamp: new Date() });
};

const getAll = async (filter = {}) => {
  return History.findAll({
    where: filter,
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
    order: [['timestamp', 'DESC']],
  });
};

export default { add, getAll }; 