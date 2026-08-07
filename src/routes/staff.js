const express = require('express');
const router = express.Router();

const { requireRole } = require('../middleware/auth');
const { navItemsFor } = require('../lib/nav');

const students = require('../db/queries/students');
const classesQ = require('../db/queries/classes');
const attendance = require('../db/queries/attendance');
const analytics = require('../db/queries/analytics');
const remarks = require('../db/queries/remarks');
const leaves = require('../db/queries/leaves');
const complaints = require('../db/queries/complaints');
const timetable = require('../db/queries/timetable');
const homework = require('../db/queries/homework');
const syllabus = require('../db/queries/syllabus');
const announcements = require('../db/queries/announcements');

router.use(requireRole('teacher', 'admin'));

function render(req, res, active, view, data) {
  res.render('staff/' + view, Object.assign({
    navItems: navItemsFor(req.session.user.role),
    active,
    title: null
  }, data));
}

// Classes a staff member may act on: a teacher's assigned list, or every
// class if empty (admin's list is always empty).
async function myClasses(req) {
  const u = req.session.user;
  if (u.classes && u.classes.length) return u.classes.slice().sort();
  return classesQ.getClassList();
}

router.get('/attendance', async (req, res, next) => {
  try {
    const classes = await myClasses(req);
    if (!classes.length) {
      return render(req, res, 'attendance', 'attendance', { title: 'Mark Attendance', classes, cls: null, roster: [], marks: {}, date: null, ok: null });
    }
    const cls = classes.includes(req.query.class) ? req.query.class : classes[0];
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const roster = await students.listByClass(cls);
    const marks = await attendance.listForClassOnDate(cls, date);
    render(req, res, 'attendance', 'attendance', { title: 'Mark Attendance', classes, cls, roster, marks, date, ok: req.query.ok || null });
  } catch (err) { next(err); }
});

router.post('/attendance', async (req, res, next) => {
  try {
    const classes = await myClasses(req);
    const cls = classes.includes(req.body.class) ? req.body.class : classes[0];
    const date = req.body.date || new Date().toISOString().slice(0, 10);
    const marksObj = req.body.marks || {};
    const marksArr = Object.keys(marksObj).map((adm) => ({ admissionNo: adm, status: marksObj[adm] }));
    await attendance.saveBulk(cls, date, marksArr, req.session.user.name);
    res.redirect(`/staff/attendance?class=${encodeURIComponent(cls)}&date=${encodeURIComponent(date)}&ok=1`);
  } catch (err) { next(err); }
});

router.get('/analytics', async (req, res, next) => {
  try {
    const classes = await myClasses(req);
    const data = await analytics.lateArrivals(classes);
    render(req, res, 'analytics', 'analytics', { title: 'Attendance Analytics', classes, ...data });
  } catch (err) { next(err); }
});

router.get('/remarks', async (req, res, next) => {
  try {
    const given = await remarks.listGivenBy(req.session.user.name);
    render(req, res, 'remarks', 'remarks', { title: 'Give Remarks', given, error: null, ok: null });
  } catch (err) { next(err); }
});

router.post('/remarks', async (req, res, next) => {
  try {
    const admissionNo = (req.body.admissionNo || '').trim().toUpperCase();
    const name = (req.body.name || '').trim();
    const text = (req.body.text || '').trim();
    const given = await remarks.listGivenBy(req.session.user.name);

    if (!admissionNo || !name || !text) {
      return render(req, res, 'remarks', 'remarks', { title: 'Give Remarks', given, error: 'Please fill in all fields.', ok: null });
    }
    const stu = await students.findByAdmissionNo(admissionNo);
    if (!stu) {
      return render(req, res, 'remarks', 'remarks', { title: 'Give Remarks', given, error: 'No student found with that admission number.', ok: null });
    }
    await remarks.create({ admissionNo: stu.admission_no, byName: req.session.user.name, text });
    const updated = await remarks.listGivenBy(req.session.user.name);
    render(req, res, 'remarks', 'remarks', { title: 'Give Remarks', given: updated, error: null, ok: 'Remark posted.' });
  } catch (err) { next(err); }
});

router.get('/leave', async (req, res, next) => {
  try {
    const classes = await myClasses(req);
    const scope = req.session.user.role === 'admin' ? null : classes;
    const rows = await leaves.listForReview(scope);
    render(req, res, 'leave-review', 'leave-review', { title: 'Leave Requests', rows });
  } catch (err) { next(err); }
});

router.post('/leave/:id/approve', async (req, res, next) => {
  try {
    await leaves.setStatus(req.params.id, 'approved', req.session.user.name);
    res.redirect('/staff/leave');
  } catch (err) { next(err); }
});

router.post('/leave/:id/reject', async (req, res, next) => {
  try {
    await leaves.setStatus(req.params.id, 'rejected', req.session.user.name);
    res.redirect('/staff/leave');
  } catch (err) { next(err); }
});

router.get('/complaints', async (req, res, next) => {
  try {
    const own = await complaints.listFiledByStaff(req.session.user.name);
    const studentComplaints = await complaints.listStudentComplaints();
    render(req, res, 'complaint', 'complaints', { title: 'Complaints', own, studentComplaints, error: null, ok: null });
  } catch (err) { next(err); }
});

