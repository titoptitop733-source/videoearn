const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { addBalance, subtractBalance, logTransaction } = require('../services/balanceService');

router.use(auth, admin);

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.balance, u.is_admin, u.created_at,
              l.name AS level_name
       FROM users u
       LEFT JOIN levels l ON l.id = u.current_level_id
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { is_admin } = req.body;
    const userId = req.params.id;
    if (userId === req.user.id && is_admin === false)
      return res.status(400).json({ message: "Нельзя снять права у самого себя" });
    await pool.query('UPDATE users SET is_admin = $1 WHERE id = $2', [is_admin, userId]);
    res.json({ message: "Обновлено" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.patch('/users/:id/balance', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userId = req.params.id;
    const amount = parseFloat(req.body.amount);
    if (isNaN(amount)) return res.status(400).json({ message: "Неверная сумма" });
    if (amount > 0) {
      await addBalance(userId, amount, client);
      await logTransaction(userId, 'admin_credit', amount, "Админ: начисление", client);
    } else if (amount < 0) {
      await subtractBalance(userId, Math.abs(amount), client);
      await logTransaction(userId, 'admin_debit', Math.abs(amount), "Админ: списание", client);
    }
    await client.query('COMMIT');
    res.json({ message: "Баланс обновлен" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
});

router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT r.*, u.username, u.email FROM requests r JOIN users u ON u.id = r.user_id`;
    const params = [];
    if (status) { query += " WHERE r.status = $1"; params.push(status); }
    query += " ORDER BY r.created_at DESC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.patch('/requests/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { status, admin_note } = req.body;
    const requestId = req.params.id;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: "Неверный статус" });
    const reqRes = await client.query(
      "SELECT * FROM requests WHERE id = $1 AND status = 'pending' FOR UPDATE",
      [requestId]
    );
    if (reqRes.rows.length === 0) throw new Error("Заявка не найдена или уже обработана");
    const request = reqRes.rows[0];
    if (status === 'approved') {
      if (request.type === 'deposit') {
        await addBalance(request.user_id, request.amount, client);
        await logTransaction(request.user_id, 'deposit', request.amount, "Пополнение подтверждено", client);
      } else if (request.type === 'withdrawal') {
        await subtractBalance(request.user_id, request.amount, client);
        await logTransaction(request.user_id, 'withdrawal', request.amount, "Вывод подтвержден", client);
      }
    }
    await client.query(
      "UPDATE requests SET status = $1, reviewed_by = $2, reviewed_at = NOW(), admin_note = $3 WHERE id = $4",
      [status, req.user.id, admin_note || null, requestId]
    );
    await client.query('COMMIT');
    res.json({ message: status === 'approved' ? "Подтверждено" : "Отклонено" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [usersRes, requestsRes] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total_users, SUM(balance) AS total_balance FROM users"),
      pool.query("SELECT status, COUNT(*) AS count, SUM(amount) AS total FROM requests GROUP BY status"),
    ]);
    res.json({ users: usersRes.rows[0], requests: requestsRes.rows });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
