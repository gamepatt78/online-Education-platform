# Duplicate File Audit

**Audit date:** 2026-11-13
**Project root:** `C:\Users\rainc\Downloads\Projects(intern)\Projects(intern)\Online Education`

## Scope and method

The initial recursive scan hashed **447 files**. It included project source, assets, configuration, local data, and monitoring snapshots; it excluded `.git/`, `node_modules/`, virtual environments, build output, and language/tool caches. The three reports created for this audit are included in the final repeat scan, bringing its total to **450 files**. The final extension counts are: CSS 89, DB 1, environment example 1, HTML 123, JPG 39, JS 112, JSON 14, JSONL 1, Markdown 22, PDF 2, PNG 33, Python 2, SQL 2, TXT 3, and 6 extensionless files.

Files were grouped by byte size and SHA-256, then byte-compared within each group. Removed legacy image copies were compared to their corresponding Git blob counterparts before deletion. No file was deleted based on its name alone. `.env` contents were not included in this report.

## Confirmed duplicate copies removed

### Legacy image directory

All **52** files below matched the same-relative-path file in `design/assets/images/` byte-for-byte in the pre-cleanup Git snapshot. The set contained 48 unique SHA-256 values, no mismatches, and **42,774,570 bytes**. The canonical copies in `design/assets/images/` were retained.

```text
design/images/78.jpg
design/images/79.jpg
design/images/80.jpg
design/images/81.jpg
design/images/about/interactive.jpg
design/images/gpay.png
design/images/ki.jpg
design/images/paytm.png
design/images/phonepe.png
design/images/pic-1.jpg
design/images/pic-2.jpg
design/images/pic-3.jpg
design/images/pic-4.jpg
design/images/pic-5.jpg
design/images/pic-6.jpg
design/images/pic-7.jpg
design/images/pic-8.jpg
design/images/pic-9.jpg
design/images/post-1-1.png
design/images/post-1-2.png
design/images/post-1-3.png
design/images/post-1-4.png
design/images/post-1-5.png
design/images/post-1-6.png
design/images/post-1-7.png
design/images/post-1-8.png
design/images/post-1-9.png
design/images/post-1-10.png
design/images/post-2-1.png
design/images/post-2-2.png
design/images/post-2-3.png
design/images/post-2-4.png
design/images/post-2-5.png
design/images/post-2-6.png
design/images/post-3-1.png
design/images/post-3-2.png
design/images/post-3-3.png
design/images/post-3-4.png
design/images/post-3-5.png
design/images/post-3-6.png
design/images/thumb-1.png
design/images/thumb-2.png
design/images/thumb-3.png
design/images/thumb-4.png
design/images/thumb-5.png
design/images/thumb-6.png
design/images/thumb-7.png
design/images/thumb-8.png
design/images/thumb-9.png
design/images/thumb-10.png
design/images/thumb-11.png
design/images/thumb-12.png
```

### Repeated thumbnails

These four files were each **58,142 bytes** and had SHA-256 `4731b0e31e462d4de10d09fabbbb3bf3d6a683a03762e19ffcc355f57cf9f545`, identical to the retained `design/assets/images/post-1-6.png`. A source-reference scan found no use of these four names.

```text
design/assets/images/post-1-7.png
design/assets/images/post-1-8.png
design/assets/images/post-1-9.png
design/assets/images/post-1-10.png
```

### Teacher and student copies

- The seven identical guidance stylesheets were replaced by one canonical `design/teacher/css/guidance-pages.css`; all seven teacher pages now reference it. Their old root CSS URLs remain as import shims.
- `design/student/html/update profile.html` was identical to `design/student/html/update-profile.html` (5,388 bytes; SHA-256 `e9fb79957edf9f60b105b101ec9890b3c3d1e1e3b028cea420e43b25b3892329`). The duplicate page was removed; profile links and the old root URL now lead to the hyphenated canonical page.
- `design/css/dashbord.css` previously duplicated the full dashboard stylesheet. Its URL remains available as a 49-byte import shim to `design/student/css/pages/dashbord.css`.

## Exact-hash groups retained

The final scan found **17 exact-byte groups (60 file paths)**. They are retained because their paths or data serve distinct roles; there are no unresolved candidates that were deleted speculatively.

