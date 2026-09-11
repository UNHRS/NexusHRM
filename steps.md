# Nexus HRM Run And Test Steps

## 1. Start The App

Docker Postgres uses host port `55432` by default so it does not collide with a local PostgreSQL service.

```bash
docker compose up -d postgres adminer
cd server
cp .env.example .env
npm install
npx prisma migrate deploy
npm run seed
npm start
```

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Payroll demo

Use the seeded `admin` account to open `/admin/payroll`, generate the current month, review the payslips, and finalize the run. Then sign in as `employee.aasha` and open `/employee/payslips`. Payroll generation is real database work; the seed provides salary structures and attendance/leave records for all nine demo employees.

Seeded users all use password `password123`.

```text
admin
manager.recruitment
manager.docs
employee.aasha
employee.bibek
employee.mina
employee.prakash
employee.sabina
employee.niraj
```

## 2. Reset Demo Data

Run this whenever you want a clean database before a demo or test run:

```bash
cd server
npm run seed
```

For a full migration reset:

```bash
./scripts/seed-reset.sh
```

## 3. Run API Tests

Keep the backend running at `http://localhost:5000`, then run:

```bash
./scripts/run-postman.sh
```

Expected result:

```text
26 requests
44 assertions
0 failures
```

HTML report:

```text
postman/report.html
```

## 4. Run Selenium QA Tests

Keep both backend and frontend running:

```text
Backend:  http://localhost:5000
Frontend: http://localhost:5173
```

Install QA dependencies once:

```bash
cd qa
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Run the suite:

```bash
cd ..
qa/.venv/bin/pytest qa --html=qa/report.html --self-contained-html
```

Expected result:

```text
10 passed
```

HTML report:

```text
qa/report.html
```

## 5. Useful Scripts

```bash
./scripts/setup.sh       # first-time setup
./scripts/run-dev.sh     # start postgres, backend, and frontend
./scripts/seed-reset.sh  # reset DB migrations and reseed
./scripts/run-tests.sh   # run Selenium QA suite
./scripts/run-postman.sh # run API regression suite
./scripts/backup-db.sh   # create SQL backup in backups/
```

## 6. Troubleshooting

If Docker fails on port `55432`, use another host port:

```bash
POSTGRES_PORT=55433 docker compose up -d postgres adminer
```

Then make sure `server/.env` uses:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:55433/nexus_hrm
```

If Selenium fails with a ChromeDriver version mismatch, the QA fixture should auto-detect local Chromium. You can override manually:

```bash
CHROMEDRIVER_VERSION=148 qa/.venv/bin/pytest qa
```

If tests fail because data changed during manual checking:

```bash
cd server
npm run seed
```
