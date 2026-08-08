const express = require('express');
const router = express.Router();

const students = require('../db/queries/students');
const teachers = require('../db/queries/teachers');
const admins = require('../db/queries/admins');

const VALID_ROLES = new Set(['student', 'teacher', 'admin']);

router.get('/', (req, res) => {
  res.render('portal-select', { title: 'Choose your portal' });
});

router.get('/school-life', (req, res) => {
  res.render('school-life', { title: 'School Life & Events' });
});

router.get('/login/:role', (req, res) => {
  const { role } = req.params;
  if (!VALID_ROLES.has(role)) return res.status(404).render('errors/404', { title: 'Not Found' });
  res.render('login', { role, error: null });
});

router.post('/login/:role', async (req, res, next) => {
  const { role } = req.params;
  if (!VALID_ROLES.has(role)) return res.status(404).render('errors/404', { title: 'Not Found' });

  try {
    if (role === 'student') {
      const name = (req.body.name || '').trim();
      const admissionNo = (req.body.admissionNo || '').trim().toUpperCase();
      if (!name || !admissionNo) {
        return res.render('login', { role, error: 'Please fill in both fields.' });
      }
      const stu = await students.findByAdmissionNo(admissionNo);
      if (!stu) {
        return res.render('login', { role, error: 'Admission number not found. Check with your school office.' });
      }
      req.session.user = {
        role: 'student',
        name: stu.name,
        loginNameEntered: name,
        admissionNo: stu.admission_no,
        class: stu.class
      };
      return res.redirect('/student');
    }

    if (role === 'teacher') {
      const name = (req.body.name || '').trim();
      const code = (req.body.code || '').trim().toUpperCase();
      if (!name || !code) {
        return res.render('login', { role, error: 'Please fill in both fields.' });
      }
      const t = await teachers.findByCode(code);
      if (!t) {
        return res.render('login', { role, error: 'Invalid teacher code.' });
      }
      req.session.user = {
        role: 'teacher',
        name: t.name,
        teacherId: t.id,
        classes: t.classes || []
      };
      return res.redirect('/staff/attendance');
    }

    // admin
    const name = (req.body.name || '').trim();
    const passcode = (req.body.passcode || '').trim();
    if (!name || !passcode) {
      return res.render('login', { role, error: 'Please fill in both fields.' });
    }
    const a = await admins.findByPasscode(passcode);
    if (!a) {
      return res.render('login', { role, error: 'Invalid passcode.' });
    }
    req.session.user = {
      role: 'admin',
      name: name || a.name,
      classes: []
    };
    return res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
