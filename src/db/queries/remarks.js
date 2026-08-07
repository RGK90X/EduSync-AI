const pool = require('../pool');

async function listForStudent(admissionNo) {
  const { rows } = await pool.query(
    'SELECT * FROM remarks WHERE admission_no = $1 ORDER BY date DESC, id DESC',
    [admissionNo]
  );
  return rows;
}

async function listAll() {
  const { rows } = await pool.query('SELECT * FROM remarks ORDER BY date DESC, id DESC');
  return rows;
}

async function listGivenBy(byName) {
  const { rows } = await pool.query(
    'SELECT * FROM remarks WHERE by_name = $1 ORDER BY date DESC, id DESC LIMIT 20',
    [byName]
  );
  return rows;
}

async function create({ admissionNo, byName, text }) {
  await pool.query(
    'INSERT INTO remarks (admission_no, by_name, text) VALUES ($1, $2, $3)',
    [admissionNo, byName, text]
  );
}

module.exports = { listForStudent, listAll, listGivenBy, create };
