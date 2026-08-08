const db = require('../pool');

async function listForStudent(admissionNo) {
  return db.prepare(
    `SELECT id, admission_no, type, reason, status, responded_by, date,
            (file_data IS NOT NULL) AS has_file, file_name
     FROM leave_requests WHERE admission_no = ? ORDER BY date DESC, id DESC`
  ).all(admissionNo);
}

// scopeClasses: null/undefined means "all" (admin); otherwise restrict to students in those classes.
async function listForReview(scopeClasses) {
  let sql = `
    SELECT l.id, l.admission_no, l.type, l.reason, l.status, l.responded_by, l.date,
           (l.file_data IS NOT NULL) AS has_file, l.file_name,
           s.name AS student_name, s.class AS student_class
    FROM leave_requests l
    JOIN students s ON s.admission_no = l.admission_no`;
  const params = [];
  if (scopeClasses && scopeClasses.length) {
    const placeholders = scopeClasses.map(() => '?').join(',');
    sql += ` WHERE s.class IN (${placeholders})`;
    params.push(...scopeClasses);
  }
  sql += ' ORDER BY l.date DESC, l.id DESC';
  return db.prepare(sql).all(...params);
}

async function create({ admissionNo, type, reason, file }) {
  db.prepare(
    `INSERT INTO leave_requests (admission_no, type, reason, file_data, file_mime, file_name)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    admissionNo, type, reason,
    file ? file.buffer : null,
    file ? file.mimetype : null,
    file ? file.originalname : null
  );
}

async function setStatus(id, status, respondedBy) {
  db.prepare('UPDATE leave_requests SET status = ?, responded_by = ? WHERE id = ?').run(status, respondedBy, id);
}

async function getFile(id) {
  return db.prepare('SELECT admission_no, file_data, file_mime, file_name FROM leave_requests WHERE id = ?').get(id) || null;
}

module.exports = { listForStudent, listForReview, create, setStatus, getFile };
