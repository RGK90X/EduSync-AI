const db = require('../pool');

async function createFromStudent({ admissionNo, category, text }) {
  db.prepare(
    `INSERT INTO complaints (source, filed_by_role, by_admission_no, category, text)
     VALUES ('student', 'student', ?, ?, ?)`
  ).run(admissionNo, category, text);
}

async function createFromStaff({ role, byName, aboutAdmissionNo, category, text }) {
  db.prepare(
    `INSERT INTO complaints (source, filed_by_role, by_name, about_admission_no, category, text)
     VALUES ('staff', ?, ?, ?, ?, ?)`
  ).run(role, byName, aboutAdmissionNo, category, text);
}

async function listForStudent(admissionNo) {
  return db.prepare(
    `SELECT * FROM complaints WHERE source = 'student' AND by_admission_no = ? ORDER BY date DESC, id DESC`
  ).all(admissionNo);
}

// All student-filed complaints, visible school-wide to staff.
async function listStudentComplaints() {
  return db.prepare(`SELECT * FROM complaints WHERE source = 'student' ORDER BY date DESC, id DESC`).all();
}

async function listFiledByStaff(byName) {
  return db.prepare(
    `SELECT * FROM complaints WHERE source = 'staff' AND by_name = ? ORDER BY date DESC, id DESC`
  ).all(byName);
}

module.exports = { createFromStudent, createFromStaff, listForStudent, listStudentComplaints, listFiledByStaff };
