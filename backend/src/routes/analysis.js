const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');
const { analyzeCombined, generateRoadmap, chatWithML } = require('../services/ml');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const field = file.fieldname;
    const ext = path.extname(file.originalname).toLowerCase();
    if (field === 'file' && ['.pdf', '.docx'].includes(ext)) return cb(null, true);
    if (field === 'certificate' && ext === '.pdf') return cb(null, true);
    cb(new Error('Invalid file type for upload'));
  },
});

function parseJsonField(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatAnalysisRow(row, options = {}) {
  if (!row) return null;
  const scores = parseJsonField(row.confidence_scores, {});
  const predicted = row.predicted_career;
  const topScore = predicted ? scores[predicted] : null;
  const inputSources = parseJsonField(row.input_sources, []);
  const keySkills = parseJsonField(row.key_skills, []);
  const roadmap = parseJsonField(row.roadmap, null);

  const formatted = {
    id: row.id,
    predicted_career: predicted,
    confidence_scores: scores,
    confidence_pct: topScore != null ? Math.round(topScore * 1000) / 10 : null,
    narrative: row.narrative,
    cv_filename: row.cv_filename,
    input_sources: inputSources,
    github_username: row.github_username,
    certificate_filename: row.certificate_filename,
    key_skills: keySkills,
    roadmap,
    analysis_version: row.analysis_version || 'v3',
    created_at: row.created_at,
  };

  if (options.truncateNarrative && formatted.narrative) {
    formatted.narrative_preview =
      formatted.narrative.length > 200
        ? `${formatted.narrative.slice(0, 200)}…`
        : formatted.narrative;
  }

  return formatted;
}

function cleanupFiles(files) {
  if (!files) return;
  for (const file of files) {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
}

/**
 * POST /api/analysis/upload — Combined CV / GitHub / certificate analysis
 */
router.post(
  '/upload',
  authenticateToken,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
  ]),
  async (req, res) => {
    const cvFile = req.files?.file?.[0];
    const certFile = req.files?.certificate?.[0];
    const github = (req.body.github || '').trim();

    if (!cvFile && !github && !certFile) {
      return res.status(400).json({
        success: false,
        error: 'Provide at least one input: CV file, GitHub username/URL, or certificate PDF.',
      });
    }

    try {
      console.log(`[analysis] Combined upload from user ${req.user.id}`);

      const mlResult = await analyzeCombined({
        filePath: cvFile?.path,
        originalName: cvFile?.originalname,
        github: github || undefined,
        certificatePath: certFile?.path,
        certificateName: certFile?.originalname,
      });

      const inputSources = mlResult.input_sources || [];
      let githubUsername = null;
      if (github) {
        const match = github.match(/github\.com\/([^/]+)/i) || github.match(/^([^/]+)/);
        githubUsername = match ? match[1] : github;
      }

      const result = await db.query(
        `INSERT INTO career_analyses (
           user_id, predicted_career, confidence_scores, narrative, cv_filename,
           input_sources, github_username, certificate_filename, key_skills, analysis_version
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'v3') RETURNING *`,
        [
          req.user.id,
          mlResult.predicted_career,
          JSON.stringify(mlResult.confidence_scores),
          mlResult.narrative,
          cvFile?.originalname || null,
          JSON.stringify(inputSources),
          githubUsername,
          certFile?.originalname || null,
          JSON.stringify(mlResult.key_skills || []),
        ]
      );

      const data = formatAnalysisRow({
        ...result.rows[0],
        confidence_scores: mlResult.confidence_scores,
        key_skills: mlResult.key_skills,
      });
      data.confidence_pct = mlResult.confidence_pct ?? data.confidence_pct;
      data.input_sources = inputSources;

      res.json({ success: true, data });
    } catch (err) {
      const msg = err.message || 'Analysis failed';
      const isValidation =
        msg.includes('Provide at least one') ||
        msg.includes('Only .pdf') ||
        msg.includes('Invalid file') ||
        msg.includes('Not enough text') ||
        msg.includes('empty or image-based') ||
        msg.includes('Unsupported file') ||
        msg.includes('GitHub user') ||
        msg.includes('No README');
      const isInference =
        msg.includes('HuggingFace') ||
        msg.includes('HF_TOKEN') ||
        msg.includes('inference failed') ||
        msg.includes('External service');
      let status = 502;
      if (isValidation) status = 400;
      else if (msg.includes('unavailable') || msg.includes('loading')) status = 503;
      else if (isInference) status = 502;
      res.status(status).json({
        success: false,
        error: msg,
      });
    } finally {
      cleanupFiles(req.files?.file);
      cleanupFiles(req.files?.certificate);
    }
  }
);

