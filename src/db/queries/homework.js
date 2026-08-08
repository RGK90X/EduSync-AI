const db = require('../pool');

async function listAll() {
  return db.prepare('SELECT * FROM homework ORDER BY date DESC, id DESC').all();
}

async function listForClass(className) {
  return db.prepare('SELECT * FROM homework WHERE class = ? ORDER BY date DESC, id DESC').all(className);
}

async function create({ className, subject, text, dueDate, byName }) {
  db.prepare('INSERT INTO homework (class, subject, text, due_date, by_name) VALUES (?, ?, ?, ?, ?)')
    .run(className, subject, text, dueDate, byName);
}

module.exports = { listAll, listForClass, create };
