# Complete API Reference Documentation

## Base URL
`http://localhost:5000`

---

## 1. System Health
### `GET /api/health`
Returns system status, active database engine, and timestamp.
```json
{
  "status": "online",
  "timestamp": "2026-11-13T03:59:16.798Z",
  "database": {
    "engine": "PostgreSQL 18",
    "connected": false,
    "fallback_mode": "Local Resilient Store"
  },
  "version": "2.0.0-production"
}
```

---

## 2. Authentication (`/api/auth`)
### `POST /api/auth/register`
Register a student account.
- **Body:** `{ "name": "string", "email": "string", "phone": "string", "password": "string" }`

### `POST /api/auth/login`
Authenticate any valid student, teacher, or admin.
- **Body:** `{ "email": "user@edu.com", "password": "password" }`
- **Response:** `{ "success": true, "token": "JWT_TOKEN", "user": { ... } }`

### `POST /api/auth/forgot-password`
Request a secure password reset token.
- **Body:** `{ "email": "user@edu.com" }`

---

## 3. SuperAdmin Management (`/api/admin`)
*Protected by `verifyToken` and `requireRole(['admin'])` except for login.*

### `POST /api/admin/login`
Authenticate administrator credentials.
- **Body:** `{ "email": "admin@edu.com", "password": "password" }`

### `GET /api/admin/stats`
Retrieve aggregated system metrics (students, teachers, courses, enrollments).

### `GET /api/admin/students`
List all student profiles.

### `POST /api/admin/students/toggle-status`
Activate or deactivate a student account (`{ "id": 1 }`).

### `GET /api/admin/teachers`
List all instructor accounts.

### `POST /api/admin/teachers/toggle-status`
Activate or deactivate a faculty account (`{ "id": 1 }`).

### `GET /api/admin/courses`
List all courses across all statuses (`published`, `pending`).

### `POST /api/admin/courses`
Publish a new course directly (`{ "title": "...", "category": "...", "level": "..." }`).

### `PUT /api/admin/courses/:id/status`
Update approval status (`{ "status": "published" }`).

### `DELETE /api/admin/courses/:id`
Delete a course from catalog.

### `GET /api/admin/categories` / `POST /api/admin/categories`
Manage academic tracks and disciplines.

### `GET /api/admin/enrollments`
Monitor student enrollments and progress.

### `GET /api/admin/notifications` / `POST /api/admin/notifications`
View or broadcast platform announcements.

### `GET /api/admin/reports`
Retrieve analytical summaries and student satisfaction ratings.

---

## 4. Student Endpoints (`/api/students`)
### `GET /api/students/dashboard`
Get student learning metrics, enrolled course tallies, and upcoming quizzes.

### `GET /api/students/courses`
List available courses with enrollment status.

### `POST /api/students/enroll`
Enroll student into a course (`{ "courseId": 1, "studentEmail": "..." }`).

### `GET /api/students/progress/:courseId`
Retrieve completion percentage for a course.

### `GET /api/students/certificate/:courseId`
Generate and verify completion certificate.

---

## 5. Teacher Endpoints (`/api/teachers`)
### `GET /api/teachers/dashboard`
Retrieve teacher statistics and active courses.

### `GET /api/teachers/courses` / `POST /api/teachers/courses`
Create courses and submit for admin approval.

### `GET /api/teachers/assignments` / `POST /api/teachers/assignments`
Create assignments with deadlines and track submissions.

### `GET /api/teachers/proctor-logs`
Inspect live exam monitoring events and webcam snapshots.

---

## 6. Academic Common Endpoints (`/api`)
### `POST /api/feedback`
Submit user feedback and ratings.

### `POST /api/admission`
Submit full degree admission application.

### `POST /api/log`
Record proctoring telemetry and security events.

### `GET /api/logs`
Retrieve recent exam logs.
