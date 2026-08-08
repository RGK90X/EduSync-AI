require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./pool');

function seed() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM admins').get();
  if (count > 0) {
    console.log('Admin already exists — skipping seed (passcode left untouched).');
    return;
  }
  const name = process.env.ADMIN_NAME || 'Admin';
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode) {
    console.error('ADMIN_PASSCODE is not set in .env — cannot seed the first admin account.');
    process.exit(1);
  }
  const hash = bcrypt.hashSync(passcode, 10);
  db.prepare('INSERT INTO admins (name, passcode_hash) VALUES (?, ?)').run(name, hash);
  console.log(`Seeded admin account "${name}". You can log in with the passcode from ADMIN_PASSCODE.`);
}

seed();
