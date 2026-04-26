const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { auth } = require('../middleware/auth');
const { subtractBalance, logTransaction } = require('../services/balanceService');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM levels WHERE is_active = TRUE ORDER BY level_number');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/purchase', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const levelId = req.params.id;
    const userId = req.user.id;
    const levelRes = await client.query('SELECT * FROM levels WHERE id = $1', [levelId]);
    if (levelRes.rows.length === 0) return res.status(404).json({ message: 'Рівень не знайдено' });
    const level = levelRes.rows[0];
    const userRes = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];
    if (user.current_level_id === level.id) return res.status(400).json({ message: 'Ви вже на цьому рівні' });
    if (parseFloat(user.balance) < parseFloat(level.price)) return res.status(400).json({ message: 'Недостатньо коштів' });
    await subtractBalance(userId, parseFloat(level.price), client);
    await logTransaction(userId, 'level_purchase', parseFloat(level.price), 'Покупка: ' + level.name, client);
    await client.query('UPDATE users SET current_level_id = $1 WHERE id = $2', [level.id, userId]);
    await client.query('COMMIT');
    res.json({ message: level.name + ' успішно куплено!' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
