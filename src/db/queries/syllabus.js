const db = require('../pool');

async function listAll() {
  return db.prepare('SELECT * FROM syllabus ORDER BY date DESC, id DESC').all();
}

async function create({ examName, subject, content, byName }) {
  db.prepare('INSERT INTO syllabus (exam_name, subject, content, by_name) VALUES (?, ?, ?, ?)')
    .run(examName, subject, content, byName);
}

module.exports = { listAll, create };
