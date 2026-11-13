# Post-Cleanup Test Report

**Date:** 2026-11-13

## Executed checks

| Check | Result |
|---|---|
| `npm.cmd test` against a newly started Express server | **Passed: 8/8** |
| Node server startup on a temporary local port | **Passed** |
| `node --check server/server.js` and `node --check test/api/api.test.js` | **Passed** |
| `git diff --check HEAD` | **Passed** |
| Pylance syntax check for `design/app.py` | **Passed: no syntax errors** |
| Local HTML/CSS resource scan | **1,407 local references checked; 16 missing teacher downloads found** |
| Local JavaScript import scan | **0 imports found; 0 missing imports** |
| Test-generated changes to `server/data/` | **Restored; files match their pre-test bytes** |

The eight integration checks covered health, missing-body auth validation, demo login, registration, duplicate-registration rejection, exam logging, log retrieval, and the legacy image redirect including its query string.

## Route and UI smoke checks

All of these returned HTTP 200 from the new Express process:

```text
/
/student/html/home.html
/student/html/login.html
/teacher/htmlfiles/home.html
/teacher/htmlfiles/teacher-login.html
/js/roles/admin/admin.js
/student/css/layouts/style.css
/teacher/css/guidance-pages.css
/assets/images/pic-1.jpg
```

The `/images/pic-1.jpg` compatibility redirect was verified by the integration test. The browser accessibility snapshot loaded student home and login pages and the teacher login page. The teacher home page redirected to teacher login without an authenticated teacher session. No administrator HTML page exists, so only its script route was checked.

## Database and remaining issues

- `/api/health` reported `connected: false` and `Local Resilient Store`; PostgreSQL was not available. The database migration command was not run against a disconnected database. The migration runner was inspected and continues to execute `db/schema.sql`.
- The resource page has **16 broken PDF/DOCX targets** under `teacher/pdfs/` and `teacher/docs/`; these were not present in the repository before cleanup.
- The project has only `.gitkeep` files under the local fonts and icons directories. External icon-font loading was not independently verified.
- Browser tooling exposed page snapshots but no console/network log reader; browser console errors therefore could not be independently reported.
- API login and registration passed. Logout was not executed in the shared browser session; inspection of the existing student logout handler shows it redirects to login without clearing `localStorage`.
