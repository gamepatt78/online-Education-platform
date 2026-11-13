# Existing Feature Inventory & Verification Matrix

| Domain | Feature | Verification Status | Implementation Path |
| :--- | :--- | :--- | :--- |
| **Authentication** | Student Registration | Verified Functional | `/api/auth/register`, `server/controllers/authController.js` |
| **Authentication** | Unified Login & JWT | Verified Functional | `/api/auth/login`, `server/controllers/authController.js` |
| **Authentication** | Password Reset Token Request | Verified Functional | `/api/auth/forgot-password`, `server/services/storageService.js` |
| **Authentication** | Role-Based Authorization | Verified Functional | `server/middleware/authMiddleware.js` (Token + Roles) |
| **Student** | Course Catalog Discovery | Verified Functional | `/api/students/courses`, `design/student/html/courses.html` |
| **Student** | Live Course Enrollment | Verified Functional | `/api/students/enroll`, `design/student/html/playlist.html` |
| **Student** | Interactive Mock Exams | Verified Functional | `design/student/html/mocktest1.html` to `mocktest3.html` |
| **Student** | Video Learning Rooms | Verified Functional | `design/student/html/watch-video.html` |
| **Student** | Certificate Generation & Verification | Verified Functional | `/api/students/certificate/:id`, `design/student/html/Certification.html`|
| **Student** | Light Theme LMS Experience | Verified Enforced | Permanent light mode; removed all dark mode toggles |
| **Teacher** | Teacher Dashboard & Metrics | Verified Functional | `/api/teachers/dashboard`, `design/teacher/htmlfiles/home.html` |
| **Teacher** | Course Authoring & Submission | Verified Functional | `/api/teachers/courses`, `design/teacher/htmlfiles/resources.html` |
| **Teacher** | Assignment Creation & Deadlines | Verified Functional | `/api/teachers/assignments`, `design/teacher/htmlfiles/creating-assignment.html` |
| **Teacher** | AI Proctoring Session Monitoring| Verified Functional | `/api/teachers/proctor-logs`, `design/teacher/htmlfiles/proctor.html` |
| **Admin** | SuperAdmin Authentication | Verified Functional | `/api/admin/login`, `design/admin/html/login.html` |
| **Admin** | Real-Time Metrics Dashboard | Verified Functional | `/api/admin/stats`, `design/admin/html/dashboard.html` |
| **Admin** | Student Management & Activation | Verified Functional | `/api/admin/students`, `design/admin/html/students.html` |
| **Admin** | Faculty Management & Activation | Verified Functional | `/api/admin/teachers`, `design/admin/html/teachers.html` |
| **Admin** | Course Publishing & Deletion | Verified Functional | `/api/admin/courses`, `design/admin/html/courses.html` |
| **Admin** | Category & Discipline Manager | Verified Functional | `/api/admin/categories`, `design/admin/html/categories.html` |
| **Admin** | Enrollment Oversight | Verified Functional | `/api/admin/enrollments`, `design/admin/html/enrollments.html` |
| **Admin** | Broadcast System Announcements | Verified Functional | `/api/admin/notifications`, `design/admin/html/notifications.html` |
| **Admin** | Analytical Audit Reports | Verified Functional | `/api/admin/reports`, `design/admin/html/reports.html` |
| **Admin** | Platform Settings Configuration | Verified Functional | `/api/admin/settings`, `design/admin/html/settings.html` |
| **Database** | PostgreSQL 18 Production Pool | Verified Active/Standby | `server/config/db.js`, `db/schema.sql` |
| **Database** | Local Resilient JSON Mirror | Verified Active | `server/data/`, `server/services/storageService.js` |
