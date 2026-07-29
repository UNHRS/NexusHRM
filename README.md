# Nexus HRM

Nexus HRM is a full-stack human resources management app with real authentication, PostgreSQL persistence, role-based permissions, employee and department CRUD, attendance tracking, leave workflows, Selenium QA tests, and Postman/Newman API tests.

## Stack

- Backend: Node.js, Express, Prisma, PostgreSQL
- Frontend: React, Vite, Tailwind CSS
- Auth: JWT in an httpOnly cookie, bcrypt password hashing
- QA: Python, pytest, Selenium, Page Object Model

## First-Time Setup

Assumes Node.js, npm, Docker, and Docker Compose are installed.

```bash
./scripts/setup.sh
```

Manual setup:

```bash
docker compose up -d
cd server
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed

cd ../client
npm install
```

## Run the App

```bash
./scripts/run-dev.sh
```

Then open:

- Frontend: http://localhost:5173
- API health: http://localhost:5000/health
- Adminer: http://localhost:8080

## Seeded Users

All seeded users use password `password123`.

| Role | Username |
| --- | --- |
| ADMIN | `admin` |
| MANAGER | `manager.recruitment` |
| MANAGER | `manager.docs` |
| EMPLOYEE | `employee.aasha` |
| EMPLOYEE | `employee.bibek` |
| EMPLOYEE | `employee.mina` |
| EMPLOYEE | `employee.prakash` |
| EMPLOYEE | `employee.sabina` |
| EMPLOYEE | `employee.niraj` |

## Main Workflows

- Admins can manage employees and departments, view company-wide attendance, and approve/reject any pending leave.
- Managers can view direct-report attendance and approve/reject leave for direct reports.
- Employees can update limited profile fields, check in/out, submit leave, and view their own attendance and leave history.

## API

Base URL: `http://localhost:5000/api`

Key route groups:

- `/auth`: login, logout, current user
- `/employees`: role-aware employee read and admin CRUD
- `/departments`: department CRUD
- `/attendance`: check-in/out, own/team/all attendance
- `/leave`: apply, own history, pending approvals, approve/reject

Use the Postman collection in `postman/` for executable API documentation.

```bash
./scripts/run-postman.sh
```

The Newman HTML report is written to `postman/report.html`.

## QA Suite

The app and seeded DB must already be running.

```bash
cd qa
pip install -r requirements.txt
pytest --html=report.html --self-contained-html
```

Or from the repo root:

```bash
./scripts/run-tests.sh
```

## Useful Scripts

```bash
./scripts/setup.sh       # first-time setup
./scripts/run-dev.sh     # run Postgres, API, and frontend
./scripts/seed-reset.sh  # reset and reseed database
./scripts/run-tests.sh   # run Selenium QA suite
./scripts/run-postman.sh # run Newman API suite
./scripts/backup-db.sh   # write timestamped SQL backup to backups/
```

## Environment

Server settings live in `server/.env`.

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nexus_hrm
JWT_SECRET=change_this_secret
PORT=5000
```
