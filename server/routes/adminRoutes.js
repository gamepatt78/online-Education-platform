const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public Admin Login Endpoint
router.post('/login', adminController.login);

// Protected Admin APIs (Token + Admin Role required)
router.use(verifyToken);
router.use(requireRole(['admin']));

router.get('/stats', adminController.getDashboardStats);
router.get('/students', adminController.getStudents);
router.post('/students/toggle-status', adminController.toggleStudentStatus);

router.get('/teachers', adminController.getTeachers);
router.post('/teachers/toggle-status', adminController.toggleTeacherStatus);

router.get('/courses', adminController.getCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id/status', adminController.updateCourseStatus);
router.delete('/courses/:id', adminController.deleteCourse);

router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.delete('/categories/:id', adminController.deleteCategory);

router.get('/enrollments', adminController.getEnrollments);
router.get('/assignments', adminController.getAssignments);
router.get('/reports', adminController.getReports);

router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.createNotification);

router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.saveSettings);

module.exports = router;
