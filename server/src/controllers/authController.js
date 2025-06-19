import authService from '../services/authService.js';
import jwt from 'jsonwebtoken';
import { RefreshToken, User } from '../models/index.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const user = await authService.register({ name, email, password });
    const tokens = authService.generateTokens(user);
    await authService.saveRefreshToken(user.id, tokens.refreshToken, new Date(Date.now() + 7*24*60*60*1000));
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields required' });
    const user = await authService.login({ email, password });
    const tokens = authService.generateTokens(user);
    await authService.saveRefreshToken(user.id, tokens.refreshToken, new Date(Date.now() + 7*24*60*60*1000));
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'No refresh token' });
    const data = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const tokenInDb = await RefreshToken.findOne({ where: { userId: data.id, token: refreshToken } });
    if (!tokenInDb) return res.status(401).json({ message: 'Invalid refresh token' });
    const user = await User.findByPk(data.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const tokens = authService.generateTokens(user);
    await authService.saveRefreshToken(user.id, tokens.refreshToken, new Date(Date.now() + 7*24*60*60*1000));
    res.json({ ...tokens });
  } catch (e) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}; 