| SHA-256 | Bytes | Paths | Why retained |
|---|---:|---|---|
| `dfcaf13a5909eb24b6288a450f3e562b04abe6e2ad272c3303cdf46fd4c6879f` | 712 | `.env`; `.env.example` | Local runtime configuration and distributable template have different roles. Values are intentionally omitted. |
| `d7c4c5969a13be89c26b96373e811c72455b9bcc938c3e2ee1de236c55773289` | 42 | `.vscode/settings.json`; `design/.vscode/settings.json` | Workspace-root and design-folder editor scopes. |
| `a84513f33ac86f348e29d95e27adea2905888a9e04e144502205a78e076c52d7` | 8,842 | `db/schema.sql`; `db/migrations/001_initial_schema.sql` | Runtime schema source and required versioned migration artifact. Both are preserved. |
| `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | 0 | `design/assets/fonts/.gitkeep`; `design/assets/icons/.gitkeep`; `design/assets/images/about/interactive.jpg`; `design/js/roles/teacher/.gitkeep` | Empty placeholders maintain distinct asset/module directories. |
| `eb06d118d0bd310ff757b0557369c4d8c4e699ca48f8d3d50bd4859cff62f283` | 49 | `design/css/attendance-management.css`; `design/css/creating-assignment.css`; `design/css/first-class.css`; `design/css/grading-guide.css`; `design/css/navigation-guide.css`; `design/css/providing-feedback.css`; `design/css/setting-deadlines.css` | Separate legacy stylesheet URLs that import the shared teacher guidance stylesheet. |
| `8d4ab75bdfefb13ddde174e6a75f8f3ad62aa7d13a666cc66f17e2931f57f721` | 50 | `design/css/auth.css`; `design/css/components/auth.css` | Separate legacy URLs importing the canonical student auth stylesheet. |
| `772960c91f41adf3895c6b991bf0d32c720ac33fdd98abdea3e4bb00eb43c324` | 49 | `design/css/dashbord.css`; `design/css/pages/dashbord.css` | Separate legacy URLs importing the canonical dashboard stylesheet. |
| `9071e86054bd44f5b8c07d2db92bccbc69b9a50ab6e458bc9c4a05cd37de4cef` | 46 | `design/css/login.css`; `design/css/pages/login.css` | Separate legacy URLs importing the canonical login stylesheet. |
| `ae0fc225d955b030c9486cc3f39f42f4725b1ee6feac1e64d6b74655f881a30d` | 48 | `design/css/layouts/style.css`; `design/css/style.css` | Separate legacy URLs importing the canonical student layout stylesheet. |
| `c9737cb0a29b998145409b9f24fc8bb4382c1bd31d57702876a62785678252d4` | 45 | `design/css/base/theme.css`; `design/css/theme.css` | Separate legacy URLs importing the canonical student theme. |
| `b39dc75a94e43987e01ee1d12b92aa5ecd17b6e1532bd5b8f84172dfa8fcd3d7` | 118 | `design/js/dashbord.js`; `design/js/roles/student/dashbord.js` | Legacy script-loader URLs. |
| `5729249044e31d8cc5eceb6f711f68978f8c85945bd8c45dbbb63ab2fe09600c` | 121 | `design/js/login.js`; `design/js/roles/student/login.js` | Legacy script-loader URLs. |
| `588dca71cb71a3f6cfb53b15e683e95c7fbc7c2edbdcaef53c6b2396ab18944c` | 133 | `design/js/mocktest1-submit.js`; `design/js/roles/student/mocktest1-submit.js` | Legacy script-loader URLs. |
| `97107cfe44c536dcd6c463d8abd991117aaeafa3b22202988b888556f4e8aecb` | 124 | `design/js/script.js`; `design/js/shared/script.js` | Legacy script-loader URLs. |
| `1b44bddc43fc860f81ae09342dd341eb99641e6ee034a28d814dacf7d8354372` | 4,965 | `design/monitor_events/images/Webcam_Snapshot_1794505716733.jpg`; `...5733770.jpg`; `...5747084.jpg`; `...6941863.jpg` | Timestamped proctor-monitor runtime evidence; retained, not treated as disposable cache. |
| `6fdff878afe4299a0e4d674098beaebcb01f5daec0d5878bf42ca3ed4775e738` | 2,557 | `design/monitor_events/images/Webcam_Snapshot_1794505810608.jpg`; `...5870294.jpg`; `...5930623.jpg`; `...5990305.jpg`; `...6050623.jpg`; `...6110316.jpg`; `...6170614.jpg`; `...6230316.jpg`; `...6290627.jpg`; `...6350316.jpg`; `...6410618.jpg`; `...6470308.jpg`; `...6530612.jpg`; `...6650645.jpg`; `...6710322.jpg`; `...6770612.jpg`; `...6830310.jpg`; `...6890627.jpg`; `...6939443.jpg` | Timestamped proctor-monitor runtime evidence; retained. |
| `5e4b72dbb1e170806ff7c961056db740f29976d74eb44c6f38bd9f2f80f8b938` | 344 | `design/update profile.html`; `design/update-profile.html` | Distinct legacy URL aliases redirecting to the canonical student page. |

The three marker-only directory trees (`design/assets/fonts/`, `design/assets/icons/`, and `design/js/roles/teacher/`) also have identical one-file fingerprints. They are separate module locations, not duplicate folders.

## Unused, obsolete, and temporary candidates

No backup/temp filename patterns (`.bak`, `.old`, `.tmp`, `.orig`, swap files, or named copies) were found. Monitoring snapshots are generated runtime data and were retained. No duplicate HTML, documentation, JSON data, font, or icon files were deleted based only on apparent non-use.
