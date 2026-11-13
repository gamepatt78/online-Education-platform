# REST API Documentation

**Base Server URL:** `http://localhost:5000`
**Data Format:** `application/json`
**Authentication Scheme:** `Bearer <JWT_TOKEN>`

---

## 1. System Health & Diagnostics

### `GET /api/health`
Returns system status, active database engine, and storage operational mode.
- **Request:** None
- **Response (200 OK):**
  ```json
  {
    "status": "online",
    "timestamp": "2026-11-12T18:04:15.868Z",
    "database": {
      "engine": "PostgreSQL 18",
      "connected": false,
      "fallback_mode": "Local Resilient Store"
    },
    "version": "2.0.0-production"
  }
  ```

---

## 2. Authentication Endpoints

### `POST /api/auth/register` (also `/register`)
Registers a new student account.
- **Payload:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.edu",
    "phone": "+1 555-0199",
    "dob": "2001-05-15",
    "designation": "Undergraduate",
    "password": "<private-password-of-at-least-8-characters>"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Registration successful! Your account is active.",
    "user": {
      "id": 2,
      "name": "Jane Doe",
      "email": "jane@example.edu",
      "designation": "Undergraduate",
      "role": "student"
    }
  }
  ```
- **Error (400 Bad Request):** If email already exists or required fields are missing.

### `POST /api/auth/register-teacher`
Submits a teacher account application. The account is created inactive and cannot sign in until an administrator activates it through the Admin Teachers page.
- **Payload:** Required: `name`, `email`, `phone`, `dob`, `designation`, `password`, and `confirmPassword`. Optional: `degrees`, an array of `{ "degree", "university", "year" }` objects; each included entry must provide all three values.
- **Response (201 Created):** Returns the application message and basic account details. Password hashes are never included in the response.
- **Error (400 Bad Request):** If account details or degree entries are invalid, or the email is already registered. Teacher registration also respects the administrator's registration setting.

### `POST /api/auth/login` (also `/login`)
Authenticates credentials and issues a signed JWT session token.
- **Payload:**
  ```json
  {
    "email": "student@example.test",
    "password": "<private-password>"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful!",
    "token": "<redacted-jwt>",
    "user": {
      "id": 1,
      "name": "Demo Student",
      "email": "Frank@gmail.com",
      "role": "student",
      "designation": "Student"
    }
  }
  ```
- **Error (401 Unauthorized):** Invalid credentials.

### `POST /api/auth/forgot-password` (also `/forgot-password`)
Password reset is unavailable until secure email delivery and token verification are configured.
- **Payload:**
  ```json
  {
    "email": "Frank@gmail.com"
  }
  ```
- **Response (501 Not Implemented):**
  ```json
  {
    "success": false,
    "message": "Password reset is unavailable because email delivery is not configured."
  }
  ```

---

## 3. Academic & Admissions Endpoints

### `POST /submit-admission` (also `/api/admission`)
Submits a formal student admission application.
- **Payload:**
  ```json
  {
    "fullName": "Jane Doe",
    "dob": "2000-01-01",
    "gender": "female",
    "previousDegree": "B.Tech",
    "cgpa": 8.7,
    "yearOfPassing": 2024,
    "email": "jane@example.edu",
    "phone": "+1 555-0199",
    "address": "123 College St"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Admission form submitted successfully!"
  }
  ```

### `POST /api/feedback`
Records feedback from the authenticated student. `/submit-feedback` is a protected legacy alias.
- **Payload:**
  ```json
  {
    "subject": "Course feedback",
    "rating": 5,
    "feedback": "The lessons were helpful."
  }
  ```
- **Authentication:** Student bearer JWT. Name and email are derived from the token's account.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Feedback submitted successfully!"
  }
  ```

---

## 4. Proctoring & Examination Activity Logging

### `POST /api/log` (also `/monitor-event`)
Records exam integrity events (camera focus loss, tab switching, facial orientation).
- **Payload:**
  ```json
  {
    "student": "Frank@gmail.com",
    "event": "tab-switched",
    "details": "Candidate switched browser tabs during mock test",
    "image": "data:image/jpeg;base64,..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "message": "Event logged successfully",
    "saved_image": "tab_switched_1794504248.jpg"
  }
  ```

### `GET /api/logs`
Retrieves the 50 most recent proctoring activity records.
- **Response (200 OK):** Array of proctoring log records.
- **Authentication:** Admin bearer JWT.

---

## 5. Persisted Student Practice Results

### `POST /api/students/exam-results`
Saves a browser-scored practice result for the authenticated student. The server derives student identity from the JWT and ignores client-supplied identity fields.
- **Authentication:** Student bearer JWT.
- **Payload:** `score`, `totalPoints`, `timeTakenSeconds`, and an `answers` array.
- **Response:** `201 Created` with the saved result and `verified: false`.

### `GET /api/students/exam-results`
Lists practice results owned by the authenticated student.
- **Authentication:** Student bearer JWT.
- **Important:** Scores are calculated in browser code and are not verified or official grades.

## 6. Teacher and Admin Workflows

Teacher endpoints require a teacher bearer JWT.

| Method and path | Purpose |
|---|---|
| `GET /api/teachers/attendance?course_id=<id>&date=YYYY-MM-DD` | Read attendance for a teacher-owned course and date. |
| `POST /api/teachers/attendance` | Save one status per enrolled student for an owned course and date. |
| `GET /api/teachers/reports?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` | Summarize attendance and assignment data for the teacher's courses. |
| `GET /api/teachers/assignments` | List assignments associated with teacher-owned courses. |
| `POST /api/teachers/assignments` | Create an assignment for an owned course. |

Admin settings endpoints require an admin bearer JWT. `GET /api/admin/settings` reads settings and defaults; `POST /api/admin/settings` persists `platform_name`, `support_email`, and/or `registration_open` in JSON storage. Closing registration also disables public student registration.

Student, teacher, and admin JSON-backed workflows use the configured `DATA_DIR`; PostgreSQL availability does not imply every feature is stored in SQL.
