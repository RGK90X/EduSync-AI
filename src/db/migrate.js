const fs = require('fs');
const path = require('path');
const db = require('./pool');

function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(sql);
  console.log('Migration complete: all tables created (or already existed).');
}

migrate();
