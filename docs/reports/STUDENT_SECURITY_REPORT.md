# Student Security Report

## Scope and conclusion

This review covers the Student-facing Node routes, Flask proxy, and the legacy
monitor server. The isolated API suite passed its authentication, role,
ownership, and input-validation checks. Live unauthenticated requests to the
Student dashboard and certificate endpoints returned HTTP 401.

The review found one low-severity issue in the separate legacy monitoring
server. It binds to loopback, which limits network exposure, but previously its
read/write routes did not authenticate callers. The endpoints now require a
configured bearer token of at least 32 characters and compare it in constant
time. This server remains separate from the current Node monitoring path.

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | ⚪ LOW | design/monitor_server.py | 56,76 | Legacy `/api/log` and `/api/logs` routes previously allowed unauthenticated reads and writes; fixed by requiring `MONITOR_SERVER_TOKEN` (minimum 32 characters). | 9/10 |

## Verified controls

- Student routes use JWT verification and Student-role authorization.
- Data lookups for enrollments and certificates scope records to the current
  Student.
- Monitoring events on the current Node route derive Student identity from the
  verified token; Flask `/monitor-event` forwards the Authorization header.
- API tests cover role restrictions, ownership boundaries, admin log access,
  profile validation, and event attribution.
- `JWT_SECRET` is required to be at least 32 bytes by
  `server/config/jwtSecret.js`; do not commit it.

## Recommendation

Keep `design/monitor_server.py` local-only and development-only. Configure
`MONITOR_SERVER_TOKEN` before use; unset or too-short tokens disable its log
routes with HTTP 503. The main Student monitoring route is `POST /api/log`
through the authenticated Node service.

This review does not certify deployment security, TLS, infrastructure,
credentials, camera privacy, or third-party payment integrations.
