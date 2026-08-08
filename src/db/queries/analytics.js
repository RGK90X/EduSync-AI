const db = require('../pool');

function lastSixMonths() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7)); // YYYY-MM
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
