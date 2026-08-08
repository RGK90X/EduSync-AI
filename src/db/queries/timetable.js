const db = require('../pool');

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

async function getForClass(className) {
  const rows = db.prepare('SELECT day, period, value FROM timetable WHERE class = ?').all(className);
  const grid = {};
  rows.forEach((r) => { grid[r.day + '-' + r.period] = r.value; });
  return grid;
}

// entries: { "Mon-1": "value", ... } — whole-class replace, matching the prototype's save-all behavior.
async function saveForClass(className, entries) {
  const upsert = db.prepare(
    `INSERT INTO timetable (class, day, period, value) VALUES (?, ?, ?, ?)
     ON CONFLICT (class, day, period) DO UPDATE SET value = excluded.value`
  );
  db.exec('BEGIN');
  try {
    for (const day of DAYS) {
      for (const period of PERIODS) {
        const key = day + '-' + period;
        const value = (entries[key] || '').trim();
        upsert.run(className, day, period, value);
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = { DAYS, PERIODS, getForClass, saveForClass };
