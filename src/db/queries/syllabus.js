const pool = require('../pool');

async function listAll() {
  const { rows } = await pool.query('SELECT * FROM syllabus ORDER BY date DESC, id DESC');
  return rows;
}

async function create({ examName, subject, content, byName }) {
  await pool.query(
    'INSERT INTO syllabus (exam_name, subject, content, by_name) VALUES ($1, $2, $3, $4)',
    [examName, subject, content, byName]
  );
}

module.exports = { listAll, create };
