const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 100,
  skip: () => process.env.DEV_MODE === 'true',
  message: { success: false, error: 'Too many requests, please try again later' },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 60 : 30,
  skip: () => process.env.DEV_MODE === 'true',
  message: { success: false, error: 'Too many chat messages, please slow down' },
});

module.exports = { apiLimiter, chatLimiter };
