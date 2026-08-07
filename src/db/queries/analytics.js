const pool = require('../pool');

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

  const totalsRes = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'late')::int AS total_late,
       COUNT(*)::int AS total_records
     FROM attendance WHERE class = ANY($1)`,
    [scopeClasses]
  );

  const byClassRes = await pool.query(
    `SELECT class, COUNT(*)::int AS n FROM attendance
     WHERE class = ANY($1) AND status = 'late' GROUP BY class`,
    [scopeClasses]
  );
  const byClassMap = {};
  byClassRes.rows.forEach((r) => { byClassMap[r.class] = r.n; });
  const lateByClass = scopeClasses.map((c) => [c, byClassMap[c] || 0]);

  const months = lastSixMonths();
  const byMonthRes = await pool.query(
    `SELECT to_char(date, 'YYYY-MM') AS ym, COUNT(*)::int AS n FROM attendance
     WHERE class = ANY($1) AND status = 'late' AND date >= $2
     GROUP BY ym`,
    [scopeClasses, months[0] + '-01']
  );
  const byMonthMap = {};
  byMonthRes.rows.forEach((r) => { byMonthMap[r.ym] = r.n; });
  const lateByMonth = months.map((m) => [m.slice(5) + '/' + m.slice(2, 4), byMonthMap[m] || 0]);

  return {
    totalLate: totalsRes.rows[0].total_late,
    totalRecords: totalsRes.rows[0].total_records,
    lateByClass,
    lateByMonth
  };
}

module.exports = { lateArrivals };
