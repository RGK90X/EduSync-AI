const pool = require('../pool');

async function createFromStudent({ admissionNo, category, text }) {
  await pool.query(
    `INSERT INTO complaints (source, filed_by_role, by_admission_no, category, text)
     VALUES ('student', 'student', $1, $2, $3)`,
    [admissionNo, category, text]
  );
}

async function createFromStaff({ role, byName, aboutAdmissionNo, category, text }) {
  await pool.query(
    `INSERT INTO complaints (source, filed_by_role, by_name, about_admission_no, category, text)
     VALUES ('staff', $1, $2, $3, $4, $5)`,
    [role, byName, aboutAdmissionNo, category, text]
  );
}

async function listForStudent(admissionNo) {
  const { rows } = await pool.query(
    `SELECT * FROM complaints WHERE source = 'student' AND by_admission_no = $1 ORDER BY date DESC, id DESC`,
    [admissionNo]
  );
  return rows;
}

// All student-filed complaints, visible school-wide to staff.
async function listStudentComplaints() {
  const { rows } = await pool.query(
    `SELECT * FROM complaints WHERE source = 'student' ORDER BY date DESC, id DESC`
  );
  return rows;
}

async function listFiledByStaff(byName) {
  const { rows } = await pool.query(
    `SELECT * FROM complaints WHERE source = 'staff' AND by_name = $1 ORDER BY date DESC, id DESC`,
    [byName]
  );
  return rows;
}

module.exports = { createFromStudent, createFromStaff, listForStudent, listStudentComplaints, listFiledByStaff };
