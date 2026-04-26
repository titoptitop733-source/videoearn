const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('✅ Підключено до PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Помилка PostgreSQL:', err.message);
});

module.exports = { pool };