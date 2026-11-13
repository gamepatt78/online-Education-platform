# Teacher / Faculty Module Technical Report

## 1. Overview
The Teacher Portal enables educators and faculty members to create, structure, and submit academic courses, schedule assignments with deadlines, evaluate student submissions, and monitor student conduct during examinations via the proctoring log monitor.

## 2. Key Features Verified
- **Faculty Dashboard:** Live dashboard providing real-time stats on active courses, pending review status, enrolled students, and proctor events (`/api/teachers/dashboard`).
- **Curriculum Authoring:** Tools for creating courses, editing lesson content, uploading resources, and submitting new curricula for Admin approval (`/api/teachers/courses`).
- **Assignment System:** Assignment creation with deadline configuration and submission monitoring (`/api/teachers/assignments`).
- **Proctoring Telemetry Review:** Interface to inspect candidate exam events and flagged infractions (`/api/teachers/proctor-logs`).

## 3. Directory Layout
- `design/teacher/htmlfiles/`: 31 dedicated faculty views including `home.html`, `resources.html`, `creating-assignment.html`, `attendance-management.html`, and `proctor.html`.
- `design/teacher/css/`: Tailored faculty styles.
- `design/teacher/js/`: Faculty client logic.
