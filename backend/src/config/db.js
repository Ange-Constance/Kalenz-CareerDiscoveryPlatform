const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL || '';
const useSsl =
  process.env.NODE_ENV === 'production' ||
  /supabase\.(co|com)|railway\.app|render\.com|neon\.tech|aws\.amazonaws\.com/i.test(dbUrl);

const pool = new Pool({
  connectionString: dbUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
