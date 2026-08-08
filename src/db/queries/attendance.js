const db = require('../pool');

async function listForStudent(admissionNo) {
  return db.prepare('SELECT * FROM attendance WHERE admission_no = ? ORDER BY date DESC').all(admissionNo);
}

async function summaryForStudent(admissionNo) {
  const row = db.prepare(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'present') AS present,
       COUNT(*) FILTER (WHERE status = 'late') AS late
     FROM attendance WHERE admission_no = ?`
  ).get(admissionNo);
  const { total, present, late } = row;
  const pct = total ? Math.round((present / total) * 100) : 0;
  return { total, present, late, pct };
}

async function listForClassOnDate(className, date) {
  const rows = db.prepare('SELECT * FROM attendance WHERE class = ? AND date = ?').all(className, date);
  const marks = {};
  rows.forEach((r) => { marks[r.admission_no] = r.status; });
  return marks;
}

// marks: [{ admissionNo, status }], upserts one row per student for that class/date.
async function saveBulk(className, date, marks, markedBy) {
  const upsert = db.prepare(
    `INSERT INTO attendance (admission_no, class, date, status, marked_by)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (admission_no, date)
     DO UPDATE SET status = excluded.status, marked_by = excluded.marked_by, class = excluded.class`
  );
  db.exec('BEGIN');
  try {
    for (const m of marks) {
      upsert.run(m.admissionNo, className, date, m.status, markedBy);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = { listForStudent, summaryForStudent, listForClassOnDate, saveBulk };
