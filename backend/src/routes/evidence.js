const express = require('express');
const multer = require('multer');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { fetchGitHubProfile } = require('../services/githubService');
const { extractTextFromPdf, extractSkillsFromText } = require('../services/pdfParser');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * @swagger
 * /evidence/github:
 *   post:
 *     summary: Ingest GitHub profile data
 *     tags: [Evidence]
 */
router.post('/github', authenticateToken, async (req, res, next) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername) {
      return res.status(400).json({ error: 'GitHub username required' });
    }

    const githubData = await fetchGitHubProfile(githubUsername);
    const rawText = githubData.signals.readmeText;

    await db.query(
      `INSERT INTO evidence (user_id, evidence_type, content_type, raw_text, extracted_data)
       VALUES ($1, 'github', 'json', $2, $3)`,
      [req.user.id, rawText, JSON.stringify(githubData)]
    );

    await db.query(
      'UPDATE users SET github_username = $1, updated_at = NOW() WHERE id = $2',
      [githubUsername, req.user.id]
    );

    res.json({
      repos: githubData.repos,
      languages: githubData.languages,
      signals: githubData.signals,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'GitHub user not found' });
    }
    next(err);
  }
});

/**
 * @swagger
 * /evidence/certificate:
 *   post:
 *     summary: Upload certificate PDF
 *     tags: [Evidence]
 */
router.post('/certificate', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Certificate file required' });
    }

    const extractedText = await extractTextFromPdf(req.file.buffer);
    const skills = extractSkillsFromText(extractedText);

    await db.query(
      `INSERT INTO evidence (user_id, evidence_type, content_type, raw_text, extracted_data)
       VALUES ($1, 'certificate', 'pdf', $2, $3)`,
      [req.user.id, extractedText, JSON.stringify({ skills })]
    );

    res.json({ extracted_text: extractedText, skills });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /evidence/cv:
 *   post:
 *     summary: Upload CV (PDF or text)
 *     tags: [Evidence]
 */
router.post('/cv', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
    let extractedText = req.body.text || '';

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        extractedText = await extractTextFromPdf(req.file.buffer);
      } else {
        extractedText = req.file.buffer.toString('utf8');
      }
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'CV text or file required' });
    }

    const experience = extractSkillsFromText(extractedText);

    await db.query(
      `INSERT INTO evidence (user_id, evidence_type, content_type, raw_text, extracted_data)
       VALUES ($1, 'cv', $2, $3, $4)`,
      [req.user.id, req.file ? 'pdf' : 'text', extractedText, JSON.stringify({ experience })]
    );

    res.json({ extracted_text: extractedText, experience });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /evidence/{userId}:
 *   get:
 *     summary: Get user evidence
 *     tags: [Evidence]
 */
router.get('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      'SELECT evidence_type, content_type, raw_text, extracted_data, uploaded_at FROM evidence WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [userId]
    );

    const evidence = { github_data: null, certificate_data: null, cv_data: null };

    for (const row of result.rows) {
      const data = {
        raw_text: row.raw_text,
        extracted_data: row.extracted_data,
        uploaded_at: row.uploaded_at,
      };
      if (row.evidence_type === 'github') evidence.github_data = data;
      else if (row.evidence_type === 'certificate') evidence.certificate_data = data;
      else if (row.evidence_type === 'cv') evidence.cv_data = data;
    }

    res.json(evidence);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
