const express = require('express');
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

const CAREER_CLASSES = [
  'Backend Development',
  'Frontend Development',
  'AI/ML Development',
  'UI/UX Design',
  'DevOps/Cloud',
  'Data Engineering',
  'Cybersecurity',
  'Mobile Development',
  'Product/Project Management',
];

const MODEL_PERFORMANCE = {
  version: 'v3',
  overall_accuracy: 86.49,
  classes: {
    'Backend Development': { precision: 0.86, recall: 0.81, f1: 0.83, support: 120 },
    'Frontend Development': { precision: 0.84, recall: 0.89, f1: 0.87, support: 115 },
    'AI/ML Development': { precision: 0.88, recall: 0.88, f1: 0.88, support: 98 },
    'UI/UX Design': { precision: 0.84, recall: 0.9, f1: 0.87, support: 87 },
    'DevOps/Cloud': { precision: 0.82, recall: 0.88, f1: 0.85, support: 92 },
    'Data Engineering': { precision: 0.9, recall: 0.92, f1: 0.91, support: 76 },
    Cybersecurity: { precision: 0.87, recall: 0.9, f1: 0.89, support: 84 },
    'Mobile Development': { precision: 0.92, recall: 0.8, f1: 0.86, support: 71 },
    'Product/Project Management': { precision: 0.86, recall: 0.82, f1: 0.84, support: 65 },
  },
};

router.use(authenticateToken, isAdmin);

function classifyInputSources(sources) {
  const list = Array.isArray(sources) ? sources : [];
  if (list.length === 1 && list[0] === 'cv') return 'cv_only';
  if (list.length === 1 && list[0] === 'github') return 'github_only';
  if (list.length > 1) return 'combined';
  if (list.length === 1) return 'other';
  return 'other';
}

