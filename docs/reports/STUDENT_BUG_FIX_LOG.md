# Student Bug Fix Log

This log records Student-module fixes in the current work history. Browser-local
practice results and the disconnected database remain explicit limitations.

| Area | Change |
|---|---|
| Profile/API errors | Routed profile and dashboard requests through JSON APIs and made response/error handling avoid parsing HTML error pages as JSON. |
| Profile editing/photo | Added validated profile editing and local upload/live-capture UI; photo data is not server-persisted. |
| Student home | Made About Us feature cards navigable and added clearer, visible icons/links. |
| Courses/certificates | Added authenticated course enrollment and eligibility-checked certificate issue/read behavior. |
| Feedback | Added authenticated, validated feedback submission. |
| Mock tests | Corrected answer keys/questions/navigation, enabled the Start Test control, added local scoring/counts, and restore-on-refresh with a wall-clock timer. |
| Mock test labels | Corrected Test 2 and Test 3 headings that incorrectly displayed “Mock Test 1”; updated refresh instructions to match the browser-local restore behavior. |
| Practice exam | Corrected answer indexes and result-state handling; results are explicitly local practice, not official grades. |
| Monitoring proxy | Changed Flask `/monitor-event` to forward to the authenticated Node route instead of accepting arbitrary identity/image uploads locally. |
| Legacy monitor security | Added constant-time bearer-token validation for both legacy log routes; unset or short secrets disable the API. SQLite connections now close after each operation. |
| Logout | Clears Student authentication and browser-local profile photo/practice results. |

## Verification

`npm.cmd test`, `py -m unittest discover -s test\python`, targeted JavaScript
syntax checks, Python syntax checks for the Flask app and legacy monitor, and
`git diff --check` passed. See
[STUDENT_TESTING_CHECKLIST.md](./STUDENT_TESTING_CHECKLIST.md).
