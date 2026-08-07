const express = require('express');
const router = express.Router();

const { requireRole } = require('../middleware/auth');
const { navItemsFor } = require('../lib/nav');

const students = require('../db/queries/students');
const teachers = require('../db/queries/teachers');
const leaves = require('../db/queries/leaves');
const announcements = require('../db/queries/announcements');

router.use(requireRole('admin'));

function render(req, res, active, view, data) {
  res.render('admin/' + view, Object.assign({
    navItems: navItemsFor('admin'),
    active,
    title: null
  }, data));
}

router.get('/', async (req, res, next) => {
  try {
    const allStudents = await students.listAll();
    const allTeachers = await teachers.listAll();
    const pendingLeaves = (await leaves.listForReview(null)).filter((l) => l.status === 'pending');
    const recentAnnouncements = await announcements.listRecent(3);
    render(req, res, 'overview', 'overview', {
      title: 'Admin Overview',
      totalStudents: allStudents.length,
      totalTeachers: allTeachers.length,
      pendingLeaveCount: pendingLeaves.length,
      announcements: recentAnnouncements
    });
  } catch (err) { next(err); }
});

router.get('/students', async (req, res, next) => {
  try {
    const list = await students.listAll();
    render(req, res, 'students', 'students', { title: 'Manage Students', list, error: null });
  } catch (err) { next(err); }
});

router.post('/students', async (req, res, next) => {
  try {
    const admissionNo = (req.body.admissionNo || '').trim().toUpperCase();
    const name = (req.body.name || '').trim();
    const className = (req.body.class || '').trim();
    const list = await students.listAll();

    if (!admissionNo || !name || !className) {
      return render(req, res, 'students', 'students', { title: 'Manage Students', list, error: 'Please fill in all fields.' });
    }
    if (!/^M0/.test(admissionNo)) {
      return render(req, res, 'students', 'students', { title: 'Manage Students', list, error: 'Admission number must start with M0 (e.g. M01004).' });
    }
    const existing = await students.findByAdmissionNo(admissionNo);
    if (existing) {
      return render(req, res, 'students', 'students', { title: 'Manage Students', list, error: 'This admission number already exists.' });
    }
    await students.create({ admissionNo, name, className });
    const updated = await students.listAll();
    render(req, res, 'students', 'students', { title: 'Manage Students', list: updated, error: null });
  } catch (err) { next(err); }
});

router.post('/students/:admissionNo/delete', async (req, res, next) => {
  try {
    await students.remove(req.params.admissionNo);
    res.redirect('/admin/students');
  } catch (err) { next(err); }
});

router.get('/teachers', async (req, res, next) => {
  try {
    const list = await teachers.listAll();
    render(req, res, 'teachers', 'teachers', { title: 'Manage Teachers', list, error: null });
  } catch (err) { next(err); }
});

router.post('/teachers', async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    const code = (req.body.code || '').trim().toUpperCase();
    const classesRaw = (req.body.classes || '').trim();
    const classes = classesRaw ? classesRaw.split(',').map((c) => c.trim()).filter(Boolean) : [];
    const list = await teachers.listAll();

    if (!name || !code) {
      return render(req, res, 'teachers', 'teachers', { title: 'Manage Teachers', list, error: 'Please fill in name and code.' });
    }
    if (await teachers.codeExists(code)) {
      return render(req, res, 'teachers', 'teachers', { title: 'Manage Teachers', list, error: 'This teacher code already exists.' });
    }
    await teachers.create({ name, code, classes });
    const updated = await teachers.listAll();
    render(req, res, 'teachers', 'teachers', { title: 'Manage Teachers', list: updated, error: null });
  } catch (err) { next(err); }
});

router.post('/teachers/:id/delete', async (req, res, next) => {
  try {
    await teachers.remove(req.params.id);
    res.redirect('/admin/teachers');
  } catch (err) { next(err); }
});

module.exports = router;
