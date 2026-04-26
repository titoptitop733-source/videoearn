const { verifyToken } = require('../config/jwt');
const { pool } = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Токен отсутствует' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const { rows } = await pool.query(
      'SELECT id, username, email, balance, current_level_id, is_admin FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!rows[0]) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
};

module.exports = { auth };