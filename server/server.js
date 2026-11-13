/**
 * Unified Production Express Server
 * Serves both the Web App Frontend and the Modern API with PostgreSQL 18 Integration.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const academicRoutes = require('./routes/academicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

const authController = require('./controllers/authController');
const academicController = require('./controllers/academicController');
const db = require('./config/db');
const { verifyToken, requireRole } = require('./middleware/authMiddleware');
const { validateLogin, validateRegister } = require('./validators/authValidator');

const app = express();
const PORT = process.env.PORT || 5000;
const PUBLIC_STATIC_EXTENSIONS = new Set([
  '.html', '.css', '.js',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.ico',
  '.woff', '.woff2', '.ttf', '.eot',
  '.pdf', '.mp4', '.webm', '.mp3', '.ogg'
]);

// Middleware
const localOrigins = [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`];
const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin && origin !== '*');
const renderOrigins = [
  process.env.RENDER_EXTERNAL_URL,
  process.env.RENDER_EXTERNAL_HOSTNAME && `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
].filter(Boolean).map(origin => new URL(origin).origin);
if ((process.env.CORS_ORIGIN || '').split(',').some(origin => origin.trim() === '*')) {
  console.warn('Ignoring wildcard CORS_ORIGIN; configure explicit origins instead.');
}
const allowedOrigins = new Set([...localOrigins, ...configuredOrigins, ...renderOrigins]);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('CORS origin is not allowed.'));
  }
}));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));

// Request logger
app.use((req, res, next) => {
  if (!req.path.includes('.') && req.method !== 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Database Health & System Status Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      engine: 'PostgreSQL 18',
      connected: db.isPostgresConnected(),
      fallback_mode: !db.isPostgresConnected() ? 'Local Resilient Store' : 'Direct DB Pool'
    },
    version: '2.0.0-production'
  });
});

// Modular REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api', academicRoutes);

// Legacy Root Endpoints for backward compatibility
app.post('/register', validateRegister, authController.register);
app.post('/login', validateLogin, authController.login);
app.post('/forgot-password', authController.forgotPassword);
app.post('/submit-feedback', verifyToken, requireRole(['student']), academicController.submitFeedback);
app.post('/submit-admission', academicController.submitAdmission);
app.post('/monitor-event', verifyToken, requireRole(['student']), academicController.logMonitorEvent);

// Keep existing bookmarks working after directory normalization
app.use((req, res, next) => {
  if (req.path === '/Teacher' || req.path.startsWith('/Teacher/')) {
    const target = `/teacher${req.path.slice('/Teacher'.length)}${req.url.slice(req.path.length)}`;
    return res.redirect(301, target);
  }
  if (req.path === '/images' || req.path.startsWith('/images/')) {
    const targetPath = req.path === '/images' ? '/assets/images' : `/assets${req.path}`;
    return res.redirect(301, `${targetPath}${req.url.slice(req.path.length)}`);
  }
  next();
});

// Serve Static Frontend Assets (design directory)
const FRONTEND_DIR = path.join(__dirname, '..', 'design');
app.use('/monitor_events', verifyToken, requireRole(['teacher', 'admin']), express.static(path.join(FRONTEND_DIR, 'monitor_events'), { fallthrough: false }));
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path === '/') return next();

  const extension = path.extname(req.path).toLowerCase();
  if (!PUBLIC_STATIC_EXTENSIONS.has(extension)) return res.sendStatus(404);
  return next();
});
app.use(express.static(FRONTEND_DIR, { dotfiles: 'deny', index: false }));
app.use('/teacher', express.static(path.join(FRONTEND_DIR, 'Teacher'), { dotfiles: 'deny', index: false }));

// Fallback route to home or dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'dashbord.html'));
});

app.use((error, req, res, next) => {
  console.error('Unhandled request failed.');
  if (res.headersSent) return next(error);
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500;
  return res.status(status).json({
    success: false,
    message: status < 500 ? 'Invalid request.' : 'Internal server error.'
  });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 Online Education Platform Live on http://localhost:${PORT}`);
    console.log(`📊 PostgreSQL Connection Status: ${db.isPostgresConnected() ? 'CONNECTED' : 'STANDBY/FALLBACK'}`);
    console.log(`📁 Static Frontend Directory: ${FRONTEND_DIR}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
