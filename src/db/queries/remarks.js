const db = require('../pool');

async function listForStudent(admissionNo) {
  return db.prepare('SELECT * FROM remarks WHERE admission_no = ? ORDER BY date DESC, id DESC').all(admissionNo);
}

async function listAll() {
  return db.prepare('SELECT * FROM remarks ORDER BY date DESC, id DESC').all();
}

async function listGivenBy(byName) {
  return db.prepare('SELECT * FROM remarks WHERE by_name = ? ORDER BY date DESC, id DESC LIMIT 20').all(byName);
}

async function create({ admissionNo, byName, text }) {
  db.prepare('INSERT INTO remarks (admission_no, by_name, text) VALUES (?, ?, ?)').run(admissionNo, byName, text);
}

module.exports = { listForStudent, listAll, listGivenBy, create };
