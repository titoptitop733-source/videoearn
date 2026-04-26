const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    let query = "SELECT * FROM requests WHERE user_id = $1";
    const params = [req.user.id];
    if (type) { query += " AND type = $2"; params.push(type); }
    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, comment } = req.body;
    if (!amount || parseFloat(amount) <= 0)
      return res.status(400).json({ message: "Неверная сумма" });
    const result = await pool.query(
      "INSERT INTO requests (user_id, type, amount, method, details) VALUES ($1, 'deposit', $2, 'card', $3) RETURNING *",
      [req.user.id, parseFloat(amount), JSON.stringify({ comment: comment || "" })]
    );
    res.status(201).json({ message: "Заявка отправлена", request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post('/withdrawal', auth, async (req, res) => {
  try {
    const { amount, wallet_address } = req.body;
    if (!amount || parseFloat(amount) <= 0)
      return res.status(400).json({ message: "Неверная сумма" });
    if (!wallet_address)
      return res.status(400).json({ message: "Укажите реквизиты" });
    const userRes = await pool.query("SELECT balance FROM users WHERE id = $1", [req.user.id]);
    const balance = parseFloat(userRes.rows[0].balance);
    if (balance < parseFloat(amount))
      return res.status(400).json({ message: "Недостаточно средств на балансе" });
    const result = await pool.query(
      "INSERT INTO requests (user_id, type, amount, method, details) VALUES ($1, 'withdrawal', $2, 'card', $3) RETURNING *",
      [req.user.id, parseFloat(amount), JSON.stringify({ wallet_address })]
    );
    res.status(201).json({ message: "Заявка отправлена", request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
