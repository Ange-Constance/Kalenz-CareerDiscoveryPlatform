const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');
const { analyzeCV, chatWithML } = require('../services/ml');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only .pdf and .docx files are allowed'));
  },
});

function formatAnalysisRow(row) {
  if (!row) return null;
  const scores = row.confidence_scores || {};
  const predicted = row.predicted_career;
  const topScore = predicted ? scores[predicted] : null;

  return {
    id: row.id,
    predicted_career: predicted,
    confidence_scores: scores,
    confidence_pct: topScore != null ? Math.round(topScore * 1000) / 10 : null,
    narrative: row.narrative,
    cv_filename: row.cv_filename,
    created_at: row.created_at,
  };
}

/**
 * POST /api/analysis/upload — Upload CV and run ML analysis
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'CV file is required (.pdf or .docx, max 5MB)' });
  }

  try {
    console.log(`[analysis] Upload from user ${req.user.id}: ${req.file.originalname}`);

    const mlResult = await analyzeCV(req.file.path, req.file.originalname);

    const result = await db.query(
      `INSERT INTO career_analyses (user_id, predicted_career, confidence_scores, narrative, cv_filename)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        req.user.id,
        mlResult.predicted_career,
        JSON.stringify(mlResult.confidence_scores),
        mlResult.narrative,
        req.file.originalname,
      ]
    );

    const data = formatAnalysisRow({
      ...result.rows[0],
      confidence_scores: mlResult.confidence_scores,
    });
    data.confidence_pct = mlResult.confidence_pct ?? data.confidence_pct;

    res.json({ success: true, data });
  } catch (err) {
    res.status(err.message.includes('unavailable') ? 503 : 400).json({
      success: false,
      error: err.message,
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

/**
 * GET /api/analysis/history — All CV analyses for logged-in user
 */
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, predicted_career, confidence_scores, narrative, cv_filename, created_at
       FROM career_analyses WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows.map((row) => formatAnalysisRow(row)),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analysis/latest — Most recent CV analysis for logged-in user
 */
router.get('/latest', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, predicted_career, confidence_scores, narrative, cv_filename, created_at
       FROM career_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows.length ? formatAnalysisRow(result.rows[0]) : null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/analysis/chat — Career-aware chat via ML service (Ollama → Groq)
 */
router.post('/chat', authenticateToken, chatLimiter, async (req, res) => {
  try {
    const { message, career, context } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const trimmed = message.trim();
    const step = typeof context === 'object' ? context?.step : null;

    await db.query(
      `INSERT INTO chat_messages (user_id, analysis_id, role, content, context_step)
       VALUES ($1, NULL, 'user', $2, $3)`,
      [req.user.id, trimmed, step || 'chat']
    );

    const contextStr =
      typeof context === 'string'
        ? context
        : context?.text ||
          (step ? `User is on step: ${step}.` : 'General career guidance for Rwanda tech.');

    const mlResult = await chatWithML(trimmed, career || '', contextStr);

    await db.query(
      `INSERT INTO chat_messages (user_id, analysis_id, role, content, context_step)
       VALUES ($1, NULL, 'assistant', $2, $3)`,
      [req.user.id, mlResult.response, step || 'chat']
    );

    res.json({ success: true, data: { response: mlResult.response } });
  } catch (err) {
    res.status(503).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/analysis/run — Retired legacy endpoint
 */
router.post('/run', authenticateToken, (req, res) => {
  res.status(410).json({
    success: false,
    error: 'This endpoint is retired. Use POST /api/analysis/upload instead.',
  });
});

router.get('/:analysisId', authenticateToken, async (req, res, next) => {
  if (req.params.analysisId === 'latest') {
    return res.status(404).json({ success: false, error: 'Analysis not found' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM analyses WHERE id = $1 AND user_id = $2',
      [req.params.analysisId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        competencies: row.competencies,
        narrative: row.narrative,
        top_career: row.top_career,
        career_matches: row.career_matches,
        created_at: row.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
