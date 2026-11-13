const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const DATA_DIR = require('../config/dataDirectory');
function readData(file) {
  const p = path.join(DATA_DIR, `${file}.json`);
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf8') || '[]'); } catch (e) { return []; }
}
function writeData(file, data) {
  const p = path.join(DATA_DIR, `${file}.json`);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

router.use(verifyToken, requireRole(['teacher']));

function isCurrentTeacher(record, user) {
  const recordEmail = typeof record.teacher_email === 'string' ? record.teacher_email.toLowerCase() : '';
  return Number(record.teacher_id) === Number(user.id) ||
    recordEmail === String(user.email || '').toLowerCase();
}

function getOwnedCourses(user) {
  return readData('courses').filter(course => isCurrentTeacher(course, user));
}

function getOwnedAssignments(user, courseIds) {
  return readData('assignments').filter(assignment =>
    isCurrentTeacher(assignment, user) || courseIds.has(Number(assignment.course_id))
  );
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function getCourseStudents(courseId) {
  const users = readData('users');
  return readData('enrollments')
    .filter(enrollment => Number(enrollment.course_id) === courseId)
    .map(enrollment => {
      const email = String(enrollment.user_email || enrollment.email || '').toLowerCase();
      const id = Number(enrollment.user_id);
      const user = users.find(item =>
        (Number.isSafeInteger(id) && Number(item.id) === id) ||
        (email && String(item.email || '').toLowerCase() === email)
      );
      return {
        id: Number.isSafeInteger(id) && id > 0 ? id : Number(user && user.id) || null,
        email: email || String(user && user.email || '').toLowerCase(),
        name: String(user && user.name || enrollment.user_name || enrollment.student_name || email || 'Student')
      };
    })
    .filter((student, index, students) =>
      (student.id || student.email) &&
      students.findIndex(item =>
        (student.id && item.id === student.id) || (student.email && item.email === student.email)
      ) === index
    );
}

// Teacher Dashboard Stats
router.get('/dashboard', (req, res) => {
  const courses = getOwnedCourses(req.user);
  const courseIds = new Set(courses.map(course => Number(course.id)));
  const enrollments = readData('enrollments').filter(enrollment => courseIds.has(Number(enrollment.course_id)));
  const assignments = getOwnedAssignments(req.user, courseIds);
  const assignmentIds = new Set(assignments.map(assignment => Number(assignment.id)));
  const submissions = readData('submissions').filter(submission =>
    assignmentIds.has(Number(submission.assignment_id)) || isCurrentTeacher(submission, req.user)
  );
  const logs = readData('exam_logs').filter(log =>
    courseIds.has(Number(log.course_id)) || isCurrentTeacher(log, req.user)
  );

  res.json({
    success: true,
    data: {
      total_courses: courses.length,
      published_courses: courses.filter(c => c.status === 'published').length,
      pending_courses: courses.filter(c => c.status === 'pending').length,
      enrolled_students: enrollments.length,
      submissions_received: submissions.length,
      active_exams_monitored: logs.length
    }
  });
});

// Teacher Courses
router.get('/courses', (req, res) => {
  res.json({ success: true, data: getOwnedCourses(req.user) });
});

router.post('/courses', (req, res) => {
  const { title, category, level, duration, description } = req.body || {};
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 120) {
    return res.status(400).json({ success: false, message: 'A title of 1 to 120 characters is required.' });
  }

  const courses = readData('courses');
  const newCourse = {
    id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
    title: title.trim(),
    slug: title.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
    category: typeof category === 'string' && category.trim() ? category.trim() : 'Development',
    level: level || 'Beginner',
    duration: duration || '15 hours',
    instructor: req.user.name || req.user.email,
    teacher_id: Number(req.user.id),
    teacher_email: String(req.user.email || '').toLowerCase(),
    thumbnail: '/assets/images/thumb-1.png',
    status: 'pending',
    students_count: 0,
    description: description || ''
  };

  courses.push(newCourse);
  writeData('courses', courses);
  res.status(201).json({ success: true, message: 'Course created and submitted for Admin approval!', data: newCourse });
});

// Teacher Assignments
router.get('/assignments', (req, res) => {
  const courseIds = new Set(getOwnedCourses(req.user).map(course => Number(course.id)));
  const assignments = getOwnedAssignments(req.user, courseIds);
  res.json({ success: true, data: assignments });
});

router.post('/assignments', (req, res) => {
  const { course_id, title, deadline, total_marks, description } = req.body || {};
  const courseId = Number(course_id);
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 120) {
    return res.status(400).json({ success: false, message: 'A title of 1 to 120 characters is required.' });
  }
  if (!Number.isSafeInteger(courseId) || courseId < 1) {
    return res.status(400).json({ success: false, message: 'A course you own is required.' });
  }
  const course = getOwnedCourses(req.user).find(item => Number(item.id) === courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
  if ((deadline && !validDate(deadline)) ||
      (description !== undefined && (typeof description !== 'string' || description.trim().length > 2000))) {
    return res.status(400).json({ success: false, message: 'Check the assignment deadline and description.' });
  }
  const marks = Number(total_marks);
  if (!Number.isSafeInteger(marks) || marks < 1 || marks > 10000) {
    return res.status(400).json({ success: false, message: 'Total marks must be a whole number from 1 to 10,000.' });
  }

  const assignments = readData('assignments');
  const newAssignment = {
    id: assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) + 1 : 1,
    course_id: courseId,
    course_title: course.title,
    title: title.trim(),
    deadline: typeof deadline === 'string' ? deadline : '',
    description: typeof description === 'string' ? description.trim() : '',
    total_marks: marks,
    teacher_id: Number(req.user.id),
    teacher_email: String(req.user.email || '').toLowerCase(),
    submissions_count: 0,
    status: 'open',
    created_at: new Date().toISOString()
  };

  assignments.push(newAssignment);
  writeData('assignments', assignments);
  res.status(201).json({ success: true, message: 'Assignment published for enrolled students.', data: newAssignment });
});

