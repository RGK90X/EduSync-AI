const pool = require('../pool');

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

async function getForClass(className) {
  const { rows } = await pool.query(
    'SELECT day, period, value FROM timetable WHERE class = $1',
    [className]
  );
  const grid = {};
  rows.forEach((r) => { grid[r.day + '-' + r.period] = r.value; });
  return grid;
}

// entries: { "Mon-1": "value", ... } — whole-class replace, matching the prototype's save-all behavior.
async function saveForClass(className, entries) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const day of DAYS) {
      for (const period of PERIODS) {
        const key = day + '-' + period;
        const value = (entries[key] || '').trim();
        await client.query(
          `INSERT INTO timetable (class, day, period, value) VALUES ($1, $2, $3, $4)
           ON CONFLICT (class, day, period) DO UPDATE SET value = EXCLUDED.value`,
          [className, day, period, value]
        );
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { DAYS, PERIODS, getForClass, saveForClass };
