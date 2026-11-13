# Student Module Status

The Student module is **partially implemented**. It has authenticated profile,
course-enrollment, feedback, and certificate APIs, plus browser-scored practice
tests. It is not a production-complete LMS: lesson progress, official exam
submissions, payments, and several activity workflows are not persisted end to
end.

The detailed audit is in
[STUDENT_MODULE_IMPLEMENTATION_REPORT.md](./STUDENT_MODULE_IMPLEMENTATION_REPORT.md).
The main limitations are listed in
[STUDENT_REMAINING_ISSUES.md](./STUDENT_REMAINING_ISSUES.md).

## Verified behavior

- Student API routes require a valid token and Student role.
- Profile reads and edits are validated and saved through the profile API.
- Course browsing/enrollment and certificate eligibility are enforced by the
  Student API; student-specific course and certificate data currently uses the
  local JSON store.
- Feedback is submitted through the authenticated API.
- Mock tests and the practice exam calculate local results; they are not official
  grades.
- `npm.cmd test` passes the isolated API integration/security suite.

## Important limits

- The live PostgreSQL connection was unavailable during verification. The Node
  service reported JSON fallback mode; the separate Flask MySQL connection was
  also unavailable.
- Profile photos are browser-local. The camera path has not been tested with
  camera permission granted.
- Do not describe the practice tests as AI-proctored, official exams, or
  server-recorded grades.
