# Duplicate Cleanup Report

**Date:** 2026-11-13

## Summary

- **64 confirmed duplicate files removed:** 52 legacy image copies, 4 repeated thumbnails, 7 duplicate teacher guidance stylesheets, and 1 duplicate student update-profile page.
- Replaced the full duplicate dashboard stylesheet with a small compatibility import; the URL remains available.
- Consolidated the teacher guidance styles into `design/teacher/css/guidance-pages.css`.
- Preserved `db/migrations/001_initial_schema.sql` as required. Its schema default is aligned with `db/schema.sql`; the migration runner still reads `db/schema.sql`.
- Added Express and Flask redirects from `/images/...` to `/assets/images/...`. Student profile links and the legacy spaced root URL lead to `update-profile.html`.
- No files outside the project were removed.

## Measured storage

Measured logical file-size reduction is **43,034,721 bytes (about 41.04 MiB)**:

- 52 mirrored images plus 4 repeated thumbnails: 43,007,138 bytes.
- Net reduction from retaining one shared teacher stylesheet instead of seven copies: 5,868 bytes.
- Duplicate student page: 5,388 bytes.
- Dashboard stylesheet reduced from 16,376 bytes to a 49-byte import: 16,327 bytes.

This is based on raw file sizes, not filesystem block allocation or compression. The migration and all retained compatibility aliases are excluded from savings.

## Intentionally preserved

- Database schema and versioned migration, even though their current SQL bytes match.
- `.env` and `.env.example`; their byte equality does not make their local-runtime and template roles interchangeable. Secret/config values are not reproduced here.
- Both scoped VS Code settings files, all legacy CSS/JS shims and update-profile URL aliases.
- Empty module/asset placeholders and timestamped proctor snapshots.
- All canonical assets under `design/assets/`.

The complete hash inventory and exact remaining duplicate groups are in [DUPLICATE_FILE_AUDIT.md](./DUPLICATE_FILE_AUDIT.md).

## Remaining candidates and issues

- The final scan still contains exact-hash groups for compatibility aliases, environment/config files, placeholders, the schema/migration pair, and monitoring evidence. They were retained because each has a separate path or operational role.
- Sixteen teacher resource links still target absent PDF/DOCX files. They predate this cleanup and were not replaced with fabricated files.
- The repository has no admin HTML page; only `design/js/roles/admin/admin.js` is present.
- No local font or icon files are present beyond `.gitkeep` placeholders; the UI references an external icon font.
- PostgreSQL was unavailable during verification; the server ran in Local Resilient Store fallback mode.
- The student logout handler redirects to the login page but does not clear `localStorage`; no unrelated behavior change was made during this file cleanup.

## Git checkpoint and commit status

A reversible checkpoint was saved as `stash@{0}` (`27cf6a29c33c4914b79c01682094b1f5c7edb0e7`) before this audit. **No commit was created.** The branch is eight commits ahead of `origin/main`. The checkpoint was taken with 376 staged/unstaged/untracked entries; the final `git status --porcelain` count is 280, including the audit reports and changes from earlier project tasks. Committing the broad worktree as a cleanup-only commit would mix unrelated work; the checkpoint remains available.