// Teacher Enrolled Students & Proctoring Logs
router.get('/students', (req, res) => {
  const courseIds = new Set(getOwnedCourses(req.user).map(course => Number(course.id)));
  const enrollments = readData('enrollments').filter(enrollment => courseIds.has(Number(enrollment.course_id)));
  res.json({ success: true, data: enrollments });
});

router.get('/attendance', (req, res) => {
  const courseId = Number(req.query.course_id);
  const date = req.query.date;
  if (!Number.isSafeInteger(courseId) || courseId < 1 || !validDate(date)) {
    return res.status(400).json({ success: false, message: 'A valid course and attendance date are required.' });
  }
  const course = getOwnedCourses(req.user).find(item => Number(item.id) === courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  const students = getCourseStudents(courseId);
  const entries = readData('attendance');
  const saved = entries.find(entry =>
    Number(entry.course_id) === courseId &&
    entry.date === date &&
    isCurrentTeacher(entry, req.user)
  );
  const savedByEmail = new Map((saved && saved.records || []).map(record => [
    String(record.user_email || '').toLowerCase(),
    record
  ]));
  const savedById = new Map((saved && saved.records || []).map(record => [Number(record.student_id), record]));
  const records = students.map(student => {
    const previous = (student.id && savedById.get(student.id)) || savedByEmail.get(student.email);
    return {
      student_id: student.id,
      user_email: student.email,
      name: student.name,
      status: previous ? previous.status : '',
      remarks: previous ? previous.remarks : ''
    };
  });
  return res.json({ success: true, data: { course_id: courseId, course_title: course.title, date, records } });
});

router.post('/attendance', (req, res) => {
  const body = req.body || {};
  const courseId = Number(body.course_id);
  const date = body.date;
  if (!Number.isSafeInteger(courseId) || courseId < 1 || !validDate(date) ||
      !Array.isArray(body.records)) {
    return res.status(400).json({ success: false, message: 'Provide a valid course, date, and attendance record list.' });
  }

  const course = getOwnedCourses(req.user).find(item => Number(item.id) === courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
  const students = getCourseStudents(courseId);
  if (!students.length || body.records.length !== students.length) {
    return res.status(400).json({ success: false, message: 'Attendance must include every enrolled student.' });
  }

  const normalizedRecords = [];
  const seenStudents = new Set();
  for (const record of body.records) {
    const email = String(record && record.user_email || '').trim().toLowerCase();
    const studentId = Number(record && record.student_id);
    const student = students.find(item =>
      (Number.isSafeInteger(studentId) && studentId > 0 && item.id === studentId) ||
      (email && item.email === email)
    );
    if (!student || !['present', 'absent', 'late'].includes(record.status) ||
        typeof record.remarks !== 'string' || record.remarks.length > 300) {
      return res.status(400).json({ success: false, message: 'Attendance contains an invalid student, status, or remark.' });
    }

    const key = student.id ? `id:${student.id}` : `email:${student.email}`;
    if (seenStudents.has(key)) {
      return res.status(400).json({ success: false, message: 'Each enrolled student must appear once.' });
    }
    seenStudents.add(key);
    normalizedRecords.push({
      student_id: student.id,
      user_email: student.email,
      name: student.name,
      status: record.status,
      remarks: record.remarks.trim()
    });
  }
  if (seenStudents.size !== students.length) {
    return res.status(400).json({ success: false, message: 'Attendance must include every enrolled student.' });
  }

  const entries = readData('attendance');
  const existingIndex = entries.findIndex(entry =>
    Number(entry.course_id) === courseId &&
    entry.date === date &&
    isCurrentTeacher(entry, req.user)
  );
  const attendanceEntry = {
    id: existingIndex >= 0 ? entries[existingIndex].id : Date.now(),
    teacher_id: Number(req.user.id),
    teacher_email: String(req.user.email || '').toLowerCase(),
    course_id: courseId,
    course_title: course.title,
    date,
    records: normalizedRecords,
    updated_at: new Date().toISOString()
  };
  if (existingIndex >= 0) entries[existingIndex] = attendanceEntry;
  else entries.push(attendanceEntry);
  writeData('attendance', entries);
  return res.status(200).json({ success: true, message: 'Attendance saved successfully.', data: attendanceEntry });
});

router.get('/reports', (req, res) => {
  const { start_date: startDate, end_date: endDate } = req.query;
  if ((startDate && !validDate(startDate)) || (endDate && !validDate(endDate)) ||
      (startDate && endDate && startDate > endDate)) {
    return res.status(400).json({ success: false, message: 'Report date range is invalid.' });
  }

  const ownedCourses = getOwnedCourses(req.user);
  const courseIds = new Set(ownedCourses.map(course => Number(course.id)));
  const courseTitleById = new Map(ownedCourses.map(course => [Number(course.id), course.title]));
  const attendance = readData('attendance')
    .filter(entry =>
      courseIds.has(Number(entry.course_id)) &&
      isCurrentTeacher(entry, req.user) &&
      (!startDate || entry.date >= startDate) &&
      (!endDate || entry.date <= endDate)
    )
    .flatMap(entry => (Array.isArray(entry.records) ? entry.records : []).map(record => ({
      date: entry.date,
      course_id: Number(entry.course_id),
      course_title: courseTitleById.get(Number(entry.course_id)) || 'Course',
      status: record.status
    })));
  const attendanceByDate = new Map();
  const attendanceByCourse = new Map();
  attendance.forEach(record => {
    const current = attendanceByDate.get(record.date) || { present: 0, total: 0 };
    current.total += 1;
    if (record.status === 'present' || record.status === 'late') current.present += 1;
    attendanceByDate.set(record.date, current);
    const courseTotals = attendanceByCourse.get(record.course_id) || {
      course_title: record.course_title,
      present: 0,
      total: 0
    };
    courseTotals.total += 1;
    if (record.status === 'present' || record.status === 'late') courseTotals.present += 1;
    attendanceByCourse.set(record.course_id, courseTotals);
  });

  const assignments = getOwnedAssignments(req.user, courseIds);
  const assignmentIds = new Set(assignments.map(assignment => Number(assignment.id)));
  const submissions = readData('submissions').filter(submission =>
    assignmentIds.has(Number(submission.assignment_id))
  );
  const enrollmentCounts = new Map();
  readData('enrollments')
    .filter(enrollment => courseIds.has(Number(enrollment.course_id)))
    .forEach(enrollment => {
      const courseId = Number(enrollment.course_id);
      enrollmentCounts.set(courseId, (enrollmentCounts.get(courseId) || 0) + 1);
    });
  const expectedSubmissions = assignments.reduce(
    (total, assignment) => total + (enrollmentCounts.get(Number(assignment.course_id)) || 0),
    0
  );
  const scores = submissions
    .map(submission => Number(submission.score ?? submission.marks))
    .filter(Number.isFinite);
  const attendanceDates = [...attendanceByDate.keys()].sort();
  const attendanceTotal = attendance.length;
  const attendancePresent = attendance.filter(item => item.status === 'present' || item.status === 'late').length;

  return res.json({
    success: true,
    data: {
      total_attendance_records: attendanceTotal,
      attendance_rate: attendanceTotal ? Math.round((attendancePresent / attendanceTotal) * 100) : null,
      assignment_count: assignments.length,
      assignment_completion_rate: expectedSubmissions
        ? Math.round((submissions.length / expectedSubmissions) * 100)
        : null,
      average_score: scores.length
        ? Math.round((scores.reduce((total, score) => total + score, 0) / scores.length) * 10) / 10
        : null,
      attendance_by_date: attendanceDates.map(date => ({
        date,
        rate: Math.round((attendanceByDate.get(date).present / attendanceByDate.get(date).total) * 100)
      })),
      attendance_by_course: [...attendanceByCourse.values()].map(item => ({
        course_title: item.course_title,
        rate: Math.round((item.present / item.total) * 100)
      })),
      assignment_performance: assignments.map(assignment => ({
        title: assignment.title,
        submissions: submissions.filter(item => Number(item.assignment_id) === Number(assignment.id)).length,
        expected_submissions: enrollmentCounts.get(Number(assignment.course_id)) || 0
      }))
    }
  });
});

router.get('/proctor-logs', (req, res) => {
  const courseIds = new Set(getOwnedCourses(req.user).map(course => Number(course.id)));
  const logs = readData('exam_logs').filter(log =>
    courseIds.has(Number(log.course_id)) || isCurrentTeacher(log, req.user)
  );
  res.json({ success: true, data: logs });
});

module.exports = router;
