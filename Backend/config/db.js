// config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'skillsync',
  password: 'nikita', // 🔒 Replace with your actual password
  port: 5432,
});

module.exports = pool;

