const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/feedback', verifyToken, requireRole(['student']), academicController.submitFeedback);
router.post('/admission', academicController.submitAdmission);
router.post('/log', verifyToken, requireRole(['student']), academicController.logMonitorEvent);
router.get('/logs', verifyToken, requireRole(['admin']), academicController.getExamLogs);

module.exports = router;
