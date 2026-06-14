const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { runAnalysis } = require('../services/mlService');
const { analyzeCV, chatWithML } = require('../services/ml');
const { generateNarrative } = require('../services/ollamaService');

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

const CAREER_DESCRIPTIONS = {
  'UX Research': 'Design user research studies, analyze feedback, and translate insights into product improvements.',
  'Health Data': 'Analyze healthcare datasets, build dashboards, and support clinical decision-making with data.',
  'Policy': 'Research tech policy, draft recommendations, and evaluate regulatory impact on digital ecosystems.',
  'Backend': 'Build scalable APIs, manage databases, and architect server-side systems for web applications.',
  'DevOps': 'Automate deployments, manage cloud infrastructure, and ensure reliable CI/CD pipelines.',
};

/**
 * POST /api/analysis/upload — Upload CV and run ML analysis
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req, res, next) => {
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

    const row = result.rows[0];

    res.json({
      success: true,
      data: {
        id: row.id,
        predicted_career: row.predicted_career,
        confidence_scores: row.confidence_scores,
        narrative: row.narrative,
        cv_filename: row.cv_filename,
        created_at: row.created_at,
      },
    });
  } catch (err) {
    res.status(err.message.includes('unavailable') ? 503 : 400).json({
      success: false,
      error: err.message,
    });
  } finally {
    // Delete temp file — do not store CV permanently
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

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/analysis/chat — Career-aware chat via ML service
 */
router.post('/chat', authenticateToken, async (req, res, next) => {
  try {
    const { message, career, context } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const mlResult = await chatWithML(message.trim(), career || '', context || '');
    res.json({ success: true, data: { response: mlResult.response } });
  } catch (err) {
    res.status(503).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /analysis/run:
 *   post:
 *     summary: Run ML analysis on user evidence (legacy)
 *     tags: [Analysis]
 */
router.post('/run', authenticateToken, async (req, res, next) => {
  try {
    const evidenceResult = await db.query(
      'SELECT evidence_type, raw_text FROM evidence WHERE user_id = $1',
      [req.user.id]
    );

    let githubText = '';
    let cvText = '';
    let certText = '';

    for (const row of evidenceResult.rows) {
      if (row.evidence_type === 'github') githubText += row.raw_text + ' ';
      else if (row.evidence_type === 'cv') cvText += row.raw_text + ' ';
      else if (row.evidence_type === 'certificate') certText += row.raw_text + ' ';
    }

    if (!githubText && !cvText && !certText) {
      return res.status(400).json({ success: false, error: 'No evidence uploaded. Please upload GitHub, CV, or certificate first.' });
    }

    const mlResult = await runAnalysis(githubText, cvText, certText);

    const careerMatches = mlResult.careers.map((c) => ({
      career: c.name,
      probability: c.probability,
      description: CAREER_DESCRIPTIONS[c.name] || '',
    }));

    const topCareer = careerMatches[0]?.career || 'Backend';
    const narrative = await generateNarrative(topCareer, mlResult.competencies);

    const result = await db.query(
      `INSERT INTO analyses (user_id, competencies, narrative, top_career, career_matches)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        req.user.id,
        JSON.stringify(mlResult.competencies),
        narrative,
        topCareer,
        JSON.stringify(careerMatches),
      ]
    );

    const analysis = result.rows[0];

    res.json({
      success: true,
      data: {
        id: analysis.id,
        competencies: mlResult.competencies,
        narrative: analysis.narrative,
        career_matches: careerMatches,
        created_at: analysis.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:analysisId', authenticateToken, async (req, res, next) => {
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
