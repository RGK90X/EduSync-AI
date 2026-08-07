const bcrypt = require('bcryptjs');
const pool = require('../pool');
const { registerClass } = require('./classes');

async function listAll() {
  const { rows } = await pool.query('SELECT id, name, code_display, classes FROM teachers ORDER BY name ASC');
  return rows;
}

// Teacher codes are hashed, so lookup means comparing the entered code
// against every stored hash (fine at expo scale — a handful of teachers).
async function findByCode(code) {
  const { rows } = await pool.query('SELECT * FROM teachers');
  for (const t of rows) {
    if (await bcrypt.compare(code, t.code_hash)) return t;
  }
  return null;
}

async function codeExists(code) {
  return (await findByCode(code)) !== null;
}

async function create({ name, code, classes }) {
  const normClasses = [];
  for (const c of classes) {
    normClasses.push(await registerClass(c));
  }
  const hash = await bcrypt.hash(code, 10);
  await pool.query(
    'INSERT INTO teachers (name, code_hash, code_display, classes) VALUES ($1, $2, $3, $4)',
    [name, hash, code, normClasses]
  );
}

async function remove(id) {
  await pool.query('DELETE FROM teachers WHERE id = $1', [id]);
}

module.exports = { listAll, findByCode, codeExists, create, remove };
