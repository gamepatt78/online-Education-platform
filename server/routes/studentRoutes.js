const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { Users } = require('../services/storageService');
const db = require('../config/db');

const DATA_DIR = require('../config/dataDirectory');
const PAYMENT_UNAVAILABLE_MESSAGE = 'Online payment is currently unavailable. Please contact the administrator for assistance.';

function readData(file) {
  const p = path.join(DATA_DIR, `${file}.json`);
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf8') || '[]'); } catch (e) { return []; }
}

function readBillingRecords(file) {
  const filePath = path.join(DATA_DIR, `${file}.json`);
  if (!fs.existsSync(filePath)) return [];
  const records = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
  if (!Array.isArray(records)) {
    throw new Error(`Billing data file "${file}.json" must contain an array.`);
  }
  return records;
}

function writeData(file, data) {
  const p = path.join(DATA_DIR, `${file}.json`);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

router.use(verifyToken, requireRole(['student']));

function isCurrentStudent(record, user) {
  const recordEmail = typeof record.user_email === 'string' ? record.user_email.toLowerCase() : '';
  return Number(record.user_id) === Number(user.id) || recordEmail === String(user.email || '').toLowerCase();
}

function normalizeBillingTransaction(payment) {
  const amountValue = payment.amount;
  const amount = amountValue === null || amountValue === undefined || amountValue === ''
    ? null
    : Number(amountValue);
  const normalizedAmount = Number.isFinite(amount) && amount >= 0 ? amount : null;
  const rawStatus = String(payment.status || 'pending').toLowerCase();

  return {
    id: payment.id,
    description: String(payment.plan_name || payment.description || 'Payment'),
    amount: normalizedAmount,
    currency: /^[A-Za-z]{3}$/.test(String(payment.currency || ''))
      ? String(payment.currency).toUpperCase()
      : null,
    paymentMethod: String(payment.payment_method || ''),
    transactionId: String(payment.transaction_id || ''),
    status: rawStatus === 'completed' ? 'paid' : rawStatus,
    createdAt: payment.created_at || null
  };
}

function calculatePaidAmount(transactions) {
  const paidTransactions = transactions.filter(transaction => transaction.status === 'paid');
  if (paidTransactions.length === 0 || paidTransactions.some(transaction =>
    transaction.amount === null || !transaction.currency
  )) {
    return { amount: null, currency: null };
  }

  const currencies = new Set(paidTransactions.map(transaction => transaction.currency));
  if (currencies.size !== 1) {
    return { amount: null, currency: null };
  }

  return {
    amount: paidTransactions.reduce((total, transaction) => total + transaction.amount, 0),
    currency: paidTransactions[0].currency
  };
}

function formatDate(value) {
  if (!value) return '';
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function publicProfile(user) {
  return {
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    dob: formatDate(user.dob),
    designation: user.designation || 'Student'
  };
}

function validDateOfBirth(dob) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  const parsed = new Date(`${dob}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dob) return false;

  const indiaDateParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const indiaToday = [
    indiaDateParts.find(part => part.type === 'year').value,
    indiaDateParts.find(part => part.type === 'month').value,
    indiaDateParts.find(part => part.type === 'day').value
  ].join('-');
  return dob <= indiaToday;
}

router.get('/profile', async (req, res) => {
  try {
    const user = await Users.findByEmail(req.user.email);
    if (!user || String(user.role).toLowerCase() !== 'student') {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    return res.json({ success: true, data: publicProfile(user) });
  } catch (error) {
    console.error('Student profile load failed.');
    return res.status(500).json({ success: false, message: 'Unable to load the student profile.' });
  }
});

router.put('/profile', async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const dob = typeof body.dob === 'string' ? body.dob.trim() : '';
  const designation = typeof body.designation === 'string' ? body.designation.trim() : '';

  if (!name || name.length > 60) {
    return res.status(400).json({ success: false, message: 'Name is required and must be 60 characters or fewer.' });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Phone number must be a 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
    });
  }
  if (!validDateOfBirth(dob)) {
    return res.status(400).json({ success: false, message: 'Enter a valid date of birth that is not in the future.' });
  }
  if (!designation || designation.length > 100) {
    return res.status(400).json({ success: false, message: 'Designation is required and must be 100 characters or fewer.' });
  }

  try {
    const user = await Users.updateProfile(req.user.email, { name, phone, dob, designation });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    return res.json({ success: true, message: 'Profile updated successfully.', data: publicProfile(user) });
  } catch (error) {
    console.error('Student profile update failed.');
    return res.status(500).json({ success: false, message: 'Unable to save the student profile.' });
  }
});

router.get('/billing', async (req, res) => {
  try {
    let payments;
    if (db.isPostgresConnected()) {
      const result = await db.query(
        `SELECT id, plan_name, amount, currency, payment_method, transaction_id, status, created_at
         FROM payments
         WHERE user_id = $1
         ORDER BY created_at DESC NULLS LAST, id DESC`,
        [req.user.id]
      );
      payments = result.rows;
    } else {
      payments = readBillingRecords('payments').filter(payment => isCurrentStudent(payment, req.user));
    }

    const transactions = payments.map(normalizeBillingTransaction);
    const paidAmount = calculatePaidAmount(transactions);
    const enrollments = readBillingRecords('enrollments').filter(enrollment =>
      isCurrentStudent(enrollment, req.user)
    );
    const coursesById = new Map(readBillingRecords('courses').map(course => [
      Number(course.id),
      course
    ]));
    const registeredCourses = enrollments.map(enrollment => {
      const course = coursesById.get(Number(enrollment.course_id));
      return {
        courseId: Number(enrollment.course_id) || null,
        title: course && course.title
          ? String(course.title)
          : String(enrollment.course_title || 'Course enrollment'),
        enrolledAt: enrollment.enrolled_at || null
      };
    });

    return res.json({
      success: true,
      data: {
        billingProfile: {
          studentId: req.user.id,
          name: req.user.name || '',
          email: req.user.email || ''
        },
        registeredCourses,
        summary: {
          totalFees: null,
          amountPaid: paidAmount.amount,
          amountPaidCurrency: paidAmount.currency,
          outstandingBalance: null,
          nextPaymentDue: null
        },
        feeBreakdown: [],
        transactions,
        invoices: [],
        installments: [],
        paymentProviderConfigured: false,
        paymentUnavailableMessage: PAYMENT_UNAVAILABLE_MESSAGE
      }
    });
  } catch (error) {
    console.error('Student billing load failed.');
    return res.status(500).json({
      success: false,
      message: 'Unable to load billing information. Please try again later.'
    });
  }
});

// Student Dashboard Data
router.get('/dashboard', (req, res) => {
  const courses = readData('courses');
  const enrollments = readData('enrollments').filter(enrollment => isCurrentStudent(enrollment, req.user));
  const certificates = readData('certificates').filter(certificate => isCurrentStudent(certificate, req.user));
  const assignments = readData('assignments');
  const submissions = readData('submissions').filter(submission => isCurrentStudent(submission, req.user));
  const notifications = readData('notifications').filter(notification =>
    notification.target === 'all' ||
    String(notification.target).toLowerCase() === String(req.user.email || '').toLowerCase() ||
    String(notification.target) === String(req.user.id)
  );
  const courseIds = new Set(enrollments.map(enrollment => Number(enrollment.course_id)));
  const courseAssignments = assignments.filter(assignment => courseIds.has(Number(assignment.course_id)));
  const submittedAssignmentIds = new Set(submissions.map(submission => Number(submission.assignment_id)));
  const upcomingQuizzes = readData('quizzes').filter(quiz => {
    const dueAt = new Date(quiz.due_at || quiz.deadline || 0).getTime();
    return courseIds.has(Number(quiz.course_id)) && dueAt >= Date.now();
  });

  const pendingAssignments = courseAssignments.filter(assignment => !submittedAssignmentIds.has(Number(assignment.id))).length;
  const pendingQuizzes = upcomingQuizzes.length;

  res.json({
    success: true,
    data: {
      enrolled_courses_count: enrollments.length,
      completed_courses_count: enrollments.filter(e => e.status === 'completed' || e.progress === 100).length,
      ongoing_courses_count: enrollments.filter(e => e.status !== 'completed' && e.progress < 100).length,
      certificates_earned_count: certificates.length,
      pending_assignments_count: pendingAssignments,
      upcoming_quizzes_count: pendingQuizzes,
      pending_activities_count: pendingAssignments + pendingQuizzes,
      notifications: notifications.slice(0, 5),
      recent_courses: courses.filter(course => course.status !== 'pending').slice(0, 4)
    }
  });
});

// Enrolled Courses for Student
router.get('/courses', (req, res) => {
  const courses = readData('courses').filter(course => course.status !== 'pending' && course.status !== 'rejected');
  const enrollments = readData('enrollments').filter(enrollment => isCurrentStudent(enrollment, req.user));
  res.json({
    success: true,
    data: courses,
    enrollments
  });
});

// Enroll in a Course
router.post('/enroll', (req, res) => {
  const courseId = Number(req.body && req.body.courseId);
  if (!Number.isSafeInteger(courseId) || courseId < 1) {
    return res.status(400).json({ success: false, message: 'A valid courseId is required.' });
  }

  const courses = readData('courses');
  const enrollments = readData('enrollments');
  const course = courses.find(c => Number(c.id) === courseId && c.status !== 'pending' && c.status !== 'rejected');
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found.' });
  }

  const email = String(req.user.email || '').toLowerCase();
  const existing = enrollments.find(e => Number(e.course_id) === courseId && isCurrentStudent(e, req.user));
  if (existing) {
    return res.status(400).json({ success: false, message: 'Already enrolled in this course.' });
  }

  const newEnrollment = {
    id: enrollments.length > 0 ? Math.max(...enrollments.map(e => e.id)) + 1 : 1,
    user_id: Number(req.user.id),
    user_email: email,
    course_id: course.id,
    course_title: course.title,
    enrolled_at: new Date().toISOString(),
    progress: 0,
    status: 'active'
  };

  enrollments.push(newEnrollment);
  writeData('enrollments', enrollments);

  res.status(201).json({
    success: true,
    message: `Successfully enrolled in ${course.title}!`,
    data: newEnrollment
  });
});

// Progress Tracking
router.get('/progress/:courseId', (req, res) => {
  const courseId = Number(req.params.courseId);
  if (!Number.isSafeInteger(courseId) || courseId < 1) {
    return res.status(400).json({ success: false, message: 'A valid courseId is required.' });
  }
  const enrollment = readData('enrollments').find(e =>
    Number(e.course_id) === courseId && isCurrentStudent(e, req.user)
  );
  if (!enrollment) {
    return res.status(404).json({ success: false, message: 'Enrollment not found.' });
  }
  res.json({
    success: true,
    data: {
      courseId,
      progress: enrollment.progress,
      completed: enrollment.status === 'completed' || Number(enrollment.progress) >= 100
    }
  });
});

router.get('/exam-results', (req, res) => {
  const results = readData('exam_results')
    .filter(result => isCurrentStudent(result, req.user))
    .sort((left, right) => String(right.submitted_at || '').localeCompare(String(left.submitted_at || '')));
  return res.json({ success: true, data: results });
});

router.post('/exam-results', async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};
  const score = Number(body.score);
  const totalPoints = Number(body.totalPoints);
  const timeTakenSeconds = Number(body.timeTakenSeconds);
  if (!Number.isFinite(score) || !Number.isFinite(totalPoints) ||
      totalPoints <= 0 || totalPoints > 999.99 || score < 0 || score > totalPoints ||
      !Number.isSafeInteger(timeTakenSeconds) || timeTakenSeconds < 0 || timeTakenSeconds > 3600 ||
      !Array.isArray(body.answers) || body.answers.length < 1 || body.answers.length > 100) {
    return res.status(400).json({ success: false, message: 'The practice exam result is invalid.' });
  }

  const answers = [];
  for (const answer of body.answers) {
    if (!answer || typeof answer.question !== 'string' || answer.question.length > 1000 ||
        typeof answer.userAnswer !== 'string' || answer.userAnswer.length > 1000 ||
        typeof answer.correctAnswer !== 'string' || answer.correctAnswer.length > 1000 ||
        typeof answer.correct !== 'boolean' || !Number.isFinite(Number(answer.points)) ||
        Number(answer.points) < 0 || Number(answer.points) > totalPoints) {
      return res.status(400).json({ success: false, message: 'The practice exam answers are invalid.' });
    }
    answers.push({
      question: answer.question,
      userAnswer: answer.userAnswer,
      correctAnswer: answer.correctAnswer,
      correct: answer.correct,
      points: Number(answer.points)
    });
  }

  const awardedPoints = answers.reduce((total, answer) => total + answer.points, 0);
  if (Math.abs(awardedPoints - score) > 0.01) {
    return res.status(400).json({ success: false, message: 'The score does not match the answer summary.' });
  }

  const correctAnswers = answers.filter(answer => answer.correct).length;
  const result = {
    id: Date.now(),
    user_id: Number(req.user.id),
    user_email: String(req.user.email || '').toLowerCase(),
    student_name: String(req.user.name || ''),
    exam_name: 'Distance Education Practice Exam',
    score,
    total_points: totalPoints,
    total_questions: answers.length,
    correct_answers: correctAnswers,
    wrong_answers: answers.length - correctAnswers,
    percentage: Math.round((score / totalPoints) * 10000) / 100,
    time_taken_seconds: timeTakenSeconds,
    answers,
    verified: false,
    score_source: 'browser-calculated',
    submitted_at: new Date().toISOString()
  };

  try {
    if (db.isPostgresConnected()) {
      try {
        await db.query(
          `INSERT INTO exam_submissions
            (user_id, student_name, student_email, score, total_questions, correct_answers,
             wrong_answers, percentage, time_taken_seconds)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            result.user_id,
            result.student_name,
            result.user_email,
            result.score,
            result.total_questions,
            result.correct_answers,
            result.wrong_answers,
            result.percentage,
            result.time_taken_seconds
          ]
        );
      } catch (error) {
        console.warn('PostgreSQL exam result persistence failed; using local JSON fallback.');
      }
    }
    const results = readData('exam_results');
    results.push(result);
    writeData('exam_results', results);
    return res.status(201).json({ success: true, message: 'Practice result saved.', data: result });
  } catch (error) {
    console.error('Practice result persistence failed.');
    return res.status(500).json({ success: false, message: 'Unable to save the practice result.' });
  }
});

