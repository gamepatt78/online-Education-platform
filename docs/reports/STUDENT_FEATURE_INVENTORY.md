# Student Feature Inventory

Status meanings: **PASS** = verified implemented path; **PARTIAL** = useful
behavior exists but an end-to-end or production requirement is missing;
**NOT IMPLEMENTED** = no complete workflow verified; **NOT TESTED** = no direct
verification.

| Feature | Status | Notes |
|---|---|---|
| Student authentication and role checks | PASS | JWT-protected Student routes; API tests cover role and ownership boundaries. |
| Student profile fields | PASS | Authenticated read/update, input validation, and persistence through profile storage. |
| Profile picture upload/live capture | PARTIAL | Browser-local data only; camera permission path not tested. |
| Dashboard summary | PARTIAL | Counts are computed from local JSON collections; underlying assignments, quizzes, and notifications are incomplete. |
| Course catalog and enrollment | PARTIAL | Authenticated browse/enroll APIs; data is JSON-backed and course content is not tied to durable lesson progress. |
| Lesson playback | PARTIAL | Static lesson pages/media references exist; server-side lesson resume and completion tracking are absent. |
| Progress tracking | PARTIAL | Read endpoint exists; no complete lesson progress update path was verified. |
| Feedback | PASS | Authenticated POST, validated subject/message/rating, and storage integration. |
| Mock tests | PARTIAL | Static questions and browser scoring; results stay in localStorage. |
| Final practice exam | PARTIAL | Static 50-question practice exam, browser-scored; not an official exam attempt or stored grade. |
| Webcam monitoring | PARTIAL / NOT TESTED | Authenticated Node event route and Flask proxy exist; camera permission/capture was not tested. Legacy `monitor_server.py` is a separate development-only logger. |
| Certificates | PARTIAL | Eligibility-checked API issuance and retrieval; JSON-backed in this implementation, with SVG/print browser output rather than verified PDF delivery. |
| Assignments | NOT IMPLEMENTED | No complete Student assignment/submission workflow verified. |
| Notifications | NOT IMPLEMENTED | Dashboard can list JSON notifications; no durable read-state workflow verified. |
| Billing/payment | NOT IMPLEMENTED | UI does not establish a real payment gateway or transaction flow. |
| Guardian/parent portal | NOT IMPLEMENTED | No complete authenticated guardian workflow verified. |
| Password reset | PARTIAL | Endpoint/UI path exists, but secure token delivery and verification flow is incomplete. |

For endpoint details, see [STUDENT_API_DOCUMENTATION.md](./STUDENT_API_DOCUMENTATION.md).
