const pool = require('./db');

(async () => {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully!');

    // Query for users
    const res = await pool.query('SELECT * FROM "users"');
    console.log('Users:', res.rows);
  } catch (err) {
    console.error('Database query error:', err);
  } finally {
    pool.end();
  }
})();
