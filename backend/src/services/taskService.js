const { pool } = require('../config/db');
const { addBalance, logTransaction } = require('./balanceService');

async function getAvailableTasks(userId) {
  const res = await pool.query(
    `SELECT v.*,
      CASE WHEN t.id IS NOT NULL THEN true ELSE false END AS completed_today,
      t.id AS task_id,
      l.reward_per_task AS reward
      FROM videos v
      JOIN users u ON u.id = $1
      JOIN levels l ON l.id = u.current_level_id
      LEFT JOIN tasks t ON t.video_id = v.id
        AND t.user_id = $1
        AND t.status = 'completed'
        AND t.task_date = CURRENT_DATE
      WHERE v.is_active = true
      ORDER BY v.id`,
    [userId]
  );
  return res.rows;
}

async function startTask(userId, videoId) {
  const existing = await pool.query(
    `SELECT id FROM tasks WHERE user_id = $1 AND video_id = $2 AND task_date = CURRENT_DATE`,
    [userId, videoId]
  );
  if (existing.rows.length > 0) {
    throw new Error("Це відео вже переглянуто сьогодні");
  }
  const res = await pool.query(
    `INSERT INTO tasks (user_id, video_id, status) VALUES ($1, $2, 'started') RETURNING id`,
    [userId, videoId]
  );
  return res.rows[0];
}

async function completeTask(userId, videoId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const taskRes = await client.query(
      `SELECT t.id, l.reward_per_task AS reward
        FROM tasks t
        JOIN users u ON u.id = t.user_id
        JOIN levels l ON l.id = u.current_level_id
        WHERE t.user_id = $1 AND t.video_id = $2
          AND t.status = 'started'
          AND t.task_date = CURRENT_DATE`,
      [userId, videoId]
    );

    if (taskRes.rows.length === 0) {
      throw new Error("Завдання не знайдено або вже виконано");
    }

    const { id: taskId, reward } = taskRes.rows[0];

    const balanceBefore = parseFloat(
      (await client.query("SELECT balance FROM users WHERE id = $1", [userId])).rows[0].balance
    );
    const balanceAfter = balanceBefore + parseFloat(reward);

    await client.query(
      `UPDATE tasks SET status = 'completed', completed_at = NOW(), reward_earned = $1 WHERE id = $2`,
      [reward, taskId]
    );

    await client.query(
      `UPDATE users SET balance = balance + $1 WHERE id = $2`,
      [reward, userId]
    );

    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description)
       VALUES ($1, 'task_reward', $2, $3, $4, $5)`,
      [userId, reward, balanceBefore, balanceAfter, "Нагорода за відео " + videoId]
    );

    await client.query("COMMIT");
    return { reward };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getAvailableTasks, startTask, completeTask };
