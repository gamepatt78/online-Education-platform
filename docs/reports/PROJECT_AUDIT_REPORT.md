# Security and Quality Audit Report

## Scope and limitations

This review covers the application source, API authorization, authentication, user-controlled rendering, and the isolated API test suite. It did not assess a live deployment, production PostgreSQL instance, payment processor, or third-party hosting configuration. Do not interpret this report as a production certification.

## Confirmed findings and remediation

| Severity | Finding | Status |
|---|---|---|
| 🔴 CRITICAL | Student/Teacher API access previously relied on inadequate role and ownership enforcement, allowing requests to use client-supplied identity or access records outside the caller's scope. | Added JWT/account validation, role gates, token-derived identity, and per-user/course scoping. |
| 🔴 CRITICAL | Admin authentication previously included hardcoded/demo credential paths. | Removed bypasses; Admin login now requires an active Admin account and a valid password hash. |
| 🟠 HIGH | JWT configuration could fall back to an unsafe or missing secret. | Startup now fails unless `JWT_SECRET` is configured with at least 32 bytes. |
| 🟠 HIGH | Admin user responses could expose password hashes. | User responses now use an explicit public-field allowlist. |
| 🟠 HIGH | Monitoring event/log paths accepted insufficiently authenticated or client-attributed data, and monitoring media was publicly reachable. | Require role-appropriate authentication, derive identity from the token, validate image data, and protect media/log access. |
| 🟡 MEDIUM | User-controlled search, question-bank, and calendar values could be inserted as HTML. | Render these values through text nodes and safe DOM APIs. |
| 🟡 MEDIUM | Exam pages could access the camera without a clear user action, and client-supplied exam results were rendered unsafely. | Camera capture is opt-in; exam result rendering uses safe DOM construction. |
| ⚪ LOW | Several visible workflows implied functionality that was not implemented, including certificate issuance and some Teacher resources. | Certificate issuance returns an explicit `501`; missing resource downloads and fake success actions are disabled. |

Findings marked fixed were addressed in the current worktree. Regression coverage is in `test/api/api.test.js`; run `npm.cmd test` to execute it.

## Remaining limitations

- Password reset and certificate issuance are not implemented end-to-end.
- Teacher resource files that are not present in the repository remain unavailable.
- PostgreSQL behavior and production deployment settings were not exercised in this review.
- Payment screens are not a verified payment-gateway integration.

See [REMAINING_ISSUES.md](./REMAINING_ISSUES.md) for operational follow-up.
