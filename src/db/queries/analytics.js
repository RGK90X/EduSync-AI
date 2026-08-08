const db = require('../pool');

// Builds each of the last 6 months as a "YYYY-MM" string using LOCAL
// year/month arithmetic only — deliberately avoids the
// construct-local-date-then-toISOString() pattern, which reports the UTC
// month and silently shifts the whole window back a month for any positive
// UTC-offset timezone (e.g. India, UTC+5:30).
function lastSixMonths() {
  const months = [];
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-based
  for (let i = 5; i >= 0; i--) {
    let mm = m - i;
    let yy = y;
    while (mm < 0) { mm += 12; yy -= 1; }
    months.push(yy + '-' + String(mm + 1).padStart(2, '0'));
  }
  return months;
}

// scopeClasses: array of class names to restrict to (admin passes the full class list).
async function lateArrivals(scopeClasses) {
  if (!scopeClasses.length) {
    return { totalLate: 0, totalRecords: 0, lateByClass: [], lateByMonth: [] };
  }

  const placeholders = scopeClasses.map(() => '?').join(',');

  const totals = db.prepare(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'late') AS total_late,
       COUNT(*) AS total_records
     FROM attendance WHERE class IN (${placeholders})`
  ).get(...scopeClasses);

  const byClassRows = db.prepare(
    `SELECT class, COUNT(*) AS n FROM attendance
     WHERE class IN (${placeholders}) AND status = 'late' GROUP BY class`
  ).all(...scopeClasses);
  const byClassMap = {};
  byClassRows.forEach((r) => { byClassMap[r.class] = r.n; });
  const lateByClass = scopeClasses.map((c) => [c, byClassMap[c] || 0]);

  const months = lastSixMonths();
  const byMonthRows = db.prepare(
    `SELECT strftime('%Y-%m', date) AS ym, COUNT(*) AS n FROM attendance
     WHERE class IN (${placeholders}) AND status = 'late' AND date >= ?
     GROUP BY ym`
  ).all(...scopeClasses, months[0] + '-01');
  const byMonthMap = {};
  byMonthRows.forEach((r) => { byMonthMap[r.ym] = r.n; });
  const lateByMonth = months.map((m) => [m.slice(5) + '/' + m.slice(2, 4), byMonthMap[m] || 0]);

  return {
    totalLate: totals.total_late,
    totalRecords: totals.total_records,
    lateByClass,
    lateByMonth
  };
}

module.exports = { lateArrivals };
