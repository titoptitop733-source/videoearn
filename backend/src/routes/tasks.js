const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAvailableTasks, startTask, completeTask } = require('../services/taskService');

// GET /tasks — список задач для текущего пользователя
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await getAvailableTasks(req.user.id);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// POST /tasks/:videoId/start — начать просмотр
router.post('/:videoId/start', auth, async (req, res) => {
  try {
    const task = await startTask(req.user.id, req.params.videoId);
    res.json({ message: 'Задание начато', task });
  } catch (err) {
    console.error("startTask error:", err.message); res.status(400).json({ message: err.message });
  }
});

// POST /tasks/:videoId/complete — завершить и начислить награду
router.post('/:videoId/complete', auth, async (req, res) => {
  try {
    const result = await completeTask(req.user.id, req.params.videoId);
    res.json({ message: 'Награда начислена', reward: result.reward });
  } catch (err) {
    console.error("startTask error:", err.message); res.status(400).json({ message: err.message });
  }
});

// GET /tasks/history — история выполненных заданий
router.get('/history', auth, async (req, res) => {
  try {
    const pool = require('../config/db');
    const res2 = await pool.query(
      `SELECT t.*, v.title AS video_title
       FROM tasks t
       JOIN videos v ON v.id = t.video_id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json(res2.rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;