// Certificates are issued only for a course the authenticated student has completed.
router.get('/certificates', (req, res) => {
  const certificates = readData('certificates').filter(certificate => isCurrentStudent(certificate, req.user));
  return res.json({ success: true, data: certificates });
});

router.post('/certificates', (req, res) => {
  const courseId = Number(req.body && req.body.courseId);
  if (!Number.isSafeInteger(courseId) || courseId < 1) {
    return res.status(400).json({ success: false, message: 'A valid courseId is required.' });
  }

  const course = readData('courses').find(item =>
    Number(item.id) === courseId && item.status !== 'pending' && item.status !== 'rejected'
  );
  const enrollment = readData('enrollments').find(item =>
    Number(item.course_id) === courseId && isCurrentStudent(item, req.user)
  );
  if (!course || !enrollment) {
    return res.status(404).json({ success: false, message: 'Course enrollment not found.' });
  }
  if (enrollment.status !== 'completed' && Number(enrollment.progress) < 100) {
    return res.status(409).json({ success: false, message: 'Complete the course before requesting its certificate.' });
  }

  const certificates = readData('certificates');
  const existing = certificates.find(certificate =>
    Number(certificate.course_id) === courseId && isCurrentStudent(certificate, req.user)
  );
  if (existing) {
    return res.json({ success: true, data: existing });
  }

  const certificate = {
    id: certificates.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1,
    user_id: Number(req.user.id),
    user_email: String(req.user.email || '').toLowerCase(),
    course_id: courseId,
    course_title: course.title,
    student_name: req.user.name,
    certificate_id: `OE-${req.user.id}-${courseId}`,
    issued_at: new Date().toISOString()
  };
  certificates.push(certificate);
  writeData('certificates', certificates);
  return res.status(201).json({ success: true, data: certificate });
});

router.get('/certificate/:courseId', (req, res) => {
  const courseId = Number(req.params.courseId);
  if (!Number.isSafeInteger(courseId) || courseId < 1) {
    return res.status(400).json({ success: false, message: 'A valid courseId is required.' });
  }
  const certificate = readData('certificates').find(item =>
    Number(item.course_id) === courseId && isCurrentStudent(item, req.user)
  );
  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Issued certificate not found.' });
  }
  return res.json({ success: true, data: certificate });
});

module.exports = router;
