const pool = require('../pool');
const { registerClass } = require('./classes');

async function findByAdmissionNo(admissionNo) {
  const { rows } = await pool.query(
    'SELECT * FROM students WHERE upper(admission_no) = upper($1)',
    [admissionNo]
  );
  return rows[0] || null;
}

async function listAll() {
  const { rows } = await pool.query('SELECT * FROM students ORDER BY admission_no ASC');
  return rows;
}

async function listByClass(className) {
  const { rows } = await pool.query('SELECT * FROM students WHERE class = $1 ORDER BY name ASC', [className]);
  return rows;
}

async function create({ admissionNo, name, className }) {
  const finalClass = await registerClass(className);
  await pool.query(
    'INSERT INTO students (admission_no, name, class) VALUES ($1, $2, $3)',
    [admissionNo, name, finalClass]
  );
}

async function remove(admissionNo) {
  await pool.query('DELETE FROM students WHERE admission_no = $1', [admissionNo]);
}

module.exports = { findByAdmissionNo, listAll, listByClass, create, remove };
