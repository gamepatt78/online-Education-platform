# UI COMPONENT INVENTORY & REUSABLE ASSET SPECIFICATION

**Project Name:** Online Education Platform (LMS)
**Location:** `C:\Users\rainc\Downloads\Projects(intern)\Projects(intern)\Online Education`
**Inspected Scope:** 77 Total HTML Pages (47 Student Portal + 30 Teacher/Admin Subsystem)

---

## 1. Summary of Identified UI Elements

| Element Classification | Exact Inspected Count | Primary Locations / Implementation |
| :--- | :---: | :--- |
| **Icons (`<i>`)** | **1,114** | Font Awesome 6.4.0 (`header`, `side-bar`, `card`, `mocktest`) |
| **Buttons (`<button>`)** | **158** | Header toggles, modal triggers, test navigation, forms |
| **Links (`<a href>`)** | **900** | Navigation menus, playlists, footer links, external references |
| **Dropdown Menus** | **222** | Sidebar "Mock Tests", course filters, header notifications |
| **Forms (`<form>`)** | **56** | Search, login, registration, admissions, feedback, assessments |
| **Form Controls** | **459** | 329 text/email/password inputs, 3 selects, textareas, checkboxes |
| **Navigation Drawers** | **40** | Off-canvas sliding sidebars (`side-bar`) across student portal |
| **Modals & Dialogs** | **8** | "Ready to Begin" mock test modals, feedback popups |

---

## 2. Reusable Header & Navigation Components

### Header Component (`.header`)
- **Branding Link**: `<a href="home.html" class="logo">Online Education Portal</a>`
- **Global Search Form**: `<form action="search.html" method="get" class="search-form">` with search input and submit button (`fa-search`).
- **Interactive Action Icons**:
  - Menu Drawer Toggle: `<div id="menu-btn" class="fas fa-bars" role="button" aria-expanded="false"></div>`
  - User Profile Toggle: `<div id="user-btn" class="fas fa-user" role="button" aria-expanded="false"></div>`
  - Session Logout Button: `<div id="logout-btn" class="fas fa-sign-out-alt" role="button" title="Logout"></div>`
- **User Profile Flyout Card**: `.header .profile` with student avatar, username, role badge, and link to `profile.html`.

### Sidebar Navigation Drawer (`.side-bar`)
- **Close Button**: `<div id="close-btn"><i class="fas fa-times"></i></div>`
- **Persistent User Profile Summary**: User avatar (`images/pic-1.jpg`), student title, role label.
- **Main Navigation Menu (`.navbar`)**:
  - `Home`: `home.html` (`fa-home`)
  - `Courses`: `courses.html` (`fa-graduation-cap`)
  - `Mock Tests Dropdown`: `.nav-item.dropdown` containing:
    - `Mock Test 1`: `mocktest1.html` (`fa-file-alt`)
    - `Mock Test 2`: `mocktest2.html` (`fa-file-alt`)
    - `Mock Test 3`: `mocktest3.html` (`fa-file-alt`)
  - `Feedback`: `feedback.html` (`fa-comments`)
  - `Exams`: `exam.html` (`fa-file-alt`)
  - `Certificate`: `Certification.html` (`fa-certificate`)
  - `Status`: `status.html` (`fa-check-circle`)
  - `Billing`: `billing.html` (`fa-receipt`)

---

## 3. Course Playlists & Video Lesson System

- **Playlist Pages (`playlist.html`, `playlist1.html` through `playlist8.html`)**:
  - Displays course syllabus, total duration, instructor profile, and video counters.
  - Playlist items link cleanly to corresponding video player lessons.
- **Video Players (`watch-video.html`, `watch-video1.html` through `watch-video8.html`)**:
  - HTML5 video players with thumbnail posters, play/pause controls, title descriptions, and chapter navigation.

---

## 4. Assessment & Proctoring System

- **Mock Tests (`mocktest1.html` through `mocktest3.html`)**:
  - Initial instruction modal with `Begin Test` trigger.
  - Active real-time countdown timer (45:00).
  - Question pagination controls (`Previous`, `Next`, `Mark for Review`, `Submit Test`).
  - Answer capture with radio selectors and automated score calculation.
- **Result Displays (`submit.html`, `results.html`, `exam-submit.html`)**:
  - Performance summary metrics (Score, Correct, Wrong, Skipped questions).
- **Proctoring Activity Monitor (`monitor.html`, `Teacher/htmlfiles/proctor.html`)**:
  - Webcam integration and automatic focus loss/tab switch logging via `/api/log`.

---

## 5. Authentication & Onboarding Forms

- **Sign In (`design/login.html`)**:
  - Modern card elevation with email and password inputs.
  - Password visibility toggle (`#password-toggle`).
  - One-click demo credential auto-fill (`Frank@gmail.com` / `123`).
- **Student Registration (`design/register.html`)**:
  - Full Name, Email, Phone, DOB, and Education Level.
  - Links to payment plans (`payment.html`) and official admission form (`admission.html`).
- **Password Recovery (`design/forgot-password.html`)**:
  - Tokenized password reset simulation.
- **Academic Admission (`design/admission.html`)**:
  - Comprehensive multi-section form with degree picker, GPA, and personal details.
