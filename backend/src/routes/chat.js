const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/** GET /api/chat/history — Load persisted chat messages */
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT role, content, context_step, created_at
       FROM chat_messages WHERE user_id = $1
       ORDER BY created_at ASC LIMIT 100`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
