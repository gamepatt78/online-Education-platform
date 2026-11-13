-- ====================================================================
-- PostgreSQL 18 Production Schema: Online Education LMS Platform
-- Fully normalized, indexed, and with referential integrity constraints
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS & AUTHENTICATION TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(25),
    dob DATE,
    designation VARCHAR(100) DEFAULT 'Student',
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    avatar_url VARCHAR(255) DEFAULT '/assets/images/pic-1.jpg',
    is_active BOOLEAN DEFAULT TRUE,
    qualifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. PASSWORD RESET TOKENS
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);

-- 4. ADMISSIONS TABLE
CREATE TABLE IF NOT EXISTS admissions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    previous_degree VARCHAR(100) NOT NULL,
    cgpa NUMERIC(4, 2),
    year_of_passing INT,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admissions_email ON admissions(email);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);

-- 5. COURSE CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'fas fa-graduation-cap'
);

-- 6. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    instructor_id INT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(255),
    price NUMERIC(10, 2) DEFAULT 0.00,
    is_premium BOOLEAN DEFAULT FALSE,
    level VARCHAR(20) DEFAULT 'All Levels' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
    total_videos INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- 7. VIDEOS / LESSONS TABLE
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    duration VARCHAR(50),
    order_index INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id, order_index);

-- 8. ENROLLMENTS
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    completed BOOLEAN DEFAULT FALSE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- 9. EXAMS & MOCK TESTS
CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    exam_type VARCHAR(50) DEFAULT 'mock_test', -- 'mock_test', 'final_exam'
    duration_minutes INT DEFAULT 30,
    total_marks INT DEFAULT 100,
    passing_marks INT DEFAULT 40,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. EXAM SUBMISSIONS & RESULTS
CREATE TABLE IF NOT EXISTS exam_submissions (
    id SERIAL PRIMARY KEY,
    exam_id INT REFERENCES exams(id) ON DELETE SET NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(150),
    student_email VARCHAR(255),
    score NUMERIC(5, 2) NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    wrong_answers INT NOT NULL,
    percentage NUMERIC(5, 2),
    passed BOOLEAN DEFAULT FALSE,
    time_taken_seconds INT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exam_submissions_user ON exam_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_email ON exam_submissions(student_email);

-- 11. EXAM PROCTORING & MONITORING LOGS
CREATE TABLE IF NOT EXISTS exam_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    student VARCHAR(255) NOT NULL,
    event VARCHAR(100) NOT NULL,
    details TEXT,
    image_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exam_logs_student ON exam_logs(student);
CREATE INDEX IF NOT EXISTS idx_exam_logs_event ON exam_logs(event);
CREATE INDEX IF NOT EXISTS idx_exam_logs_timestamp ON exam_logs(timestamp DESC);

-- 12. FEEDBACK SUBMISSIONS
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- 13. PAYMENTS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    plan_name VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50) DEFAULT 'card',
    transaction_id VARCHAR(255) UNIQUE,
    status VARCHAR(30) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_tx ON payments(transaction_id);

-- 14. SEED INITIAL DATA (CATEGORIES & DEMO USERS)
INSERT INTO categories (name, slug, description, icon) VALUES
('Development', 'development', 'Web and Software Development courses', 'fas fa-code'),
('Data Science & AI', 'data-science', 'Machine Learning, AI and Data Analytics', 'fas fa-brain'),
('Design', 'design', 'UI/UX Design, Figma and Graphic Design', 'fas fa-pen-nib'),
('Business', 'business', 'Entrepreneurship, Marketing and Finance', 'fas fa-chart-line')
ON CONFLICT (slug) DO NOTHING;

-- Demo Password hash for '123' using bcrypt (cost 10)
-- $2a$10$wT8Kz4r7rT2v8kF6K...
INSERT INTO users (name, email, password_hash, designation, role) VALUES
('Demo Student', 'Frank@gmail.com', '$2a$10$7rX.7Yw678FpXoZzI0lJke5u9P/Y/fQ9gW1bE4F8dYf6h7j8k9l0m', 'Student', 'student'),
('Fatima Zahra', 'Fatima@gmail.com', '$2a$10$7rX.7Yw678FpXoZzI0lJke5u9P/Y/fQ9gW1bE4F8dYf6h7j8k9l0m', 'Senior Student', 'student'),
('Instructor John', 'john.instructor@edu.com', '$2a$10$7rX.7Yw678FpXoZzI0lJke5u9P/Y/fQ9gW1bE4F8dYf6h7j8k9l0m', 'Senior Computer Science Instructor', 'teacher')
ON CONFLICT (email) DO NOTHING;
