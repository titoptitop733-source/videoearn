const { pool } = require('../config/db');

async function getBalance(userId, client = null) {
  const db = client || pool;
  const res = await db.query('SELECT balance FROM users WHERE id = $1', [userId]);
  return parseFloat(res.rows[0]?.balance || 0);
}

async function addBalance(userId, amount, client = null) {
  const db = client || pool;
  const res = await db.query(
    'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
    [amount, userId]
  );
  return parseFloat(res.rows[0].balance);
}

async function subtractBalance(userId, amount, client = null) {
  const db = client || pool;
  const check = await db.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
  const current = parseFloat(check.rows[0].balance);
  if (current < amount) {
    throw new Error('Недостатньо коштів на балансі');
  }
  const res = await db.query(
    'UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING balance',
    [amount, userId]
  );
  return parseFloat(res.rows[0].balance);
}

async function logTransaction(userId, type, amount, description, client = null) {
  const db = client || pool;
  const before = await getBalance(userId, db);
  const after = type === 'task_reward' || type === 'deposit'
    ? before + parseFloat(amount)
    : before - parseFloat(amount);
  await db.query(
    `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, type, amount, before, after, description]
  );
}

module.exports = { getBalance, addBalance, subtractBalance, logTransaction };
