# Run and Restart the Online Education Platform

## Main application: Node.js and Express

The complete application runs from the project root using Express on port **5000**. It serves the student, teacher, and admin pages as well as the API. In VS Code, open a terminal at the project root before running the commands below.

### First-time setup

Use Node.js LTS. In PowerShell, create `.env` only if it does not already exist:

```powershell
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
}
```

Edit `.env` and set `JWT_SECRET` to a private random value of at least 32 characters. Generate a value with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For local development, set `CORS_ORIGIN` to the exact local origins:

```text
CORS_ORIGIN=http://localhost:5000,http://127.0.0.1:5000
```

Do not set `CORS_ORIGIN=*`; the server ignores wildcard origins and prints a warning.

If you are not using PostgreSQL, remove or blank the example `DATABASE_URL` value. The app can use its local JSON storage under `server/data`; a disconnected PostgreSQL status in `/api/health` means fallback storage is active, not that Express failed to start. Do not commit `.env` or real user data.

Install dependencies and run the automated tests:

```powershell
npm.cmd install
npm.cmd test
```

`npm.cmd` works around PowerShell blocking the `npm.ps1` script; there is no need to change the machine's execution policy. Re-run `npm.cmd install` only for a fresh checkout or after dependency changes.

### Start, stop, and restart

Start the main server from the project root:

```powershell
npm.cmd start
```

Keep that terminal open. Open the application at <http://localhost:5000/> and check server/database status at <http://localhost:5000/api/health>.

To stop the server, press **Ctrl+C in the terminal running it**. To restart, run `npm.cmd start` again from the project root. If the server is already running in another terminal, stop it there first rather than starting a second copy.

### PostgreSQL (optional)

The app starts without PostgreSQL and falls back to local JSON storage. To use PostgreSQL, configure a valid `DATABASE_URL`, make sure PostgreSQL is running, and create the target database. Then run the migration before starting the server:

```powershell
npm.cmd run db:migrate
npm.cmd start
```

The migration requires a reachable PostgreSQL server and an existing database. Do not run it with the placeholder URL from `.env.example`.

If startup or migration reports `Invalid URL`, correct `DATABASE_URL` to a valid PostgreSQL connection URL, or blank it when using local JSON fallback. The migration command requires PostgreSQL and will not work in fallback mode.

## Optional legacy Python site

`design/app.py` is a separate legacy site on port **5002**, not the primary application server. Run it only if you specifically need that site:

```powershell
py -m pip install -r design\requirements.txt
py design\app.py
```

Open <http://127.0.0.1:5002/>. Student registration and login on this site forward to the Node API, so keep the Express server running on port 5000 as well. Some legacy form routes require a separately configured MySQL server and `student_portal` database.

The optional Python monitoring service uses port **5001** and is not required for normal app use. `py -m http.server 8080 --directory design` serves static files only; it does not provide the API or database functionality.

## Documentation

The project reports and reference documents are organized under [`docs/reports/`](./docs/reports/). This run guide remains at the project root.
