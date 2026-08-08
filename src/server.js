require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const { fmtDate, todayStr } = require('./lib/fmt');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.locals.fmtDate = fmtDate;
app.locals.todayStr = todayStr;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// This app runs as a single local process on one laptop (no cloud DB, no
// horizontal scaling), so an in-memory session store is the right fit —
// simpler than a DB-backed store, at the cost of logging everyone out if
// the server restarts (acceptable for an expo booth: just log back in).
app.use(session({
  store: new session.MemoryStore(),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Make the logged-in user available to every view (topbar/sidebar) without
// threading it through every single res.render call.
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use('/', require('./routes/index'));
app.use('/student', require('./routes/student'));
app.use('/staff', require('./routes/staff'));
app.use('/admin', require('./routes/admin'));
app.use('/files', require('./routes/files'));

app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Not Found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong. Please try again.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EduSync AI listening on http://localhost:${PORT}`);
});
