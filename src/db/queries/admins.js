const bcrypt = require('bcryptjs');
const pool = require('../pool');

async function findByPasscode(passcode) {
  const { rows } = await pool.query('SELECT * FROM admins');
  for (const a of rows) {
    if (await bcrypt.compare(passcode, a.passcode_hash)) return a;
  }
  return null;
}

module.exports = { findByPasscode };
