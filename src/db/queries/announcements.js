const pool = require('../pool');

async function listRecent(limit) {
  const { rows } = await pool.query(
    'SELECT * FROM announcements ORDER BY date DESC, id DESC LIMIT $1',
    [limit]
  );
  return rows;
}

async function create({ title, text, byName }) {
  await pool.query(
    'INSERT INTO announcements (title, text, by_name) VALUES ($1, $2, $3)',
    [title, text, byName]
  );
}

module.exports = { listRecent, create };
