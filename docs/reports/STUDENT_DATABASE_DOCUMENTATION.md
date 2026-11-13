# Student Database Documentation

## Configured stores

The relational schema is defined in `db/schema.sql` and the migration script is
`server/scripts/migrate.js`. PostgreSQL connection configuration is in
`server/config/db.js`; local JSON storage defaults to `server/data` and can be
overridden with `DATA_DIR`.

The schema includes users, password-reset tokens, admissions, categories,
courses, lessons, enrollments, exams, exam submissions/logs, feedback, payments,
assignments, and related LMS records. This schema is not proof that each Student
workflow uses those tables.

## Actual Student persistence

| Data | Current implementation |
|---|---|
| Profile | PostgreSQL when connection is active, with local JSON store also used/fallback. |
| Course list, enrollments, progress, certificates | Direct JSON read/write in `server/routes/studentRoutes.js`. No relational persistence is implemented by those routes. |
| Feedback | Storage service attempts PostgreSQL and writes a local JSON copy/fallback. |
| Practice-test results | Browser localStorage only; not stored in PostgreSQL or JSON API collections. |
| Profile photo | Browser localStorage only. |
| Webcam event data | Authenticated Node route stores log metadata through the storage service; optional image bytes are saved under `design/monitor_events/images`. The legacy logger uses a separate SQLite file. |

## Verified environment

The live Node health response reported PostgreSQL `connected=false` and fallback
mode `Local Resilient Store`. Flask startup logged that MySQL at
`localhost:3306` could not be reached. No PostgreSQL migration or MySQL-backed
workflow was exercised. The passing automated suite uses isolated temporary
storage and is not evidence of live database connectivity.

## Operational cautions

- Configure the PostgreSQL URL/credentials and run migrations against a
  disposable database before deployment.
- Back up and restrict access to JSON data files; JSON fallback is not a
  substitute for tested concurrent production persistence.
- Avoid claiming data is database-backed unless the relevant API path is moved
  to and verified against the relational tables.
