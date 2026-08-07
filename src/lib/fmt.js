function fmtDate(d) {
  if (!d) return '';
  try {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return String(d);
  }
}

module.exports = { fmtDate };
