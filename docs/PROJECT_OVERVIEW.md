# Project Overview

**Project Name:** Online Education Platform (Enterprise LMS)
**Workspace Path:** `C:\Users\rainc\Downloads\Projects(intern)\Projects(intern)\Online Education`
**Application Type:** Full-Stack Web-based Learning Management System & Online Examination Portal

---

## 1. Project Purpose & Scope
The Online Education Platform is designed to serve as an end-to-end educational platform for students, instructors, and administrators. It provides:
1. **Curriculum & Video Learning**: Structured course playlists, video lessons, and syllabus tracking.
2. **Online Assessment & Mock Examinations**: Interactive timed tests, instant scoring, feedback, and performance tracking.
3. **Integrity & Proctoring**: Real-time webcam proctoring and event activity logging (tab-switch detection, face presence tracking).
4. **Student Lifecycle Management**: Registration, admissions processing, profile management, and certificates.
5. **Instructor / Teacher Administration**: Attendance management, assignment creation, grading guides, and proctoring controls.

---

## 2. Actual Technology Stack

- **Runtime & Execution**: Node.js v24.19.0 (with backward-compatible support for Python/Flask legacy scripts).
- **Backend API & Web Server**: Express.js 5.1.0 running on port 5000 (`server/server.js`).
- **Relational Database**: PostgreSQL 18 with connection pooling (`pg` v8.18.0) and high-availability local resilience tier.
- **Frontend Architecture**: Semantic HTML5, CSS3 Custom Properties (Design System tokens in `design/css/theme.css`), Vanilla JavaScript ES6+.
- **Authentication & Security**: Bcryptjs password hashing, JSON Web Tokens (JWT), tokenized password recovery.
- **Automated Testing**: Native Node.js assertion integration test runner (`server/test/api.test.js`).

---

## 3. High-Level Architecture Overview

```text
                                  +---------------------------------------+
                                  |         Client Web Browser            |
                                  | (HTML5 / Modern CSS Theme / VanillaJS)|
                                  +---------------------------------------+
                                                     |
                                                     | HTTP / REST APIs & Static Assets
                                                     v
                                  +---------------------------------------+
                                  |      Unified Express Backend          |
                                  |          (Node.js / Port 5000)        |
                                  +---------------------------------------+
                                    |                                   |
                +-------------------+-------------------+               | Dual-Tier Storage Layer
                |                                       |               |
                v                                       v               v
  +---------------------------+           +---------------------------+ +------------------------+
  |  PostgreSQL 18 DB Pool    |           |  JWT / Bcrypt Security    | |  Resilient Local Store |
  |  (Direct Normalized SQL)  |           |  (Token Auth & Sessions)  | |  (Zero-Downtime Tier)  |
  +---------------------------+           +---------------------------+ +------------------------+
```
