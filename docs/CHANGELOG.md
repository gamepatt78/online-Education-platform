# Changelog & Historical Modifications

All notable changes to the **Online Education** platform are documented in this file.

---

## [Unreleased] - 2026-11-13 (Student Module Reorganization)

### Changed
- Moved the student-facing HTML pages into `design/student/html/` (44 unique pages remain after duplicate cleanup).
- Organized student stylesheets into `design/student/css/{base,components,layouts,pages}/` and scripts into `design/student/js/{shared,services,auth,pages}/`.
- Normalized the teacher subsystem path to `design/teacher/` and kept administrator scripts under `design/js/roles/admin/`.
- Updated page, stylesheet, script, and image references to the new canonical paths. Existing root student URLs, legacy CSS/JS paths, `/images/`, and uppercase `/Teacher/...` URLs remain compatible.
- Preserved the misplaced teacher resources page as `design/teacher/htmlfiles/resources-legacy.html`.
- Updated the project structure and run documentation for the new layout.

### Duplicate cleanup
- Kept `db/migrations/001_initial_schema.sql` as a protected versioned artifact and aligned its avatar default with `db/schema.sql`; the migration runner continues to execute `db/schema.sql`.
- Removed duplicate `design/images/` copies and repeated post thumbnails; `/images/...` backend requests redirect to `/assets/images/...`.
- Consolidated seven identical teacher guidance stylesheets into `design/teacher/css/guidance-pages.css`, retaining legacy CSS import paths.
- Removed the duplicate spaced student update-profile page and pointed the old root URL to `update-profile.html`.
- Updated the schema avatar default and documentation to use the canonical asset path.

### Verification
- `npm.cmd test`: all 8 integration tests passed.
- Verified the student and teacher static routes, the Express `/Teacher/...` compatibility redirect, and legacy `/images/...` redirects.
- A local-reference scan found 16 teacher download links whose PDF/DOCX targets were absent from the pre-migration repository; no fabricated placeholder files were added.

---

## [2.1.0] - 2026-11-12 (Comprehensive Audit, Quality Improvements & Documentation)

### Added
- **`docs/` Repository**: Created complete documentation suite:
  - `docs/PROJECT_OVERVIEW.md`
  - `docs/PROJECT_STRUCTURE.md`
  - `docs/ARCHITECTURE_DOCUMENTATION.md`
  - `docs/DATABASE_DOCUMENTATION.md`
  - `docs/API_DOCUMENTATION.md`
  - `docs/SETUP_AND_INSTALLATION.md`
  - `docs/TESTING_REPORT.md`
  - `docs/SECURITY_AUDIT.md`
  - `docs/CODE_QUALITY_REPORT.md`
  - `docs/PRODUCTION_READINESS_REPORT.md`
  - `docs/CHANGELOG.md`
- **`.gitignore`**: Added standard exclusions for `node_modules/`, `.env`, temporary camera snapshots, and IDE artifacts.
- **`server/scripts/count_elements.js`**: Workspace AST script to inventory UI components across all 77 pages.

### Changed
- Standardized all documentation and verification metrics across student and teacher portals.
- Verified and stabilized the unified Express server process and automated integration test runner.

---

## [2.0.0] - 2026-11-12 (Architecture Redesign & PostgreSQL 18 Integration)

### Added
- **PostgreSQL 18 Integration**:
  - `db/schema.sql`: Full DDL/DML relational schema with 10 tables, indexes, constraints, and demo seeds.
  - `server/config/db.js`: High-performance PostgreSQL connection pool with resilience failover.
  - `server/scripts/migrate.js`: One-command migration tool (`npm run db:migrate`).
- **Unified Express Backend**:
  - `server/server.js`: Replaced conflicting Flask scripts with a unified service on port 5000.
  - `server/controllers/authController.js`: Bcrypt encryption, JWT session management.
  - `server/controllers/academicController.js`: Admissions, feedback, and proctoring activity logs.
  - `server/services/storageService.js`: Dual-tier storage engine (PostgreSQL 18 + local failover store).
  - `server/test/api.test.js`: Native assertion integration test runner (`npm test`).
- **Modern Design System**:
  - `design/css/theme.css`: Linear/Stripe-inspired tokens (colors, elevation shadows, fluid radii, typography).
  - Redesigned `login.html`, `register.html`, and `forgot-password.html` with modern card elevation and auto-fill credentials.

### Fixed
- Parameterized database credentials in `design/app.py` via `os.getenv` to eliminate plaintext password exposure.
- Standardized hardcoded `http://localhost:5000/...` endpoints to clean relative URLs across forms and scripts.
- Removed corrupted shell-redirection file `localStorage.setItem...`.
- Replaced space-containing `design/update profile.html` with clean `design/update-profile.html` alias.
