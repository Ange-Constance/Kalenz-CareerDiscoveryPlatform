const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: formatUser(user).name,
      is_admin: Boolean(user.is_admin),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

function formatUser(row) {
  const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email.split('@')[0];
  return {
    id: row.id,
    email: row.email,
    name,
    firstName: row.first_name,
    lastName: row.last_name,
    githubUsername: row.github_username,
    location: row.location,
    is_admin: Boolean(row.is_admin),
    createdAt: row.created_at,
  };
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { email, password, firstName, lastName, name } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);

      const parts = (name || '').trim().split(' ');
      const fName = firstName || parts[0] || null;
      const lName = lastName || parts.slice(1).join(' ') || null;
      const adminEmail = process.env.ADMIN_EMAIL || 'angeconstance400@gmail.com';
      const isAdminUser = email === adminEmail;

      const result = await db.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, is_admin)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [email, passwordHash, fName, lName, isAdminUser]
      );

      const user = formatUser(result.rows[0]);
      const token = generateToken(result.rows[0]);

      res.status(201).json({ success: true, token, user });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ success: false, error: 'An account with this email already exists' });
      }
      next(err);
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 */
router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { email, password } = req.body;
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);

      if (!valid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      res.json({ success: true, token: generateToken(user), user: formatUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /auth/github-callback:
 *   post:
 *     summary: GitHub OAuth callback
 *     tags: [Auth]
 */
router.post('/github-callback', async (req, res, next) => {
  try {
    const { code, githubUsername, email } = req.body;

    if (!githubUsername && !email) {
      return res.status(400).json({ error: 'GitHub username or email required' });
    }

    let result = await db.query(
      'SELECT * FROM users WHERE github_username = $1 OR email = $2',
      [githubUsername, email]
    );

    let user;
    if (result.rows.length === 0) {
      result = await db.query(
        `INSERT INTO users (email, github_username, github_id, first_name)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [email || `${githubUsername}@github.local`, githubUsername, code || githubUsername, githubUsername]
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];
      if (githubUsername) {
        await db.query(
          'UPDATE users SET github_username = $1, updated_at = NOW() WHERE id = $2',
          [githubUsername, user.id]
        );
      }
    }

    res.json({
      token: generateToken(user),
      user: formatUser(user),
      githubProfile: { username: githubUsername },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticateToken, (req, res) => {
  res.json({ success: true });
});

router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: formatUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
