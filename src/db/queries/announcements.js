const db = require('../pool');

async function listRecent(limit) {
  return db.prepare('SELECT * FROM announcements ORDER BY date DESC, id DESC LIMIT ?').all(limit);
}

async function create({ title, text, byName }) {
  db.prepare('INSERT INTO announcements (title, text, by_name) VALUES (?, ?, ?)').run(title, text, byName);
}

module.exports = { listRecent, create };
