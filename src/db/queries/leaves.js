const pool = require('../pool');

async function listForStudent(admissionNo) {
  const { rows } = await pool.query(
    `SELECT id, admission_no, type, reason, status, responded_by, date,
            (file_data IS NOT NULL) AS has_file, file_name
     FROM leave_requests WHERE admission_no = $1 ORDER BY date DESC, id DESC`,
    [admissionNo]
  );
  return rows;
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
    params.push(scopeClasses);
    sql += ' WHERE s.class = ANY($1)';
  }
  sql += ' ORDER BY l.date DESC, l.id DESC';
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function create({ admissionNo, type, reason, file }) {
  await pool.query(
    `INSERT INTO leave_requests (admission_no, type, reason, file_data, file_mime, file_name)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      admissionNo, type, reason,
      file ? file.buffer : null,
      file ? file.mimetype : null,
      file ? file.originalname : null
    ]
  );
}

async function setStatus(id, status, respondedBy) {
  await pool.query(
    'UPDATE leave_requests SET status = $1, responded_by = $2 WHERE id = $3',
    [status, respondedBy, id]
  );
}

async function getFile(id) {
  const { rows } = await pool.query(
    'SELECT admission_no, file_data, file_mime, file_name FROM leave_requests WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

module.exports = { listForStudent, listForReview, create, setStatus, getFile };
