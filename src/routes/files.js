const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const leaves = require('../db/queries/leaves');

router.use(requireAuth);

router.get('/leave/:id/certificate', async (req, res, next) => {
  try {
    const file = await leaves.getFile(req.params.id);
    if (!file || !file.file_data) {
      return res.status(404).render('errors/404', { title: 'Not Found' });
    }
    const u = req.session.user;
    const isOwner = u.role === 'student' && u.admissionNo === file.admission_no;
    const isStaff = u.role === 'teacher' || u.role === 'admin';
    if (!isOwner && !isStaff) {
      return res.status(403).render('errors/403', { title: 'Access Denied' });
    }
    res.set('Content-Type', file.file_mime || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${(file.file_name || 'certificate').replace(/"/g, '')}"`);
    res.send(file.file_data);
  } catch (err) { next(err); }
});

module.exports = router;
