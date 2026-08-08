const bcrypt = require('bcryptjs');
const db = require('../pool');

async function findByPasscode(passcode) {
  const rows = db.prepare('SELECT * FROM admins').all();
  for (const a of rows) {
    if (bcrypt.compareSync(passcode, a.passcode_hash)) return a;
  }
  return null;
}

module.exports = { findByPasscode };
