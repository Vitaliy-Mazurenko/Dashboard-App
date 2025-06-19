import historyService from '../services/historyService.js';

export const getHistory = async (req, res) => {
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