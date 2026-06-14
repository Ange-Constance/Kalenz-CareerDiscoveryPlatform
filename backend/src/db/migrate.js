require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { pool } = require('../config/db');

async function ensureDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL is not set in .env');

  const match = dbUrl.match(/\/([^/?]+)(\?|$)/);
  const dbName = match?.[1];
  if (!dbName) throw new Error('Could not parse database name from DATABASE_URL');

  const adminUrl = dbUrl.replace(`/${dbName}`, '/postgres');
  const client = new Client({ connectionString: adminUrl });

  await client.connect();
  const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

  if (exists.rows.length === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created database "${dbName}"`);
  }

  await client.end();
}

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    await ensureDatabase();
    await pool.query(schema);
    console.log('Database migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
