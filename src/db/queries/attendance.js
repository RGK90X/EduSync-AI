const pool = require('../pool');

async function listForStudent(admissionNo) {
  const { rows } = await pool.query(
    'SELECT * FROM attendance WHERE admission_no = $1 ORDER BY date DESC',
    [admissionNo]
  );
  return rows;
}

async function summaryForStudent(admissionNo) {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'present')::int AS present,
       COUNT(*) FILTER (WHERE status = 'late')::int AS late
     FROM attendance WHERE admission_no = $1`,
    [admissionNo]
  );
  const { total, present, late } = rows[0];
  const pct = total ? Math.round((present / total) * 100) : 0;
  return { total, present, late, pct };
}

async function listForClassOnDate(className, date) {
  const { rows } = await pool.query(
    'SELECT * FROM attendance WHERE class = $1 AND date = $2',
    [className, date]
  );
  const marks = {};
  rows.forEach((r) => { marks[r.admission_no] = r.status; });
  return marks;
}

// marks: [{ admissionNo, status }], upserts one row per student for that class/date.
async function saveBulk(className, date, marks, markedBy) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const m of marks) {
      await client.query(
        `INSERT INTO attendance (admission_no, class, date, status, marked_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (admission_no, date)
         DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by, class = EXCLUDED.class`,
        [m.admissionNo, className, date, m.status, markedBy]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { listForStudent, summaryForStudent, listForClassOnDate, saveBulk };
