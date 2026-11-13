const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Users, Settings } = require('../services/storageService');

const JWT_SECRET = require('../config/jwtSecret');
const DATA_DIR = require('../config/dataDirectory');

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    dob: user.dob,
    designation: user.designation,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at
  };
}

function readData(file) {
  const p = path.join(DATA_DIR, `${file}.json`);
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8') || '[]');
  } catch (e) {
    return [];
  }
}

function writeData(file, data) {
  const p = path.join(DATA_DIR, `${file}.json`);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

// Admin Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await Users.findByEmail(trimmedEmail);

    if (!user || String(user.role).toLowerCase() !== 'admin' || user.is_active === false || !user.password_hash) {
      return res.status(403).json({ success: false, message: 'Access denied: Not an administrator account.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin',
        designation: user.designation || 'Administrator'
      }
    });
  } catch (error) {
    console.error('Admin login failed.');
    return res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
};

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const users = readData('users');
    const courses = readData('courses');
    const enrollments = readData('enrollments');
    const admissions = readData('admissions');
    const logs = readData('exam_logs');

    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');
    const publishedCourses = courses.filter(c => c.status === 'published');
    const pendingCourses = courses.filter(c => c.status === 'pending');

    return res.status(200).json({
      success: true,
      data: {
        total_students: students.length,
        total_teachers: teachers.length,
        total_courses: courses.length,
        published_courses: publishedCourses.length,
        pending_courses: pendingCourses.length,
        total_enrollments: enrollments.length,
        admissions_count: admissions.length,
        recent_logs_count: logs.length,
        recent_students: students.slice(-5).reverse().map(publicUser),
        recent_courses: courses.slice(-5).reverse()
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Students
exports.getStudents = async (req, res) => {
  try {
    const users = readData('users');
    const students = users.filter(u => u.role === 'student');
    return res.status(200).json({ success: true, data: students.map(publicUser) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.toggleStudentStatus = async (req, res) => {
  try {
    const id = Number(req.body && req.body.id);
    const users = readData('users');
    const user = users.find(u => Number(u.id) === id && u.role === 'student');
    if (!user) return res.status(404).json({ success: false, message: 'Student not found.' });
    const isActive = user.is_active === false;
    const updatedUser = await Users.setActiveStatus(id, 'student', isActive);
    if (!updatedUser) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.status(200).json({ success: true, message: `Student status set to ${updatedUser.is_active ? 'active' : 'inactive'}.`, is_active: updatedUser.is_active });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Teachers
exports.getTeachers = async (req, res) => {
  try {
    const users = readData('users');
    const teachers = users.filter(u => u.role === 'teacher');
    return res.status(200).json({ success: true, data: teachers.map(publicUser) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.toggleTeacherStatus = async (req, res) => {
  try {
    const id = Number(req.body && req.body.id);
    const users = readData('users');
    const user = users.find(u => Number(u.id) === id && u.role === 'teacher');
    if (!user) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    const isActive = user.is_active === false;
    const updatedUser = await Users.setActiveStatus(id, 'teacher', isActive);
    if (!updatedUser) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    return res.status(200).json({ success: true, message: `Teacher status set to ${updatedUser.is_active ? 'active' : 'inactive'}.`, is_active: updatedUser.is_active });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Courses
exports.getCourses = async (req, res) => {
  try {
    const courses = readData('courses');
    return res.status(200).json({ success: true, data: courses });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, category, level, duration, instructor, description } = req.body;
    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required.' });
    }
    const courses = readData('courses');
    const newCourse = {
      id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category,
      level: level || 'Beginner',
      duration: duration || '10 hours',
      instructor: instructor || 'Admin Instructor',
      thumbnail: '/assets/images/thumb-1.png',
      status: 'published',
      students_count: 0,
      description: description || ''
    };
    courses.push(newCourse);
    writeData('courses', courses);
    return res.status(201).json({ success: true, message: 'Course created successfully.', data: newCourse });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.updateCourseStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const courses = readData('courses');
    const course = courses.find(c => c.id === id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    course.status = status;
    writeData('courses', courses);
    return res.status(200).json({ success: true, message: `Course status updated to ${status}.`, data: course });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let courses = readData('courses');
    courses = courses.filter(c => c.id !== id);
    writeData('courses', courses);
    return res.status(200).json({ success: true, message: 'Course deleted safely.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = readData('categories');
    return res.status(200).json({ success: true, data: categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });
    const categories = readData('categories');
    const newCat = {
      id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      icon: icon || 'fas fa-graduation-cap',
      description: description || ''
    };
    categories.push(newCat);
    writeData('categories', categories);
    return res.status(201).json({ success: true, message: 'Category added.', data: newCat });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let categories = readData('categories');
    categories = categories.filter(c => c.id !== id);
    writeData('categories', categories);
    return res.status(200).json({ success: true, message: 'Category removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Enrollments
exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = readData('enrollments');
    return res.status(200).json({ success: true, data: enrollments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Assignments
exports.getAssignments = async (req, res) => {
  try {
    const assignments = readData('assignments');
    return res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Reports
exports.getReports = async (req, res) => {
  try {
    const users = readData('users');
    const courses = readData('courses');
    const enrollments = readData('enrollments');
    const feedback = readData('feedback');
    const admissions = readData('admissions');

    return res.status(200).json({
      success: true,
      data: {
        total_users: users.length,
        student_count: users.filter(u => u.role === 'student').length,
        teacher_count: users.filter(u => u.role === 'teacher').length,
        courses_count: courses.length,
        enrollments_count: enrollments.length,
        feedback_count: feedback.length,
        admissions_count: admissions.length,
        average_feedback_rating: feedback.length > 0 ? (feedback.reduce((a, b) => a + (Number(b.rating) || 0), 0) / feedback.length).toFixed(1) : 0
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = readData('notifications');
    return res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, target } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }
    const notifications = readData('notifications');
    const newNote = {
      id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
      title,
      message,
      target: target || 'all',
      timestamp: new Date().toISOString(),
      read: false
    };
    notifications.unshift(newNote);
    writeData('notifications', notifications);
    return res.status(201).json({ success: true, message: 'Notification broadcasted.', data: newNote });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.get();
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.saveSettings = async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, 'platform_name')) {
    const platformName = typeof body.platform_name === 'string' ? body.platform_name.trim() : '';
    if (!platformName || platformName.length > 120) {
      return res.status(400).json({ success: false, message: 'Platform name must be 1 to 120 characters.' });
    }
    updates.platform_name = platformName;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'support_email')) {
    const supportEmail = typeof body.support_email === 'string' ? body.support_email.trim().toLowerCase() : '';
    if (supportEmail.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      return res.status(400).json({ success: false, message: 'A valid support email is required.' });
    }
    updates.support_email = supportEmail;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'registration_open')) {
    if (typeof body.registration_open !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Registration status must be a boolean.' });
    }
    updates.registration_open = body.registration_open;
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'Provide at least one supported setting.' });
  }

  try {
    const settings = await Settings.update(updates);
    return res.status(200).json({ success: true, message: 'Settings saved successfully.', data: settings });
  } catch (err) {
    console.error('Admin settings persistence failed.');
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
