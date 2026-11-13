# Project Structure & Final Architecture Specification

**Project Name:** Online Education Platform (LMS)
**Workspace Root:** `C:\Users\rainc\Downloads\Projects(intern)\Projects(intern)\Online Education`
**Current Date:** November 13, 2026

---

## 1. Actual Final Directory Tree

The project follows the requested target architecture while preserving all unique pages, routes, playlists, mock tests, and teacher subsystem files:

```text
Online Education/
│
├── .env.example                          # Environment configuration template (PostgreSQL 18, JWT, Port)
├── .gitignore                            # Standard exclusions (node_modules, secrets, caches)
├── package.json                          # Unified npm scripts (start, dev, db:migrate, test)
├── README.md                             # Production architectural documentation
│
├── db/                                   # Database Tier
│   ├── schema.sql                        # PostgreSQL 18 production schema & seeds
│   ├── migrations/                       # Versioned database migration artifacts
│   │   └── 001_initial_schema.sql
│   └── seeds/                            # Database seed scripts
│
├── docs/                                 # Complete Technical Documentation (11 Reports)
│   ├── PROJECT_OVERVIEW.md               # Scope, stack, features, and system purpose
│   ├── PROJECT_STRUCTURE.md              # Folder layouts and component roles
│   ├── ARCHITECTURE_DOCUMENTATION.md     # Component interactions, data flows, and security
│   ├── DATABASE_DOCUMENTATION.md         # Schema design, entity relationships, and migrations
│   ├── API_DOCUMENTATION.md              # REST API contract and endpoint specifications
│   ├── SETUP_AND_INSTALLATION.md         # Environment setup and execution guidelines
│   ├── TESTING_REPORT.md                 # Test suite results and verification evidence
│   ├── SECURITY_AUDIT.md                 # Cybersecurity review and vulnerability mitigations
│   ├── CODE_QUALITY_REPORT.md            # Code metrics, maintainability, and clean architecture
│   ├── PRODUCTION_READINESS_REPORT.md    # Deployment audit and verification checklist
│   └── CHANGELOG.md                      # Chronological modification log
│
├── server/                               # Unified Backend Application (Express.js / Node.js)
│   ├── config/                           # Database client initialization & connection pooling
│   │   └── db.js
│   ├── routes/                           # Modular Express REST API routers
│   │   ├── authRoutes.js                 # Authentication & password recovery routes
│   │   └── academicRoutes.js             # Admissions, feedback & proctoring routes
│   ├── controllers/                      # Request validation & response handling
│   │   ├── authController.js             # Bcrypt hashing & JWT issuance
│   │   └── academicController.js         # Admissions, feedback, proctoring
│   ├── services/                         # Business logic & dual-tier storage engine
│   │   └── storageService.js             # PostgreSQL 18 + local resilient failover
│   ├── middleware/                       # Request interceptors & security
│   │   └── authMiddleware.js             # JWT verification middleware
│   ├── validators/                       # Input validation handlers
│   │   └── authValidator.js
│   ├── utils/                            # Shared response and formatting helpers
│   │   └── responseHelper.js
│   ├── scripts/                          # Operational & database utilities
│   │   ├── migrate.js                    # Automated migration CLI runner
│   │   └── count_elements.js             # Workspace AST element scanner
│   ├── data/                             # Synchronized resilient store
│   └── server.js                         # Unified Express production server (Port 5000)
│
├── test/                                 # Modular Test Directory
│   ├── api/                              # REST API integration tests
│   │   └── api.test.js
│   ├── unit/                             # Unit tests
│   │   └── sample.test.js
│   ├── integration/                      # Service integration tests
│   │   └── sample.test.js
│   └── e2e/                              # End-to-end browser workflows
│       └── sample.test.js
│
└── design/                               # Frontend Application (Client Tier)
    ├── assets/
    │   ├── images/                       # Canonical image assets
    │   ├── icons/
    │   └── fonts/
    ├── student/
    │   ├── html/                         # 44 student-facing pages
    │   ├── css/
    │   │   ├── base/
    │   │   ├── components/
    │   │   ├── layouts/
    │   │   └── pages/
    │   └── js/
    │       ├── shared/
    │       ├── services/
    │       ├── auth/
    │       └── pages/
    ├── teacher/
    │   ├── htmlfiles/                    # Existing teacher pages and preserved resource page
    │   ├── css/                          # Teacher-specific stylesheets
    │   └── js/                           # Teacher-specific scripts
    ├── css/                              # Legacy stylesheet imports; dashboard CSS remains here
    ├── js/
    │   ├── shared/                       # Shared entry script and compatibility loader
    │   └── roles/
    │       └── admin/                    # Existing administrator script preserved
    ├── dashbord.html                     # Existing application entry page
    └── index.html                        # Existing entry redirect
```

---

## 2. Verification of Preserved Application Features

- **Student HTML**: 44 canonical pages live in `design/student/html/`; old root-level URLs redirect to their new locations.
- **Teacher HTML**: Existing teacher pages remain in `design/teacher/htmlfiles/`. The previously misplaced `Teacher/js/resources.html` page is preserved at `teacher/htmlfiles/resources-legacy.html`; its former path redirects there.
- **Static compatibility**: Legacy CSS and JavaScript paths remain as import/loader shims. The backend redirects legacy `/images/...` URLs to canonical `/assets/images/...` assets.
- **Administrator scripts**: `design/js/roles/admin/` remains separate from student and teacher code.
- **Backend static serving**: Express already serves the full `design/` tree. Express and Flask redirect legacy `/Teacher/...` URLs to `/teacher/...` and legacy `/images/...` URLs to `/assets/images/...`.
- **Automated tests**: `npm.cmd test` passed all 7 integration tests after the move.
- **Known repository gap**: `teacher/htmlfiles/resources.html` links to 16 PDF/DOCX downloads under `teacher/pdfs/` and `teacher/docs/`; those files were not present in the pre-migration checkpoint.
