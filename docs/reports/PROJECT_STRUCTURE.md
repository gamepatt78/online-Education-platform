# LMS Project Directory Structure

```text
Online Education/
├── .env.example                     # Environment template (PostgreSQL, JWT, Ports)
├── .gitignore                       # Git exclusions (node_modules, .env, OS artifacts)
├── db/
│   ├── migrations/                  # Versioned schema migrations
│   │   └── 001_initial_schema.sql
│   └── schema.sql                   # Complete PostgreSQL 18 schema (DDL & DML seeds)
├── docs/
│   └── reports/                     # Project, module, API, security, and UI reports
├── design/                          # Frontend User Interfaces
│   ├── admin/                       # [NEW] Full-featured SuperAdmin Module
│   │   ├── assets/                  # Admin icons and image assets
│   │   ├── css/
│   │   │   └── common.css           # Modular Admin design system (light mode)
│   │   ├── html/
│   │   │   ├── dashboard.html       # Analytics overview & quick stats
│   │   │   ├── students.html        # Student account controls & activation
│   │   │   ├── teachers.html        # Faculty controls & status management
│   │   │   ├── courses.html         # Course catalog, approval & deletion
│   │   │   ├── categories.html      # Academic track & discipline manager
│   │   │   ├── enrollments.html     # Real-time student enrollment viewer
│   │   │   ├── assignments.html     # Assignment submission monitoring
│   │   │   ├── reports.html         # Audit & analytical summaries
│   │   │   ├── notifications.html   # System-wide announcement broadcast
│   │   │   ├── settings.html        # Global LMS configuration
│   │   │   └── login.html           # Authenticated administrator gateway
│   │   └── js/
│   │       ├── common.js            # Auth checks, token handling, fetch helper
│   │       ├── dashboard.js         # Stat metric rendering
│   │       ├── students.js          # Student list & activation toggle
│   │       ├── teachers.js          # Faculty list & activation toggle
│   │       ├── courses.js           # Course creator, approve/unpublish
│   │       ├── categories.js        # Category CRUD
│   │       ├── enrollments.js       # Live enrollment tables
│   │       └── reports.js           # Analytics aggregator
│   ├── student/                     # Verified Student Portal (Permanent Light Mode)
│   │   ├── css/                     # Clean light LMS typography and styling
│   │   ├── html/                    # 44 Verified Student Pages (courses, learning room, exams)
│   │   └── js/                      # Student client-side controller logic
│   ├── teacher/                     # Verified Faculty Portal
│   │   ├── css/                     # Teacher dashboard stylesheets
│   │   ├── htmlfiles/               # Course authoring, assignments, proctoring
│   │   └── js/                      # Teacher management scripts
│   └── assets/                      # Static brand imagery, badges, and icons
├── server/                          # Production Backend REST API
│   ├── config/                      # Database pool (PostgreSQL 18 + resilient fallback)
│   ├── controllers/                 # Express route controllers (auth, academic, admin)
│   ├── data/                        # Resilient persistent storage layers (JSON)
│   ├── middleware/                  # Token verification & strict role-based access control
│   ├── routes/                      # Modular Express router files
│   │   ├── adminRoutes.js           # SuperAdmin REST endpoints
│   │   ├── authRoutes.js            # Authentication endpoints (login, register)
│   │   ├── studentRoutes.js         # Student endpoints (enroll, dashboard, certs)
│   │   ├── teacherRoutes.js         # Teacher endpoints (courses, assignments)
│   │   └── academicRoutes.js        # Common feedback, admissions & AI proctor logs
│   ├── scripts/                     # Migration scripts (migrate.js)
│   └── server.js                    # Unified Express application entry point
├── test/
│   └── api/
│       └── api.test.js              # Comprehensive 10-test automated regression suite
├── HOW_TO_RUN.md                    # Root-level setup, start, stop, and restart guide
└── README.md                        # Master production technical documentation
```
