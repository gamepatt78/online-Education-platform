const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Users, Settings } = require('../services/storageService');

const JWT_SECRET = require('../config/jwtSecret');

function normalizeTeacherQualifications(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 10) return null;

  const currentYear = new Date().getFullYear();
  const qualifications = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const degree = typeof item.degree === 'string' ? item.degree.trim() : '';
    const university = typeof item.university === 'string' ? item.university.trim() : '';
    const yearText = item.year === undefined || item.year === null ? '' : String(item.year).trim();
    if (!degree && !university && !yearText) continue;

    const year = /^\d{4}$/.test(yearText) ? Number(yearText) : NaN;
    if (!degree || degree.length > 120 || !university || university.length > 200 ||
        !Number.isSafeInteger(year) || year < 1950 || year > currentYear) {
      return null;
    }
    qualifications.push({ degree, university, year });
  }
  return qualifications;
}

// Register User
exports.register = async (req, res) => {
  try {
    const settings = await Settings.get();
    if (!settings.registration_open) {
      return res.status(403).json({ success: false, message: 'Student registration is currently closed.' });
    }

    const { name, email, phone, dob, designation, password } = req.body;

    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters and no more than 72 bytes.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Users.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || '',
      dob: dob || null,
      designation: designation || 'Student',
      role: 'student',
      password_hash
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is active.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        designation: newUser.designation,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration request failed.');
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

exports.registerTeacher = async (req, res) => {
  try {
    const settings = await Settings.get();
    if (!settings.registration_open) {
      return res.status(403).json({ success: false, message: 'Teacher registration is currently closed.' });
    }

    const body = req.body || {};
    const designation = typeof body.designation === 'string' ? body.designation.trim() : '';
    if (!designation || designation.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Designation is required and must be 100 characters or fewer.'
      });
    }

    const qualifications = normalizeTeacherQualifications(body.degrees);
    if (!qualifications) {
      return res.status(400).json({
        success: false,
        message: 'Enter complete degree, university, and valid year details for each qualification.'
      });
    }

    const normalizedEmail = body.email.trim().toLowerCase();
    const existing = await Users.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const newTeacher = await Users.create({
      name: body.name.trim(),
      email: normalizedEmail,
      phone: body.phone.trim(),
      dob: body.dob,
      designation,
      password_hash: passwordHash,
      role: 'teacher',
      is_active: false,
      qualifications
    });

    return res.status(201).json({
      success: true,
      message: 'Your teacher application was submitted. An administrator must approve your account before you can sign in.',
      user: {
        id: newTeacher.id,
        name: newTeacher.name,
        email: newTeacher.email,
        role: newTeacher.role,
        is_active: false
      }
    });
  } catch (error) {
    console.error('Teacher registration request failed.');
    return res.status(500).json({ success: false, message: 'Teacher registration failed. Please try again.' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await Users.findByEmail(normalizedEmail);
    if (!user || !user.password_hash || user.is_active === false) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const role = typeof user.role === 'string' ? user.role.toLowerCase() : '';
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(403).json({ success: false, message: 'This account does not have an authorized role.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        designation: user.designation || 'Student'
      }
    });
  } catch (error) {
    console.error('Login request failed.');
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Password reset is unavailable because email delivery is not configured.'
  });
};
