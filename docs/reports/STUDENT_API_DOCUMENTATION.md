# Student API Documentation

## Base URLs

- Express: `http://127.0.0.1:5000`
- Flask proxy/static frontend: `http://127.0.0.1:5002`

Student routes require `Authorization: Bearer <JWT>` and a Student role unless
otherwise noted. Flask proxies preserve the incoming Authorization header.

## Authentication

| Method and path | Auth | Behavior |
|---|---|---|
| `POST /api/auth/register` | No | Validates and registers an account. |
| `POST /api/auth/login` | No | Authenticates and returns a JWT. |
| `POST /api/auth/forgot-password` | No | Endpoint exists; secure token delivery/verification is incomplete. |

## Student endpoints

| Method and path | Request | Behavior and notable responses |
|---|---|---|
| `GET /api/students/profile` | None | Returns the authenticated Student profile. `401` missing token; `403` invalid token; `404` profile missing. |
| `PUT /api/students/profile` | JSON: `name`, `phone`, `dob`, `designation` | Validates and updates profile fields. `400` invalid input. |
| `GET /api/students/dashboard` | None | Returns course, certificate, assignment, quiz counts, notifications, and recent courses from configured JSON collections. |
| `GET /api/students/courses` | None | Returns visible courses and the current Student's enrollments. |
| `POST /api/students/enroll` | JSON: `courseId` | Creates enrollment. `400` invalid/duplicate request; `404` unavailable course; `201` success. |
| `GET /api/students/progress/:courseId` | None | Reads progress for the authenticated Student's enrollment. No progress-write endpoint is implemented here. |
| `GET /api/students/certificates` | None | Lists certificates owned by the authenticated Student. |
| `POST /api/students/certificates` | JSON: `courseId` | Issues a certificate only when the Student has a completed enrollment; `409` if incomplete, `404` if no matching course enrollment. |
| `GET /api/students/certificate/:courseId` | None | Returns an issued certificate owned by the Student. |
| `GET /api/students/exam-results` | None | Lists practice results owned by the authenticated Student. |
| `POST /api/students/exam-results` | JSON: score, totalPoints, timeTakenSeconds, answers | Saves a practice result and derives identity from the JWT. `verified` is always false because scoring is browser-calculated. |
| `POST /api/feedback` | JSON: `subject`, `feedback`, `rating` | Authenticated Student feedback; message max 2,000 characters, rating 1-5. |
| `POST /api/log` | JSON: `event`, `details`, optional data-image | Authenticated Student monitoring event; identity is derived from the token. |

`GET /api/logs` is restricted to Admin. `POST /api/admission` is not a
Student-authenticated route. The Flask aliases for Student profile, dashboard,
courses, enrollment, certificates, feedback, and monitoring are implemented in
`design/app.py`.

## Storage notes

Student course/enrollment/progress/certificate and practice-result endpoints
use local JSON files in the current implementation; practice results may also
be mirrored to PostgreSQL when it is connected. The practice exam is scored in
browser code, so saved scores are not verified or official grades. Profile
photos remain browser-local. See
[STUDENT_DATABASE_DOCUMENTATION.md](./STUDENT_DATABASE_DOCUMENTATION.md).
