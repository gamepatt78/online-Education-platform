# Architecture Documentation

**Project Name:** Online Education Platform (LMS)
**System Architecture:** Decoupled Full-Stack Web Application with Dual-Tier Resilient Persistence

---

## 1. Frontend Architecture

The client tier is built on semantic HTML5, modern CSS3 custom properties, and Vanilla JavaScript (ES6+).
- **Design System (`design/css/theme.css`)**:
  - Linear/Stripe-inspired aesthetic using a cohesive color palette (Indigo primary `#4f46e5`, Sky Blue accent `#0ea5e9`).
  - Standardized elevation shadows (`--shadow-sm` through `--shadow-xl`), fluid radii, and typography scales based on `Plus Jakarta Sans`.
- **Navigation & Layout**:
  - Sticky glassmorphic header (`.header`) with dynamic search input, drawer toggles, and user profile flyouts.
  - Off-canvas sliding sidebar drawer (`.side-bar`) with accessible keyboard controls (`Escape` key close, `aria-expanded`).
  - Modular course playlists with embedded video streaming players.
- **Client State & Sessions**:
  - Client authentication state is tracked via localStorage (`isLoggedIn`, `token`, `userEmail`, `userName`).
  - Synchronous exam session tracking for mock tests (timer countdown, score, question indicators).

---

## 2. Backend Architecture

The backend is built on Express.js (v5.1.0) running on Node.js (v24.19.0).
- **Controller Layer (`server/controllers/`)**:
  - `authController.js`: Authenticates credentials with `bcryptjs`, issues signed JSON Web Tokens (7-day expiration), and handles password reset requests.
  - `academicController.js`: Processes course evaluations, admission applications, and proctored examination integrity events.
- **Resilient Dual-Tier Storage Service (`server/services/storageService.js`)**:
  - Primary target: Direct PostgreSQL 18 connection pool (`pg`).
  - Graceful fallback: If an external PostgreSQL instance is not yet running locally, the application synchronizes reads and writes through its local resilient store (`server/data/`), guaranteeing 100% server availability and zero request failures.
- **Static Asset Pipeline**:
  - Express directly serves all frontend HTML, CSS, JavaScript, and media assets under the `design/` directory.

---

## 3. Data Flow & Communication Lifecycle

```text
1. User interacts with UI (e.g. Submits Login Form)
   └─► JavaScript Event Handler captures form inputs
       └─► Sends asynchronous POST request to /api/auth/login
           └─► Express router delegates request to authController.login
               └─► Controller queries storageService.Users.findByEmail(email)
                   ├─► Query PostgreSQL 18 user table (if active pool)
                   └─► Or fall back to server/data/users.json
               └─► Bcrypt compares hashed password with provided password
               └─► JsonWebToken generates signed Bearer token
           └─► Returns HTTP 200 JSON with token & sanitized user object
       └─► Client stores token in localStorage and redirects to home.html
```
