CREATE TABLE IF NOT EXISTS classes (
  name VARCHAR(60) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS students (
  admission_no VARCHAR(20) PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  class        VARCHAR(60) NOT NULL REFERENCES classes(name),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teachers (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  code_hash     VARCHAR(200) NOT NULL,
  code_display  VARCHAR(40) NOT NULL,
  classes       TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL DEFAULT 'Admin',
  passcode_hash VARCHAR(200) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance (
  id           SERIAL PRIMARY KEY,
  admission_no VARCHAR(20) NOT NULL REFERENCES students(admission_no) ON DELETE CASCADE,
  class        VARCHAR(60) NOT NULL,
  date         DATE NOT NULL,
  status       VARCHAR(10) NOT NULL CHECK (status IN ('present','absent','late')),
  marked_by    VARCHAR(120) NOT NULL,
  UNIQUE (admission_no, date)
);

CREATE TABLE IF NOT EXISTS remarks (
  id           SERIAL PRIMARY KEY,
  admission_no VARCHAR(20) NOT NULL REFERENCES students(admission_no) ON DELETE CASCADE,
  by_name      VARCHAR(120) NOT NULL,
  text         TEXT NOT NULL,
  date         DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id           SERIAL PRIMARY KEY,
  admission_no VARCHAR(20) NOT NULL REFERENCES students(admission_no) ON DELETE CASCADE,
  type         VARCHAR(10) NOT NULL CHECK (type IN ('other','sick')),
  reason       TEXT NOT NULL,
  file_data    BYTEA NULL,
  file_mime    VARCHAR(60) NULL,
  file_name    VARCHAR(200) NULL,
  status       VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  responded_by VARCHAR(120) NULL,
  date         DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS complaints (
  id                  SERIAL PRIMARY KEY,
  source              VARCHAR(10) NOT NULL CHECK (source IN ('student','staff')),
  filed_by_role       VARCHAR(10) NOT NULL CHECK (filed_by_role IN ('student','teacher','admin')),
  by_admission_no     VARCHAR(20) NULL REFERENCES students(admission_no) ON DELETE SET NULL,
  by_name             VARCHAR(120) NULL,
  about_admission_no  VARCHAR(20) NULL REFERENCES students(admission_no) ON DELETE SET NULL,
  category            VARCHAR(60) NOT NULL,
  text                TEXT NOT NULL,
  date                DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS timetable (
  class    VARCHAR(60) NOT NULL REFERENCES classes(name),
  day      VARCHAR(3) NOT NULL CHECK (day IN ('Mon','Tue','Wed','Thu','Fri','Sat')),
  period   INT NOT NULL CHECK (period BETWEEN 1 AND 7),
  value    VARCHAR(80) NOT NULL DEFAULT '',
  PRIMARY KEY (class, day, period)
);

CREATE TABLE IF NOT EXISTS homework (
  id          SERIAL PRIMARY KEY,
  class       VARCHAR(60) NOT NULL,
  subject     VARCHAR(80) NOT NULL,
  text        TEXT NOT NULL,
  due_date    DATE NOT NULL,
  by_name     VARCHAR(120) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS syllabus (
  id          SERIAL PRIMARY KEY,
  exam_name   VARCHAR(120) NOT NULL,
  subject     VARCHAR(80) NOT NULL,
  content     TEXT NOT NULL,
  by_name     VARCHAR(120) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS announcements (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(160) NOT NULL,
  text        TEXT NOT NULL,
  by_name     VARCHAR(120) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE
);
