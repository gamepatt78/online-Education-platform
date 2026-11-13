const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Users, Settings } = require('../services/storageService');

const JWT_SECRET = require('../config/jwtSecret');

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
