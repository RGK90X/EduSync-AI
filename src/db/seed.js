require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function seed() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM admins');
  if (rows[0].count > 0) {
    console.log('Admin already exists — skipping seed (passcode left untouched).');
    await pool.end();
    return;
  }
  const name = process.env.ADMIN_NAME || 'Admin';
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode) {
    console.error('ADMIN_PASSCODE is not set in .env — cannot seed the first admin account.');
    process.exit(1);
  }
  const hash = await bcrypt.hash(passcode, 10);
  await pool.query('INSERT INTO admins (name, passcode_hash) VALUES ($1, $2)', [name, hash]);
  console.log(`Seeded admin account "${name}". You can log in with the passcode from ADMIN_PASSCODE.`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
