const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { signToken } = require('../config/jwt');
const { auth } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Все поля обязательны' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' });
    
    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]
    );
    if (exists.rows.length > 0)
      return res.status(400).json({ error: 'Email или имя пользователя уже заняты' });
    
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, balance, is_admin, created_at',
      [username, email, password_hash]
    );
    
    const token = signToken({ id: rows[0].id });
    res.status(201).json({ user: rows[0], token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Все поля обязательны' });
    
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows[0])
      return res.status(400).json({ error: 'Неверный email или пароль' });
    
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid)
      return res.status(400).json({ error: 'Неверный email или пароль' });
    
    const token = signToken({ id: rows[0].id });
    res.json({
      user: {
        id: rows[0].id,
        username: rows[0].username,
        email: rows[0].email,
        balance: rows[0].balance,
        current_level_id: rows[0].current_level_id,
        is_admin: rows[0].is_admin,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.username, u.email, u.balance, u.current_level_id, u.is_admin,
        COUNT(t.id) FILTER (WHERE t.status = 'completed') AS videos_watched,
        COALESCE(SUM(t.reward_earned) FILTER (WHERE t.status = 'completed'), 0) AS total_earned
       FROM users u
       LEFT JOIN tasks t ON t.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
