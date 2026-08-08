function fmtDate(d) {
  if (!d) return '';
  try {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return String(d);
  }
}

// "Today" as YYYY-MM-DD in the server's LOCAL timezone. Deliberately avoids
// `new Date().toISOString()`, which reports the UTC date — for any positive
// UTC-offset timezone (e.g. India, UTC+5:30) that silently returns
// yesterday's date during early local-morning hours.
function todayStr(d) {
  const date = d || new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

module.exports = { fmtDate, todayStr };
