# Remaining Issues and Release Considerations

These are known product or verification limitations, not claims that the current code has been tested in production.

## Unimplemented or unavailable features

- Password reset has no complete secure delivery and verification flow.
- Certificate issuance is available for authenticated students with a completed
  enrollment. Certificates are currently persisted in the local JSON store when
  using the Student API; verify relational persistence and production
  verification before deployment.
- Teacher resource downloads are disabled when the corresponding resource files are absent.
- Payment screens have not been verified as a real gateway integration.

## Environment and deployment verification

- No live PostgreSQL server or migration was exercised during the API tests. Validate schema migration, user-status updates, backups, and recovery against a disposable database before deployment.
- Configure a private `JWT_SECRET` of at least 32 bytes and exact allowed origins in `CORS_ORIGIN`; do not use wildcard origins or commit `.env`.
- Configure HTTPS, production logging, filesystem permissions, database credentials, backups, and monitoring in the deployment environment.
- The test suite uses isolated temporary data and does not establish that local JSON fallback is suitable for production or concurrent workloads.

## Local development

- In PowerShell, use `npm.cmd` if the `npm` script is blocked by the local execution policy. There is no need to change the system policy to run the project.
- `py -m http.server` serves only static files; use `npm.cmd start` to run the API and frontend together.
- Run `npm.cmd test` after code changes. See [HOW_TO_RUN.md](./HOW_TO_RUN.md) for setup and commands.