/**
 * POST /api/analysis/roadmap — Generate and persist personalized roadmap
 */
router.post('/roadmap', authenticateToken, async (req, res) => {
  try {
    const { analysis_id, career, cv_text, confidence, key_skills } = req.body;

    if (!career) {
      return res.status(400).json({ success: false, error: 'Career is required' });
    }

    if (analysis_id) {
      const owned = await db.query(
        'SELECT id FROM career_analyses WHERE id = $1 AND user_id = $2',
        [analysis_id, req.user.id]
      );
      if (owned.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Analysis not found' });
      }
    }

    const mlResult = await generateRoadmap({
      career,
      cvText: cv_text || '',
      confidence: confidence || 0,
      keySkills: key_skills || [],
    });

    const roadmap = mlResult.data;

    if (analysis_id) {
      await db.query(
        `INSERT INTO roadmaps (user_id, analysis_id, career, roadmap_data)
         VALUES ($1, $2, $3, $4)`,
        [req.user.id, analysis_id, career, JSON.stringify(roadmap)]
      );

      await db.query(
        'UPDATE career_analyses SET roadmap = $1 WHERE id = $2 AND user_id = $3',
        [JSON.stringify(roadmap), analysis_id, req.user.id]
      );
    }

    res.json({ success: true, data: roadmap });
  } catch (err) {
    res.status(503).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/analysis/history — All analyses for logged-in user
 */
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT ca.*, r.roadmap_data AS roadmap_from_table
       FROM career_analyses ca
       LEFT JOIN LATERAL (
         SELECT roadmap_data FROM roadmaps
         WHERE analysis_id = ca.id
         ORDER BY created_at DESC LIMIT 1
       ) r ON true
       WHERE ca.user_id = $1
       ORDER BY ca.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows.map((row) => {
        const formatted = formatAnalysisRow(
          {
            ...row,
            roadmap: row.roadmap || row.roadmap_from_table,
          },
          { truncateNarrative: true }
        );
        return formatted;
      }),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analysis/latest — Most recent analysis with full data
 */
router.get('/latest', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT ca.*, r.roadmap_data AS roadmap_from_table
       FROM career_analyses ca
       LEFT JOIN LATERAL (
         SELECT roadmap_data FROM roadmaps
         WHERE analysis_id = ca.id
         ORDER BY created_at DESC LIMIT 1
       ) r ON true
       WHERE ca.user_id = $1
       ORDER BY ca.created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.json({ success: true, data: null });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: formatAnalysisRow({
        ...row,
        roadmap: row.roadmap || row.roadmap_from_table,
      }),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/analysis/chat — Career-aware chat with session history
 */
router.post('/chat', authenticateToken, chatLimiter, async (req, res) => {
  try {
    const {
      message,
      career,
      context,
      cv_summary,
      analysis_id,
      chat_history: clientHistory,
    } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const trimmed = message.trim();
    const step = typeof context === 'object' ? context?.step : null;
    const sessionId = analysis_id ? `analysis-${analysis_id}` : null;

    if (analysis_id) {
      const owned = await db.query(
        'SELECT id, narrative FROM career_analyses WHERE id = $1 AND user_id = $2',
        [analysis_id, req.user.id]
      );
      if (owned.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Analysis not found' });
      }
    }

    await db.query(
      `INSERT INTO chat_messages (user_id, career_analysis_id, session_id, role, content, context_step)
       VALUES ($1, $2, $3, 'user', $4, $5)`,
      [req.user.id, analysis_id || null, sessionId, trimmed, step || 'chat']
    );

    let chatHistory = Array.isArray(clientHistory) ? clientHistory : [];
    if (!chatHistory.length && analysis_id) {
      const historyResult = await db.query(
        `SELECT role, content FROM chat_messages
         WHERE user_id = $1 AND career_analysis_id = $2
         ORDER BY created_at ASC`,
        [req.user.id, analysis_id]
      );
      chatHistory = historyResult.rows.slice(-10);
    }

    const contextStr =
      typeof context === 'string'
        ? context
        : context?.text ||
          (step ? `User is on step: ${step}.` : 'General career guidance for Rwanda tech.');

    const cvSummary =
      cv_summary ||
      (analysis_id
        ? (
            await db.query(
              'SELECT narrative FROM career_analyses WHERE id = $1 AND user_id = $2',
              [analysis_id, req.user.id]
            )
          ).rows[0]?.narrative?.slice(0, 500)
        : '') ||
      '';

    const mlResult = await chatWithML(
      trimmed,
      career || '',
      contextStr,
      cvSummary,
      chatHistory.slice(-10)
    );

    await db.query(
      `INSERT INTO chat_messages (user_id, career_analysis_id, session_id, role, content, context_step)
       VALUES ($1, $2, $3, 'assistant', $4, $5)`,
      [req.user.id, analysis_id || null, sessionId, mlResult.response, step || 'chat']
    );

    res.json({ success: true, data: { response: mlResult.response } });
  } catch (err) {
    res.status(503).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/analysis/:id/chat — Chat history for an analysis session
 */
router.get('/:id/chat', authenticateToken, async (req, res, next) => {
  try {
    const analysisId = parseInt(req.params.id, 10);
    if (Number.isNaN(analysisId)) {
      return res.status(400).json({ success: false, error: 'Invalid analysis ID' });
    }

    const owned = await db.query(
      'SELECT id FROM career_analyses WHERE id = $1 AND user_id = $2',
      [analysisId, req.user.id]
    );
    if (owned.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }

    const result = await db.query(
      `SELECT id, role, content, created_at FROM chat_messages
       WHERE user_id = $1 AND career_analysis_id = $2
       ORDER BY created_at ASC`,
      [req.user.id, analysisId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analysis/:id — Single career analysis with roadmap and chat
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  const param = req.params.id;
  if (param === 'history' || param === 'latest') {
    return next();
  }

  const analysisId = parseInt(param, 10);

  if (!Number.isNaN(analysisId)) {
    try {
      const result = await db.query(
        `SELECT ca.*, r.roadmap_data AS roadmap_from_table
         FROM career_analyses ca
         LEFT JOIN LATERAL (
           SELECT roadmap_data FROM roadmaps
           WHERE analysis_id = ca.id
           ORDER BY created_at DESC LIMIT 1
         ) r ON true
         WHERE ca.id = $1 AND ca.user_id = $2`,
        [analysisId, req.user.id]
      );

      if (result.rows.length > 0) {
        const chatResult = await db.query(
          `SELECT id, role, content, created_at FROM chat_messages
           WHERE user_id = $1 AND career_analysis_id = $2
           ORDER BY created_at ASC`,
          [req.user.id, analysisId]
        );

        return res.json({
          success: true,
          data: {
            ...formatAnalysisRow({
              ...result.rows[0],
              roadmap: result.rows[0].roadmap || result.rows[0].roadmap_from_table,
            }),
            chat_history: chatResult.rows,
          },
        });
      }
    } catch (err) {
      return next(err);
    }
  }

  // Legacy analyses table fallback
  try {
    const result = await db.query(
      'SELECT * FROM analyses WHERE id = $1 AND user_id = $2',
      [param, req.user.id]
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

/**
 * POST /api/analysis/run — Retired legacy endpoint
 */
router.post('/run', authenticateToken, (req, res) => {
  res.status(410).json({
    success: false,
    error: 'This endpoint is retired. Use POST /api/analysis/upload instead.',
  });
});

module.exports = router;