router.post('/complaints', async (req, res, next) => {
  try {
    const admissionNo = (req.body.admissionNo || '').trim().toUpperCase();
    const category = req.body.category || 'Other';
    const text = (req.body.text || '').trim();
    const own = await complaints.listFiledByStaff(req.session.user.name);
    const studentComplaints = await complaints.listStudentComplaints();

    if (!admissionNo || !text) {
      return render(req, res, 'complaint', 'complaints', { title: 'Complaints', own, studentComplaints, error: 'Please fill in all fields.', ok: null });
    }
    const stu = await students.findByAdmissionNo(admissionNo);
    if (!stu) {
      return render(req, res, 'complaint', 'complaints', { title: 'Complaints', own, studentComplaints, error: 'No student found with that admission number.', ok: null });
    }
    await complaints.createFromStaff({ role: req.session.user.role, byName: req.session.user.name, aboutAdmissionNo: stu.admission_no, category, text });
    const updatedOwn = await complaints.listFiledByStaff(req.session.user.name);
    render(req, res, 'complaint', 'complaints', { title: 'Complaints', own: updatedOwn, studentComplaints, error: null, ok: 'Complaint filed.' });
  } catch (err) { next(err); }
});

router.get('/timetable', async (req, res, next) => {
  try {
    const classes = await myClasses(req);
    if (!classes.length) {
      return render(req, res, 'timetable', 'timetable', { title: 'Timetable Editor', classes, cls: null, grid: {}, days: timetable.DAYS, periods: timetable.PERIODS, editable: true, ok: null });
    }
    const cls = classes.includes(req.query.class) ? req.query.class : classes[0];
    const grid = await timetable.getForClass(cls);
    render(req, res, 'timetable', 'timetable', {
      title: 'Timetable Editor', classes, cls, grid,
      days: timetable.DAYS, periods: timetable.PERIODS, editable: true,
      saveAction: `/staff/timetable?class=${encodeURIComponent(cls)}`,
      className: cls, ok: req.query.ok || null
    });
  } catch (err) { next(err); }
});

router.post('/timetable', async (req, res, next) => {
  try {
    const classes = await myClasses(req);
    const cls = classes.includes(req.query.class) ? req.query.class : classes[0];
    const entries = req.body.tt || {};
    await timetable.saveForClass(cls, entries);
    res.redirect(`/staff/timetable?class=${encodeURIComponent(cls)}&ok=1`);
  } catch (err) { next(err); }
});

router.get('/homework', async (req, res, next) => {
  try {
    const classes = await myClasses(req);
    const rows = await homework.listAll();
    render(req, res, 'homework', 'homework', { title: 'Homework', classes, rows, error: null, ok: null });
  } catch (err) { next(err); }
});

router.post('/homework', async (req, res, next) => {
  try {
    const classes = await myClasses(req);
    const className = req.body.class;
    const subject = (req.body.subject || '').trim();
    const text = (req.body.text || '').trim();
    const dueDate = req.body.dueDate || new Date().toISOString().slice(0, 10);
    const rows = await homework.listAll();

    if (!className || !subject || !text) {
      return render(req, res, 'homework', 'homework', { title: 'Homework', classes, rows, error: 'Please fill in subject and details.', ok: null });
    }
    await homework.create({ className, subject, text, dueDate, byName: req.session.user.name });
    const updated = await homework.listAll();
    render(req, res, 'homework', 'homework', { title: 'Homework', classes, rows: updated, error: null, ok: 'Homework posted.' });
  } catch (err) { next(err); }
});

router.get('/syllabus', async (req, res, next) => {
  try {
    const rows = await syllabus.listAll();
    render(req, res, 'syllabus', 'syllabus', { title: 'Exam Syllabus', rows, error: null, ok: null });
  } catch (err) { next(err); }
});

router.post('/syllabus', async (req, res, next) => {
  try {
    const examName = (req.body.examName || '').trim();
    const subject = (req.body.subject || '').trim();
    const content = (req.body.content || '').trim();
    const rows = await syllabus.listAll();

    if (!examName || !subject || !content) {
      return render(req, res, 'syllabus', 'syllabus', { title: 'Exam Syllabus', rows, error: 'Please fill in all fields.', ok: null });
    }
    await syllabus.create({ examName, subject, content, byName: req.session.user.name });
    const updated = await syllabus.listAll();
    render(req, res, 'syllabus', 'syllabus', { title: 'Exam Syllabus', rows: updated, error: null, ok: 'Syllabus posted.' });
  } catch (err) { next(err); }
});

router.get('/announcements', async (req, res, next) => {
  try {
    const rows = await announcements.listRecent(50);
    render(req, res, 'announce', 'announcements', { title: 'Announcements', rows, error: null, ok: null });
  } catch (err) { next(err); }
});

router.post('/announcements', async (req, res, next) => {
  try {
    const title = (req.body.title || '').trim();
    const text = (req.body.text || '').trim();
    const rows = await announcements.listRecent(50);

    if (!title || !text) {
      return render(req, res, 'announce', 'announcements', { title: 'Announcements', rows, error: 'Please fill in all fields.', ok: null });
    }
    await announcements.create({ title, text, byName: req.session.user.name });
    const updated = await announcements.listRecent(50);
    render(req, res, 'announce', 'announcements', { title: 'Announcements', rows: updated, error: null, ok: 'Announcement posted.' });
  } catch (err) { next(err); }
});

module.exports = router;
