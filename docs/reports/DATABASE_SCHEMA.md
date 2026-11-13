# Database Schema & Persistence Architecture

## 1. Overview
The Online Education Platform uses a mixed persistence architecture:
1. **PostgreSQL:** Relational tables, foreign keys, indexes, and check constraints are defined by the ordered SQL migrations in `db/migrations/`.
2. **JSON storage:** Several application workflows, including settings, attendance, assignments, and detailed practice results, use files in the configured `DATA_DIR`. JSON and PostgreSQL are not synchronized as a single source of truth.

The migration runner creates `schema_migrations` and records each applied migration filename. The table is created by the runner, not by the initial schema SQL file.

## 2. PostgreSQL 18 Entities
- `users`: ID, UUID, name, email, password_hash, phone, dob, designation, role (`student`, `teacher`, `admin`), avatar_url, is_active, timestamps.
- `password_resets`: ID, user_id, email, token, expires_at, used.
- `admissions`: ID, user_id, full_name, dob, gender, previous_degree, cgpa, year_of_passing, email, phone, address, status.
- `categories`: ID, name, slug, description, icon.
- `courses`: ID, category_id, instructor_id, title, slug, description, thumbnail_url, price, is_premium, level, total_videos, timestamps.
- `lessons`: ID, course_id, title, description, video_url, duration, order_index.
- `enrollments`: ID, user_id, course_id, progress_percent, completed, enrolled_at, completed_at.
- `exams`: ID, course_id, title, exam_type, duration_minutes, total_marks, passing_marks, is_active.
- `exam_submissions`: ID, exam_id, user_id, student_name, student_email, score, total_questions, correct_answers, wrong_answers, percentage, passed, time_taken_seconds.
- `exam_logs`: ID, user_id, student, event, details, image_url, timestamp.
- `feedback`: ID, user_id, name, email, rating, feedback_text, created_at.
- `payments`: ID, user_id, plan_name, amount, currency, payment_method, transaction_id, status.

The practice-result endpoint can mirror the summary fields to `exam_submissions` when PostgreSQL is connected. Detailed answer data and the `verified: false` marker are stored in JSON; client-calculated scores are not official grades.
