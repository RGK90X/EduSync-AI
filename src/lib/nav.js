// Nav item definitions per role — mirrors the original prototype's navItemsFor(),
// but with real hrefs instead of client-side tab keys.
const ICONS = {
  overview: '&#9670;', attendance: '&#9678;', analytics: '&#9673;', remarks: '&#9998;',
  leave: '&#9993;', complaint: '&#9873;', timetable: '&#9783;', homework: '&#128218;',
  syllabus: '&#128220;', announce: '&#128276;', student: '&#9737;', teacher: '&#9878;',
  schoolLife: '&#127884;'
};

function navItemsFor(role) {
  if (role === 'student') {
    return [
      { key: 'overview', label: 'Overview', icon: ICONS.overview, href: '/student' },
      { key: 'attendance', label: 'My Attendance', icon: ICONS.attendance, href: '/student/attendance' },
      { key: 'remarks', label: 'My Remarks', icon: ICONS.remarks, href: '/student/remarks' },
      { key: 'leave', label: 'Leave Request', icon: ICONS.leave, href: '/student/leave' },
      { key: 'complaint', label: 'Complaint Box', icon: ICONS.complaint, href: '/student/complaints' },
      { key: 'timetable', label: 'Timetable', icon: ICONS.timetable, href: '/student/timetable' },
      { key: 'homework', label: 'Homework', icon: ICONS.homework, href: '/student/homework' },
      { key: 'syllabus', label: 'Syllabus', icon: ICONS.syllabus, href: '/student/syllabus' },
      { key: 'announce', label: 'Announcements', icon: ICONS.announce, href: '/student/announcements' },
      { key: 'schoolLife', label: 'School Life', icon: ICONS.schoolLife, href: '/school-life' }
    ];
  }
  const staffCommon = [
    { key: 'attendance', label: role === 'admin' ? 'Attendance' : 'Mark Attendance', icon: ICONS.attendance, href: '/staff/attendance' },
    { key: 'analytics', label: 'Analytics', icon: ICONS.analytics, href: '/staff/analytics' },
    { key: 'remarks', label: role === 'admin' ? 'Remarks' : 'Give Remarks', icon: ICONS.remarks, href: '/staff/remarks' },
    { key: 'leave', label: 'Leave Requests', icon: ICONS.leave, href: '/staff/leave' },
    { key: 'complaint', label: role === 'admin' ? 'Complaints' : 'File / View Complaints', icon: ICONS.complaint, href: '/staff/complaints' },
    { key: 'timetable', label: 'Timetable', icon: ICONS.timetable, href: '/staff/timetable' },
    { key: 'homework', label: 'Homework', icon: ICONS.homework, href: '/staff/homework' },
    { key: 'syllabus', label: 'Syllabus', icon: ICONS.syllabus, href: '/staff/syllabus' },
    { key: 'announce', label: 'Announcements', icon: ICONS.announce, href: '/staff/announcements' },
    { key: 'schoolLife', label: 'School Life', icon: ICONS.schoolLife, href: '/school-life' }
  ];
  if (role === 'teacher') return staffCommon;
  // admin
  return [
    { key: 'overview', label: 'Overview', icon: ICONS.overview, href: '/admin' },
    { key: 'students', label: 'Manage Students', icon: ICONS.student, href: '/admin/students' },
    { key: 'teachers', label: 'Manage Teachers', icon: ICONS.teacher, href: '/admin/teachers' },
    ...staffCommon
  ];
}

module.exports = { navItemsFor, ICONS };
