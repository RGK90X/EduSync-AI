const db = require('../pool');

// Mirrors the prototype's registerClass(): inserts the class name if it
// doesn't already exist (case-insensitive match returns the existing name).
async function registerClass(name) {
  const clean = String(name || '').trim();
  if (!clean) return clean;
  const existing = db.prepare('SELECT name FROM classes WHERE lower(name) = lower(?)').get(clean);
  if (existing) return existing.name;
  db.prepare('INSERT OR IGNORE INTO classes (name) VALUES (?)').run(clean);
  return clean;
}

async function getClassList() {
  const rows = db.prepare('SELECT name FROM classes ORDER BY name ASC').all();
  return rows.map((r) => r.name);
}

module.exports = { registerClass, getClassList };
