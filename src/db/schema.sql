CREATE TABLE IF NOT EXISTS classes (
  name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS students (
  admission_no TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  class        TEXT NOT NULL REFERENCES classes(name),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teachers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  code_hash     TEXT NOT NULL,
  code_display  TEXT NOT NULL,
  classes_json  TEXT NOT NULL DEFAULT '[]',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL DEFAULT 'Admin',
  passcode_hash TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  admission_no TEXT NOT NULL REFERENCES students(admission_no) ON DELETE CASCADE,
  class        TEXT NOT NULL,
  date         TEXT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('present','absent','late')),
  marked_by    TEXT NOT NULL,
  UNIQUE (admission_no, date)
);

CREATE TABLE IF NOT EXISTS remarks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  admission_no TEXT NOT NULL REFERENCES students(admission_no) ON DELETE CASCADE,
  by_name      TEXT NOT NULL,
  text         TEXT NOT NULL,
  date         TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  admission_no TEXT NOT NULL REFERENCES students(admission_no) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('other','sick')),
  reason       TEXT NOT NULL,
  file_data    BLOB NULL,
  file_mime    TEXT NULL,
  file_name    TEXT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  responded_by TEXT NULL,
  date         TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS complaints (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  source              TEXT NOT NULL CHECK (source IN ('student','staff')),
  filed_by_role       TEXT NOT NULL CHECK (filed_by_role IN ('student','teacher','admin')),
  by_admission_no     TEXT NULL REFERENCES students(admission_no) ON DELETE SET NULL,
  by_name             TEXT NULL,
  about_admission_no  TEXT NULL REFERENCES students(admission_no) ON DELETE SET NULL,
  category            TEXT NOT NULL,
  text                TEXT NOT NULL,
  date                TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS timetable (
  class    TEXT NOT NULL REFERENCES classes(name),
  day      TEXT NOT NULL CHECK (day IN ('Mon','Tue','Wed','Thu','Fri','Sat')),
  period   INTEGER NOT NULL CHECK (period BETWEEN 1 AND 7),
  value    TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (class, day, period)
);

CREATE TABLE IF NOT EXISTS homework (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  class       TEXT NOT NULL,
  subject     TEXT NOT NULL,
  text        TEXT NOT NULL,
  due_date    TEXT NOT NULL,
  by_name     TEXT NOT NULL,
  date        TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS syllabus (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_name   TEXT NOT NULL,
  subject     TEXT NOT NULL,
  content     TEXT NOT NULL,
  by_name     TEXT NOT NULL,
  date        TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS announcements (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  text        TEXT NOT NULL,
  by_name     TEXT NOT NULL,
  date        TEXT NOT NULL DEFAULT (date('now'))
);
