const db = require('../pool');
const { registerClass } = require('./classes');

async function findByAdmissionNo(admissionNo) {
  return db.prepare('SELECT * FROM students WHERE upper(admission_no) = upper(?)').get(admissionNo) || null;
}

async function listAll() {
  return db.prepare('SELECT * FROM students ORDER BY admission_no ASC').all();
}

async function listByClass(className) {
  return db.prepare('SELECT * FROM students WHERE class = ? ORDER BY name ASC').all(className);
}

async function create({ admissionNo, name, className }) {
  const finalClass = await registerClass(className);
  db.prepare('INSERT INTO students (admission_no, name, class) VALUES (?, ?, ?)').run(admissionNo, name, finalClass);
}

async function remove(admissionNo) {
  db.prepare('DELETE FROM students WHERE admission_no = ?').run(admissionNo);
}

module.exports = { findByAdmissionNo, listAll, listByClass, create, remove };
