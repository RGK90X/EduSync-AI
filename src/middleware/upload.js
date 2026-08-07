const multer = require('multer');

const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error('Only PDF, JPEG, or PNG files are allowed.'));
  }
});

// Wraps multer's single-file upload so multer errors (bad type, too big) become
// a friendly req.uploadError instead of throwing/crashing the request.
function singleFileOptional(fieldName) {
  const mw = upload.single(fieldName);
  return (req, res, next) => {
    mw(req, res, (err) => {
      if (err) {
        req.uploadError = err.message || 'File upload failed.';
      }
      next();
    });
  };
}

module.exports = { singleFileOptional };
