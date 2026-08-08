const bcrypt = require('bcryptjs');
const db = require('../pool');
const { registerClass } = require('./classes');

function withClasses(row) {
  if (!row) return row;
  let classes = [];
  try { classes = JSON.parse(row.classes_json || '[]'); } catch (e) { classes = []; }
  return Object.assign({}, row, { classes });
}

async function listAll() {
  const rows = db.prepare('SELECT id, name, code_display, classes_json FROM teachers ORDER BY name ASC').all();
  return rows.map(withClasses);
}

// Teacher codes are hashed, so lookup means comparing the entered code
// against every stored hash (fine at expo scale — a handful of teachers).
async function findByCode(code) {
  const rows = db.prepare('SELECT * FROM teachers').all();
  for (const t of rows) {
    if (bcrypt.compareSync(code, t.code_hash)) return withClasses(t);
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
  const hash = bcrypt.hashSync(code, 10);
  db.prepare('INSERT INTO teachers (name, code_hash, code_display, classes_json) VALUES (?, ?, ?, ?)')
    .run(name, hash, code, JSON.stringify(normClasses));
}

async function remove(id) {
  db.prepare('DELETE FROM teachers WHERE id = ?').run(id);
}

module.exports = { listAll, findByCode, codeExists, create, remove };