router.get('/metrics', async (req, res, next) => {
  try {
    const [
      usersTotal,
      usersWeek,
      usersMonth,
      activeUsers,
      analysesTotal,
      analysesWeek,
      avgConfidence,
      inputSourceRows,
      careerRows,
      chatStats,
      roadmapsTotal,
      recentUsers,
      recentAnalyses,
      skillsRows,
    ] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS count FROM users'),
      db.query(
        `SELECT COUNT(*)::int AS count FROM users WHERE created_at >= NOW() - INTERVAL '7 days'`
      ),
      db.query(
        `SELECT COUNT(*)::int AS count FROM users WHERE created_at >= NOW() - INTERVAL '30 days'`
      ),
      db.query(
        `SELECT COUNT(DISTINCT user_id)::int AS count FROM career_analyses
         WHERE created_at >= NOW() - INTERVAL '7 days'`
      ),
      db.query('SELECT COUNT(*)::int AS count FROM career_analyses'),
      db.query(
        `SELECT COUNT(*)::int AS count FROM career_analyses
         WHERE created_at >= NOW() - INTERVAL '7 days'`
      ),
      db.query(
        `SELECT AVG(
           (confidence_scores->>predicted_career)::float
         ) AS avg_conf
         FROM career_analyses
         WHERE confidence_scores IS NOT NULL AND predicted_career IS NOT NULL`
      ),
      db.query('SELECT input_sources FROM career_analyses'),
      db.query(
        `SELECT predicted_career, COUNT(*)::int AS count
         FROM career_analyses GROUP BY predicted_career`
      ),
      db.query(
        `SELECT COUNT(*)::int AS total,
                COUNT(DISTINCT COALESCE(session_id, career_analysis_id::text, user_id::text))::int AS sessions
         FROM chat_messages`
      ),
      db.query('SELECT COUNT(*)::int AS count FROM roadmaps'),
      db.query(
        `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at,
                (SELECT COUNT(*)::int FROM career_analyses ca WHERE ca.user_id = u.id) AS analyses_count
         FROM users u ORDER BY u.created_at DESC LIMIT 5`
      ),
      db.query(
        `SELECT ca.id, ca.predicted_career, ca.confidence_scores, ca.input_sources, ca.created_at,
                u.email AS user_email
         FROM career_analyses ca
         JOIN users u ON u.id = ca.user_id
         ORDER BY ca.created_at DESC LIMIT 5`
      ),
      db.query(
        `SELECT skill, COUNT(*)::int AS count
         FROM career_analyses, jsonb_array_elements_text(key_skills) AS skill
         GROUP BY skill ORDER BY count DESC LIMIT 10`
      ),
    ]);

    const inputSources = { cv_only: 0, github_only: 0, combined: 0, other: 0 };
    for (const row of inputSourceRows.rows) {
      const sources = typeof row.input_sources === 'string'
        ? JSON.parse(row.input_sources)
        : row.input_sources || [];
      const key = classifyInputSources(sources);
      inputSources[key] = (inputSources[key] || 0) + 1;
    }

    const careerDistribution = {};
    for (const career of CAREER_CLASSES) {
      careerDistribution[career] = 0;
    }
    for (const row of careerRows.rows) {
      if (row.predicted_career) {
        careerDistribution[row.predicted_career] = row.count;
      }
    }

    const totalMessages = chatStats.rows[0]?.total || 0;
    const sessions = chatStats.rows[0]?.sessions || 1;

    res.json({
      success: true,
      data: {
        users: {
          total: usersTotal.rows[0].count,
          new_this_week: usersWeek.rows[0].count,
          new_this_month: usersMonth.rows[0].count,
          active_last_7_days: activeUsers.rows[0].count,
        },
        analyses: {
          total: analysesTotal.rows[0].count,
          this_week: analysesWeek.rows[0].count,
          avg_confidence: avgConfidence.rows[0]?.avg_conf
            ? Math.round(parseFloat(avgConfidence.rows[0].avg_conf) * 1000) / 10
            : 0,
          input_sources: {
            cv_only: inputSources.cv_only,
            github_only: inputSources.github_only,
            combined: inputSources.combined,
          },
        },
        career_distribution: careerDistribution,
        model_performance: MODEL_PERFORMANCE,
        chat: {
          total_messages: totalMessages,
          avg_messages_per_session: Math.round((totalMessages / sessions) * 10) / 10,
        },
        roadmaps: {
          total_generated: roadmapsTotal.rows[0].count,
        },
        top_skills: skillsRows.rows.map((r) => ({ skill: r.skill, count: r.count })),
        recent_users: recentUsers.rows.map((u) => ({
          id: u.id,
          name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email.split('@')[0],
          email: u.email,
          created_at: u.created_at,
          analyses_count: u.analyses_count,
        })),
        recent_analyses: recentAnalyses.rows.map((a) => {
          const scores = a.confidence_scores || {};
          const pct = a.predicted_career ? scores[a.predicted_career] : null;
          return {
            id: a.id,
            user_email: a.user_email,
            predicted_career: a.predicted_career,
            confidence_pct: pct != null ? Math.round(pct * 1000) / 10 : null,
            input_sources: a.input_sources,
            created_at: a.created_at,
          };
        }),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    let where = '';
    const params = [limit, offset];
    if (search) {
      where = 'WHERE u.email ILIKE $3 OR u.first_name ILIKE $3 OR u.last_name ILIKE $3';
      params.push(`%${search}%`);
    }

    const countResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM users u ${where}`,
      search ? [`%${search}%`] : []
    );

    const result = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.is_admin, u.created_at,
              (SELECT COUNT(*)::int FROM career_analyses ca WHERE ca.user_id = u.id) AS analyses_count,
              (SELECT MAX(created_at) FROM career_analyses ca WHERE ca.user_id = u.id) AS last_active
       FROM users u
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    res.json({
      success: true,
      data: {
        users: result.rows.map((u) => ({
          id: u.id,
          name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email.split('@')[0],
          email: u.email,
          is_admin: Boolean(u.is_admin),
          created_at: u.created_at,
          analyses_count: u.analyses_count,
          last_active: u.last_active,
        })),
        pagination: {
          page,
          limit,
          total: countResult.rows[0].count,
          pages: Math.ceil(countResult.rows[0].count / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const analysesResult = await db.query(
      `SELECT id, predicted_career, confidence_scores, narrative, input_sources, created_at
       FROM career_analyses WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const u = userResult.rows[0];
    res.json({
      success: true,
      data: {
        id: u.id,
        name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email.split('@')[0],
        email: u.email,
        is_admin: Boolean(u.is_admin),
        created_at: u.created_at,
        analyses: analysesResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { is_admin: isAdminFlag } = req.body;

    if (typeof isAdminFlag !== 'boolean') {
      return res.status(400).json({ success: false, error: 'is_admin boolean is required' });
    }

    const result = await db.query(
      'UPDATE users SET is_admin = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, is_admin',
      [isAdminFlag, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get('/analyses', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const offset = (page - 1) * limit;
    const career = (req.query.career || '').trim();

    let where = '';
    const countParams = [];
    const queryParams = [limit, offset];

    if (career) {
      where = 'WHERE ca.predicted_career = $3';
      countParams.push(career);
      queryParams.push(career);
    }

    const countResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM career_analyses ca ${where}`,
      countParams
    );

    const result = await db.query(
      `SELECT ca.id, ca.predicted_career, ca.confidence_scores, ca.input_sources,
              ca.narrative, ca.created_at, u.email AS user_email
       FROM career_analyses ca
       JOIN users u ON u.id = ca.user_id
       ${where}
       ORDER BY ca.created_at DESC
       LIMIT $1 OFFSET $2`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        analyses: result.rows.map((a) => {
          const scores = a.confidence_scores || {};
          const pct = a.predicted_career ? scores[a.predicted_career] : null;
          return {
            id: a.id,
            user_email: a.user_email,
            predicted_career: a.predicted_career,
            confidence_pct: pct != null ? Math.round(pct * 1000) / 10 : null,
            input_sources: a.input_sources,
            narrative: a.narrative,
            created_at: a.created_at,
          };
        }),
        pagination: {
          page,
          limit,
          total: countResult.rows[0].count,
          pages: Math.ceil(countResult.rows[0].count / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
