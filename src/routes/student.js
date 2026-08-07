const express = require('express');
const router = express.Router();

const { requireRole } = require('../middleware/auth');
const { singleFileOptional } = require('../middleware/upload');
const { navItemsFor } = require('../lib/nav');

const attendance = require('../db/queries/attendance');
const remarks = require('../db/queries/remarks');
const leaves = require('../db/queries/leaves');
const complaints = require('../db/queries/complaints');
const timetable = require('../db/queries/timetable');
const homework = require('../db/queries/homework');
const syllabus = require('../db/queries/syllabus');
const announcements = require('../db/queries/announcements');

router.use(requireRole('student'));

function render(req, res, active, view, data) {
  res.render('student/' + view, Object.assign({
    navItems: navItemsFor('student'),
    active,
    title: null
  }, data));
}

router.get('/', async (req, res, next) => {
  try {
    const stu = req.session.user;
    const summary = await attendance.summaryForStudent(stu.admissionNo);
    const myRemarks = await remarks.listForStudent(stu.admissionNo);
    const recentAnnouncements = await announcements.listRecent(3);
    render(req, res, 'overview', 'overview', {
      title: 'Overview', summary, remarksCount: myRemarks.length, announcements: recentAnnouncements
    });
  } catch (err) { next(err); }
});

router.get('/attendance', async (req, res, next) => {
  try {
    const stu = req.session.user;
    const rows = await attendance.listForStudent(stu.admissionNo);
    render(req, res, 'attendance', 'attendance', { title: 'My Attendance', rows });
  } catch (err) { next(err); }
});

router.get('/remarks', async (req, res, next) => {
  try {
    const stu = req.session.user;
    const rows = await remarks.listForStudent(stu.admissionNo);
    render(req, res, 'remarks', 'remarks', { title: 'My Remarks', rows });
  } catch (err) { next(err); }
});

router.get('/leave', async (req, res, next) => {
  try {
    const stu = req.session.user;
    const rows = await leaves.listForStudent(stu.admissionNo);
    render(req, res, 'leave', 'leave', { title: 'Leave Request', rows, error: null, ok: null });
  } catch (err) { next(err); }
});

router.post('/leave', singleFileOptional('certificate'), async (req, res, next) => {
  try {
    const stu = req.session.user;
    const type = req.body.type === 'sick' ? 'sick' : 'other';
    const reason = (req.body.reason || '').trim();
    const rows = await leaves.listForStudent(stu.admissionNo);

    if (!reason) {
      return render(req, res, 'leave', 'leave', { title: 'Leave Request', rows, error: 'Please enter a reason.', ok: null });
    }
    if (req.uploadError) {
      return render(req, res, 'leave', 'leave', { title: 'Leave Request', rows, error: req.uploadError, ok: null });
    }
    if (type === 'sick' && !req.file) {
      return render(req, res, 'leave', 'leave', {
        title: 'Leave Request', rows,
        error: 'Sick leave requires a medical certificate/prescription file (PDF, JPEG or PNG, up to 3MB).',
        ok: null
      });
    }

    await leaves.create({ admissionNo: stu.admissionNo, type, reason, file: req.file });
    const updatedRows = await leaves.listForStudent(stu.admissionNo);
    render(req, res, 'leave', 'leave', { title: 'Leave Request', rows: updatedRows, error: null, ok: 'Leave request submitted.' });
  } catch (err) { next(err); }
});

router.get('/complaints', async (req, res, next) => {
  try {
    const stu = req.session.user;
    const rows = await complaints.listForStudent(stu.admissionNo);
    render(req, res, 'complaint', 'complaints', { title: 'Complaint Box', rows, error: null, ok: null });
  } catch (err) { next(err); }
});

router.post('/complaints', async (req, res, next) => {
  try {
    const stu = req.session.user;
    const category = req.body.category || 'Other';
    const text = (req.body.text || '').trim();
    const rows = await complaints.listForStudent(stu.admissionNo);

    if (!text) {
      return render(req, res, 'complaint', 'complaints', { title: 'Complaint Box', rows, error: 'Please describe your complaint.', ok: null });
    }
    await complaints.createFromStudent({ admissionNo: stu.admissionNo, category, text });
    const updatedRows = await complaints.listForStudent(stu.admissionNo);
    render(req, res, 'complaint', 'complaints', { title: 'Complaint Box', rows: updatedRows, error: null, ok: 'Complaint submitted.' });
  } catch (err) { next(err); }
});

router.get('/timetable', async (req, res, next) => {
  try {
    const stu = req.session.user;
    const grid = await timetable.getForClass(stu.class);
    render(req, res, 'timetable', 'timetable', {
      title: 'Timetable', grid, className: stu.class,
      days: timetable.DAYS, periods: timetable.PERIODS, editable: false
    });
  } catch (err) { next(err); }
});

router.get('/homework', async (req, res, next) => {
  try {
    const stu = req.session.user;
    const rows = await homework.listForClass(stu.class);
    render(req, res, 'homework', 'homework', { title: 'Homework', rows, className: stu.class });
  } catch (err) { next(err); }
});

router.get('/syllabus', async (req, res, next) => {
  try {
    const rows = await syllabus.listAll();
    render(req, res, 'syllabus', 'syllabus', { title: 'Exam Syllabus', rows });
  } catch (err) { next(err); }
});

router.get('/announcements', async (req, res, next) => {
  try {
    const rows = await announcements.listRecent(50);
    render(req, res, 'announce', 'announcements', { title: 'Announcements', rows });
  } catch (err) { next(err); }
});

module.exports = router;
