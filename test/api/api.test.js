const assert = require('assert');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const bcrypt = require('bcryptjs');

const TEST_SECRET = 'test-secret-for-isolated-lms-suite-32-characters';
const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'online-education-test-'));
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = TEST_SECRET;
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.CORS_ORIGIN = 'http://localhost:5000,http://127.0.0.1:5000';
process.env.RENDER_EXTERNAL_URL = 'https://online-education.example.onrender.com';

function writeData(name, data) {
  fs.writeFileSync(path.join(TEST_DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2));
}

function makeRequest(port, route, method = 'GET', body = null, token = null, origin = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (body !== null) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    if (origin) headers.Origin = origin;
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: route,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data || '{}'), raw: data, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, body: {}, raw: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (body !== null) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Executing isolated LMS security and integration tests...');
  let serverInstance = null;

  try {
    const studentPassword = 'Student-Test-Password-1';
    const teacherPassword = 'Teacher-Test-Password-1';
    const adminPassword = 'Admin-Test-Password-1';
    const [studentHash, teacherHash, otherTeacherHash, adminHash] = await Promise.all([
      bcrypt.hash(studentPassword, 10),
      bcrypt.hash(teacherPassword, 10),
      bcrypt.hash('Other-Teacher-Password-1', 10),
      bcrypt.hash(adminPassword, 10)
    ]);

    writeData('users', [
      { id: 1, name: 'Test Student', email: 'student@example.test', password_hash: studentHash, phone: '9876543210', dob: '2000-01-01', designation: 'Student', role: 'student', is_active: true },
      { id: 2, name: 'Test Teacher', email: 'teacher@example.test', password_hash: teacherHash, role: 'teacher', is_active: true },
      { id: 3, name: 'Other Teacher', email: 'other-teacher@example.test', password_hash: otherTeacherHash, role: 'teacher', is_active: true },
      { id: 4, name: 'Test Admin', email: 'admin@example.test', password_hash: adminHash, role: 'admin', is_active: true },
      { id: 5, name: 'Other Student', email: 'other-student@example.test', password_hash: studentHash, role: 'student', is_active: true }
    ]);
    writeData('courses', [
      { id: 10, title: 'Teacher-owned course', category: 'Test', status: 'published', teacher_id: 2, teacher_email: 'teacher@example.test' },
      { id: 20, title: 'Other teacher course', category: 'Test', status: 'published', teacher_id: 3, teacher_email: 'other-teacher@example.test' }
    ]);
    writeData('enrollments', [
      { id: 1, user_id: 1, user_email: 'student@example.test', course_id: 10, course_title: 'Teacher-owned course', status: 'active', progress: 10 },
      { id: 2, user_id: 5, user_email: 'other-student@example.test', course_id: 20, course_title: 'Other teacher course', status: 'active', progress: 20 }
    ]);
    writeData('assignments', [
      { id: 1, course_id: 10, title: 'Owned assignment', teacher_id: 2 },
      { id: 2, course_id: 20, title: 'Other assignment', teacher_id: 3 }
    ]);
    writeData('notifications', [
      { id: 1, target: 'all', title: 'General notice' },
      { id: 2, target: 'other-student@example.test', title: 'Private notice' }
    ]);
    writeData('exam_logs', [
      { id: 1, course_id: 20, teacher_id: 3, student: 'other-student@example.test', event: 'test' }
    ]);

    const app = require('../../server/server');
    serverInstance = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
      serverInstance.once('listening', resolve);
      serverInstance.once('error', reject);
    });
    const port = serverInstance.address().port;

    console.log('  -> Health endpoint');
    const health = await makeRequest(port, '/api/health');
    assert.strictEqual(health.status, 200, 'Health endpoint must return 200');
    assert.strictEqual(health.body.status, 'online', 'Status must be online');
    const renderFont = await makeRequest(
      port,
      '/assets/vendor/fontawesome/webfonts/fa-solid-900.woff2',
      'GET',
      null,
      null,
      process.env.RENDER_EXTERNAL_URL
    );
    assert.strictEqual(renderFont.status, 200, 'Render-origin font requests must be allowed');
    assert.strictEqual(
      renderFont.headers['access-control-allow-origin'],
      process.env.RENDER_EXTERNAL_URL,
      'Only the configured Render origin should be echoed for the font request'
    );

    console.log('  -> Public static allowlist and private file denial');
    const publicPage = await makeRequest(port, '/student/html/home.html');
    assert.strictEqual(publicPage.status, 200, 'Student pages must remain publicly servable');
    const publicDatabase = await makeRequest(port, '/exam_logs.db', 'HEAD');
    assert.strictEqual(publicDatabase.status, 404, 'SQLite databases must not be publicly served');
    const publicPythonSource = await makeRequest(port, '/app.py');
    assert.strictEqual(publicPythonSource.status, 404, 'Backend source files must not be publicly served');
    const publicRequirements = await makeRequest(port, '/requirements.txt');
    assert.strictEqual(publicRequirements.status, 404, 'Internal text files must not be publicly served');

    console.log('  -> Authentication, registration validation, and role restrictions');
    const invalidRegister = await makeRequest(port, '/api/auth/register', 'POST', {
      name: 'Invalid Registration', email: 'bad@example.test', phone: '5551234', dob: '2000-01-01', password: 'StrongPass-1'
    });
    assert.strictEqual(invalidRegister.status, 400, 'Invalid Indian mobile number must be rejected');
    const registration = await makeRequest(port, '/api/auth/register', 'POST', {
      name: 'New Student', email: 'new-student@example.test', phone: '9876543210', dob: '2000-01-01', password: 'StrongPass-1'
    });
    assert.strictEqual(registration.status, 201);
    assert.ok(!Object.prototype.hasOwnProperty.call(registration.body.user, 'password_hash'));
    const invalidTeacherApplication = await makeRequest(port, '/api/auth/register-teacher', 'POST', {
      name: 'Pending Teacher',
      email: 'new-teacher@example.test',
      phone: '9876543210',
      dob: '1990-01-01',
      designation: 'Science Teacher',
      password: 'StrongTeacherPass-1',
      confirmPassword: 'StrongTeacherPass-1',
      degrees: [{ degree: 'B.Sc', university: '', year: '' }]
    });
    assert.strictEqual(invalidTeacherApplication.status, 400, 'Partial qualifications must be rejected');
    const teacherApplication = await makeRequest(port, '/api/auth/register-teacher', 'POST', {
      name: 'Pending Teacher',
      email: 'new-teacher@example.test',
      phone: '9876543210',
      dob: '1990-01-01',
      designation: 'Science Teacher',
      password: 'StrongTeacherPass-1',
      confirmPassword: 'StrongTeacherPass-1',
      degrees: [{
        degree: 'B.Sc',
        university: 'Example University',
        year: String(new Date().getFullYear() - 2)
      }]
    });
    assert.strictEqual(teacherApplication.status, 201);
    assert.strictEqual(teacherApplication.body.user.role, 'teacher');
    assert.strictEqual(teacherApplication.body.user.is_active, false);
    assert.ok(!Object.prototype.hasOwnProperty.call(teacherApplication.body.user, 'password_hash'));
    const pendingTeacherLogin = await makeRequest(port, '/api/auth/login', 'POST', {
      email: 'new-teacher@example.test',
      password: 'StrongTeacherPass-1'
    });
    assert.strictEqual(pendingTeacherLogin.status, 401, 'Teacher application must require admin approval');
    const legacyLogin = await makeRequest(port, '/api/auth/login', 'POST', {
      email: 'student@example.test', password: '123'
    });
    assert.strictEqual(legacyLogin.status, 401, 'Legacy demo password must be rejected');

    const studentLogin = await makeRequest(port, '/api/auth/login', 'POST', {
      email: 'STUDENT@example.test', password: studentPassword
    });
    assert.strictEqual(studentLogin.status, 200);
    const studentToken = studentLogin.body.token;
    const teacherLogin = await makeRequest(port, '/api/auth/login', 'POST', {
      email: 'teacher@example.test', password: teacherPassword
    });
    assert.strictEqual(teacherLogin.status, 200);
    const teacherToken = teacherLogin.body.token;
    const noToken = await makeRequest(port, '/api/students/dashboard');
    assert.strictEqual(noToken.status, 401);

    console.log('  -> Student billing authentication, ownership, and honest empty states');
    writeData('payments', [
      {
        id: 1, user_id: 1, user_email: 'student@example.test', plan_name: 'Course payment',
        amount: '1200.00', currency: 'INR', payment_method: 'upi',
        transaction_id: 'TEST-STUDENT-TXN-1', status: 'completed', created_at: '2025-01-15T10:00:00.000Z'
      },
      {
        id: 2, user_id: 1, user_email: 'student@example.test', plan_name: 'Failed payment',
        amount: '300.00', currency: 'INR', payment_method: 'card',
        transaction_id: 'TEST-STUDENT-TXN-2', status: 'failed', created_at: '2025-01-16T10:00:00.000Z'
      },
      {
        id: 3, user_id: 5, user_email: 'other-student@example.test', plan_name: 'Other student payment',
        amount: '9999.00', currency: 'INR', payment_method: 'upi',
        transaction_id: 'TEST-OTHER-TXN', status: 'completed', created_at: '2025-01-17T10:00:00.000Z'
      }
    ]);
    const unauthenticatedBilling = await makeRequest(port, '/api/students/billing');
    assert.strictEqual(unauthenticatedBilling.status, 401);
    const teacherBilling = await makeRequest(port, '/api/students/billing', 'GET', null, teacherToken);
    assert.strictEqual(teacherBilling.status, 403);
    const studentBilling = await makeRequest(port, '/api/students/billing', 'GET', null, studentToken);
    assert.strictEqual(studentBilling.status, 200);
    assert.strictEqual(studentBilling.body.data.billingProfile.email, 'student@example.test');
    assert.deepStrictEqual(studentBilling.body.data.registeredCourses.map(course => course.title), ['Teacher-owned course']);
    assert.deepStrictEqual(
      studentBilling.body.data.transactions.map(transaction => transaction.transactionId).sort(),
      ['TEST-STUDENT-TXN-1', 'TEST-STUDENT-TXN-2']
    );
    assert.strictEqual(studentBilling.body.data.summary.amountPaid, 1200);
    assert.strictEqual(studentBilling.body.data.summary.amountPaidCurrency, 'INR');
    assert.strictEqual(studentBilling.body.data.summary.totalFees, null);
    assert.strictEqual(studentBilling.body.data.summary.outstandingBalance, null);
    assert.deepStrictEqual(studentBilling.body.data.feeBreakdown, []);
    assert.deepStrictEqual(studentBilling.body.data.invoices, []);
    assert.deepStrictEqual(studentBilling.body.data.installments, []);
    assert.strictEqual(
      studentBilling.body.data.paymentUnavailableMessage,
      'Online payment is currently unavailable. Please contact the administrator for assistance.'
    );
    const emptyStudentLogin = await makeRequest(port, '/api/auth/login', 'POST', {
      email: 'new-student@example.test', password: 'StrongPass-1'
    });
    const emptyStudentBilling = await makeRequest(
      port, '/api/students/billing', 'GET', null, emptyStudentLogin.body.token
    );
    assert.deepStrictEqual(emptyStudentBilling.body.data.transactions, []);
    assert.strictEqual(emptyStudentBilling.body.data.summary.amountPaid, null);
    assert.deepStrictEqual(emptyStudentBilling.body.data.registeredCourses, []);

    console.log('  -> Feedback API persistence and validation');
    const unauthenticatedFeedback = await makeRequest(port, '/api/feedback', 'POST', {
      subject: 'Test', rating: 5, feedback: 'Test feedback'
    });
    assert.strictEqual(unauthenticatedFeedback.status, 401);
    const invalidFeedback = await makeRequest(port, '/api/feedback', 'POST', {
      subject: '', rating: 6, feedback: ''
    }, studentToken);
    assert.strictEqual(invalidFeedback.status, 400);
    const feedbackResponse = await makeRequest(port, '/api/feedback', 'POST', {
      name: 'Spoofed Name', email: 'spoofed@example.test', subject: 'Course experience',
      rating: 5, feedback: 'A helpful learning portal.'
    }, studentToken);
    assert.strictEqual(feedbackResponse.status, 200);
    assert.strictEqual(feedbackResponse.body.success, true);
    const savedFeedback = JSON.parse(fs.readFileSync(path.join(TEST_DATA_DIR, 'feedback.json'), 'utf8'));
    assert.strictEqual(savedFeedback[0].name, 'Test Student');
    assert.strictEqual(savedFeedback[0].email, 'student@example.test');
    assert.ok(savedFeedback[0].feedback_text.startsWith('Course experience\n'));
    const unauthenticatedLegacyFeedback = await makeRequest(port, '/submit-feedback', 'POST', {
      subject: 'Legacy route', rating: 5, feedback: 'Must require a student token.'
    });
    assert.strictEqual(unauthenticatedLegacyFeedback.status, 401);

    console.log('  -> Admission validation and JSON fallback persistence');
    const invalidAdmission = await makeRequest(port, '/submit-admission', 'POST', {
      fullName: 'Applicant',
      email: 'applicant@example.test'
    });
    assert.strictEqual(invalidAdmission.status, 400);
    const admissionResponse = await makeRequest(port, '/submit-admission', 'POST', {
      fullName: 'Applicant Example',
      dob: '2002-04-03',
      gender: 'female',
      previousDegree: 'bsc',
      cgpa: '0',
      yearOfPassing: '2023-08',
      email: 'applicant@example.test',
      phone: '9876543210',
      address: 'Example Street'
    });
    assert.strictEqual(admissionResponse.status, 200);
    const savedAdmissions = JSON.parse(fs.readFileSync(path.join(TEST_DATA_DIR, 'admissions.json'), 'utf8'));
    assert.strictEqual(savedAdmissions[0].cgpa, 0);
    assert.strictEqual(savedAdmissions[0].yearOfPassing, 2023);

    console.log('  -> Student profile authorization, validation, and persistence');
    const unauthorizedProfile = await makeRequest(port, '/api/students/profile');
    assert.strictEqual(unauthorizedProfile.status, 401);
    const teacherProfile = await makeRequest(port, '/api/students/profile', 'GET', null, teacherToken);
    assert.strictEqual(teacherProfile.status, 403);
    const profileBeforeUpdate = await makeRequest(port, '/api/students/profile', 'GET', null, studentToken);
    assert.strictEqual(profileBeforeUpdate.status, 200);
    assert.strictEqual(profileBeforeUpdate.body.data.name, 'Test Student');
    assert.ok(!Object.prototype.hasOwnProperty.call(profileBeforeUpdate.body.data, 'password_hash'));
    const invalidProfileUpdate = await makeRequest(port, '/api/students/profile', 'PUT', {
      name: 'Updated Student', phone: '123', dob: '2000-01-01', designation: 'Student'
    }, studentToken);
    assert.strictEqual(invalidProfileUpdate.status, 400);
    const profileUpdate = await makeRequest(port, '/api/students/profile', 'PUT', {
      name: 'Updated Student', phone: '9123456789', dob: '2000-02-03', designation: 'Computer Science'
    }, studentToken);
    assert.strictEqual(profileUpdate.status, 200);
    const profileAfterUpdate = await makeRequest(port, '/api/students/profile', 'GET', null, studentToken);
    assert.deepStrictEqual(profileAfterUpdate.body.data, {
      id: 1,
      name: 'Updated Student',
      email: 'student@example.test',
      phone: '9123456789',
      dob: '2000-02-03',
      designation: 'Computer Science'
    });
    const savedUsers = JSON.parse(fs.readFileSync(path.join(TEST_DATA_DIR, 'users.json'), 'utf8'));
    assert.strictEqual(savedUsers.find(user => user.id === 5).name, 'Other Student');

    console.log('  -> Student data ownership and enrollment identity');
    const studentDashboard = await makeRequest(port, '/api/students/dashboard', 'GET', null, studentToken);
    assert.strictEqual(studentDashboard.status, 200);
    assert.strictEqual(studentDashboard.body.data.enrolled_courses_count, 1);
    assert.strictEqual(studentDashboard.body.data.certificates_earned_count, 0);
    assert.deepStrictEqual(studentDashboard.body.data.notifications.map(item => item.title), ['General notice']);
    const studentCourses = await makeRequest(port, '/api/students/courses', 'GET', null, studentToken);
    assert.strictEqual(studentCourses.status, 200);
    assert.deepStrictEqual(studentCourses.body.enrollments.map(item => item.user_id), [1]);
    const incompleteCertificate = await makeRequest(port, '/api/students/certificates', 'POST', {
      courseId: 10
    }, studentToken);
    assert.strictEqual(incompleteCertificate.status, 409);
    const testEnrollments = JSON.parse(fs.readFileSync(path.join(TEST_DATA_DIR, 'enrollments.json'), 'utf8'));
    testEnrollments[0].progress = 100;
    testEnrollments[0].status = 'completed';
    writeData('enrollments', testEnrollments);
    const certificate = await makeRequest(port, '/api/students/certificates', 'POST', {
      courseId: 10
    }, studentToken);
    assert.strictEqual(certificate.status, 201);
    assert.strictEqual(certificate.body.data.student_name, 'Updated Student');
    assert.strictEqual(certificate.body.data.course_title, 'Teacher-owned course');
    const duplicateCertificate = await makeRequest(port, '/api/students/certificates', 'POST', {
      courseId: 10
    }, studentToken);
    assert.strictEqual(duplicateCertificate.status, 200, 'Certificate issuance must be idempotent');
    assert.strictEqual(duplicateCertificate.body.data.id, certificate.body.data.id);
    const certificateList = await makeRequest(port, '/api/students/certificates', 'GET', null, studentToken);
    assert.deepStrictEqual(certificateList.body.data.map(item => item.user_id), [1]);
    const updatedDashboard = await makeRequest(port, '/api/students/dashboard', 'GET', null, studentToken);
    assert.strictEqual(updatedDashboard.body.data.certificates_earned_count, 1);
    const otherStudentLogin = await makeRequest(port, '/api/auth/login', 'POST', {
      email: 'other-student@example.test', password: studentPassword
    });
    const otherStudentExamResults = await makeRequest(
      port, '/api/students/exam-results', 'GET', null, otherStudentLogin.body.token
    );
    assert.deepStrictEqual(otherStudentExamResults.body.data, []);
    const otherStudentBilling = await makeRequest(
      port, '/api/students/billing', 'GET', null, otherStudentLogin.body.token
    );
    assert.deepStrictEqual(
      otherStudentBilling.body.data.transactions.map(transaction => transaction.transactionId),
      ['TEST-OTHER-TXN']
    );
    const otherStudentCertificates = await makeRequest(
      port, '/api/students/certificates', 'GET', null, otherStudentLogin.body.token
    );
    assert.deepStrictEqual(otherStudentCertificates.body.data, []);
    const issuedCertificate = await makeRequest(port, '/api/students/certificate/10', 'GET', null, studentToken);
    assert.strictEqual(issuedCertificate.status, 200);
    const enrollment = await makeRequest(port, '/api/students/enroll', 'POST', {
      courseId: 20, studentEmail: 'other-student@example.test'
    }, studentToken);
    assert.strictEqual(enrollment.status, 201);
    assert.strictEqual(enrollment.body.data.user_id, 1, 'Enrollment identity must come from the token');
    assert.strictEqual(enrollment.body.data.user_email, 'student@example.test');
    const unauthenticatedExamResults = await makeRequest(port, '/api/students/exam-results');
    assert.strictEqual(unauthenticatedExamResults.status, 401);
    const invalidExamResult = await makeRequest(port, '/api/students/exam-results', 'POST', {
      score: 10,
      totalPoints: 10,
      timeTakenSeconds: 30,
      answers: [{ question: 'Q', userAnswer: 'A', correctAnswer: 'A', correct: true, points: 5 }]
    }, studentToken);
    assert.strictEqual(invalidExamResult.status, 400);
    const savedExamResult = await makeRequest(port, '/api/students/exam-results', 'POST', {
      user_id: 5,
      user_email: 'other-student@example.test',
      score: 5,
      totalPoints: 10,
      timeTakenSeconds: 30,
      answers: [
        { question: 'Question one', userAnswer: 'Correct', correctAnswer: 'Correct', correct: true, points: 5 },
        { question: 'Question two', userAnswer: 'Skipped', correctAnswer: 'Correct', correct: false, points: 0 }
      ]
    }, studentToken);
    assert.strictEqual(savedExamResult.status, 201);
    assert.strictEqual(savedExamResult.body.data.user_id, 1);
    assert.strictEqual(savedExamResult.body.data.user_email, 'student@example.test');
    assert.strictEqual(savedExamResult.body.data.verified, false);
    const ownExamResults = await makeRequest(port, '/api/students/exam-results', 'GET', null, studentToken);
    assert.strictEqual(ownExamResults.body.data.length, 1);
    assert.strictEqual(ownExamResults.body.data[0].score, 5);
    const studentToTeacher = await makeRequest(port, '/api/teachers/dashboard', 'GET', null, studentToken);
    assert.strictEqual(studentToTeacher.status, 403);

    console.log('  -> Teacher course and student ownership');
    const teacherCourses = await makeRequest(port, '/api/teachers/courses', 'GET', null, teacherToken);
    assert.deepStrictEqual(teacherCourses.body.data.map(course => course.id), [10]);
    const foreignAssignment = await makeRequest(port, '/api/teachers/assignments', 'POST', {
      course_id: 20, title: 'Unauthorized assignment'
    }, teacherToken);
    assert.strictEqual(foreignAssignment.status, 404);
    const invalidAssignment = await makeRequest(port, '/api/teachers/assignments', 'POST', {
      course_id: 10, title: 'Invalid marks', total_marks: 0
    }, teacherToken);
    assert.strictEqual(invalidAssignment.status, 400);
    const assignment = await makeRequest(port, '/api/teachers/assignments', 'POST', {
      course_id: 10, title: 'Owned assignment', deadline: '2026-12-15',
      description: 'Complete the course project.', total_marks: 100
    }, teacherToken);
    assert.strictEqual(assignment.status, 201);
    assert.strictEqual(assignment.body.data.description, 'Complete the course project.');
    const teacherStudents = await makeRequest(port, '/api/teachers/students', 'GET', null, teacherToken);
    assert.deepStrictEqual(teacherStudents.body.data.map(item => item.user_email), ['student@example.test']);
    const unauthenticatedAttendance = await makeRequest(port, '/api/teachers/attendance');
    assert.strictEqual(unauthenticatedAttendance.status, 401);
    const foreignCourseAttendance = await makeRequest(
      port, '/api/teachers/attendance?course_id=20&date=2026-03-10', 'GET', null, teacherToken
    );
    assert.strictEqual(foreignCourseAttendance.status, 404);
    const attendanceInput = await makeRequest(
      port, '/api/teachers/attendance?course_id=10&date=2026-03-10', 'GET', null, teacherToken
    );
    assert.strictEqual(attendanceInput.status, 200);
    assert.strictEqual(attendanceInput.body.data.records.length, 1);
    const attendanceSaved = await makeRequest(port, '/api/teachers/attendance', 'POST', {
      course_id: 10,
      date: '2026-03-10',
      records: [{
        student_id: 1,
        user_email: 'student@example.test',
        status: 'present',
        remarks: 'Attended'
      }]
    }, teacherToken);
    assert.strictEqual(attendanceSaved.status, 200);
    const attendanceReadback = await makeRequest(
      port, '/api/teachers/attendance?course_id=10&date=2026-03-10', 'GET', null, teacherToken
    );
    assert.strictEqual(attendanceReadback.body.data.records[0].status, 'present');
    const teacherReport = await makeRequest(
      port, '/api/teachers/reports?start_date=2026-03-10&end_date=2026-03-10', 'GET', null, teacherToken
    );
    assert.strictEqual(teacherReport.status, 200);
    assert.strictEqual(teacherReport.body.data.attendance_rate, 100);
    assert.strictEqual(teacherReport.body.data.assignment_count, 2);
    const teacherLogs = await makeRequest(port, '/api/teachers/proctor-logs', 'GET', null, teacherToken);
    assert.deepStrictEqual(teacherLogs.body.data, []);

    console.log('  -> Admin authentication, authorization, and password-hash privacy');
    const demoAdmin = await makeRequest(port, '/api/admin/login', 'POST', {
      email: 'admin@example.test', password: '123'
    });
    assert.notStrictEqual(demoAdmin.status, 200, 'Admin demo password must be rejected');
    const adminLogin = await makeRequest(port, '/api/admin/login', 'POST', {
      email: 'admin@example.test', password: adminPassword
    });
    assert.strictEqual(adminLogin.status, 200);
    const adminToken = adminLogin.body.token;
    assert.ok(adminToken);
    const adminStats = await makeRequest(port, '/api/admin/stats', 'GET', null, adminToken);
    assert.strictEqual(adminStats.status, 200, 'Admin stats must return 200 with valid token');
    assert.ok(adminStats.body.data.total_students >= 0);
    const invalidSettings = await makeRequest(port, '/api/admin/settings', 'POST', {
      support_email: 'not-an-email'
    }, adminToken);
    assert.strictEqual(invalidSettings.status, 400);
    const settingsUpdate = await makeRequest(port, '/api/admin/settings', 'POST', {
      platform_name: 'Example Learning',
      support_email: 'help@example.test',
      registration_open: false
    }, adminToken);
    assert.strictEqual(settingsUpdate.status, 200);
    const settingsRead = await makeRequest(port, '/api/admin/settings', 'GET', null, adminToken);
    assert.strictEqual(settingsRead.body.data.platform_name, 'Example Learning');
    assert.strictEqual(settingsRead.body.data.support_email, 'help@example.test');
    assert.strictEqual(settingsRead.body.data.registration_open, false);
    const closedRegistration = await makeRequest(port, '/api/auth/register', 'POST', {
      name: 'Blocked Student',
      email: 'blocked-student@example.test',
      phone: '9876543210',
      dob: '2000-01-01',
      password: 'StrongPass-1'
    });
    assert.strictEqual(closedRegistration.status, 403);
    const closedTeacherRegistration = await makeRequest(port, '/api/auth/register-teacher', 'POST', {
      name: 'Closed Teacher',
      email: 'closed-teacher@example.test',
      phone: '9876543210',
      dob: '1990-01-01',
      designation: 'Science Teacher',
      password: 'StrongTeacherPass-1',
      confirmPassword: 'StrongTeacherPass-1'
    });
    assert.strictEqual(closedTeacherRegistration.status, 403);
    const students = await makeRequest(port, '/api/admin/students', 'GET', null, adminToken);
    assert.strictEqual(students.status, 200);
    assert.ok(students.body.data.every(user => !Object.prototype.hasOwnProperty.call(user, 'password_hash')));
    const teachers = await makeRequest(port, '/api/admin/teachers', 'GET', null, adminToken);
    assert.strictEqual(teachers.status, 200);
    assert.ok(teachers.body.data.every(user => !Object.prototype.hasOwnProperty.call(user, 'password_hash')));
    const pendingTeacher = teachers.body.data.find(user => user.email === 'new-teacher@example.test');
    assert.ok(pendingTeacher, 'Admin must be able to review new teacher applications');
    assert.strictEqual(pendingTeacher.is_active, false);
    assert.deepStrictEqual(pendingTeacher.qualifications, [{
      degree: 'B.Sc',
      university: 'Example University',
      year: new Date().getFullYear() - 2
    }]);
    const approveTeacher = await makeRequest(
      port,
      '/api/admin/teachers/toggle-status',
      'POST',
      { id: pendingTeacher.id },
      adminToken
    );
    assert.strictEqual(approveTeacher.status, 200);
    assert.strictEqual(approveTeacher.body.is_active, true);
    const approvedTeacherLogin = await makeRequest(port, '/api/auth/login', 'POST', {
      email: 'new-teacher@example.test',
      password: 'StrongTeacherPass-1'
    });
    assert.strictEqual(approvedTeacherLogin.status, 200);
    assert.strictEqual(approvedTeacherLogin.body.user.role, 'teacher');
    const logsDenied = await makeRequest(port, '/api/logs', 'GET', null, studentToken);
    assert.strictEqual(logsDenied.status, 403);
    const unauthenticatedAdmin = await makeRequest(port, '/api/admin/stats');
    assert.strictEqual(unauthenticatedAdmin.status, 401);

    console.log('  -> Authenticated exam event attribution and admin log access');
    const unauthenticatedLog = await makeRequest(port, '/api/log', 'POST', { event: 'test' });
    assert.strictEqual(unauthenticatedLog.status, 401);
    const logRes = await makeRequest(port, '/api/log', 'POST', {
      student: 'spoofed@example.test', event: 'face_detected', details: 'Candidate face centered'
    }, studentToken);
    assert.strictEqual(logRes.status, 200, 'Proctor logging must return 200');
    const logs = await makeRequest(port, '/api/logs', 'GET', null, adminToken);
    assert.strictEqual(logs.status, 200);
    assert.strictEqual(logs.body[0].student, 'student@example.test', 'Client-supplied identity must be ignored');
    const deactivatedStudent = await makeRequest(port, '/api/admin/students/toggle-status', 'POST', { id: 1 }, adminToken);
    assert.strictEqual(deactivatedStudent.status, 200);
    const revokedToken = await makeRequest(port, '/api/students/dashboard', 'GET', null, studentToken);
    assert.strictEqual(revokedToken.status, 401, 'Deactivated users must lose access immediately');

    console.log('\n✅ Isolated LMS security and integration tests passed.');
  } catch (err) {
    console.error('❌ Test execution failed:', err);
    throw err;
  } finally {
    if (serverInstance) {
      await new Promise(resolve => serverInstance.close(resolve));
    }
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  }
}

if (require.main === module) {
  runTests().catch(() => process.exitCode = 1);
}

module.exports = runTests;
