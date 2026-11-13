# Student Remaining Issues

## Incomplete end-to-end features

- Lesson completion, resume position, and learning-hours tracking are not
  persisted through a Student API.
- Mock-test/final-exam grades are browser-local and do not represent official
  authenticated exam submissions.
- Profile photos are stored in browser localStorage rather than the server.
- Assignments/submissions, notification read state, and recent activity do not
  have complete Student workflows.
- Billing screens do not establish a real payment gateway or verified
  transaction history.
- Guardian/parent workflows are not implemented.
- Password reset has no complete secure token delivery and verification flow.

## Persistence and operations

- Current Student course, enrollment, progress, and certificate routes use local
  JSON files; JSON fallback has not been validated for production concurrency or
  recovery.
- The live PostgreSQL connection was unavailable during verification; no
  migration was exercised. Flask's separate MySQL connection also failed.
- Certificate issuance is implemented for completed enrollments, but the
  Student route stores certificates in JSON. Browser UI output is SVG/print;
  direct PDF delivery and production verification have not been established.
- `design/monitor_server.py` is a separate loopback development logger and now
  requires `MONITOR_SERVER_TOKEN`; do not expose it or treat it as the main
  authenticated service.

## Release checks

- Verify database migrations and persistence against a disposable PostgreSQL
  database.
- Verify webcam consent/capture, accessibility, and cross-browser behavior.
- Configure production TLS, secrets, CORS, filesystem permissions, logging,
  backups, and monitoring.
- Validate all integrations using test accounts and provider sandboxes.
