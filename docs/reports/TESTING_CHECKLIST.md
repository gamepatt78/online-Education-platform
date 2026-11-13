# Testing Checklist

## Automated API suite

Run in PowerShell from the repository root:

```powershell
npm.cmd test
```

The suite creates synthetic users and records in a temporary directory, disables PostgreSQL for the test process, and removes its generated data when finished.

The current integration/security checks cover:

- Health endpoint behavior.
- Registration validation, password hashing/response privacy, normalized login, and rejection of legacy demo passwords.
- Authentication requirements and Student/Teacher/Admin role boundaries.
- Student enrollment identity and record scoping.
- Teacher course ownership, assignment ownership, and student/log scoping.
- Admin authentication, authorization, user response privacy, and deactivation of existing tokens.
- Exam event authentication and server-derived student attribution.
- Explicit rejection of unimplemented certificate issuance.

## JavaScript syntax

For focused syntax checks of updated server and test files:

```powershell
node --check server\middleware\authMiddleware.js
node --check server\services\storageService.js
node --check server\controllers\adminController.js
node --check server\controllers\academicController.js
node --check test\api\api.test.js
```

Frontend files can also be checked with `node --check` where they do not depend on browser-only syntax or globals.

## Manual checks still required before release

- Test the Student, Teacher, and Admin workflows in a browser using non-production test accounts.
- Verify PostgreSQL migrations, connection failures, and status updates against a disposable database.
- Test the deployed CORS allowlist, TLS termination, secrets management, and hosting permissions.
- Validate payment and other external integrations with their providers; the current UI alone does not establish a working integration.
- Confirm each currently available Teacher resource file and download before enabling additional resources.
