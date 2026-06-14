const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');
const { generateChatResponse } = require('../services/ollamaService');

const router = express.Router();

/**
 * @swagger
 * /chat/message:
 *   post:
 *     summary: Send chat message to AI assistant
 *     tags: [Chat]
 */
router.post('/message', authenticateToken, chatLimiter, async (req, res, next) => {
  try {
    const { message, context } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message required' });
    }

    await db.query(
      `INSERT INTO chat_messages (user_id, analysis_id, role, content, context_step)
       VALUES ($1, $2, 'user', $3, $4)`,
      [req.user.id, context?.analysisId || null, message, context?.step || 'dashboard']
    );

    const response = await generateChatResponse(message, context);

    const result = await db.query(
      `INSERT INTO chat_messages (user_id, analysis_id, role, content, context_step)
       VALUES ($1, $2, 'assistant', $3, $4) RETURNING created_at`,
      [req.user.id, context?.analysisId || null, response, context?.step || 'dashboard']
    );

    res.json({
      response,
      timestamp: result.rows[0].created_at,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT role, content, context_step, created_at
       FROM chat_messages WHERE user_id = $1
       ORDER BY created_at ASC LIMIT 100`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
