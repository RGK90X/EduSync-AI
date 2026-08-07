function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.redirect('/');
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render('errors/403', { title: 'Access Denied' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
