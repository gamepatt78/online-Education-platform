# Setup and Installation Guide

**Project Name:** Online Education Platform (LMS)
**Supported Platforms:** Windows, macOS, Linux
**Runtime Requirement:** Node.js v18.0.0 or higher

---

## 1. Prerequisites
- **Node.js** (v18.x, v20.x, or v24.x)
- **NPM** (v9.x or higher)
- **PostgreSQL 18** (Optional: the built-in resilience engine handles storage gracefully if PostgreSQL is not installed locally)

---

## 2. Quick Start (3 Steps)

### Step 1: Install Dependencies
Open PowerShell or your preferred terminal in the project root:
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy the configuration template:
```bash
cp .env.example .env
```
*(On Windows PowerShell, use `Copy-Item .env.example .env`)*

Configure your settings in `.env`:
```ini
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DATABASE>
JWT_SECRET=<GENERATE_A_PRIVATE_RANDOM_SECRET>
```

### Step 3: Run Migrations (Optional) & Start Application
To run the automated database migration and seed default records:
```bash
npm run db:migrate
```

To start the unified server:
```bash
npm start
```
The server will bind to **`http://localhost:5000`**.

---

## 3. Operational NPM Commands

| Command | Action |
| :--- | :--- |
| `npm start` | Launches unified Express server in production mode |
| `npm run dev` | Launches unified Express server in development mode |
| `npm test` | Executes native Node.js automated integration test suite |
| `npm run db:migrate` | Runs PostgreSQL 18 table creation and seed scripts |

---

## 4. Account setup

No reusable demo credentials are documented here. Create student accounts through the registration flow and provision privileged accounts through a trusted administrative process. Do not use seed accounts or example credentials in production.
