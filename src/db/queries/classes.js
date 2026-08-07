const pool = require('../pool');

// Mirrors the prototype's registerClass(): inserts the class name if it
// doesn't already exist (case-insensitive match returns the existing name).
async function registerClass(name) {
  const clean = String(name || '').trim();
  if (!clean) return clean;
  const existing = await pool.query('SELECT name FROM classes WHERE lower(name) = lower($1)', [clean]);
  if (existing.rows.length) return existing.rows[0].name;
  await pool.query('INSERT INTO classes (name) VALUES ($1) ON CONFLICT DO NOTHING', [clean]);
  return clean;
}

async function getClassList() {
  const { rows } = await pool.query('SELECT name FROM classes ORDER BY name ASC');
  return rows.map((r) => r.name);
}

module.exports = { registerClass, getClassList };
