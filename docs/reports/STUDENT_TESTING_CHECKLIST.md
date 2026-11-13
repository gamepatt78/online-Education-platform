# Student Testing Checklist

## Automated checks completed

- [x] `npm.cmd test` — isolated LMS API integration/security tests passed.
- [x] `py -m unittest discover -s test\python` — all legacy monitor
  authentication and storage tests passed.
- [x] `node --check` — updated Student test, question, exam-results, and shared
  script files.
- [x] `git diff --check` — no whitespace errors.
- [x] Pylance syntax check — `design/app.py` and `design/monitor_server.py`.
- [x] Live API check — Node health HTTP 200; reports PostgreSQL disconnected and
  local JSON fallback.
- [x] Live API access check — Flask Student dashboard/certificate without token
  return HTTP 401.

## Browser checks completed

- [x] Mock Test 2 page title matches the page; partial submission displayed
  1 correct, 0 wrong, and 19 skipped.
- [x] Refresh restoration resumed the selected answer and remaining timer.
- [x] Prior verification covered all three mock tests at 20/20 and the 50-item
  practice exam at 250/250.
- [x] A prior 390px viewport check found no horizontal overflow on the checked
  Student pages.

## Still required before release

- [ ] Test live PostgreSQL migration and Student data workflows using a
  disposable database.
- [ ] Test webcam capture only with explicit permission in a supported browser;
  validate user-visible consent and failure states.
- [ ] Verify keyboard, screen-reader, contrast, and cross-browser behavior.
- [ ] Exercise authenticated flows with non-production test accounts.
- [ ] Validate payments, password-reset delivery, HTTPS, CORS allowlist,
  production secrets, backups, and monitoring.
- [ ] Test assignment, notifications, and lesson progress after those workflows
  are implemented.
