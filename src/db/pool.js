require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const dbFile = process.env.DB_FILE || './data/edusync.db';
const absPath = path.isAbsolute(dbFile) ? dbFile : path.join(__dirname, '..', '..', dbFile);

fs.mkdirSync(path.dirname(absPath), { recursive: true });

const db = new DatabaseSync(absPath);
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');

module.exports = db;
