import userService from '../services/userService.js';
import fs from 'fs';
import path from 'path';
import { User } from '../db/models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAll();
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getUserById = async (req, res) => {
  try {

    if (req.user.id !== +req.params.id && req.user.role === 'User') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await userService.getById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateUser = async (req, res) => {
  try {

    if (req.user.id !== +req.params.id && req.user.role === 'User') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await userService.update(req.params.id, req.body);
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteUser = async (req, res) => {
  try {

    if (req.user.role !== 'SuperAdmin' && req.body.role === 'Admin') {
      return res.status(403).json({ message: 'Only SuperAdmin can delete Admins' });
    }
    await userService.remove(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (req.user.id !== +req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.avatar) {
      fs.unlinkSync(path.join(process.cwd(), user.avatar));
    }
    await user.update({ avatar: req.file.path });
    res.json({ message: 'Avatar uploaded', avatar: req.file.path });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    if (req.user.id !== +req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.avatar) {
      fs.unlinkSync(path.join(process.cwd(), user.avatar));
      await user.update({ avatar: null });
    }
    res.json({ message: 'Avatar deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createUser = async (req, res) => {
  try {

    if (!['Admin', 'SuperAdmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}; 