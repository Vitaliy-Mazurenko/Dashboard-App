import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Company from './company.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('SuperAdmin', 'Admin', 'User'),
    defaultValue: 'User',
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

User.prototype.getCompaniesByRole = async function() {
  if (this.role === 'SuperAdmin' || this.role === 'Admin') {
    return await Company.findAll();
  } else {
    return await Company.findAll({ where: { ownerId: this.id } });
  }
};

export default User; 