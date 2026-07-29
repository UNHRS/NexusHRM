# Nexus HRM QA Suite

Run these tests after the app is running with a seeded database.

```bash
cd qa
pip install -r requirements.txt
pytest --html=report.html --self-contained-html
```

Useful environment variables:

- `BASE_URL` defaults to `http://localhost:5173`
- `HEADLESS` defaults to `true`; set `HEADLESS=false` to watch Chrome run

Before running QA, start the application:

```bash
docker compose up -d
cd server && npm install && npx prisma migrate dev && npm run seed && npm run dev
cd client && npm install && npm run dev
```
