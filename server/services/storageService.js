/**
 * Dual Storage Layer:
 * Seamlessly stores and queries records in PostgreSQL 18 when available,
 * and maintains synchronized local JSON store as a resilient backup.
 */
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const DATA_DIR = require('../config/dataDirectory');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getLocalFile(collection) {
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  return filePath;
}

function readLocal(collection) {
  try {
    const file = getLocalFile(collection);
    return JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
  } catch (err) {
    return [];
  }
}

function writeLocal(collection, data) {
  const file = getLocalFile(collection);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

const DEFAULT_SETTINGS = {
  platform_name: 'Online Education LMS',
  support_email: 'admin@edu.com',
  registration_open: true,
  default_role: 'student',
  theme_default: 'light'
};

const Settings = {
  async get() {
    const stored = readLocal('settings');
    return stored && !Array.isArray(stored) && typeof stored === 'object'
      ? { ...DEFAULT_SETTINGS, ...stored }
      : { ...DEFAULT_SETTINGS };
  },

  async update(updates) {
    const current = await this.get();
    const settings = { ...current, ...updates, updated_at: new Date().toISOString() };
    writeLocal('settings', settings);
    return settings;
  }
};

// User Storage Service
const Users = {
  async findByEmail(email) {
    if (db.isPostgresConnected()) {
      try {
        const res = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        if (res.rows.length) return res.rows[0];
      } catch (err) {
        console.warn('PostgreSQL user query failed; using local JSON fallback.');
      }
    }
    const users = readLocal('users');
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async create(user) {
    let createdUser = null;
    const qualifications = Array.isArray(user.qualifications) ? user.qualifications : [];
    const isActive = user.is_active !== false;
    if (db.isPostgresConnected()) {
      try {
        const res = await db.query(
          `INSERT INTO users (name, email, password_hash, phone, dob, designation, role, is_active, qualifications)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb) RETURNING *`,
          [
            user.name,
            user.email,
            user.password_hash,
            user.phone,
            user.dob || null,
            user.designation || 'Student',
            user.role || 'student',
            isActive,
            JSON.stringify(qualifications)
          ]
        );
        createdUser = res.rows[0];
      } catch (err) {
        console.warn('PostgreSQL user insert failed; using local JSON fallback.');
      }
    }

    // Always mirror to local store for reliability
    const users = readLocal('users');
    const localUser = {
      id: createdUser ? createdUser.id : users.length + 1,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash,
      phone: user.phone,
      dob: user.dob,
      designation: user.designation || 'Student',
      role: user.role || 'student',
      is_active: isActive,
      qualifications,
      created_at: new Date().toISOString()
    };
    users.push(localUser);
    writeLocal('users', users);

    return createdUser || localUser;
  },

  async updateProfile(email, profile) {
    let updatedUser = null;
    if (db.isPostgresConnected()) {
      try {
        const res = await db.query(
          `UPDATE users
           SET name = $1, phone = $2, dob = $3, designation = $4
           WHERE LOWER(email) = LOWER($5) AND LOWER(role) = 'student'
           RETURNING id, name, email, phone, dob, designation, role`,
          [profile.name, profile.phone, profile.dob, profile.designation, email]
        );
        updatedUser = res.rows[0] || null;
      } catch (err) {
        console.warn('PostgreSQL profile update failed; using local JSON fallback.');
      }
    }

    const users = readLocal('users');
    const localUser = users.find(user =>
      typeof user.email === 'string' &&
      user.email.toLowerCase() === email.toLowerCase() &&
      String(user.role).toLowerCase() === 'student'
    );
    if (localUser) {
      Object.assign(localUser, profile);
      writeLocal('users', users);
      return localUser;
    }

    return updatedUser;
  },

  async setActiveStatus(id, role, isActive) {
    const users = readLocal('users');
    const user = users.find(item => Number(item.id) === Number(id) && item.role === role);
    if (!user) return null;

    if (db.isPostgresConnected()) {
      await db.query(
        'UPDATE users SET is_active = $1 WHERE id = $2 AND role = $3',
        [isActive, id, role]
      );
    }

    user.is_active = isActive;
    writeLocal('users', users);
    return user;
  }
};

// Feedback Storage Service
const Feedback = {
  async create({ name, email, rating, feedback_text }) {
    if (db.isPostgresConnected()) {
      try {
        await db.query(
          'INSERT INTO feedback (name, email, rating, feedback_text) VALUES ($1, $2, $3, $4)',
          [name, email, rating, feedback_text]
        );
      } catch (err) {
        console.warn('PostgreSQL feedback persistence failed; using local JSON fallback.');
      }
    }
    const items = readLocal('feedback');
    items.push({ id: items.length + 1, name, email, rating, feedback_text, created_at: new Date().toISOString() });
    writeLocal('feedback', items);
    return true;
  },

  async getAll() {
    if (db.isPostgresConnected()) {
      try {
        const res = await db.query('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50');
        return res.rows;
      } catch (err) {}
    }
    return readLocal('feedback');
  }
};

// Admissions Storage Service
const Admissions = {
  async create(data) {
    if (db.isPostgresConnected()) {
      try {
        await db.query(
          `INSERT INTO admissions (full_name, dob, gender, previous_degree, cgpa, year_of_passing, email, phone, address)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            data.fullName,
            data.dob,
            data.gender,
            data.previousDegree,
            data.cgpa === null || data.cgpa === undefined || data.cgpa === '' ? null : Number(data.cgpa),
            data.yearOfPassing === null || data.yearOfPassing === undefined || data.yearOfPassing === ''
              ? null
              : Number(data.yearOfPassing),
            data.email,
            data.phone,
            data.address
          ]
        );
      } catch (err) {
        console.warn('PostgreSQL admission persistence failed; using local JSON fallback.');
      }
    }
    const items = readLocal('admissions');
    items.push({ id: items.length + 1, ...data, created_at: new Date().toISOString() });
    writeLocal('admissions', items);
    return true;
  }
};

// Exam Monitoring Logs Storage Service
const ExamLogs = {
  async create({ student, event, details, image }) {
    if (db.isPostgresConnected()) {
      try {
        await db.query(
          'INSERT INTO exam_logs (student, event, details, image_url) VALUES ($1, $2, $3, $4)',
          [student || 'Unknown', event || '', details || '', image || '']
        );
      } catch (err) {
        console.warn('PostgreSQL exam log persistence failed; using local JSON fallback.');
      }
    }
    const logs = readLocal('exam_logs');
    logs.unshift({
      id: logs.length + 1,
      student: student || 'Unknown',
      event: event || '',
      details: details || '',
      image: image || '',
      timestamp: new Date().toISOString()
    });
    writeLocal('exam_logs', logs.slice(0, 100));
    return true;
  },

  async getAll(limit = 50) {
    if (db.isPostgresConnected()) {
      try {
        const res = await db.query('SELECT * FROM exam_logs ORDER BY timestamp DESC LIMIT $1', [limit]);
        return res.rows;
      } catch (err) {}
    }
    return readLocal('exam_logs').slice(0, limit);
  }
};

// Password Reset Requests
const PasswordResets = {
  async create({ email, token }) {
    if (db.isPostgresConnected()) {
      try {
        await db.query(
          'INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'24 HOURS\')',
          [email, token]
        );
      } catch (err) {}
    }
    const resets = readLocal('password_resets');
    resets.push({ email, token, created_at: new Date().toISOString() });
    writeLocal('password_resets', resets);
    return true;
  }
};

module.exports = {
  Users,
  Settings,
  Feedback,
  Admissions,
  ExamLogs,
  PasswordResets
};
