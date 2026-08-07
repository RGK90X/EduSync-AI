const pool = require('../pool');

async function listAll() {
  const { rows } = await pool.query('SELECT * FROM homework ORDER BY date DESC, id DESC');
  return rows;
}

async function listForClass(className) {
  const { rows } = await pool.query(
    'SELECT * FROM homework WHERE class = $1 ORDER BY date DESC, id DESC',
    [className]
  );
  return rows;
}

async function create({ className, subject, text, dueDate, byName }) {
  await pool.query(
    'INSERT INTO homework (class, subject, text, due_date, by_name) VALUES ($1, $2, $3, $4, $5)',
    [className, subject, text, dueDate, byName]
  );
}

module.exports = { listAll, listForClass, create };
