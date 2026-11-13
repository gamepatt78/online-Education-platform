# SuperAdmin Module Engineering Report

## 1. Overview
The SuperAdmin module was engineered completely from scratch to provide centralized administrative control over the entire Online Education LMS platform. It includes role-protected access, directory management for students and faculty, course catalog approval and deletion, category taxonomy management, real-time enrollment oversight, platform announcements, and executive reports.

## 2. Directory Architecture
```text
design/admin/
├── assets/
│   ├── icons/
│   └── images/
├── css/
│   └── common.css           # Modular Admin layout and UI components (Light mode)
├── html/
│   ├── dashboard.html       # Analytics & system health dashboard
│   ├── students.html        # Student search, directory, and activate/deactivate
│   ├── teachers.html        # Faculty search, directory, and activate/deactivate
│   ├── courses.html         # Curriculum catalog, approval & deletion
│   ├── categories.html      # Academic category CRUD
│   ├── enrollments.html     # Live student enrollment viewer
│   ├── assignments.html     # Assignment tracking and submission counts
│   ├── reports.html         # Analytical summaries and audit logs
│   ├── notifications.html   # System-wide announcement broadcast tool
│   ├── settings.html        # Platform configuration
│   └── login.html           # Administrator authentication interface
└── js/
    ├── common.js            # Admin token management, auth guard, fetch helper
    ├── dashboard.js         # Real-time metric rendering
    ├── students.js          # Student management controller
    ├── teachers.js          # Faculty management controller
    ├── courses.js           # Course creator and approval handler
    ├── categories.js        # Category management controller
    ├── enrollments.js       # Live enrollment loader
    └── reports.js           # Analytics aggregator
```

## 3. Backend Integration & Role Security
- **Route Namespace:** `/api/admin`
- **Protection Layer:** All admin endpoints (except `/api/admin/login`) are protected by `verifyToken` and `requireRole(['admin'])` in `server/middleware/authMiddleware.js`.
- **Administrative Account:** Default administrative account (`admin@edu.com`) is provisioned with high-entropy bcrypt hashing and role `admin`. Public registration of admin accounts is strictly forbidden.
